'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Video, ArrowDown, PhoneOff } from '@/lib/animated-icons';
import { api } from '@/lib/api';
import { formatDateId, formatTimeId } from '@/lib/date';

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

function formatTime(dateStr) {
  return formatTimeId(dateStr);
}

function formatDuration(sec) {
  if (!sec && sec !== 0) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} detik`;
  return `${m} menit ${s} detik`;
}

function CallIcon({ type, status, isIncoming }) {
  if (status === 'missed') return <PhoneOff className="w-5 h-5 text-red-500" />;
  if (!isIncoming) return (
    <div className="relative">
      <Phone className="w-5 h-5 text-wa-accent" />
      <ArrowDown className="w-3 h-3 text-wa-accent absolute -bottom-1 -right-1" />
    </div>
  );
  return type === 'video'
    ? <Video className="w-5 h-5 text-wa-primary" />
    : <Phone className="w-5 h-5 text-wa-primary" />;
}

export default function CallHistoryModal({ open, onClose, conversationId }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !conversationId) return;
    setLoading(true);
    api.calls.history(conversationId)
      .then((res) => setCalls(res?.data || res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, conversationId]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[70vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-wa-primary text-white shrink-0">
              <h3 className="text-base font-semibold">Riwayat Panggilan</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : calls.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Belum ada riwayat panggilan</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {calls.map((call) => {
                    const isIncoming = call.receiver_id === call.caller_id;
                    const caller = call.caller || {};
                    return (
                      <div key={call.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wa-primary/10 to-wa-primary/5 flex items-center justify-center shrink-0">
                          <CallIcon type={call.type} status={call.status} isIncoming={isIncoming} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{caller.name || 'Unknown'}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${call.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {call.type === 'video' ? 'Video' : 'Suara'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${call.status === 'missed' ? 'text-red-500' : call.status === 'ended' ? 'text-gray-400' : 'text-wa-accent'}`}>
                              {call.status === 'missed' ? 'Tidak dijawab'
                                : call.status === 'rejected' ? 'Ditolak'
                                : call.status === 'ended' ? `Selesai${call.duration ? ` (${formatDuration(call.duration)})` : ''}`
                                : call.status === 'ongoing' ? 'Berlangsung'
                                : call.status}
                            </span>
                            <span className="text-[10px] text-gray-400">{formatDate(call.created_at)} {formatTime(call.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
