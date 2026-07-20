'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/gif'];

function isImage(type) { return IMAGE_TYPES.includes(type); }
function isAudio(type) { return type?.startsWith('audio/'); }
function isVideoFile(type) { return type?.startsWith('video/'); }

function ReadReceipt({ status }) {
  if (status === 'sending') return <span className="text-[9px] text-foreground/40 ml-1">⏳</span>;
  if (status === 'sent') return <span className="text-[9px] text-foreground/50 ml-1">✓</span>;
  if (status === 'delivered') return <span className="text-[9px] text-foreground/50 ml-1">✓✓</span>;
  if (status === 'read') return <span className="text-[9px] text-[#53bdeb] ml-1">✓✓</span>;
  return null;
}

function AudioPlayer({ attachment, isMine }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onMeta = () => setDuration(el.duration || 0);
    el.addEventListener('loadedmetadata', onMeta);
    return () => el.removeEventListener('loadedmetadata', onMeta);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(ct);
    setProgress((ct / dur) * 100);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const formatDuration = (sec) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const dur = attachment?.duration || duration || 0;

  return (
    <div className={`flex items-center gap-2 min-w-[180px] ${isMine ? '' : ''}`}>
      <audio ref={audioRef} src={attachment?.url} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} preload="metadata" />
      <button onClick={togglePlay} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMine ? 'bg-foreground/10 hover:bg-foreground/20' : 'bg-primary/10 hover:bg-primary/20'}`}>
        {playing ? <PauseIcon className={`w-4 h-4 ${isMine ? 'text-foreground' : 'text-primary'}`} /> : <PlayIcon className={`w-4 h-4 ${isMine ? 'text-foreground' : 'text-primary'} ml-0.5`} />}
      </button>
      <div className="flex-1">
          <div className={`h-1.5 rounded-full ${isMine ? 'bg-foreground/10' : 'bg-gray-200'} relative`}>
            <div className={`h-full rounded-full ${isMine ? 'bg-wa-accent' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className={`text-[10px] ${isMine ? 'text-foreground/50' : 'text-gray-400'} w-8 text-right`}>{formatDuration(currentTime || dur)}</span>
    </div>
  );
}

function AttachmentContent({ attachment, isMine }) {
  const [lightbox, setLightbox] = useState(false);

  if (isImage(attachment.type)) {
    return (
      <>
        <button onClick={() => setLightbox(true)} className="block w-full cursor-pointer -mx-1 -mt-1">
          <img src={attachment.url} alt={attachment.name} className="max-w-full rounded-xl max-h-64 object-contain bg-black/5" loading="lazy" />
        </button>
        {lightbox && (
          <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} loading="lazy" />
          </div>
        )}
      </>
    );
  }

  if (isAudio(attachment.type)) {
    return <AudioPlayer attachment={attachment} isMine={isMine} />;
  }

  if (isVideoFile(attachment.type)) {
    return (
      <video controls className="max-w-full rounded-xl max-h-64 bg-black/5">
        <source src={attachment.url} type={attachment.type} />
      </video>
    );
  }

  return (
    <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isMine ? 'bg-foreground/5 hover:bg-foreground/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-[10px] opacity-60">{attachment.size ? `${(attachment.size / 1024).toFixed(0)} KB` : ''}</p>
      </div>
      <ArrowDownTrayIcon className="w-4 h-4 shrink-0 opacity-60" />
    </a>
  );
}

const MessageBubble = memo(function MessageBubble({ message, isMine, onReply, onDelete }) {
  const [context, setContext] = useState(false);

  const handleContext = () => setContext(!context);

  const handleReply = () => {
    if (onReply) onReply(message);
    setContext(false);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(message.id);
    setContext(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-4 mb-1`}
    >
      <div className={`max-w-[80%] lg:max-w-[65%] ${isMine ? 'order-1' : 'order-1'}`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 ${
            isMine
              ? 'bg-wa-primary-light text-foreground rounded-br-sm'
              : 'bg-white text-foreground rounded-bl-sm border border-border shadow-sm'
          }`}
          onClick={handleContext}
        >
          {message.reply_to && (
            <div className={`mb-1.5 pl-2.5 border-l-2 ${isMine ? 'border-foreground/20' : 'border-primary/40'} text-xs ${isMine ? 'text-foreground/60' : 'text-gray-500'}`}>
              <span className="font-medium">Balasan</span>
              <p className="truncate">{message.reply_to?.message || ''}</p>
            </div>
          )}
          {message.attachment && (
            <div className={message.message ? 'mb-1.5' : ''}>
              <AttachmentContent attachment={message.attachment} isMine={isMine} />
            </div>
          )}
          {message.message && message.message !== '[Pesan telah dihapus]' && (
            <p className="text-[15px] whitespace-pre-wrap break-words leading-[1.4]">{message.message}</p>
          )}
          {message.message === '[Pesan telah dihapus]' && (
            <p className="text-xs italic opacity-60">Pesan telah dihapus</p>
          )}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isMine ? 'text-foreground/50' : 'text-gray-400'}`}>
              {formatTime(message.created_at)}
            </span>
            {isMine && message.status && <ReadReceipt status={message.status} />}
          </div>
        </div>
      </div>

      {context && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContext(false)} />
          <div className={`absolute ${isMine ? 'right-0' : 'left-0'} top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-border py-1 min-w-[140px]`}>
            {onReply && (
              <button onClick={handleReply} className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Balas
              </button>
            )}
            {isMine && message.message !== '[Pesan telah dihapus]' && (
              <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
});

export default MessageBubble;
