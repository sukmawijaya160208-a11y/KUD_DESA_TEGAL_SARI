'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VoiceRecorder({ onSend, onCancel }) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      doStartRecording();
    }
  }, []);

  async function doStartRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        setBlob(audioBlob);
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= 300) { stopRecording(); return prev; }
          return prev + 1;
        });
      }, 1000);
    } catch {
      onCancel();
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }

  const handleSend = () => {
    if (blob) onSend(blob, duration);
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!recording && blob) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-surface border-t border-border">
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-foreground transition-colors cursor-pointer">
          Batal
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-wa-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-wa-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
          </div>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-wa-accent rounded-full" style={{ width: '100%' }} />
          </div>
          <span className="text-xs text-gray-400 w-10 text-right">{formatDuration(duration)}</span>
        </div>
        <button onClick={handleSend} className="px-4 py-1.5 bg-wa-accent text-white text-sm rounded-xl hover:bg-wa-accent-hover transition-colors cursor-pointer">
          Kirim
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border-t border-border">
      <button onClick={onCancel} className="text-sm text-gray-500 hover:text-foreground transition-colors cursor-pointer">
        Batal
      </button>
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: recording ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-3 h-3 rounded-full bg-red-500"
          />
          <span className="text-sm font-mono font-medium">{formatDuration(duration)}</span>
        </div>
      </div>
      <button onClick={stopRecording} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer">
        <div className="w-3 h-3 rounded-sm bg-white" />
      </button>
    </div>
  );
}
