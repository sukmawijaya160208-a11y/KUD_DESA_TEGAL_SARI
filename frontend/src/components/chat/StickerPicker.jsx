'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const STICKER_PACKS = [
  {
    name: 'Ekspresi',
    stickers: [
      { id: 'wave', emoji: '👋', label: 'Hai!' },
      { id: 'ok', emoji: '👍', label: 'OK' },
      { id: 'love', emoji: '❤️', label: 'Love' },
      { id: 'laugh', emoji: '😂', label: 'Lucu' },
      { id: 'cry', emoji: '😢', label: 'Sedih' },
      { id: 'angry', emoji: '😡', label: 'Marah' },
      { id: 'clap', emoji: '👏', label: 'Mantap' },
      { id: 'fire', emoji: '🔥', label: 'Keren' },
      { id: 'party', emoji: '🎉', label: 'Hore' },
      { id: 'sleep', emoji: '😴', label: 'Tidur' },
      { id: 'kiss', emoji: '😘', label: 'Cium' },
      { id: 'cry2', emoji: '🥺', label: 'Pleasse' },
    ],
  },
  {
    name: 'Makanan',
    stickers: [
      { id: 'pizza', emoji: '🍕', label: 'Pizza' },
      { id: 'burger', emoji: '🍔', label: 'Burger' },
      { id: 'coffee', emoji: '☕', label: 'Kopi' },
      { id: 'cake', emoji: '🎂', label: 'Kue' },
      { id: 'noodle', emoji: '🍜', label: 'Mie' },
      { id: 'sushi', emoji: '🍣', label: 'Sushi' },
    ],
  },
  {
    name: 'Hewan',
    stickers: [
      { id: 'cat', emoji: '🐱', label: 'Kucing' },
      { id: 'dog', emoji: '🐶', label: 'Anjing' },
      { id: 'rabbit', emoji: '🐰', label: 'Kelinci' },
      { id: 'panda', emoji: '🐼', label: 'Panda' },
      { id: 'koala', emoji: '🐨', label: 'Koala' },
      { id: 'fox', emoji: '🦊', label: 'Rubah' },
      { id: 'bear', emoji: '🐻', label: 'Beruang' },
      { id: 'monkey', emoji: '🐵', label: 'Monyet' },
    ],
  },
  {
    name: 'Alam',
    stickers: [
      { id: 'sun', emoji: '☀️', label: 'Cerah' },
      { id: 'rain', emoji: '🌧️', label: 'Hujan' },
      { id: 'rainbow', emoji: '🌈', label: 'Pelangi' },
      { id: 'moon', emoji: '🌙', label: 'Bulan' },
      { id: 'star', emoji: '⭐', label: 'Bintang' },
      { id: 'flower', emoji: '🌸', label: 'Bunga' },
    ],
  },
];

export default function StickerPicker({ onSelect }) {
  const [pack, setPack] = useState(0);
  const currentPack = STICKER_PACKS[pack];

  const handleSelect = async (sticker) => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#075E54';
    ctx.beginPath();
    ctx.arc(60, 60, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(sticker.emoji, 60, 60);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      const file = new File([blob], `sticker_${sticker.id}.png`, { type: 'image/png' });
      onSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
    >
      <div className="flex gap-1 px-2 py-1.5 border-b border-border overflow-x-auto">
        {STICKER_PACKS.map((p, i) => (
          <button key={p.name} onClick={() => setPack(i)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${pack === i ? 'bg-wa-primary/10 text-wa-primary font-medium ring-1 ring-wa-primary/30' : 'hover:bg-muted text-gray-600'}`}>
            {p.stickers[0].emoji} {p.name}
          </button>
        ))}
      </div>

      <div className="h-48 overflow-y-auto p-2">
        {currentPack && (
          <div className="grid grid-cols-4 gap-2">
            {currentPack.stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleSelect(sticker)}
                className="aspect-square rounded-2xl bg-gradient-to-br from-wa-primary/10 to-wa-primary/5 hover:from-wa-primary/20 hover:to-wa-primary/10 flex items-center justify-center text-3xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={sticker.label}
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
