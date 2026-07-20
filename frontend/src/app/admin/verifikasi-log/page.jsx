'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/date';

export default function VerifikasiLogPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => { api.admin.verifikasiLog.list().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [toast]);

  const paged = data.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(data.length / perPage);

  const tindakanBadge = (t) => {
    if (t === 'terima') return <Badge status="verified" />;
    if (t === 'tolak') return <Badge status="rejected" />;
    return <Badge status="pending" />;
  };

  if (loading) return <TableSkeleton />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShieldExclamationIcon className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifikasi Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Riwayat verifikasi oleh semua verifikator</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Waktu</th>
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Verifikator</th>
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Tipe</th>
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Tindakan</th>
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Catatan</th>
            </tr></thead>
            <tbody>
              {paged.map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3 text-gray-500 text-xs">{v.created_at ? formatDate(v.created_at) : '-'}</td>
                  <td className="py-3 px-3 font-medium text-foreground">{v.user?.name}</td>
                  <td className="py-3 px-3"><span className="text-xs text-gray-500">{v.verifiable_type?.includes('Pekebun') ? 'Pekebun' : 'Program'}</span></td>
                  <td className="py-3 px-3">{tindakanBadge(v.tindakan)}</td>
                  <td className="py-3 px-3 text-gray-500 text-sm max-w-xs truncate">{v.catatan || '-'}</td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-gray-400">Belum ada riwayat verifikasi</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
