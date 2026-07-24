'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  ShieldExclamationIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon,
  CheckCircleIcon, XCircleIcon, ArrowUpIcon, ArrowDownIcon,
  ClockIcon, EyeIcon, ChevronDownIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatRelative } from '@/lib/date';
const TINDAKAN_OPTIONS = [
  { value: '', label: 'Semua Tindakan' },
  { value: 'terima', label: 'Disetujui' },
  { value: 'tolak', label: 'Ditolak' },
];

const TIPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'Pekebun', label: 'Pekebun' },
  { value: 'Program', label: 'Program' },
];

const PAGE_SIZES = [10, 20, 50, 100];

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

function getTipe(v) {
  if (v.verifiable_type?.includes('Pekebun')) return 'Pekebun';
  if (v.verifiable_type?.includes('PendaftaranProgram')) return 'Program';
  return '-';
}

export default function VerifikasiLogPage() {
  const toast = useToast();
  const searchRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filterTindakan, setFilterTindakan] = useState('');
  const [filterTipe, setFilterTipe] = useState('');

  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [gotoPage, setGotoPage] = useState('');

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [detailModal, setDetailModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    api.admin.verifikasiLog.list()
      .then(d => { setData(Array.isArray(d) ? d : []); setError(null); })
      .catch(e => { setError(e.message); toast.error(e.message); })
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(() => {
    return data.filter(v => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = v.user?.name?.toLowerCase().includes(q);
        const matchCatatan = v.catatan?.toLowerCase().includes(q);
        const matchTarget = extractTargetName(v).toLowerCase().includes(q);
        if (!matchName && !matchCatatan && !matchTarget) return false;
      }
      if (filterTindakan && v.tindakan !== filterTindakan) return false;
      if (filterTipe) {
        const tipe = getTipe(v);
        if (tipe !== filterTipe) return false;
      }
      return true;
    });
  }, [data, search, filterTindakan, filterTipe]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case 'created_at': va = a.created_at || ''; vb = b.created_at || ''; break;
        case 'verifikator': va = a.user?.name?.toLowerCase() || ''; vb = b.user?.name?.toLowerCase() || ''; break;
        case 'tipe': va = getTipe(a); vb = getTipe(b); break;
        case 'tindakan': va = a.tindakan || ''; vb = b.tindakan || ''; break;
        case 'target': va = extractTargetName(a).toLowerCase(); vb = extractTargetName(b).toLowerCase(); break;
        default: va = a.created_at || ''; vb = b.created_at || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const stats = useMemo(() => {
    const total = data.length;
    const terima = data.filter(v => v.tindakan === 'terima').length;
    const tolak = data.filter(v => v.tindakan === 'tolak').length;
    return { total, terima, tolak };
  }, [data]);

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

  const renderTindakanBadge = (tindakan) => {
    if (tindakan === 'terima') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
        <CheckCircleIcon className="w-3.5 h-3.5" /> Disetujui
      </span>
    );
    if (tindakan === 'tolak') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
        <XCircleIcon className="w-3.5 h-3.5" /> Ditolak
      </span>
    );
    return <Badge status="pending" />;
  };

  const hasActiveFilters = search || filterTindakan || filterTipe;

  const clearFilters = () => {
    setSearch('');
    setFilterTindakan('');
    setFilterTipe('');
    setPage(1);
  };

  if (loading) return <TableSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShieldExclamationIcon className="w-16 h-16 text-destructive/60 mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Gagal Memuat Data</h2>
      <p className="text-gray-500 text-sm mb-4">{error}</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shadow-sm">
            <ShieldExclamationIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Verifikasi Log</h1>
            <p className="text-sm text-gray-500 mt-0.5">Riwayat verifikasi oleh semua verifikator</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Verifikasi', value: stats.total, icon: ShieldExclamationIcon, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
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
            <input ref={searchRef} placeholder="Cari verifikator, catatan, atau target..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
          </div>
          <Select value={filterTindakan} onChange={(e) => { setFilterTindakan(e.target.value); setPage(1); }} className="min-w-[160px]">
            {TINDAKAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Select value={filterTipe} onChange={(e) => { setFilterTipe(e.target.value); setPage(1); }} className="min-w-[140px]">
            {TIPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-gray-400 font-medium"><FunnelIcon className="w-3 h-3 inline mr-1" />Filter:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Cari: {search}
                <button onClick={() => setSearch('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterTindakan && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Tindakan: {filterTindakan === 'terima' ? 'Disetujui' : 'Ditolak'}
                <button onClick={() => setFilterTindakan('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterTipe && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Tipe: {filterTipe}
                <button onClick={() => setFilterTipe('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-foreground underline cursor-pointer ml-1">Clear all</button>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-3 w-8" />
                {renderSortHeader('created_at', 'Waktu', 'min-w-[140px]')}
                {renderSortHeader('verifikator', 'Verifikator')}
                {renderSortHeader('tipe', 'Tipe')}
                {renderSortHeader('target', 'Target')}
                {renderSortHeader('tindakan', 'Tindakan')}
                <th className="text-left py-3 px-3 font-semibold text-foreground/70">Catatan</th>
                <th className="text-left py-3 px-3 font-semibold text-foreground/70">Detail</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((v) => {
                const expanded = expandedRows.has(v.id);
                return (
                  <tr key={v.id} className={`border-b border-border/50 transition-colors hover:bg-muted/50 ${expanded ? 'bg-muted/30' : ''}`}>
                    <td className="py-3 px-3">
                      <button onClick={() => setExpandedRows(prev => { const n = new Set(prev); if (n.has(v.id)) n.delete(v.id); else n.add(v.id); return n; })}
                        className="p-0.5 rounded hover:bg-muted transition-all cursor-pointer">
                        {expanded ? <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{formatDate(v.created_at)}</span>
                        <span className="text-[10px] text-gray-400">{formatRelative(v.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {v.user?.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-foreground text-sm">{v.user?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getTipe(v) === 'Pekebun' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {getTipe(v)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-foreground font-medium">{extractTargetName(v)}</td>
                    <td className="py-3 px-3">{renderTindakanBadge(v.tindakan)}</td>
                    <td className="py-3 px-3 text-sm text-gray-500 max-w-xs truncate">{v.catatan || '-'}</td>
                    <td className="py-3 px-3">
                      <button onClick={() => setDetailModal(v)}
                        className="p-1.5 rounded-lg hover:bg-muted text-gray-400 hover:text-primary transition-all cursor-pointer" title="Detail">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <ShieldExclamationIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Tidak ada data verifikasi</p>
                    <p className="text-gray-300 text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {paged.map((v) => {
          if (!expandedRows.has(v.id)) return null;
          const p = v.verifiable;
          return (
            <div key={`exp-${v.id}`} className="border-t border-border bg-muted/20 animate-fade-in">
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {[
                    ['Verifikator', v.user?.name],
                    ['Tindakan', v.tindakan === 'terima' ? 'Disetujui' : 'Ditolak'],
                    ['Tipe', getTipe(v)],
                    ['Target', extractTargetName(v)],
                    ['Waktu', v.created_at ? formatDate(v.created_at) : '-'],
                    ['Catatan', v.catatan || '-'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-gray-400 text-[11px] block mb-0.5">{label}</span>
                      <span className="font-medium text-foreground text-sm">{value || '-'}</span>
                    </div>
                  ))}
                </div>
                {p && (p.foto_pekebun || p.upload_ktp || p.upload_kk) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-gray-400 text-[11px] block mb-2">Dokumen Terkait</span>
                    <div className="flex flex-wrap gap-2">
                      {p.foto_pekebun && (
                        <button onClick={() => setPreviewImage(p.foto_pekebun)}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={p.foto_pekebun} alt="" className="w-full h-full object-cover" />
                        </button>
                      )}
                      {p.upload_ktp && (
                        <button onClick={() => setPreviewImage(p.upload_ktp)}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={p.upload_ktp} alt="" className="w-full h-full object-cover" />
                        </button>
                      )}
                      {p.upload_kk && (
                        <button onClick={() => setPreviewImage(p.upload_kk)}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={p.upload_kk} alt="" className="w-full h-full object-cover" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Menampilkan {sorted.length === 0 ? 0 : (safePage - 1) * perPage + 1} - {Math.min(safePage * perPage, sorted.length)} dari {sorted.length} data</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">per halaman:</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="border border-border rounded-lg px-2 py-1 text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none cursor-pointer">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Â« Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) pageNum = i + 1;
              else if (safePage <= 4) pageNum = i + 1;
              else if (safePage >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = safePage - 3 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${safePage === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-border hover:bg-muted text-gray-600'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next Â»</button>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-400">Go:</span>
              <input type="number" min={1} max={totalPages} value={gotoPage} onChange={(e) => setGotoPage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt(gotoPage); if (v >= 1 && v <= totalPages) setPage(v); setGotoPage(''); } }}
                className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none" />
            </div>
          </div>
        </div>
      </Card>

      {detailModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-surface rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
              <h3 className="text-lg font-bold text-foreground">Detail Verifikasi</h3>
              <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {[
                ['Verifikator', detailModal.user?.name],
                ['Tindakan', detailModal.tindakan === 'terima' ? 'Disetujui' : 'Ditolak'],
                ['Tipe', getTipe(detailModal)],
                ['Target', extractTargetName(detailModal)],
                ['Waktu', detailModal.created_at ? formatDate(detailModal.created_at) : '-'],
                ['Catatan', detailModal.catatan || '-'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-gray-400 text-xs block">{label}</span>
                  <span className="font-medium text-foreground">{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 cursor-pointer">
              <XMarkIcon className="w-4 h-4 text-gray-700" />
            </button>
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

