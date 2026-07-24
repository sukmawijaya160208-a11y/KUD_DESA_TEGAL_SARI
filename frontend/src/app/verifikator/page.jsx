'use client';

import { useState, useEffect, useCallback, memo, startTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  CheckBadgeIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon,
  UsersIcon, ClockIcon, CheckCircleIcon, XCircleIcon,
  FunnelIcon, ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatRelative } from '@/lib/date';

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'verified', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

const PAGE_SIZES = [10, 25, 50, 100];

const PekebunRow = memo(function PekebunRow({ d, onPreview, onVerifikasi, expanded, onToggleExpand }) {
  return (
    <motion.tr variants={fadeUp}
      className={`border-b border-border/50 transition-colors hover:bg-muted/50 ${expanded ? 'bg-muted/30' : ''}`}>
      <td className="py-3 px-3 w-8">
        <button onClick={onToggleExpand} className="p-0.5 rounded hover:bg-muted transition-all cursor-pointer">
          {expanded ? <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
        </button>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {d.foto_pekebun ? (
              <img src={d.foto_pekebun} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => onPreview(d.foto_pekebun)} />
            ) : (
              <span className="text-white font-bold text-sm">{d.nama?.charAt(0) || '?'}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{d.nama}</p>
            <p className="text-[11px] text-muted-foreground">NIK: {d.nik}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground">{d.no_whatsapp}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          {d.foto_pekebun && (
            <button onClick={() => onPreview(d.foto_pekebun)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer" title="Foto">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {d.upload_ktp && (
            <button onClick={() => onPreview(d.upload_ktp)} className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer" title="KTP">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {d.upload_kk && (
            <button onClick={() => onPreview(d.upload_kk)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer" title="KK">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {(!d.foto_pekebun && !d.upload_ktp && !d.upload_kk) && (
            <span className="text-[11px] text-muted-foreground italic">-</span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5">
          {d.lahan?.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{d.lahan.length} Lahan</span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <Badge status={d.status} />
      </td>
      <td className="py-3 px-3">
        {d.status === 'pending' ? (
          <div className="flex items-center gap-1.5">
            <button onClick={() => onVerifikasi(d.id, 'verified')}
              className="px-2.5 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5" /> Terima
            </button>
            <button onClick={() => onVerifikasi(d.id, 'rejected')}
              className="px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1">
              <XCircleIcon className="w-3.5 h-3.5" /> Tolak
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">-</span>
        )}
      </td>
    </motion.tr>
  );
});

export default function VerifikatorPage() {
  const toast = useToast();
  const searchRef = useRef(null);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [gotoPage, setGotoPage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [verifModal, setVerifModal] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const searchTimer = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, perPage };
    if (filterStatus) params.status = filterStatus;
    if (search) params.search = search;
    api.verifikator.pengajuanPekebun(params)
      .then((res) => startTransition(() => {
        if (res.data) {
          setData(res.data);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        } else {
          setData(Array.isArray(res) ? res : []);
          setMeta(Array.isArray(res) ? { currentPage: 1, lastPage: 1, total: res.length } : null);
        }
      }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [page, search, filterStatus, perPage, toast]);

  const fetchStats = useCallback(() => {
    api.verifikator.statsPekebun()
      .then((s) => startTransition(() => setStats(s)))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSearch = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => startTransition(() => setPage(1)), 300);
  };

  const openVerifikasi = (id, action) => {
    setVerifModal({ id, action });
    setCatatan('');
  };

  const handleVerifikasi = async () => {
    if (!verifModal) return;
    setSubmitting(true);
    try {
      await api.verifikator.verifikasiPekebun(verifModal.id, { status: verifModal.action, catatan });
      toast.success(`Pekebun berhasil ${verifModal.action === 'verified' ? 'disetujui' : 'ditolak'}`);
      setVerifModal(null);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
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

  const hasActiveFilters = search || filterStatus !== 'pending';

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
            <CheckBadgeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Verifikasi Pekebun</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Setujui atau tolak pendaftaran pekebun baru</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Menunggu', value: stats.pending, icon: ClockIcon, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
          { label: 'Disetujui', value: stats.verified, icon: CheckCircleIcon, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Ditolak', value: stats.rejected, icon: XCircleIcon, color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
        ].map((s, i) => (
          <div key={i} className={`bg-surface rounded-2xl border border-border p-4 shadow-sm ${s.shadow} transition-all duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center shadow-sm`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border mb-4 shadow-sm">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef}
              placeholder="Cari nama, NIK, atau WhatsApp..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => { startTransition(() => { setFilterStatus(e.target.value); setPage(1); }); }} className="min-w-[160px]">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
            <span className="text-xs text-muted-foreground font-medium"><FunnelIcon className="w-3 h-3 inline mr-1" />Filter:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Cari: {search}
                <button onClick={() => { setSearch(''); setPage(1); }} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterStatus !== 'pending' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Status: {filterStatus === 'verified' ? 'Disetujui' : 'Ditolak'}
                <button onClick={() => setFilterStatus('pending')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={() => { setSearch(''); setFilterStatus('pending'); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer ml-1">Clear all</button>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data...
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center">
              <CheckBadgeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-muted-foreground">Tidak ada data pekebun</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-3 w-8" />
                  {renderSortHeader('nama', 'Pekebun', 'min-w-[200px]')}
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">WhatsApp</th>
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Dokumen</th>
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Lahan</th>
                  {renderSortHeader('status', 'Status')}
                  <th className="text-left py-3 px-3 font-semibold text-foreground/70">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => {
                  const expanded = expandedRows.has(d.id);
                  return (
                    <PekebunRow
                      key={d.id}
                      d={d}
                      onPreview={setPreviewImage}
                      onVerifikasi={openVerifikasi}
                      expanded={expanded}
                      onToggleExpand={() => setExpandedRows(prev => { const n = new Set(prev); if (n.has(d.id)) n.delete(d.id); else n.add(d.id); return n; })}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {data.map((d) => {
          if (!expandedRows.has(d.id)) return null;
          return (
            <div key={`exp-${d.id}`} className="border-t border-border bg-muted/20 animate-fade-in">
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {[
                    ['Nama', d.nama],
                    ['NIK', d.nik],
                    ['No. KK', d.no_kk || '-'],
                    ['Tempat Lahir', d.tempat_lahir || '-'],
                    ['Tanggal Lahir', d.tanggal_lahir ? formatDate(d.tanggal_lahir) : '-'],
                    ['WhatsApp', d.no_whatsapp || '-'],
                    ['Alamat', d.alamat || '-'],
                    ['Status', d.status],
                  ].map(([label, value]) => (
                    <div key={label} className={label === 'Alamat' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                      <span className="text-muted-foreground text-[11px] block mb-0.5">{label}</span>
                      <span className="font-medium text-foreground text-sm">{value || '-'}</span>
                    </div>
                  ))}
                </div>
                {(d.foto_pekebun || d.upload_ktp || d.upload_kk) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-muted-foreground text-[11px] block mb-2">Dokumen</span>
                    <div className="flex flex-wrap gap-2">
                      {d.foto_pekebun && (
                        <button onClick={() => setPreviewImage(d.foto_pekebun)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={d.foto_pekebun} alt="" className="w-full h-full object-cover" />
                        </button>
                      )}
                      {d.upload_ktp && (
                        <button onClick={() => setPreviewImage(d.upload_ktp)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={d.upload_ktp} alt="" className="w-full h-full object-cover" />
                        </button>
                      )}
                      {d.upload_kk && (
                        <button onClick={() => setPreviewImage(d.upload_kk)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={d.upload_kk} alt="" className="w-full h-full object-cover" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {d.lahan?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-muted-foreground text-[11px] block mb-2">Data Lahan</span>
                    <div className="space-y-2">
                      {d.lahan.map(l => (
                        <div key={l.id} className="p-2.5 rounded-lg border border-border bg-white">
                          <p className="text-sm font-medium text-foreground">{l.alamat_lahan}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{Number(l.luas_lahan_m2).toLocaleString()} M² — {l.jenis_surat}{l.nomor_surat ? ` (${l.nomor_surat})` : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {meta.lastPage > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${meta.currentPage === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-border hover:bg-muted text-muted-foreground'}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button disabled={meta.currentPage >= meta.lastPage} onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next »</button>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-muted-foreground">Go:</span>
                <input type="number" min={1} max={meta.lastPage} value={gotoPage} onChange={(e) => setGotoPage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt(gotoPage); if (v >= 1 && v <= meta.lastPage) setPage(v); setGotoPage(''); } }}
                  className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[9998] bg-black/85 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 cursor-pointer">
              <XMarkIcon className="w-4 h-4 text-gray-700" />
            </button>
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      <Modal
        open={!!verifModal}
        onClose={() => setVerifModal(null)}
        title={verifModal?.action === 'verified' ? 'Setujui Pekebun' : 'Tolak Pekebun'}
      >
        <p className="text-sm text-muted-foreground mb-4">
          {verifModal?.action === 'verified'
            ? 'Konfirmasi persetujuan pekebun ini?'
            : 'Konfirmasi penolakan pekebun ini?'}
        </p>
        <textarea
          placeholder="Catatan verifikasi (opsional)"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border text-sm resize-none bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all mb-4"
          rows={3}
        />
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => setVerifModal(null)}>Batal</Button>
          <Button
            variant={verifModal?.action === 'verified' ? 'success' : 'danger'}
            loading={submitting}
            onClick={handleVerifikasi}
          >
            {verifModal?.action === 'verified' ? 'Setujui' : 'Tolak'}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
