'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircleIcon, ChevronLeftIcon, ChevronRightIcon, FilmIcon } from '@heroicons/react/24/outline';

const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv'];

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function getVideoType(url) {
  const ext = url?.split('.').pop()?.toLowerCase() || '';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'mov') return 'video/quicktime';
  return 'video/mp4';
}

export default function VideoGallery({ videos = [], isAdmin, onUpload, onRemoveVideo, uploading }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef(null);
  const list = Array.isArray(videos) ? videos.filter(Boolean) : [];

  const currentUrl = list[activeIdx];
  const hasMultiple = list.length > 1;

  const goNext = useCallback(() => {
    setActiveIdx((i) => (i + 1) % list.length);
  }, [list.length]);

  const goPrev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + list.length) % list.length);
  }, [list.length]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  }, [goNext, goPrev]);

  useEffect(() => {
    if (list.length > 0 && activeIdx >= list.length) {
      setActiveIdx(0);
    }
  }, [list.length, activeIdx]);

  if (list.length === 0 && !isAdmin) return null;

  return (
    <section className="relative overflow-hidden py-16 lg:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
              <PlayCircleIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-white/80 text-sm font-medium">Video Profil Aplikasi</span>
            </div>
          </div>

          {list.length === 0 ? (
            isAdmin && (
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-4 px-6 py-16 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400/50 bg-white/5 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-10 w-10 text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-white/70 text-sm">Mengupload...</span>
                    </div>
                  ) : (
                    <>
                      <FilmIcon className="w-12 h-12 text-white/30 group-hover:text-emerald-400 transition-colors" />
                      <div className="text-center">
                        <p className="text-white/80 font-medium group-hover:text-emerald-400 transition-colors">
                          Upload Video Profil
                        </p>
                        <p className="text-white/40 text-sm mt-1">MP4, WebM, MOV — Maks. 2GB</p>
                      </div>
                    </>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="video/*" onChange={(e) => { onUpload?.(e.target.files?.[0]); e.target.value = ''; }} className="hidden" />
              </div>
            )
          ) : (
            <div>
              <div
                className="relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl"
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                <div className="aspect-video relative">
                  <AnimatePresence mode="wait">
                    <motion.video
                      key={activeIdx}
                      src={currentUrl}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <source src={currentUrl} type={getVideoType(currentUrl)} />
                    </motion.video>
                  </AnimatePresence>

                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                        aria-label="Video sebelumnya"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                        aria-label="Video selanjutnya"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {hasMultiple && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {list.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === activeIdx ? 'w-8 bg-emerald-400' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Video ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-200 text-sm font-medium backdrop-blur-sm disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <FilmIcon className="w-4 h-4" />
                        Tambah Video
                      </>
                    )}
                  </button>
                  {currentUrl && (
                    <button
                      type="button"
                      onClick={() => onRemoveVideo?.(activeIdx)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Hapus Video
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl border border-blue-500/30 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                    Dari Folder Server
                  </button>
                  <input ref={fileRef} type="file" accept="video/*" onChange={(e) => { onUpload?.(e.target.files?.[0]); e.target.value = ''; }} className="hidden" />
                </div>
              )}

              {showPicker && isAdmin && (
                <VideoFolderPicker
                  onSelect={(url) => {
                    onUpload?.(null, url);
                    setShowPicker(false);
                  }}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function VideoFolderPicker({ onSelect, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/videos/list', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFiles(data);
        else setFiles([]);
      })
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/80 text-sm font-medium">Video dari Folder Server</p>
        <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm">Tutup</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-white/40" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : files.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-4">Belum ada video di folder server</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {files.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => onSelect(f.url)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/50 transition-all text-left group"
            >
              <FilmIcon className="w-8 h-8 text-white/40 group-hover:text-emerald-400 transition-colors" />
              <span className="text-white/70 text-xs text-center leading-tight truncate w-full">{f.name}</span>
              {f.size > 0 && <span className="text-white/40 text-[10px]">{formatSize(f.size)}</span>}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
