'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import {
  XMarkIcon, MagnifyingGlassIcon, UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function NewChatModal({ open, onClose, onStart }) {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api.chat.users()
      .then((d) => { if (!cancelled) setUsers(d); })
      .catch((e) => { if (!cancelled) toast.error(e.message); });
    return () => { cancelled = true; };
  }, [open, toast]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = async (user) => {
    setCreating(user.id);
    try {
      const res = await api.chat.create(user.id);
      await onStart(res.id);
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
    setCreating(null);
  };

  const roleBadge = (role) => {
    const s = role === 'admin' ? 'bg-blue-100 text-blue-700' :
             role === 'verifikator' ? 'bg-purple-100 text-purple-700' :
             'bg-emerald-100 text-emerald-700';
    return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s}`}>{role}</span>;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/40 flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-heading font-bold text-foreground">Percakapan Baru</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-border">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pengguna..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-muted/50 focus:ring-2 focus:ring-wa-accent/30 focus:border-wa-accent outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {users.length === 0 && !search ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  {search ? 'Tidak ada pengguna ditemukan' : 'Belum ada pengguna lain'}
                </div>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStart(user)}
                    disabled={creating === user.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-all cursor-pointer disabled:opacity-50 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wa-primary to-wa-primary/60 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                        {roleBadge(user.role)}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {creating === user.id ? (
                        <div className="w-5 h-5 border-2 border-wa-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserPlusIcon className="w-5 h-5 text-wa-primary" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
