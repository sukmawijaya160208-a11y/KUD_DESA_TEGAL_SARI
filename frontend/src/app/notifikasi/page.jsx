'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/date';

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const load = () => api.notifikasi.list().then(setNotifs).catch(() => setError('Gagal memuat notifikasi')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleMarkAll = async () => {
    await api.notifikasi.markAllAsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
        <Button variant="ghost" size="sm" onClick={handleMarkAll}>Tandai Semua Dibaca</Button>
      </div>

      {notifs.length === 0 ? (
        <p className="text-gray-400 text-center py-20">Belum ada notifikasi</p>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <button key={n.id} onClick={() => { if (n.link) router.push(n.link); if (!n.is_read) api.notifikasi.markAsRead(n.id).then(() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x))); }}
              className={`w-full text-left block ${!n.is_read ? 'bg-kud-green/5 border-kud-green/20' : ''} border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors`}>
              <div className="flex items-center gap-2">
                {!n.is_read && <span className="w-2 h-2 bg-kud-green rounded-full shrink-0" />}
                <h3 className={`text-sm ${!n.is_read ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{n.judul}</h3>
                <span className="text-[10px] text-gray-400 ml-auto">{formatDate(n.created_at)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-4">{n.pesan}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
