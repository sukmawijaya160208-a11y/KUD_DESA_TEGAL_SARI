'use client';

import { useEffect, useState, useRef, useCallback, memo, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EditProgramModal from './components/EditProgramModal';
import ProgramDetail from '@/components/ProgramDetail';
import { formatDate, formatDateShort } from '@/lib/date';
import { JENIS_OPTIONS } from '@/constants/options';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, SquarePen, Trash2, CalendarDays, Users, BarChart3, CheckCircle, Clock, XCircle, Search, ChevronDown, ChevronUp, Eye, Filter, Sparkles, Download, ArrowUp, ArrowDown } from '@/lib/animated-icons';

const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP',
  foto_kk: 'Foto KK',
  akte: 'Akte',
  foto_pekebun: 'Foto Pekebun',
  foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Terbaru' },
  { value: 'nama', label: 'Nama A-Z' },
  { value: 'tanggal_mulai', label: 'Tanggal Mulai' },
  { value: 'kuota', label: 'Kuota Terbesar' },
];

const STATUS_MAP = {
  verified: '✓',
  pending: '○',
  rejected: '✗',
};

const STATUS_CLASS = {
  verified: 'text-green-600 bg-green-50 border-green-200',
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
};

function ProgramCard({ program, onEdit, onDelete, onDetail, onToggleAktif }) {
  const [expanded, setExpanded] = useState(false);
  const pendaftarCount = program.pendaftaran_program_count || 0;
  const kuota = program.kuota;
  const progress = kuota ? Math.min((pendaftarCount / kuota) * 100, 100) : 0;
  const pendaftar = program.pendaftaran_program || [];
  const fotoUrl = program.foto?.[0];
  const isAktif = program.aktif !== false;
  const isPenuh = kuota && pendaftarCount >= kuota;
  const sisaKuota = kuota ? Math.max(kuota - pendaftarCount, 0) : null;
  const remainingDays = program.tanggal_selesai
    ? Math.max(Math.ceil((new Date(program.tanggal_selesai) - new Date()) / (1000 * 60 * 60 * 24)), 0)
    : null;

  return (
    <motion.div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group will-change-transform ${
        isPenuh ? 'border-amber-200' : isAktif ? 'border-border' : 'border-red-200 bg-red-50/20'
      }`}
    >
      {/* HERO */}
      {fotoUrl ? (
        <div className="h-44 bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden relative">
          <img src={fotoUrl} alt="" className="w-full h-full object-cover opacity-60" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg drop-shadow-sm leading-tight">{program.nama}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/70 text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{program.jenis}</span>
              {isPenuh && <span className="text-amber-300 text-xs font-medium bg-amber-500/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Penuh</span>}
            </div>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={() => onDetail(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => onEdit(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-150 cursor-pointer" title="Edit"><SquarePen className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-red-400/60 transition-colors duration-150 cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center relative">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2"><ClipboardList className="w-6 h-6 text-white/40" /></div>
            <h3 className="text-white font-bold">{program.nama}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-white/50 text-xs">{program.jenis}</span>
              {isPenuh && <span className="text-amber-300 text-xs font-medium">Penuh</span>}
            </div>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={() => onDetail(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => onEdit(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-150 cursor-pointer" title="Edit"><SquarePen className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(program)} className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-red-400/60 transition-colors duration-150 cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* STATUS BADGE + META */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
            isAktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAktif ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isAktif ? 'Aktif' : 'Nonaktif'}
          </span>
          {remainingDays !== null && isAktif && (
            <span className={`text-[10px] font-medium ${remainingDays <= 7 ? 'text-red-500' : 'text-gray-400'}`}>
              {remainingDays === 0 ? 'Hari ini berakhir' : `${remainingDays} hari lagi`}
            </span>
          )}
        </div>

        {/* PERIOD + KUOTA */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {program.tanggal_mulai && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">
              <CalendarDays className="w-3 h-3" />
              {formatDate(program.tanggal_mulai, 'dd MMM')}
              {program.tanggal_selesai && ` - ${formatDateShort(program.tanggal_selesai)}`}
            </span>
          )}
          {kuota && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${
              isPenuh ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Users className="w-3 h-3" />
              {pendaftarCount}/{kuota}
            </span>
          )}
        </div>

        {/* DESKRIPSI */}
        {program.deskripsi && <p className="text-sm text-gray-600 line-clamp-2">{program.deskripsi}</p>}

        {/* PERSYARATAN BADGES */}
        {program.persyaratan?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {program.persyaratan.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium border border-blue-100">{PERSYARATAN_LABEL[s] || s}</span>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border space-y-3">
          {/* PROGRESS BAR */}
          {kuota > 0 && (
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-gray-400">Kapasitas Pendaftar</span>
                <div className="flex items-center gap-2">
                  {sisaKuota !== null && (
                    <span className={`font-medium ${sisaKuota <= 5 && isAktif ? 'text-red-500' : 'text-gray-500'}`}>
                      {isPenuh ? 'Penuh' : `Sisa ${sisaKuota} kursi`}
                    </span>
                  )}
                  <span className={`font-bold ${progress >= 80 ? 'text-amber-600' : progress >= 50 ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                    progress >= 100 ? 'bg-amber-500' : progress >= 80 ? 'bg-orange-400' : progress >= 50 ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* TOGGLE + PENDAFTAR */}
          <div className="flex items-center justify-between">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isAktif} onChange={() => onToggleAktif(program)} />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              <span className={`ml-2 text-xs font-semibold ${isAktif ? 'text-emerald-600' : 'text-gray-400'}`}>
                {isAktif ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
            {program.foto?.length > 1 && <span className="text-[10px] text-gray-400">+{program.foto.length - 1} foto</span>}
          </div>

          {/* PENDAFTAR LIST */}
          {pendaftar.length > 0 && (
            <div>
              <button onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 cursor-pointer">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Lihat Pendaftar ({pendaftarCount})
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
                              <td className="py-1.5 pr-2 text-gray-500">{formatDate(pp.created_at, 'dd MMM')}</td>
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
  show: { opacity: 1, transition: { staggerChildren: 0.015 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const StatsCard = memo(function StatsCard({ label, value, sub, icon: Icon, color }) {
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </motion.div>
  );
});

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
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('created_at');
  const searchTimer = useRef(null);

  const fetchData = useCallback((params = {}) => {
    const p = {};
    if (params.search || search) p.search = params.search || search;
    if (params.jenis || filterJenis) p.jenis = params.jenis || filterJenis;
    if (params.status || filterStatus) p.status = params.status || filterStatus;
    if (params.sort || sortOrder) p.sort = params.sort || sortOrder;
    if (params.page) p.page = params.page;
    p.per_page = params.per_page || 20;
    api.admin.program.list(Object.keys(p).length ? p : undefined)
      .then((res) => {
        setData(res.data || []);
        setMeta(res.last_page > 1 ? { current_page: res.current_page, last_page: res.last_page } : null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [search, filterJenis, filterStatus, sortOrder, toast]);

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

  const handleFilterStatus = useCallback((val) => {
    setFilterStatus(val);
    fetchData({ status: val });
  }, [fetchData]);

  const handleSort = useCallback((val) => {
    setSortOrder(val);
    fetchData({ sort: val });
  }, [fetchData]);

  const openEdit = useCallback((item) => {
    setEditing(item);
    setShowForm(true);
  }, []);

  const handleFormSaved = useCallback(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

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

  const totalKuota = stats?.total_kuota || 0;
  const totalPendaftar = stats?.total_pendaftar || 0;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Program KUD</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola program KUD beserta persyaratan dan pendaftaran</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Tambah Program
        </Button>
      </motion.div>

      {/* STATS ROW */}
      {stats && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard label="Total Program" value={stats.total || 0} icon={ClipboardList} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatsCard label="Program Aktif" value={stats.aktif || 0} sub={stats.nonaktif ? `${stats.nonaktif} nonaktif` : ''} icon={CheckCircle} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatsCard label="Total Kuota" value={totalKuota} icon={BarChart3} color="bg-gradient-to-br from-amber-500 to-amber-600" />
          <StatsCard label="Total Pendaftar" value={totalPendaftar} sub={totalKuota ? `${Math.round((totalPendaftar / totalKuota) * 100)}% terisi` : ''} icon={Users} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        </motion.div>
      )}

      {/* FILTERS */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Cari program..." value={search} onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border,box-shadow]" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select value={filterStatus} onChange={(e) => handleFilterStatus(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border,box-shadow] appearance-none cursor-pointer">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="penuh">Penuh</option>
            </select>
          </div>
          <select value={filterJenis} onChange={(e) => handleFilterJenis(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border,box-shadow] cursor-pointer">
            <option value="">Semua Jenis</option>
            {JENIS_OPTIONS.filter(j => j.value).map((j) => (<option key={j.value} value={j.value}>{j.label}</option>))}
          </select>
          <select value={sortOrder} onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border,box-shadow] cursor-pointer">
            {SORT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
        </div>
      </motion.div>

      {/* EDIT MODAL */}
      <EditProgramModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        editing={editing}
        onSaved={handleFormSaved}
      />

      {/* DATA GRID */}
      {data.length === 0 && !search && !filterJenis && !filterStatus ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Belum Ada Program KUD</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Buat program KUD pertama Anda untuk memulai pendaftaran</p>
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Buat Program Baru
          </Button>
        </motion.div>
      ) : data.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Tidak ada program yang cocok</p>
          <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci atau filter pencarian</p>
        </motion.div>
      ) : (
        <motion.div variants={containerAnim} className="card-grid grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {data.map((p) => (
            <ProgramCardMemo key={p.id} program={p} onEdit={openEdit} onDelete={setDeleteModal} onDetail={setDetailProgram} onToggleAktif={handleToggleAktif} />
          ))}
        </motion.div>
      )}

      {/* PAGINATION */}
      {meta && meta.last_page > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-1.5">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => fetchData({ page })}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${meta.current_page === page ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-border hover:bg-gray-50'}`}>
              {page}
            </button>
          ))}
        </motion.div>
      )}

      {/* DELETE MODAL */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Program" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm">Yakin ingin menghapus program <strong>{deleteModal?.nama}</strong>?</p>
        {deleteModal?.pendaftaran_program_count > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">Program ini memiliki <strong>{deleteModal.pendaftaran_program_count} pendaftaran</strong> yang juga akan dihapus.</p>
          </div>
        )}
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>

      <ProgramDetail program={detailProgram} open={!!detailProgram} onClose={() => setDetailProgram(null)} role="admin" />
    </motion.div>
  );
}