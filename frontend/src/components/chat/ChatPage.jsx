'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import CallProvider, { useCall } from './CallProvider';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import IncomingCall from './IncomingCall';
import CallScreen from './CallScreen';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const POLL_INTERVAL = 3000;

function ChatPageInner() {
  const [user] = useState(() => {
    if (typeof window === 'undefined') return { id: null, name: '', role: '' };
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return { id: u.id, name: u.name, role: u.role };
  });
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [mobileView, setMobileView] = useState('list');
  const call = useCall();

  useEffect(() => {
    let cancelled = false;
    api.chat.conversations()
      .then((d) => { if (!cancelled) { setConversations(d); setConvLoading(false); } })
      .catch(() => { if (!cancelled) setConvLoading(false); });
    const convPoll = setInterval(() => {
      api.chat.conversations()
        .then((d) => { if (!cancelled) {
          setConversations(d);
          if (activeConv) {
            const updated = d.find((c) => c.id === activeConv?.id);
            if (updated) setActiveConv(updated);
          }
        }})
        .catch(() => {});
    }, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(convPoll); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeConv) return;
    let cancelled = false;
    api.chat.markAsRead(activeConv.id).catch(() => {});
    api.chat.messages(activeConv.id)
      .then((d) => { if (!cancelled) setMessages(d); })
      .catch(() => {});
    const msgPoll = setInterval(() => {
      api.chat.messages(activeConv.id)
        .then((d) => { if (!cancelled) setMessages(d); })
        .catch(() => {});
    }, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(msgPoll); };
  }, [activeConv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback((conv) => {
    setActiveConv(conv);
    setMobileView('chat');
  }, []);

  const loadConversations = useCallback(() => {
    api.chat.conversations()
      .then((d) => { setConversations(d); return d; })
      .catch(() => {});
  }, []);

  const handleSend = useCallback(async (text, attachment, replyTo) => {
    const tempId = 'temp_' + Date.now();
    const optimistic = {
      id: tempId,
      conversation_id: activeConv.id,
      sender_id: user.id,
      message: text,
      attachment: attachment || null,
      reply_to: replyTo ? { id: replyTo.id, message: replyTo.message, attachment: replyTo.attachment } : null,
      created_at: new Date().toISOString(),
      is_mine: true,
      status: 'sent',
    };
    setMessages((prev) => [...prev, optimistic]);
    const sent = await api.chat.send(activeConv.id, text, attachment);
    setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...sent, is_mine: true, status: 'delivered' } : m)));
    loadConversations();
  }, [activeConv, user.id, loadConversations]);

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await api.chat.deleteMessage(activeConv.id, messageId);
      setMessages((prev) => prev.map((m) =>
        m.id === messageId ? { ...m, message: '[Pesan telah dihapus]', attachment: null } : m
      ));
    } catch {}
  }, [activeConv]);

  const handleNewChat = useCallback(() => setNewChatOpen(true), []);

  const handleStartChat = useCallback(async (convId) => {
    try {
      const data = await api.chat.conversations();
      setConversations(data);
      const found = data.find((c) => c.id === convId);
      if (found) {
        setActiveConv(found);
        setMobileView('chat');
      }
    } catch {}
  }, []);

  const handleCall = useCallback(() => {
    if (activeConv) call.initiateCall(activeConv.id, 'audio');
  }, [activeConv, call]);

  const handleVideoCall = useCallback(() => {
    if (activeConv) call.initiateCall(activeConv.id, 'video');
  }, [activeConv, call]);

  const handleBack = useCallback(() => setMobileView('list'), []);

  return (
    <>
      <IncomingCall />
      <CallScreen />
      <div className="flex h-dvh overflow-hidden">
        <div className={`${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'} lg:w-[400px] xl:w-[420px] border-r border-border bg-white flex-col w-full`}>
          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            myId={user.id}
            loading={convLoading}
          />
        </div>

        <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {activeConv ? (
            <ChatWindow
              conversation={activeConv}
              messages={messages}
              myId={user.id}
              onSend={handleSend}
              onDeleteMessage={handleDeleteMessage}
              onCall={handleCall}
              onVideoCall={handleVideoCall}
              onMobileBack={handleBack}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-chat-pattern">
              <div className="w-20 h-20 rounded-3xl bg-white/50 flex items-center justify-center mb-4">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-wa-primary/40" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground">Pesan</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Pilih percakapan atau mulai obrolan baru
              </p>
            </div>
          )}
        </div>
      </div>

      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onStart={handleStartChat}
      />
    </>
  );
}

export default function ChatPage() {
  const [user] = useState(() => {
    if (typeof window === 'undefined') return null;
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.id || null;
  });

  return (
    <CallProvider userId={user}>
      <ChatPageInner />
    </CallProvider>
  );
}
