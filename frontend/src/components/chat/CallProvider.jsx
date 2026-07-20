'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

const CallContext = createContext(null);

export function useCall() {
  return useContext(CallContext);
}

export default function CallProvider({ children, userId }) {
  const [activeCall, setActiveCall] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [peerConn, setPeerConn] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const pollRef = useRef(null);

  const cleanupStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  const getStream = useCallback(async (video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      setLocalStream(stream);
      return stream;
    } catch {
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream, onRemoteStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.ontrack = (event) => {
      if (onRemoteStream) onRemoteStream(event.streams[0]);
    };

    return pc;
  }, []);

  const initiateCall = useCallback(async (conversationId, type) => {
    try {
      const res = await api.calls.initiate(conversationId, type);
      setActiveCall({ ...res, type, status: 'ringing' });

      const stream = await getStream(type === 'video');
      if (!stream) { setActiveCall(null); return; }

      const pc = createPeerConnection(stream, (remoteStream) => {
        setActiveCall((prev) => ({ ...prev, remoteStream }));
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // Store in data channel or use polling for signaling
      setPeerConn(pc);

      const signalInterval = setInterval(async () => {
        try {
          const signal = await api.calls.active();
          if (!signal || signal.status === 'ended') {
            clearInterval(signalInterval);
            cleanupStream();
            if (pc) pc.close();
            setActiveCall(null);
            setPeerConn(null);
          }
        } catch { clearInterval(signalInterval); }
      }, 2000);

      return res;
    } catch {
      return null;
    }
  }, [getStream, createPeerConnection, cleanupStream]);

  const answerCall = useCallback(async (call) => {
    try {
      await api.calls.accept(call.id);
      const stream = await getStream(call.type === 'video');
      if (!stream) return;

      const pc = createPeerConnection(stream, (remoteStream) => {
        setActiveCall((prev) => ({ ...prev, remoteStream }));
      });

      setPeerConn(pc);
      setActiveCall({ ...call, status: 'ongoing', stream, localStream: stream });
      setIncoming([]);
    } catch { }
  }, [getStream, createPeerConnection]);

  const rejectCall = useCallback(async (callId) => {
    try { await api.calls.reject(callId); } catch { }
    setIncoming((prev) => prev.filter((c) => c.id !== callId));
  }, []);

  const endCall = useCallback(async () => {
    if (activeCall?.id) {
      try { await api.calls.end(activeCall.id); } catch { }
    }
    cleanupStream();
    if (peerConn) { peerConn.close(); setPeerConn(null); }
    setActiveCall(null);
  }, [activeCall, peerConn, cleanupStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setActiveCall((prev) => prev ? { ...prev, muted: !prev.muted } : prev);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setActiveCall((prev) => prev ? { ...prev, videoOff: !prev.videoOff } : prev);
    }
  }, [localStream]);

  useEffect(() => {
    if (!userId) return;
    pollRef.current = setInterval(async () => {
      if (document.hidden) return;
      try {
        const pending = await api.calls.pending();
        if (pending && pending.length > 0) {
          setIncoming(pending);
        }
        if (!activeCall) return;
        const active = await api.calls.active();
        if (active) {
          setActiveCall(active);
          if (active.status === 'ended') {
            cleanupStream();
            if (peerConn) { peerConn.close(); setPeerConn(null); }
          }
        }
      } catch { }
    }, activeCall ? 2000 : 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      cleanupStream();
    };
  }, [userId, activeCall, peerConn, cleanupStream]);

  return (
    <CallContext.Provider value={{
      activeCall, incoming, initiateCall, answerCall, rejectCall, endCall,
      toggleMute, toggleCamera, localStream,
    }}>
      {children}
    </CallContext.Provider>
  );
}
