'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MessageCircle, Phone } from '@/lib/animated-icons';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import CallHistoryModal from './CallHistoryModal';
import { formatDateId } from '@/lib/date';

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  for (const msg of messages) {
    const dateKey = msg.created_at ? new Date(msg.created_at).toDateString() : 'unknown';
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: msg.created_at, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hari ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return formatDateId(d, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChatWindow({ conversation, messages, myId, onSend, onDeleteMessage, onCall, onVideoCall, onMobileBack, otherTyping }) {
  const [replyTo, setReplyTo] = useState(null);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const bottomRef = useRef(null);
  const msgContainerRef = useRef(null);

  useEffect(() => {
    const container = msgContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [conversation?.id]);

  const handleSend = (text, attachment, reply) => {
    return onSend(text, attachment, reply);
  };

  const handleReply = useCallback((msg) => {
    setReplyTo(msg);
  }, []);

  const handleDelete = useCallback((messageId) => {
    if (onDeleteMessage) onDeleteMessage(messageId);
  }, [onDeleteMessage]);

  const dateGroups = useMemo(() => groupByDate(messages), [messages]);

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-chat-pattern">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-wa-primary/10 to-wa-primary/5 flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-wa-primary/40" />
        </div>
        <h3 className="text-lg font-heading font-bold text-foreground">Pesan</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Pilih percakapan dari sidebar atau mulai obrolan baru
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-chat-pattern">
      <ChatHeader
        conversation={conversation}
        myId={myId}
        onMobileBack={onMobileBack}
        onCall={onCall}
        onVideoCall={onVideoCall}
        otherTyping={otherTyping}
      />

      <div ref={msgContainerRef} className="flex-1 overflow-y-auto py-2 scroll-smooth">
        {dateGroups.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-3">
              <span className="px-3 py-1 bg-white/90 text-gray-500 text-[11px] font-medium rounded-full shadow-sm">
                {formatDate(group.date)}
              </span>
            </div>
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id || msg._temp}
                message={msg}
                isMine={Number(msg.sender_id) === Number(myId) || msg.is_mine}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center justify-center border-t border-border bg-white px-2 py-1">
        <button
          onClick={() => setShowCallHistory(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-xs text-gray-500"
        >
          <Phone className="w-3.5 h-3.5" />
          Riwayat Panggilan
        </button>
      </div>

      <ChatInput onSend={handleSend} active={conversation} replyTo={replyTo} onClearReply={() => setReplyTo(null)} conversationId={conversation.id} />

      <CallHistoryModal
        open={showCallHistory}
        onClose={() => setShowCallHistory(false)}
        conversationId={conversation.id}
      />
    </div>
  );
}
