'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, MicrophoneIcon, VideoCameraIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useCall } from './CallProvider';

export default function CallScreen() {
  const { activeCall, endCall, toggleMute, toggleCamera, localStream, remoteStream } = useCall();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Live duration timer
  useEffect(() => {
    if (!activeCall || activeCall.status === 'ringing') {
      setElapsed(0);
      return;
    }
    const startedAt = activeCall.started_at ? new Date(activeCall.started_at).getTime() : Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall?.status, activeCall?.started_at]);

  if (!activeCall) return null;

  const other = activeCall.callee || activeCall.receiver || activeCall.caller || {};
  const isVideo = activeCall.type === 'video';
  const isRinging = activeCall.status === 'ringing';

  const formatDuration = (sec) => {
    if (!sec && sec !== 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-black flex flex-col"
    >
      {/* Video call layout */}
      {isVideo && (
        <div className="flex-1 relative bg-gray-900">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center text-5xl font-bold text-white mx-auto mb-4">
                  {other?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <p className="text-white text-lg font-medium">{other?.name || 'Menunggu...'}</p>
                <p className="text-white/50 text-sm mt-1">
                  {isRinging ? 'Memanggil...' : formatDuration(elapsed)}
                </p>
              </div>
            </div>
          )}

          {/* Local video PIP */}
          <div className="absolute top-4 right-4 w-32 h-48 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-gray-800">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Audio call layout */}
      {!isVideo && (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-800 to-black">
          <div className="text-center">
            <motion.div
              animate={isRinging ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl font-bold text-white mx-auto mb-6"
            >
              {other?.name?.charAt(0)?.toUpperCase() || '?'}
            </motion.div>
            <p className="text-white text-xl font-medium">{other?.name || 'Seseorang'}</p>
            <p className="text-white/50 text-sm mt-2">
              {isRinging ? 'Memanggil...' : formatDuration(elapsed)}
            </p>
            {activeCall.muted && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-400 text-xs mt-3">
                Mikrofon dimatikan
              </motion.p>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="py-8 px-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-6 max-w-sm mx-auto">
          {!isRinging && (
            <>
              <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer ${activeCall.muted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <MicrophoneIcon className="w-6 h-6" />
              </button>
              {isVideo && (
                <button onClick={toggleCamera} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer ${activeCall.videoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  <VideoCameraIcon className="w-6 h-6" />
                </button>
              )}
              <button className="w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer">
                <SpeakerWaveIcon className="w-6 h-6" />
              </button>
            </>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer shadow-lg"
          >
            <PhoneIcon className="w-7 h-7 text-white rotate-135" style={{ transform: 'rotate(135deg)' }} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
