'use client';

import { memo } from 'react';
import { ArrowLeftIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

function isOnline(user) {
  if (!user?.updated_at) return false;
  const diff = Date.now() - new Date(user.updated_at).getTime();
  return diff < 300000;
}

const ChatHeader = memo(function ChatHeader({ conversation, myId, onMobileBack, onCall, onVideoCall }) {
  const other = conversation?.users?.find((u) => u.id !== myId) || conversation?.users?.[0];
  const online = isOnline(other);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-white shrink-0 shadow-sm z-10">
      <button onClick={onMobileBack} className="lg:hidden p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer">
        <ArrowLeftIcon className="w-5 h-5 text-foreground" />
      </button>
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-wa-primary to-wa-primary/60 flex items-center justify-center text-white text-sm font-bold">
          {other?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        {online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-surface rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">{other?.name || 'Unknown'}</h3>
        </div>
        <p className="text-[11px] text-gray-400 truncate">
          {online ? 'Online' : other?.role ? `${other.role.charAt(0).toUpperCase() + other.role.slice(1)}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onCall} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer" title="Panggilan Suara">
          <PhoneIcon className="w-5 h-5 text-foreground/70" />
        </button>
        <button onClick={onVideoCall} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer" title="Panggilan Video">
          <VideoCameraIcon className="w-5 h-5 text-foreground/70" />
        </button>
        <button className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer" title="Lainnya">
          <EllipsisVerticalIcon className="w-5 h-5 text-foreground/70" />
        </button>
      </div>
    </div>
  );
});

export default ChatHeader;
