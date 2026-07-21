'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function VideoSection({ urlVideo, isAdmin, onUpload, onRemove, uploading }) {
  const fileRef = useRef(null);

  const handleUploadClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    e.target.value = '';
  };

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

          {!urlVideo ? (
            isAdmin ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  type="button"
                  onClick={handleUploadClick}
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
                      <ArrowUpTrayIcon className="w-12 h-12 text-white/30 group-hover:text-emerald-400 transition-colors" />
                      <div className="text-center">
                        <p className="text-white/80 font-medium group-hover:text-emerald-400 transition-colors">
                          Upload Video Profil
                        </p>
                        <p className="text-white/40 text-sm mt-1">MP4, WebM — Maks. 2GB</p>
                      </div>
                    </>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center h-48 rounded-2xl bg-white/5 border border-white/10"
              >
                <p className="text-white/40 text-sm">Video belum tersedia</p>
              </motion.div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl">
                <div className="aspect-video relative">
                  <video
                    src={urlVideo}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    <source src={urlVideo} type="video/mp4" />
                  </video>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleUploadClick}
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
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Ganti Video
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Hapus Video
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
