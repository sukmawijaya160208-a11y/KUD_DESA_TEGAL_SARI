'use client'

import { getYouTubeEmbedUrl } from '@/utils/youtube'

export default function YouTubeEmbed({ youtubeUrl }) {
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl)

  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-slate-800/50 rounded-2xl border border-slate-700/60 flex flex-col items-center justify-center p-6 text-center">
        <svg className="w-12 h-12 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-400">Belum ada video profil aplikasi yang disematkan.</p>
      </div>
    )
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-black">
      <iframe
        src={embedUrl}
        title="Video Profil Aplikasi KUD"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
