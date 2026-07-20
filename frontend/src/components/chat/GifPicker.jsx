'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TRENDING = [
  'https://media.tenor.com/8Qamkf5SMFIAAAAC/ok-thumbs-up.gif',
  'https://media.tenor.com/8jPmFQEcgF4AAAAC/love-hearts.gif',
  'https://media.tenor.com/jg8RsGcR3sYAAAAC/wave-hello.gif',
  'https://media.tenor.com/Kx7mAbYX5sQAAAAC/clap-applause.gif',
  'https://media.tenor.com/f2Pvp7lRQLsAAAAC/fire-excited.gif',
  'https://media.tenor.com/bR5M1QfZ0Z4AAAAC/cry-crying.gif',
  'https://media.tenor.com/w7BmR8d1S9YAAAAC/shrug.gif',
  'https://media.tenor.com/vq6YgxI-DY0AAAAC/dancing-dance.gif',
  'https://media.tenor.com/SdfgAWX7RcIAAAAC/laughing-lol.gif',
  'https://media.tenor.com/lBqVTAFWKlMAAAAC/angry-mad.gif',
  'https://media.tenor.com/03cQsHYf7b4AAAAC/party-confetti.gif',
  'https://media.tenor.com/SsFffg_HNfsAAAAC/disco-dancing.gif',
];

const SEARCH_GIFS = {
  ok: ['https://media.tenor.com/8Qamkf5SMFIAAAAC/ok-thumbs-up.gif', 'https://media.tenor.com/1Z3-sFTfJZgAAAAC/okay-ok.gif'],
  love: ['https://media.tenor.com/8jPmFQEcgF4AAAAC/love-hearts.gif', 'https://media.tenor.com/H7YQGFHaqdQAAAAC/i-love-you-love.gif'],
  wave: ['https://media.tenor.com/jg8RsGcR3sYAAAAC/wave-hello.gif', 'https://media.tenor.com/h-vH0WWsUAMAAAAC/hi-hey.gif'],
  laugh: ['https://media.tenor.com/SdfgAWX7RcIAAAAC/laughing-lol.gif', 'https://media.tenor.com/Ef34VvUok30AAAAC/lmao-laughing.gif'],
  cry: ['https://media.tenor.com/bR5M1QfZ0Z4AAAAC/cry-crying.gif', 'https://media.tenor.com/Yh7q5VX7YxYAAAAC/sobbing-crying.gif'],
  sad: ['https://media.tenor.com/bR5M1QfZ0Z4AAAAC/cry-crying.gif', 'https://media.tenor.com/EmI8lN-YJLgAAAAC/sad-cat.gif'],
  angry: ['https://media.tenor.com/lBqVTAFWKlMAAAAC/angry-mad.gif', 'https://media.tenor.com/BGqDNYJQv3IAAAAC/angry.gif'],
  party: ['https://media.tenor.com/03cQsHYf7b4AAAAC/party-confetti.gif', 'https://media.tenor.com/IZNmoDO0FUYAAAAC/party-time.gif'],
  dance: ['https://media.tenor.com/SsFffg_HNfsAAAAC/disco-dancing.gif', 'https://media.tenor.com/vq6YgxI-DY0AAAAC/dancing-dance.gif'],
  clap: ['https://media.tenor.com/Kx7mAbYX5sQAAAAC/clap-applause.gif', 'https://media.tenor.com/ZDVvt8vNw-MAAAAC/clapping-clap.gif'],
  fire: ['https://media.tenor.com/f2Pvp7lRQLsAAAAC/fire-excited.gif', 'https://media.tenor.com/UpMu6KHKmy8AAAAC/fire.gif'],
  sleep: ['https://media.tenor.com/aRhJ4R82cfIAAAAC/sleep-good-night.gif', 'https://media.tenor.com/7iE8E73Hn8AAAAAC/sleepy-tired.gif'],
};

function computeResults(search) {
  if (!search.trim()) return TRENDING;
  const q = search.toLowerCase().trim();
  const keys = Object.keys(SEARCH_GIFS).filter((k) => q.includes(k) || k.includes(q));
  return keys.length > 0 ? [...new Set(keys.flatMap((k) => SEARCH_GIFS[k]))] : [];
}

export default function GifPicker({ onSelect }) {
  const [search, setSearch] = useState('');
  const results = computeResults(search);

  const handleSelect = async (url) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const file = new File([blob], 'gif.gif', { type: 'image/gif' });
      onSelect(file);
    } catch {
      onSelect(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
    >
      <div className="p-2.5 border-b border-border">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari GIF..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            autoFocus
          />
        </div>
      </div>
      <div className="h-48 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {results.map((url, i) => (
            <button key={i} onClick={() => handleSelect(url)} className="relative aspect-video rounded-xl overflow-hidden bg-muted hover:ring-2 hover:ring-wa-primary/50 transition-all cursor-pointer group">
              <img src={url} alt="GIF" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
          {results.length === 0 && (
            <div className="col-span-2 text-center py-8 text-sm text-gray-400">GIF tidak ditemukan</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
