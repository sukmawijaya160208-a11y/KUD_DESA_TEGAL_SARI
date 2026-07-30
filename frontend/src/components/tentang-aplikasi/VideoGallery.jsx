'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from '@/lib/animated-icons';
import YouTubeEmbed from '@/components/YouTubeEmbed';

export default function VideoGallery({ youtubeUrl, isAdmin, onUpdateUrl }) {
  const [editUrl, setEditUrl] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!youtubeUrl && !isAdmin) return null;

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
              <PlayCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white/80 text-sm font-medium">Video Profil Aplikasi</span>
            </div>
          </div>

          <YouTubeEmbed youtubeUrl={youtubeUrl} />

          {isAdmin && (
            <div className="mt-6 max-w-xl mx-auto">
              {showInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=xxxxxxxxx"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => { if (editUrl) { onUpdateUrl?.(editUrl); setShowInput(false); setEditUrl(''); } }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowInput(false); setEditUrl(''); }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/20"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.37a4.5 4.5 0 00-6.364 0L4.5 12.25" /></svg>
                    {youtubeUrl ? 'Ganti Link YouTube' : 'Tambahkan Link YouTube'}
                  </button>
                  {youtubeUrl && (
                    <button
                      type="button"
                      onClick={() => onUpdateUrl?.('')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Hapus Video
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
