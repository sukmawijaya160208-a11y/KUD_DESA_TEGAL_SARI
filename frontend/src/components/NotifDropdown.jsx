'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function NotifDropdown() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [count, setCount] = useState(0);
  const ref = useRef();
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const [d, c] = await Promise.all([api.notifikasi.list(), api.notifikasi.countUnread()]);
      queueMicrotask(() => { setNotifs(d); setCount(c.count); });
    } catch {}
  }, []);

  useEffect(() => { refresh(); const interval = setInterval(refresh, 30000); return () => clearInterval(interval); }, [refresh]);
  useEffect(() => { const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }, []);

  const handleClick = async (n) => {
    if (!n.is_read) await api.notifikasi.markAsRead(n.id).catch(() => {});
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2.5 text-foreground/60 hover:text-foreground transition-colors cursor-pointer">
        <BellIcon className="w-5 h-5" />
        {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-border z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-surface z-10 flex items-center justify-between px-4 py-3 border-b border-border rounded-t-2xl">
            <h3 className="font-heading font-bold text-foreground text-sm">Notifikasi</h3>
            {count > 0 && <button onClick={async () => { await api.notifikasi.markAllAsRead().catch(() => {}); setCount(0); setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true }))); }} className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1"><CheckIcon className="w-3 h-3" /> Tandai dibaca</button>}
          </div>
          {notifs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Tidak ada notifikasi</p>
          ) : (
            notifs.map((n) => (
              <button key={n.id} onClick={() => handleClick(n)} className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/[0.03]' : ''}`}>
                <p className={`text-sm ${!n.is_read ? 'font-bold text-foreground' : 'text-gray-600'}`}>{n.judul}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.pesan}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
