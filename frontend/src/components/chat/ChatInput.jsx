'use client';

import { useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon, PhotoIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';
import StickerPicker from './StickerPicker';
import VoiceRecorder from './VoiceRecorder';

function AttachmentPreviewInline({ file, onRemove }) {
  const isImg = file.type?.startsWith('image/');
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl border border-border mb-2">
      {isImg ? (
        <img src={file.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
      ) : file.type?.startsWith('audio/') ? (
        <div className="w-10 h-10 rounded-lg bg-wa-primary/10 flex items-center justify-center shrink-0">
          <MusicalNoteIcon className="w-5 h-5 text-wa-primary" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
        <p className="text-[10px] text-gray-400">{file.size ? `${(file.size / 1024).toFixed(0)} KB` : ''}</p>
      </div>
      <button onClick={onRemove} className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

export default function ChatInput({ onSend, replyTo, onClearReply }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachFile, setAttachFile] = useState(null);
  const [attaching, setAttaching] = useState(false);
  const [showPicker, setShowPicker] = useState(null);
  const [recording, setRecording] = useState(false);
  const textRef = useRef(null);
  const fileRef = useRef(null);

  const autoResize = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 132) + 'px';
  }, []);

  const handleChange = (e) => {
    setInput(e.target.value);
    setTimeout(autoResize, 0);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachFile) || sending) return;
    setSending(true);
    const text = input.trim();
    const att = attachFile ? { url: attachFile.url, name: attachFile.name, type: attachFile.type, size: attachFile.size } : null;
    setInput('');
    setAttachFile(null);
    if (onClearReply) onClearReply();
    if (textRef.current) { textRef.current.style.height = 'auto'; }
    try {
      await onSend(text, att, replyTo);
    } catch {
      setInput(text);
      if (att) setAttachFile(att);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttaching(true);
    try {
      const result = await api.chat.upload(file);
      setAttachFile(result);
      setShowPicker(null);
    } catch (err) {
      alert('Upload gagal: ' + err.message);
    }
    setAttaching(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji);
    textRef.current?.focus();
  };

  const handleGifSelect = async (fileOrUrl) => {
    setAttaching(true);
    try {
      const file = typeof fileOrUrl === 'string' ? await urlToFile(fileOrUrl) : fileOrUrl;
      const result = await api.chat.upload(file);
      setAttachFile(result);
      setShowPicker(null);
    } catch { }
    setAttaching(false);
  };

  const handleStickerSelect = async (file) => {
    setAttaching(true);
    try {
      const result = await api.chat.upload(file);
      setAttachFile(result);
      setShowPicker(null);
    } catch { }
    setAttaching(false);
  };

  const handleVoiceSend = async (blob, duration) => {
    setAttaching(true);
    try {
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      const result = await api.chat.upload(file);
      result.duration = duration;
      setAttachFile(result);
    } catch { }
    setAttaching(false);
    setRecording(false);
  };

  const urlToFile = async (url) => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new File([blob], 'gif.gif', { type: 'image/gif' });
  };

  if (recording) {
    return <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setRecording(false)} />;
  }

  return (
    <div className="px-3 py-2 border-t border-border bg-white shrink-0 relative">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 pl-2.5 border-l-4 border-wa-primary bg-muted/50 rounded-r-lg py-1.5 pr-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-wa-primary">Balas {replyTo.is_mine ? 'diri sendiri' : ''}</p>
            <p className="text-xs text-gray-500 truncate">
              {replyTo.attachment?.type?.startsWith('image/') ? '[Foto]'
                : replyTo.attachment?.type?.startsWith('audio/') ? '[Pesan Suara]'
                : replyTo.attachment ? '[File]'
                : replyTo.message || ''}
            </p>
          </div>
          <button onClick={() => { if (onClearReply) onClearReply(); }} className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachFile && (
        <AttachmentPreviewInline file={attachFile} onRemove={() => setAttachFile(null)} />
      )}

      {/* Picker overlay */}
      <AnimatePresence>
        {showPicker === 'emoji' && (
          <EmojiPicker onSelect={handleEmojiSelect} />
        )}
        {showPicker === 'gif' && (
          <GifPicker onSelect={handleGifSelect} />
        )}
        {showPicker === 'sticker' && (
          <StickerPicker onSelect={handleStickerSelect} />
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-1.5">
        <div className="flex items-center gap-0.5">
          <button onClick={() => setShowPicker(showPicker === 'emoji' ? null : 'emoji')} className={`p-2 rounded-xl transition-colors cursor-pointer ${showPicker === 'emoji' ? 'bg-wa-primary/10 text-wa-primary' : 'hover:bg-muted text-gray-400'}`}>
            <FaceSmileIcon className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => fileRef.current?.click()} disabled={attaching} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer disabled:opacity-40 text-gray-400">
              {attaching ? (
                <div className="w-5 h-5 border-2 border-wa-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperClipIcon className="w-5 h-5" />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" className="hidden" onChange={handleFilePick} />
          </div>
          <button onClick={() => setShowPicker(showPicker === 'gif' ? null : 'gif')} className={`p-2 rounded-xl transition-colors cursor-pointer text-sm font-bold ${showPicker === 'gif' ? 'bg-wa-primary/10 text-wa-primary' : 'hover:bg-muted text-gray-400'}`}>
            GIF
          </button>
          <button onClick={() => setShowPicker(showPicker === 'sticker' ? null : 'sticker')} className={`p-2 rounded-xl transition-colors cursor-pointer ${showPicker === 'sticker' ? 'bg-wa-primary/10 text-wa-primary' : 'hover:bg-muted text-gray-400'}`}>
            <PhotoIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan..."
            rows={1}
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-white text-sm focus:ring-2 focus:ring-wa-accent/30 focus:border-wa-accent outline-none transition-all resize-none placeholder:text-gray-300 max-h-[132px] leading-5"
            style={{ minHeight: '42px' }}
          />
        </div>

        {input.trim() || attachFile ? (
          <button onClick={handleSend} disabled={(!input.trim() && !attachFile) || sending} className="w-10 h-10 rounded-xl bg-wa-accent hover:bg-wa-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0">
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4 text-white" />
            )}
          </button>
        ) : (
          <button onClick={() => setRecording(true)} className="w-10 h-10 rounded-xl bg-wa-accent hover:bg-wa-accent-hover flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
