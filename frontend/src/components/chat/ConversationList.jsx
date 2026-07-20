'use client';

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'skrg';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function otherUser(conversation, myId) {
  return conversation.users?.find((u) => u.id !== myId) || conversation.users?.[0] || { name: 'Unknown', role: '' };
}

function isOnline(user) {
  if (!user?.updated_at) return false;
  return Date.now() - new Date(user.updated_at).getTime() < 300000;
}

const ConversationList = memo(function ConversationList({ conversations, activeId, onSelect, onNewChat, myId, loading }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => search
    ? conversations.filter((conv) => {
        const other = otherUser(conv, myId);
        return other.name?.toLowerCase().includes(search.toLowerCase());
      })
    : conversations, [conversations, search, myId]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0 bg-wa-primary text-white">
        <h2 className="text-lg font-heading font-semibold text-white">Pesan</h2>
        <button onClick={onNewChat} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer">
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 py-2.5 border-b border-border bg-white">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-wa-accent/30">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari atau mulai chat baru"
            className="bg-transparent outline-none text-sm text-foreground w-full placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {search ? 'Tidak ditemukan' : 'Belum ada percakapan'}
            </p>
            <p className="text-xs text-gray-400 mt-1.5">
              {search ? 'Coba kata kunci lain' : 'Klik + untuk memulai obrolan baru'}
            </p>
          </div>
        ) : (
          filtered.map((conv, idx) => {
            const other = otherUser(conv, myId);
            const active = conv.id === activeId;
            const online = isOnline(other);

            return (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer border-b border-border/50 ${
                  active
                    ? 'bg-wa-primary text-white'
                    : 'hover:bg-muted/50 active:bg-muted/80'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-gradient-to-br from-wa-primary to-wa-primary/60 text-white'
                  }`}>
                    {other.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {online && (
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 rounded-full ${
                      active ? 'border-wa-primary' : 'border-surface'
                    }`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-foreground'}`}>{other.name || 'Unknown'}</span>
                    {conv.last_message && (
                      <span className={`text-[10px] shrink-0 ${active ? 'text-white/70' : 'text-gray-400'}`}>{timeAgo(conv.last_message.created_at)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-xs truncate flex-1 ${active ? 'text-white/70' : 'text-gray-400'}`}>
                      {conv.last_message
                        ? (conv.last_message.sender_id === myId ? 'Anda: ' : '') + conv.last_message.message
                        : 'Belum ada pesan'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 px-1.5 py-0.5 bg-wa-accent text-white text-[10px] font-bold rounded-full min-w-[20px] text-center leading-none">
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
});

export default ConversationList;
