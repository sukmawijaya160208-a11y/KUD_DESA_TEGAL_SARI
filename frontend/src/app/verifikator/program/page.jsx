'use client';

import { useState, useEffect, useCallback, memo, startTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  DocumentTextIcon, EyeIcon, XMarkIcon, MapPinIcon,
  ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';

const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP', foto_kk: 'Foto KK', akte: 'Akte',
  foto_pekebun: 'Foto Pekebun', foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'verified', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function parseKebun(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function openMaps(coord) {
  if (!coord) return;
  const q = coord.includes('http') ? coord : `https://www.google.com/maps?q=${encodeURIComponent(coord)}`;
  window.open(q, '_blank');
}

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

const ProgramRow = memo(function ProgramRow({ d, expandedId, onToggle, onPreview, onVerifikasi }) {
  const p = d.pekebun || {};
  const lahanTerdaftar = d.lahan;
  const semuaLahan = Array.isArray(p.lahan) ? p.lahan : [];
  const dokumen = d.data?.dokumen || {};
  const isExpanded = expandedId === d.id;

  return (
    <motion.tr variants={fadeUp} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {p.foto_pekebun ? (
              <img src={p.foto_pekebun} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{p.nama?.charAt(0) || '?'}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{p.nama}</p>
            <p className="text-[11px] text-gray-400">NIK: {p.nik || '-'}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="text-sm font-medium text-foreground">{d.programKud?.nama || '-'}</span>
      </td>
      <td className="py-3 px-3 text-sm text-gray-500">
        {new Date(d.created_at).toLocaleDateString('id-ID')}
      </td>
      <td className="py-3 px-3">
        <Badge status={d.status} />
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          {d.status === 'pending' && (
            <>
              <button onClick={() => onVerifikasi(d.id, 'verified')}
                className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors cursor-pointer" title="Setujui">
                <CheckCircleIcon className="w-4 h-4" />
              </button>
              <button onClick={() => onVerifikasi(d.id, 'rejected')}
                className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer" title="Tolak">
                <XCircleIcon className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={() => onToggle(d.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-foreground hover:bg-muted transition-colors cursor-pointer" title="Detail">
            {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

const ExpandedRow = memo(function ExpandedRow({ d, onPreview, onVerifikasi, catatan, setCatatan }) {
  const p = d.pekebun || {};
  const lahanTerdaftar = d.lahan;
  const semuaLahan = Array.isArray(p.lahan) ? p.lahan : [];
  const dokumen = d.data?.dokumen || {};

  return (
    <tr key={`exp-${d.id}`}>
      <td colSpan={5} className="px-3 pb-4">
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50/80 rounded-xl border border-border p-4 space-y-4">
              {Object.keys(dokumen).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dokumen Persyaratan</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {Object.entries(dokumen).map(([key, url]) => (
                      <button key={key} onClick={() => onPreview(url)}
                        className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-white cursor-pointer"
                      >
                        <img src={url} alt={key} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                          <span className="text-white text-[9px] font-medium block truncate">{PERSYARATAN_LABEL[key] || key}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(p.foto_pekebun || p.upload_ktp || p.upload_kk) && Object.keys(dokumen).length === 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dokumen Pekebun</h4>
                  <div className="flex flex-wrap gap-2">
                    {p.foto_pekebun && (
                      <button onClick={() => onPreview(p.foto_pekebun)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-medium hover:bg-blue-100 transition-all cursor-pointer">
                        <EyeIcon className="w-3.5 h-3.5" /> Foto
                      </button>
                    )}
                    {p.upload_ktp && (
                      <button onClick={() => onPreview(p.upload_ktp)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-medium hover:bg-purple-100 transition-all cursor-pointer">
                        <EyeIcon className="w-3.5 h-3.5" /> KTP
                      </button>
                    )}
                    {p.upload_kk && (
                      <button onClick={() => onPreview(p.upload_kk)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-medium hover:bg-emerald-100 transition-all cursor-pointer">
                        <EyeIcon className="w-3.5 h-3.5" /> KK
                      </button>
                    )}
                  </div>
                </div>
              )}

              {semuaLahan.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data Lahan</h4>
                  <div className="space-y-2">
                    {semuaLahan.map((l) => {
                      const isRegistered = lahanTerdaftar && lahanTerdaftar.id === l.id;
                      return (
                        <div key={l.id} className={`p-2.5 rounded-lg border ${isRegistered ? 'bg-primary/5 border-primary/20' : 'bg-white border-border'}`}>
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <p className="text-sm font-medium text-foreground">{l.alamat_lahan}</p>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">{l.jenis_surat}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {Number(l.luas_lahan_m2).toLocaleString()} M² {l.nomor_surat ? `— ${l.nomor_surat}` : ''}
                            {isRegistered && <span className="ml-2 text-primary font-medium">✓ Terdaftar</span>}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {l.foto_petani && (
                              <button onClick={() => onPreview(l.foto_petani)} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:opacity-90 transition-opacity">
                                <img src={l.foto_petani} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 left-0.5 text-[6px] bg-black/60 text-white px-1 py-0.5 rounded">Petani</span>
                              </button>
                            )}
                            {parseKebun(l.foto_kebun).map((url, ki) => (
                              <button key={ki} onClick={() => onPreview(url)} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-white cursor-pointer hover:opacity-90 transition-opacity">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 left-0.5 text-[6px] bg-black/60 text-white px-1 py-0.5 rounded">K{ki + 1}</span>
                              </button>
                            ))}
                            {l.titik_koordinat && (
                              <button onClick={() => openMaps(l.titik_koordinat)}
                                className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-primary rounded-lg text-[10px] font-medium hover:bg-blue-100 transition-all cursor-pointer">
                                <MapPinIcon className="w-3 h-3" /> Maps
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {l.upload_surat_tanah && <a href={l.upload_surat_tanah} target="_blank" className="text-[10px] text-primary hover:underline">Surat Tanah</a>}
                            {l.upload_surat_keterangan && <a href={l.upload_surat_keterangan} target="_blank" className="text-[10px] text-primary hover:underline">Keterangan</a>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <textarea
                placeholder="Catatan verifikasi (opsional)"
                value={catatan[d.id] || ''}
                onChange={(e) => setCatatan((prev) => ({ ...prev, [d.id]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
                rows={2}
              />

              <div className="flex items-center gap-2">
                {d.status === 'pending' ? (
                  <>
                    <Button variant="success" size="sm" onClick={() => onVerifikasi(d.id, 'verified')}>
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Setujui
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onVerifikasi(d.id, 'rejected')}>
                      <XCircleIcon className="w-3.5 h-3.5" /> Tolak
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 italic">Sudah diverifikasi</span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </td>
    </tr>
  );
});

export default function VerifikatorProgramPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterProgram, setFilterProgram] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [verifModal, setVerifModal] = useState(null);
  const [catatan, setCatatan] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [verifCatatan, setVerifCatatan] = useState('');
  const searchTimer = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, perPage: 10 };
    if (filterStatus) params.status = filterStatus;
    if (filterProgram) params.program_id = filterProgram;
    if (search) params.search = search;
    api.verifikator.pengajuanProgram(params)
      .then((res) => startTransition(() => {
        if (res.data) {
          const fmt = res.data.map((item) => {
            const p = item.pekebun || {};
            if (p.lahan && typeof p.lahan === 'string') try { p.lahan = JSON.parse(p.lahan); } catch { p.lahan = []; }
            if (item.lahan && typeof item.lahan.foto_kebun === 'string') try { item.lahan.foto_kebun = JSON.parse(item.lahan.foto_kebun); } catch { item.lahan.foto_kebun = []; }
            if (item.data && typeof item.data === 'string') try { item.data = JSON.parse(item.data); } catch { item.data = {}; }
            return item;
          });
          setData(fmt);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        } else {
          setData(res);
          setMeta({ currentPage: 1, lastPage: 1, total: res.length });
        }
      }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [page, search, filterStatus, filterProgram, toast]);

  const fetchStats = useCallback(() => {
    api.verifikator.statsProgram()
      .then((s) => startTransition(() => setStats(s)))
      .catch(() => {});
  }, []);

  const fetchPrograms = useCallback(() => {
    api.admin.program.list({ perPage: 100 })
      .then((res) => startTransition(() => {
        if (res.data) setProgramList(res.data);
      }))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); fetchStats(); fetchPrograms(); }, [fetchData, fetchStats, fetchPrograms]);

  const handleSearch = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => startTransition(() => setPage(1)), 300);
  };

  const openVerifikasi = (id, action) => {
    setVerifModal({ id, action });
    setVerifCatatan('');
  };

  const handleVerifikasi = async () => {
    if (!verifModal) return;
    setSubmitting(true);
    try {
      await api.verifikator.verifikasiProgram(verifModal.id, { status: verifModal.action, catatan: verifCatatan });
      toast.success(`Program berhasil ${verifModal.action === 'verified' ? 'disetujui' : 'ditolak'}`);
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
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <DocumentTextIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifikasi Program</h1>
          <p className="text-sm text-gray-500 mt-0.5">Setujui atau tolak pendaftaran program pekebun</p>
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
              placeholder="Cari pekebun atau program..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <select
            value={filterProgram}
            onChange={(e) => startTransition(() => { setFilterProgram(e.target.value); setPage(1); })}
            className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
          >
            <option value="">Semua Program</option>
            {programList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
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
              <DocumentTextIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Tidak ada data pendaftaran program</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
                  <th className="text-left py-3 px-3 font-semibold text-white/80 first:rounded-l-lg">Pekebun</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Program</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Tanggal</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80 last:rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <ProgramRow
                    key={d.id}
                    d={d}
                    expandedId={expandedId}
                    onToggle={(id) => startTransition(() => setExpandedId((prev) => prev === id ? null : id))}
                    onPreview={setPreviewImage}
                    onVerifikasi={openVerifikasi}
                  />
                ))}
                {data.map((d) => expandedId === d.id && (
                  <ExpandedRow
                    key={`exp-${d.id}`}
                    d={d}
                    onPreview={setPreviewImage}
                    onVerifikasi={openVerifikasi}
                    catatan={catatan}
                    setCatatan={setCatatan}
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

      <Modal
        open={!!verifModal}
        onClose={() => setVerifModal(null)}
        title={verifModal?.action === 'verified' ? 'Setujui Program' : 'Tolak Program'}
      >
        <p className="text-sm text-gray-600 mb-4">
          {verifModal?.action === 'verified'
            ? 'Konfirmasi persetujuan pendaftaran program ini?'
            : 'Konfirmasi penolakan pendaftaran program ini?'}
        </p>
        <textarea
          placeholder="Catatan verifikasi (opsional)"
          value={verifCatatan}
          onChange={(e) => setVerifCatatan(e.target.value)}
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
    </motion.div>
  );
}
