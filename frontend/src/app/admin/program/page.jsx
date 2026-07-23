'use client';

import { useEffect, useState, useRef, useCallback, memo, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';
import ProgramDetail from '@/components/ProgramDetail';
import { formatDate, formatDateShort } from '@/lib/date';
import { motion, AnimatePresence } from 'framer-motion';
import ExportDropdown from '@/components/ExportDropdown';
import DocumentViewer from '@/components/DocumentViewer';
import {
  ClipboardDocumentListIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  XMarkIcon, PhotoIcon, CalendarDaysIcon, UsersIcon,
  CheckCircleIcon, ClockIcon, MagnifyingGlassIcon,
  ChevronDownIcon, ChevronUpIcon, EyeIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

const JENIS_OPTIONS = ['PSR', 'Intensifikasi', 'Ekstensifikasi', 'Pelatihan SDMPKS', 'Beasiswa SDMPKS', 'Kemitraan'];
const ALL_PERSYARATAN = [
  { value: 'foto_ktp', label: 'Foto KTP' },
  { value: 'foto_kk', label: 'Foto KK' },
  { value: 'akte', label: 'Akte' },
  { value: 'foto_pekebun', label: 'Foto Pekebun' },
  { value: 'foto_surat_tanah', label: 'Foto Surat Tanah' },
  { value: 'keterangan_beda_nama', label: 'Keterangan Beda Nama' },
];
const PERSYARATAN_LABEL = Object.fromEntries(ALL_PERSYARATAN.map((p) => [p.value, p.label]));
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Terbaru' },
  { value: 'nama', label: 'Nama A-Z' },
  { value: 'tanggal_mulai', label: 'Tanggal Mulai' },
];


const STATUS_MAP = {
  verified: 'âœ“',
  pending: 'â—',
  rejected: 'âœ—',
};
const STATUS_CLASS = {
  verified: 'text-green-600 bg-green-50',
  pending: 'text-yellow-600 bg-yellow-50',
  rejected: 'text-red-600 bg-red-50',
};

function ProgramCard({ program, onEdit, onDelete, onDetail, onToggleAktif }) {
  const [expanded, setExpanded] = useState(false);
  const pendaftar = program.pendaftaran_program || [];
  const pendaftarCount = program.pendaftaran_program_count || 0;
  const kuota = program.kuota;
  const progress = kuota ? Math.min((pendaftarCount / kuota) * 100, 100) : 0;
  const fotoUrl = program.foto?.[0];

  return (
    <motion.div
      variants={cardAnim}
      layout
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
    >
      {fotoUrl ? (
        <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden relative">
          <img src={fotoUrl} alt="" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg drop-shadow-sm">{program.nama}</h3>
            <span className="text-white/70 text-xs font-medium">{program.jenis}</span>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={() => onDetail(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer" title="Detail">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onEdit(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer" title="Edit">
              <PencilSquareIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-red-400/60 transition-all cursor-pointer" title="Hapus">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center relative">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white/40" />
            </div>
            <h3 className="text-white font-bold">{program.nama}</h3>
            <span className="text-white/50 text-xs">{program.jenis}</span>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={() => onDetail(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer" title="Detail">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onEdit(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer" title="Edit">
              <PencilSquareIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-red-400/60 transition-all cursor-pointer" title="Hapus">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {program.tanggal_mulai && (
            <span className="flex items-center gap-1">
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              {formatDate(program.tanggal_mulai)}
              {program.tanggal_selesai && ` - ${formatDate(program.tanggal_selesai)}`}
            </span>
          )}
          {kuota && (
            <span className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" />
              {pendaftarCount}/{kuota}
            </span>
          )}
        </div>

        {program.deskripsi && <p className="text-sm text-gray-600 line-clamp-2">{program.deskripsi}</p>}

        {program.persyaratan?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {program.persyaratan.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium">{PERSYARATAN_LABEL[s] || s}</span>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={program.aktif}
                onChange={() => onToggleAktif(program)}
              />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              <span className={`ml-2 text-xs font-semibold ${program.aktif ? 'text-green-600' : 'text-gray-400'}`}>
                {program.aktif ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
            {program.foto?.length > 1 && <span className="text-[10px] text-gray-400">+{program.foto.length - 1} foto</span>}
          </div>

          {kuota > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Kapasitas</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {pendaftar.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {expanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                Lihat Pendaftar ({pendaftarCount})
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-border">
                            <th className="py-1.5 pr-2 font-medium">Nama</th>
                            <th className="py-1.5 pr-2 font-medium">NIK</th>
                            <th className="py-1.5 pr-2 font-medium">Tgl Daftar</th>
                            <th className="py-1.5 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendaftar.map((pp) => (
                            <tr key={pp.id} className="border-b border-border/50 last:border-0">
                              <td className="py-1.5 pr-2 text-foreground">{pp.pekebun?.nama || '-'}</td>
                              <td className="py-1.5 pr-2 text-gray-500">{pp.pekebun?.nik || '-'}</td>
                              <td className="py-1.5 pr-2 text-gray-500">
                                {formatDate(pp.created_at, 'dd MMM')}
                              </td>
                              <td className="py-1.5">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${STATUS_CLASS[pp.status] || 'text-gray-500 bg-gray-50'}`}>
                                  {STATUS_MAP[pp.status] || '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ProgramCardMemo = memo(ProgramCard);

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function StatsCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  );
}

export default function AdminProgramPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [detailProgram, setDetailProgram] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [sortOrder, setSortOrder] = useState('created_at');
  const searchTimer = useRef(null);
  const [form, setForm] = useState({
    nama: '', jenis: 'PSR', deskripsi: '',
    foto: [], persyaratan: [],
    tanggal_mulai: '', tanggal_selesai: '', kuota: '',
    aktifkan_surat: false,
    surat_1_judul: '', surat_1_isi: '',
    surat_2_judul: '', surat_2_isi: '',
    surat_3_judul: '', surat_3_isi: '',
  });

  const fetchData = useCallback((params = {}) => {
    const p = {};
    if (params.search || search) p.search = params.search || search;
    if (params.jenis || filterJenis) p.jenis = params.jenis || filterJenis;
    if (params.sort || sortOrder) p.sort = params.sort || sortOrder;
    p.per_page = params.per_page || 20;
    api.admin.program.list(Object.keys(p).length ? p : undefined)
      .then((res) => {
        setData(res.data || []);
        setMeta(res.last_page > 1 ? { current_page: res.current_page, last_page: res.last_page } : null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [search, filterJenis, sortOrder, toast]);

  const fetchStats = useCallback(() => {
    api.admin.program.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    startTransition(() => { setLoading(true); });
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchData({ search: val }), 300);
  }, [fetchData]);

  const handleFilterJenis = useCallback((val) => {
    setFilterJenis(val);
    fetchData({ jenis: val });
  }, [fetchData]);

  const handleSort = useCallback((val) => {
    setSortOrder(val);
    fetchData({ sort: val });
  }, [fetchData]);

  const resetForm = useCallback(() => {
    setForm({ nama: '', jenis: 'PSR', deskripsi: '', foto: [], persyaratan: [], tanggal_mulai: '', tanggal_selesai: '', kuota: '', aktifkan_surat: false, surat_1_judul: '', surat_1_isi: '', surat_2_judul: '', surat_2_isi: '', surat_3_judul: '', surat_3_isi: '' });
    setEditing(null);
    setShowForm(false);
  }, []);

  const openEdit = useCallback((item) => {
    setForm({
      nama: item.nama || '',
      jenis: item.jenis || 'PSR',
      deskripsi: item.deskripsi || '',
      foto: item.foto || [],
      persyaratan: item.persyaratan || [],
      tanggal_mulai: item.tanggal_mulai || '',
      tanggal_selesai: item.tanggal_selesai || '',
      kuota: item.kuota?.toString() || '',
      aktifkan_surat: item.aktifkan_surat || false,
      surat_1_judul: item.surat_1_judul || '',
      surat_1_isi: item.surat_1_isi || '',
      surat_2_judul: item.surat_2_judul || '',
      surat_2_isi: item.surat_2_isi || '',
      surat_3_judul: item.surat_3_judul || '',
      surat_3_isi: item.surat_3_isi || '',
    });
    setEditing(item);
    setShowForm(true);
  }, []);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.uploadDokumenProgram(file, 'foto_program');
      setForm((prev) => ({ ...prev, foto: [...prev.foto, res.url] }));
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
  };

  const removeFoto = (idx) => {
    setForm((prev) => ({ ...prev, foto: prev.foto.filter((_, i) => i !== idx) }));
  };

  const togglePersyaratan = (val) => {
    setForm((prev) => ({
      ...prev,
      persyaratan: prev.persyaratan.includes(val)
        ? prev.persyaratan.filter((p) => p !== val)
        : [...prev.persyaratan, val],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        kuota: form.kuota ? parseInt(form.kuota) : null,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null,
      };
      if (editing) {
        await api.admin.program.update(editing.id, { ...payload, aktif: true });
        toast.success('Program berhasil diperbarui');
      } else {
        await api.admin.program.create(payload);
        toast.success('Program berhasil ditambahkan');
      }
      resetForm();
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleToggleAktif = useCallback(async (program) => {
    try {
      const res = await api.admin.program.toggleAktif(program.id, !program.aktif);
      setData((prev) => prev.map((p) => (p.id === program.id ? { ...p, aktif: res.aktif, pendaftaran_program_count: res.pendaftaran_program_count } : p)));
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  }, [fetchStats, toast]);

  const handleDelete = async () => {
    try {
      await api.admin.program.delete(deleteModal.id);
      toast.success('Program berhasil dihapus');
      setDeleteModal(null);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Program KUD</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola program KUD berserta persyaratan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown
            title="Data Program KUD"
            fetchAll={() => api.admin.program.list({ per_page: 9999 }).then((res) => res.data || res)}
            pdfUrl={api.admin.export.programPdf()}
            csvUrl={api.admin.export.programCsv()}
            filename="data-program"
            renderPrintContent={(items) => `
              <table class="print-table">
                <thead>
                  <tr>
                    <th style="width:36px">No</th>
                    <th>Nama Program</th>
                    <th>Jenis</th>
                    <th style="width:70px">Status</th>
                    <th style="width:50px;text-align:center">Kuota</th>
                    <th style="width:50px;text-align:center">Daftar</th>
                    <th>Mulai</th>
                    <th>Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((p, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td><strong>${p.nama}</strong></td>
                      <td>${p.jenis}</td>
                      <td><span class="badge badge-${p.aktif ? 'aktif' : 'nonaktif'}">${p.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                      <td style="text-align:center">${p.kuota ?? '-'}</td>
                      <td style="text-align:center">${p.pendaftaran_program_count || 0}</td>
                      <td>${p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</td>
                      <td>${p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          />
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <PlusIcon className="w-4 h-4" /> Tambah Program
          </Button>
        </div>
      </motion.div>

      {stats && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatsCard label="Total Program" value={stats.total} icon={ClipboardDocumentListIcon} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatsCard label="Aktif" value={stats.aktif} icon={CheckCircleIcon} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatsCard label="Nonaktif" value={stats.nonaktif} icon={ClockIcon} color="bg-gradient-to-br from-gray-400 to-gray-500" />
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari program..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={filterJenis}
          onChange={(e) => handleFilterJenis(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Semua Jenis</option>
          {JENIS_OPTIONS.map((j) => (<option key={j} value={j}>{j}</option>))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => handleSort(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          {SORT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
      </motion.div>

      <Modal open={showForm} onClose={resetForm} title={editing ? 'Edit Program' : 'Tambah Program Baru'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Program" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required placeholder="PSR - Peremajaan Sawit Rakyat" />
            <Select label="Jenis" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
              {JENIS_OPTIONS.map((j) => (<option key={j} value={j}>{j}</option>))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Foto Program</label>
            <div className="flex flex-wrap gap-3">
              {form.foto.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border bg-muted group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFoto(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted hover:border-primary/40 transition-all">
                <div className="flex flex-col items-center gap-1">
                  <PhotoIcon className="w-6 h-6 text-gray-300" />
                  <span className="text-[10px] text-gray-400">Tambah</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFotoUpload} />
              </label>
            </div>
          </div>

          <Textarea label="Deskripsi Program" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} placeholder="Deskripsi lengkap program..." />

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Persyaratan Dokumen</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PERSYARATAN.map((p) => (
                <button key={p.value} type="button" onClick={() => togglePersyaratan(p.value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${form.persyaratan.includes(p.value) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-border hover:border-primary/40'}`}>
                  {form.persyaratan.includes(p.value) && <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.aktifkan_surat}
                onChange={(e) => setForm({ ...form, aktifkan_surat: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
              />
              <div>
                <span className="font-medium text-foreground">Aktifkan Surat Pernyataan</span>
                <p className="text-xs text-gray-400">Pekebun akan membaca & menandatangani 3 surat pernyataan</p>
              </div>
            </label>

            {form.aktifkan_surat && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-border">
                    <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-primary" />
                      Surat {i}
                    </h4>
                    <div className="space-y-3">
                      <Input
                        label="Judul Surat"
                        value={form[`surat_${i}_judul`]}
                        onChange={(e) => setForm({ ...form, [`surat_${i}_judul`]: e.target.value })}
                        placeholder={`Surat Pernyataan ${i}`}
                      />
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Isi Surat</label>
                        <textarea
                          value={form[`surat_${i}_isi`]}
                          onChange={(e) => setForm({ ...form, [`surat_${i}_isi`]: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                          placeholder={`Gunakan {{placeholder}} untuk data dinamis:\n{{nama_pekebun}}, {{nik}}, {{alamat}}, {{luas_lahan}}, dll.`}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Placeholder: {`{{nama_pekebun}}, {{nik}}, {{no_kk}}, {{tempat_lahir}}, {{tanggal_lahir}}, {{alamat}}, {{alamat_lahan}}, {{luas_lahan}}, {{nama_program}}`}
                        </p>
                      </div>
                      {form[`surat_${i}_isi`] && (
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-primary font-medium">Preview Surat {i}</summary>
                          <div className="mt-2">
                            <DocumentViewer
                              judul={form[`surat_${i}_judul`]}
                              isi={form[`surat_${i}_isi`]}
                              data={{
                                nama_pekebun: 'Contoh Nama',
                                nik: '3512345678901234',
                                alamat: 'Desa Tegal Sari',
                                alamat_lahan: 'Sawit 2 Ha',
                                luas_lahan: '20.000 M²',
                                nama_program: form.nama || 'Program',
                              }}
                              showSignature={false}
                            />
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePicker label="Tanggal Mulai" value={form.tanggal_mulai} onChange={(v) => setForm({ ...form, tanggal_mulai: v })} />
            <DatePicker label="Tanggal Selesai" value={form.tanggal_selesai} onChange={(v) => setForm({ ...form, tanggal_selesai: v })} />
            <Input label="Kuota Pendaftar" type="number" min="0" value={form.kuota} onChange={(e) => setForm({ ...form, kuota: e.target.value })} placeholder="Maksimal peserta" />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={resetForm}>Batal</Button>
            <Button type="submit" loading={submitting}>
              {editing ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              {editing ? 'Simpan Perubahan' : 'Simpan Program'}
            </Button>
          </div>
        </form>
      </Modal>

      {data.length === 0 && !search && !filterJenis ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardDocumentListIcon className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Belum Ada Program KUD</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Buat program KUD pertama Anda untuk memulai pendaftaran</p>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <PlusIcon className="w-4 h-4" /> Buat Program Baru
          </Button>
        </motion.div>
      ) : data.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16">
          <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Tidak ada program yang cocok</p>
          <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci atau filter pencarian</p>
        </motion.div>
      ) : (
        <motion.div variants={containerAnim} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.map((p) => (
            <ProgramCardMemo
              key={p.id}
              program={p}
              onEdit={openEdit}
              onDelete={setDeleteModal}
              onDetail={setDetailProgram}
              onToggleAktif={handleToggleAktif}
            />
          ))}
        </motion.div>
      )}

      {meta && meta.last_page > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchData({ page })}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all cursor-pointer ${meta.current_page === page ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-border hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}
        </motion.div>
      )}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Program" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm">Yakin ingin menghapus program <strong>{deleteModal?.nama}</strong>?</p>
        {deleteModal?.pendaftaran_program_count > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              âš ï¸ Program ini memiliki <strong>{deleteModal.pendaftaran_program_count} pendaftaran</strong> yang juga akan dihapus.
            </p>
          </div>
        )}
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>

      <ProgramDetail
        program={detailProgram}
        open={!!detailProgram}
        onClose={() => setDetailProgram(null)}
        role="admin"
      />
    </motion.div>
  );
}

