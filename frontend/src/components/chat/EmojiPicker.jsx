'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  { id: 'smileys', label: '😊', emojis: ['😊','😁','😂','🤣','😃','😄','😅','😆','😉','😋','😌','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬'] },
  { id: 'gestures', label: '👍', emojis: ['👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤞','🤟','🤘','👌','💪','🦵','🦶','👂','👃','👁️','👀','🧠','🫀','🫁','🗣️','👤','👥','🫂'] },
  { id: 'hearts', label: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💞','💓','💗','💖','💘','💝','❣️','💔','❤️‍🔥','❤️‍🩹'] },
  { id: 'objects', label: '🎉', emojis: ['🎉','🎊','🎈','🎁','🎀','🪄','✨','🌟','⭐','💫','🎯','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🤝','💯','🔥','💎','💍','👑','🧿','🔮','🕹️','🎮','🎲','♟️','🎭','🎨','🎬','🎤','🎧','🎵','🎶','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','📱','💻','⌚','📷','🎥','📸','📀','💿','📞','📟','📠','🔋','🔌','💡','🔦','🕯️','📖','📕','📗','📘','📙','📚','📓','📔','📒','📃','📜','📄','✉️','📧','📨','📩','📤','📥','📦'] },
  { id: 'nature', label: '🌿', emojis: ['🌿','🌱','🌲','🌳','🌴','🌵','🌾','🌻','🌼','🌸','🌷','🌹','🌺','🌻','🌞','🌝','🌛','🌜','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌀','🌪️','🌈','☔','💧','💦','🌊'] },
  { id: 'food', label: '🍕', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🍲','🍜','🍝','🍣','🍱','🍛','🍙','🍚','🍘','🥟','🦪','🍤','🍥','🥮','🍡','🍧','🍨','🍦','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','☕','🍵','🍶','🥤','🧃','🧋','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾'] },
  { id: 'animals', label: '🐱', emojis: ['🐶','🐱','🐭','🐹','🐰','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦡','🦫','🦦','🦨','🦥','🐁','🐀','🐿️'] },
];

export default function EmojiPicker({ onSelect }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('smileys');
  const [recent, setRecent] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('recent_emojis') || '[]'); } catch { return []; }
  });

  const allEmojis = CATEGORIES.flatMap((c) => c.emojis);
  const filtered = search
    ? allEmojis.filter((e) => e.includes(search))
    : CATEGORIES.find((c) => c.id === category)?.emojis || [];

  const handleSelect = (emoji) => {
    const updated = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, 20);
    setRecent(updated);
    if (typeof window !== 'undefined') localStorage.setItem('recent_emojis', JSON.stringify(updated));
    onSelect(emoji);
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
            placeholder="Cari emoji..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-0.5 px-2 py-1.5 border-b border-border overflow-x-auto">
        {recent.length > 0 && (
          <button onClick={() => { setSearch(''); setCategory('recent'); }} className={`px-2 py-1 rounded-lg text-sm whitespace-nowrap transition-colors ${category === 'recent' ? 'bg-wa-primary/10 text-wa-primary' : 'hover:bg-muted'}`}>
            🕐
          </button>
        )}
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => { setSearch(''); setCategory(cat.id); }} className={`px-2 py-1 rounded-lg text-sm whitespace-nowrap transition-colors ${category === cat.id ? 'bg-wa-primary/10 ring-1 ring-wa-primary/30' : 'hover:bg-muted'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="h-48 overflow-y-auto p-2">
        {search && (
          <div className="text-[10px] text-gray-400 mb-1.5 px-1">Hasil pencarian</div>
        )}
        {category === 'recent' && !search && (
          <div className="text-[10px] text-gray-400 mb-1.5 px-1">Sering digunakan</div>
        )}
        <div className="grid grid-cols-7 gap-0.5">
          {(search ? filtered : category === 'recent' ? recent : filtered).map((emoji, i) => (
            <button key={emoji + i} onClick={() => handleSelect(emoji)} className="w-9 h-9 flex items-center justify-center text-xl hover:bg-muted rounded-lg transition-colors cursor-pointer">
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
