'use client';

import { useState, useEffect, useCallback, memo, startTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/date';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import {
  ClockIcon, CheckCircleIcon, XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const TINDAKAN_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'terima', label: 'Disetujui' },
  { value: 'tolak', label: 'Ditolak' },
];

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value ?? '-'}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

const RiwayatRow = memo(function RiwayatRow({ d }) {
  return (
    <motion.tr variants={fadeUp} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-3 px-3">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          d.tindakan === 'terima'
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'
        }`}>
          {d.tindakan === 'terima' ? 'Disetujui' : 'Ditolak'}
        </span>
      </td>
      <td className="py-3 px-3 text-sm text-foreground font-medium">{d.user?.name}</td>
      <td className="py-3 px-3 text-sm text-gray-500 max-w-[300px] truncate">{d.catatan || '-'}</td>
      <td className="py-3 px-3 text-sm text-gray-500">{formatDate(d.created_at)}</td>
    </motion.tr>
  );
});

export default function VerifikatorRiwayatPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [stats, setStats] = useState({ total: 0, terima: 0, tolak: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTindakan, setFilterTindakan] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToast();
  const searchTimer = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, perPage: 10 };
    if (filterTindakan) params.tindakan = filterTindakan;
    if (search) params.search = search;
    api.verifikator.riwayat(params)
      .then((res) => startTransition(() => {
        if (res.data) {
          setData(res.data);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        } else {
          setData(Array.isArray(res) ? res : []);
          setMeta(Array.isArray(res) ? { currentPage: 1, lastPage: 1, total: res.length } : null);
        }
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, filterTindakan, toast]);

  const fetchStats = useCallback(() => {
    api.verifikator.statsRiwayat()
      .then((s) => startTransition(() => setStats(s)))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSearch = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => startTransition(() => setPage(1)), 300);
  };

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
          <ClockIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Verifikasi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catatan seluruh aktivitas verifikasi</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard icon={ClockIcon} label="Total" value={stats.total} color="primary" />
        <StatsCard icon={CheckCircleIcon} label="Disetujui" value={stats.terima} color="success" />
        <StatsCard icon={XCircleIcon} label="Ditolak" value={stats.tolak} color="destructive" />
      </div>

      <div className="bg-surface rounded-2xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari verifikator atau catatan..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <select
            value={filterTindakan}
            onChange={(e) => startTransition(() => { setFilterTindakan(e.target.value); setPage(1); })}
            className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
          >
            {TINDAKAN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data...
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada riwayat verifikasi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
                  <th className="text-left py-3 px-3 font-semibold text-white/80 first:rounded-l-lg">Tindakan</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Verifikator</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Catatan</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80 last:rounded-r-lg">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <RiwayatRow key={d.id} d={d} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {meta.lastPage > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Halaman {meta.currentPage} dari {meta.lastPage} (Total: {meta.total})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.currentPage <= 1}
                onClick={() => startTransition(() => setPage((p) => Math.max(1, p - 1)))}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
              >
                Prev
              </button>
              <button
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => startTransition(() => setPage((p) => p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
