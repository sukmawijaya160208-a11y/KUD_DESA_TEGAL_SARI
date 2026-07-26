'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

const CallContext = createContext(null);

export function useCall() {
  return useContext(CallContext);
}

const POLL_ACTIVE = 2000;
const POLL_PENDING = 5000;

export default function CallProvider({ children, userId }) {
  const [activeCall, setActiveCall] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [peerConn, setPeerConn] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const pollRef = useRef(null);
  const sigIntervalRef = useRef(null);

  const cleanupStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t) => t.stop());
      setRemoteStream(null);
    }
  }, [localStream, remoteStream]);

  const getStream = useCallback(async (video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      setLocalStream(stream);
      return stream;
    } catch {
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream, onRemoteStream, callId) => {
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

    pc.onicecandidate = (event) => {
      if (event.candidate && callId) {
        api.calls.sendIce(callId, event.candidate.candidate, 'caller').catch(() => {});
      }
    };

    return pc;
  }, []);

  // ICE candidate polling for receiver
  const pollIceCandidates = useCallback(async (callId, pc, isCaller) => {
    try {
      const res = await api.calls.getIce(callId);
      if (res?.candidates) {
        const fromKey = isCaller ? 'ice_receiver' : 'ice_caller';
        res.candidates.forEach((c) => {
          pc.addIceCandidate(new RTCIceCandidate({ candidate: c })).catch(() => {});
        });
      }
    } catch {}
  }, []);

  // Signaling: Poll for answer (caller side)
  const pollForAnswer = useCallback(async (callId, pc) => {
    if (!callId || !pc) return;
    try {
      const res = await api.calls.getAnswer(callId);
      if (res?.sdp && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: res.sdp }));
        if (sigIntervalRef.current) clearInterval(sigIntervalRef.current);
      }
    } catch {}
  }, []);

  // Signaling: Poll for offer (receiver side)
  const pollForOffer = useCallback(async (callId) => {
    if (!callId) return null;
    try {
      const res = await api.calls.getOffer(callId);
      return res?.sdp || null;
    } catch { return null; }
  }, []);

  const initiateCall = useCallback(async (conversationId, type) => {
    try {
      const res = await api.calls.initiate(conversationId, type);
      const callData = res?.data || res;
      setActiveCall({ ...callData, type, status: 'ringing', muted: false, videoOff: false });

      const stream = await getStream(type === 'video');
      if (!stream) { setActiveCall(null); return; }

      const pc = createPeerConnection(stream, (remoteStream) => {
        setRemoteStream(stream);
        setActiveCall((prev) => ({ ...prev, remoteStream }));
      }, callData.id);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer via API
      await api.calls.sendOffer(callData.id, offer.sdp);

      setPeerConn(pc);

      // Poll for answer + ICE candidates
      sigIntervalRef.current = setInterval(() => {
        pollForAnswer(callData.id, pc);
        pollIceCandidates(callData.id, pc, true);
      }, 1500);

      return res;
    } catch {
      return null;
    }
  }, [getStream, createPeerConnection, pollForAnswer, pollIceCandidates]);

  const answerCall = useCallback(async (call) => {
    try {
      const res = await api.calls.accept(call.id);
      const callData = res?.data || res;
      const stream = await getStream(callData.type === 'video');
      if (!stream) return;

      const pc = createPeerConnection(stream, (remoteStream) => {
        setRemoteStream(stream);
      }, callData.id);

      // Setup ICE handler for receiver (override caller handler)
      pc.onicecandidate = (event) => {
        if (event.candidate && callData.id) {
          api.calls.sendIce(callData.id, event.candidate.candidate, 'receiver').catch(() => {});
        }
      };

      setPeerConn(pc);
      setActiveCall({ ...callData, status: 'ongoing', stream, localStream: stream, muted: false, videoOff: false });
      setIncoming([]);

      // Poll for offer
      let attempts = 0;
      const offerPoll = setInterval(async () => {
        attempts++;
        const sdp = await pollForOffer(callData.id);
        if (sdp) {
          clearInterval(offerPoll);
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await api.calls.sendAnswer(callData.id, answer.sdp);
          // Start polling ICE from caller
          if (sigIntervalRef.current) clearInterval(sigIntervalRef.current);
          sigIntervalRef.current = setInterval(() => {
            pollIceCandidates(callData.id, pc, false);
          }, 1500);
        }
        if (attempts > 20) clearInterval(offerPoll);
      }, 1500);
    } catch { }
  }, [getStream, createPeerConnection, pollForOffer, pollIceCandidates]);

  const rejectCall = useCallback(async (callId) => {
    try { await api.calls.reject(callId); } catch { }
    setIncoming((prev) => prev.filter((c) => c.id !== callId));
  }, []);

  const endCall = useCallback(async () => {
    if (activeCall?.id) {
      try { await api.calls.end(activeCall.id); } catch { }
    }
    if (sigIntervalRef.current) clearInterval(sigIntervalRef.current);
    cleanupStream();
    if (peerConn) { peerConn.close(); setPeerConn(null); }
    setActiveCall(null);
    setRemoteStream(null);
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
        if (pending && pending.data && pending.data.length > 0) {
          setIncoming(pending.data);
        }
        if (!activeCall) return;
        const active = await api.calls.active();
        if (active) {
          if (active.status === 'ended') {
            if (sigIntervalRef.current) clearInterval(sigIntervalRef.current);
            cleanupStream();
            if (peerConn) { peerConn.close(); setPeerConn(null); }
            setActiveCall(null);
            setRemoteStream(null);
          } else {
            setActiveCall((prev) => ({ ...prev, ...active }));
          }
        }
      } catch { }
    }, activeCall ? POLL_ACTIVE : POLL_PENDING);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [userId, activeCall, peerConn, cleanupStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sigIntervalRef.current) clearInterval(sigIntervalRef.current);
      cleanupStream();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CallContext.Provider value={{
      activeCall, incoming, initiateCall, answerCall, rejectCall, endCall,
      toggleMute, toggleCamera, localStream, remoteStream,
    }}>
      {children}
    </CallContext.Provider>
  );
}
