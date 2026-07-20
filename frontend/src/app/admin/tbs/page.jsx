'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/date';

export default function AdminTBSPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => { api.admin.tbs.list().then(d => setData(d.data || [])).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [toast]);

  const filtered = data.filter((d) =>
    d.pekebun?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.pekebun?.nama?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <TableSkeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Data TBS Seluruh Pekebun</h1>

      <Card>
        <input placeholder="Cari pekebun..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all mb-4" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Pekebun</th>
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Tanggal</th>
              <th className="text-right py-3 px-3 font-semibold text-foreground/70">Jumlah TBS</th>
              <th className="text-left py-3 px-3 font-semibold text-foreground/70">Keterangan</th>
            </tr></thead>
            <tbody>
              {paged.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-foreground">{d.pekebun?.nama}</div>
                    <div className="text-xs text-gray-400">{d.pekebun?.user?.email}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{d.tanggal ? formatDate(d.tanggal) : '-'}</td>
                  <td className="py-3 px-3 text-right font-semibold text-foreground">{d.jumlah_tbs} kg</td>
                  <td className="py-3 px-3 text-gray-500">{d.keterangan || '-'}</td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan="4" className="text-center py-10 text-gray-400">Tidak ada data TBS</td></tr>}
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
