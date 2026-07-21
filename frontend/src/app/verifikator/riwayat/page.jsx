'use client';

import { useState, useEffect, useCallback, memo, startTransition, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatRelative } from '@/lib/date';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import {
  ClockIcon, CheckCircleIcon, XCircleIcon,
  MagnifyingGlassIcon, FunnelIcon, XMarkIcon,
  ArrowUpIcon, ArrowDownIcon, EyeIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

const TINDAKAN_OPTIONS = [
  { value: '', label: 'Semua Tindakan' },
  { value: 'terima', label: 'Disetujui' },
  { value: 'tolak', label: 'Ditolak' },
];

const PAGE_SIZES = [10, 25, 50, 100];

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function getTipe(v) {
  if (v.verifiable_type?.includes('Pekebun')) return 'Pekebun';
  if (v.verifiable_type?.includes('PendaftaranProgram')) return 'Program';
  return '-';
}

function extractTargetName(v) {
  if (!v.verifiable) return '-';
  if (v.verifiable_type?.includes('Pekebun')) {
    return v.verifiable.nama || '-';
  }
  if (v.verifiable_type?.includes('PendaftaranProgram')) {
    return v.verifiable.programKud?.nama || v.verifiable.program_kud?.nama || '-';
  }
  return '-';
}

const RiwayatRow = memo(function RiwayatRow({ d }) {
  return (
    <motion.tr variants={fadeUp} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-3 px-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          d.tindakan === 'terima'
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'
        }`}>
          {d.tindakan === 'terima' ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
          {d.tindakan === 'terima' ? 'Disetujui' : 'Ditolak'}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          getTipe(d) === 'Pekebun' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {getTipe(d)}
        </span>
      </td>
      <td className="py-3 px-3 text-sm font-medium text-foreground">{extractTargetName(d)}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {d.user?.name?.charAt(0) || '?'}
          </div>
          <span className="text-sm text-foreground font-medium">{d.user?.name}</span>
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-gray-500 max-w-[200px] truncate" title={d.catatan || '-'}>{d.catatan || '-'}</td>
      <td className="py-3 px-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{formatDate(d.created_at)}</span>
          <span className="text-[10px] text-gray-400">{formatRelative(d.created_at)}</span>
        </div>
      </td>
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
  const [perPage, setPerPage] = useState(10);
  const [gotoPage, setGotoPage] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const toast = useToast();
  const searchTimer = useRef(null);
  const searchRef = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, perPage };
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
  }, [page, search, filterTindakan, perPage, toast]);

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

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const renderSortIcon = (column) => {
    if (sortKey !== column) return <ArrowUpIcon className="w-3 h-3 text-gray-300 group-hover:text-gray-400" />;
    return sortDir === 'asc'
      ? <ArrowUpIcon className="w-3 h-3 text-primary" />
      : <ArrowDownIcon className="w-3 h-3 text-primary" />;
  };

  const renderSortHeader = (column, children, className) => (
    <th className={`text-left py-3 px-3 font-semibold text-foreground/70 group cursor-pointer select-none ${className || ''}`}
      onClick={() => toggleSort(column)}>
      <div className="flex items-center gap-1">
        {children}
        {renderSortIcon(column)}
      </div>
    </th>
  );

  const hasActiveFilters = search || filterTindakan;

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
        {[
          { label: 'Total', value: stats.total, icon: ShieldCheckIcon, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
          { label: 'Disetujui', value: stats.terima, icon: CheckCircleIcon, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Ditolak', value: stats.tolak, icon: XCircleIcon, color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
        ].map((s, i) => (
          <div key={i} className={`bg-surface rounded-2xl border border-border p-4 ${s.shadow} transition-all duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <Card className="mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input ref={searchRef}
              placeholder="Cari target, verifikator, atau catatan..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <Select value={filterTindakan} onChange={(e) => { startTransition(() => { setFilterTindakan(e.target.value); setPage(1); }); }} className="min-w-[160px]">
            {TINDAKAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-gray-400 font-medium"><FunnelIcon className="w-3 h-3 inline mr-1" />Filter:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Cari: {search}
                <button onClick={() => { setSearch(''); setPage(1); }} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterTindakan && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Tindakan: {filterTindakan === 'terima' ? 'Disetujui' : 'Ditolak'}
                <button onClick={() => { setFilterTindakan(''); setPage(1); }} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={() => { setSearch(''); setFilterTindakan(''); setPage(1); }}
              className="text-xs text-gray-400 hover:text-foreground underline cursor-pointer ml-1">Clear all</button>
          </div>
        )}
      </Card>

      <Card>
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
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Tindakan</th>
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Tipe</th>
                  {renderSortHeader('target', 'Target')}
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Verifikator</th>
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Catatan</th>
                  {renderSortHeader('created_at', 'Tanggal', 'min-w-[140px]')}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Halaman {meta.currentPage} dari {meta.lastPage} (Total: {meta.total})</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">per halaman:</span>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="border border-border rounded-lg px-2 py-1 text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none cursor-pointer">
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button disabled={meta.currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">« Prev</button>
              {Array.from({ length: Math.min(meta.lastPage, 7) }, (_, i) => {
                let pageNum;
                if (meta.lastPage <= 7) pageNum = i + 1;
                else if (meta.currentPage <= 4) pageNum = i + 1;
                else if (meta.currentPage >= meta.lastPage - 3) pageNum = meta.lastPage - 6 + i;
                else pageNum = meta.currentPage - 3 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${meta.currentPage === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-border hover:bg-muted text-gray-600'}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button disabled={meta.currentPage >= meta.lastPage} onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next »</button>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-gray-400">Go:</span>
                <input type="number" min={1} max={meta.lastPage} value={gotoPage} onChange={(e) => setGotoPage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt(gotoPage); if (v >= 1 && v <= meta.lastPage) setPage(v); setGotoPage(''); } }}
                  className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none" />
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
