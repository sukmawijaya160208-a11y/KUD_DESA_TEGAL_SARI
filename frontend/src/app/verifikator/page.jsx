'use client';

import { useState, useEffect, useCallback, memo, startTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  CheckBadgeIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon,
  UsersIcon, ClockIcon, CheckCircleIcon, XCircleIcon
} from '@heroicons/react/24/outline';

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'verified', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

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

const PekebunRow = memo(function PekebunRow({ d, onPreview, onVerifikasi }) {
  return (
    <motion.tr variants={fadeUp} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {d.foto_pekebun ? (
              <img src={d.foto_pekebun} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => onPreview(d.foto_pekebun)} />
            ) : (
              <span className="text-white font-bold text-sm">{d.nama?.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{d.nama}</p>
            <p className="text-[11px] text-gray-400">NIK: {d.nik}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-gray-600">{d.no_whatsapp}</td>
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
            <span className="text-[11px] text-gray-400 italic">-</span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5">
          {d.lahan?.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{d.lahan.length} Lahan</span>
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
          <span className="text-[11px] text-gray-400 italic">-</span>
        )}
      </td>
    </motion.tr>
  );
});

export default function VerifikatorPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [verifModal, setVerifModal] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, perPage: 10 };
    if (filterStatus) params.status = filterStatus;
    if (search) params.search = search;
    api.verifikator.pengajuanPekebun(params)
      .then((res) => startTransition(() => {
        if (res.data) {
          setData(res.data);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        } else {
          setData(res);
          setMeta({ currentPage: 1, lastPage: 1, total: res.length });
        }
      }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [page, search, filterStatus, toast]);

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

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <CheckBadgeIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifikasi Pekebun</h1>
          <p className="text-sm text-gray-500 mt-0.5">Setujui atau tolak pendaftaran pekebun baru</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard icon={ClockIcon} label="Menunggu" value={stats.pending} color="warning" />
        <StatsCard icon={CheckCircleIcon} label="Disetujui" value={stats.verified} color="success" />
        <StatsCard icon={XCircleIcon} label="Ditolak" value={stats.rejected} color="destructive" />
      </div>

      <div className="bg-surface rounded-2xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari nama, NIK, atau WhatsApp..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => startTransition(() => { setFilterStatus(e.target.value); setPage(1); })}
            className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
          >
            {STATUS_OPTIONS.map((o) => (
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
              <CheckBadgeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Tidak ada data pekebun</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
                  <th className="text-left py-3 px-3 font-semibold text-white/80 first:rounded-l-lg">Pekebun</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">WhatsApp</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Dokumen</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Lahan</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80 last:rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <PekebunRow
                    key={d.id}
                    d={d}
                    onPreview={setPreviewImage}
                    onVerifikasi={openVerifikasi}
                  />
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
        <p className="text-sm text-gray-600 mb-4">
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
          <Button variant="secondary" onClick={() => setVerifModal(null)}>Batal</Button>
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
