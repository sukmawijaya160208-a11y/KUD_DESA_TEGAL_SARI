'use client';

import { memo } from 'react';
import { ArrowLeftIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function isOnline(user) {
  if (!user?.updated_at) return false;
  const diff = Date.now() - new Date(user.updated_at).getTime();
  return diff < 300000;
}

const ChatHeader = memo(function ChatHeader({ conversation, myId, onMobileBack, onCall, onVideoCall, otherTyping }) {
  const other = conversation?.users?.find((u) => u.id !== myId) || conversation?.users?.[0];
  const online = isOnline(other);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-wa-primary text-white shrink-0 z-10">
      <button onClick={onMobileBack} className="lg:hidden p-1.5 -ml-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
        <ArrowLeftIcon className="w-5 h-5 text-white" />
      </button>
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {other?.foto_profil ? (
            <img src={other.foto_profil} alt="" className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }} />
          ) : null}
          <span className={`text-sm font-bold text-white ${other?.foto_profil ? 'hidden' : ''}`}>
            {other?.name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        {online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-wa-primary rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white truncate">{other?.name || 'Unknown'}</h3>
          {other?.role && (
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              {other.role === 'admin' ? 'Admin' : other.role === 'verifikator' ? 'Verif' : 'Pekebun'}
            </span>
          )}
        </div>
        {otherTyping ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-white/70"
          >
            sedang mengetik...
          </motion.p>
        ) : (
          <p className="text-[11px] text-white/60 truncate">
            {online ? 'Online' : ''}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onCall} className="p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer" title="Panggilan Suara">
          <PhoneIcon className="w-5 h-5 text-white" />
        </button>
        <button onClick={onVideoCall} className="p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer" title="Panggilan Video">
          <VideoCameraIcon className="w-5 h-5 text-white" />
        </button>
        <button className="p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer" title="Lainnya">
          <EllipsisVerticalIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
});

export default ChatHeader;
