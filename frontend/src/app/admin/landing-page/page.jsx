'use client';

import { useEffect, useState, useCallback, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormModal from './components/FormModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon,
  ClipboardDocumentListIcon, AcademicCapIcon, PhotoIcon,
  VideoCameraIcon, StarIcon, SparklesIcon,
  ChartBarIcon, BuildingOffice2Icon, ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon, PhoneIcon,
  ChevronUpIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const TABS = [
  { id: 'langkah', label: '6 Langkah', icon: ClipboardDocumentListIcon, color: 'from-blue-500 to-blue-600' },
  { id: 'sertifikasi', label: 'Sertifikasi', icon: AcademicCapIcon, color: 'from-purple-500 to-purple-600' },
  { id: 'dokumentasi', label: 'Dokumentasi', icon: PhotoIcon, color: 'from-green-500 to-green-600' },
  { id: 'video', label: 'Video', icon: VideoCameraIcon, color: 'from-red-500 to-red-600' },
  { id: 'keuntungan', label: 'Keuntungan', icon: StarIcon, color: 'from-yellow-500 to-amber-600' },
  { id: 'fitur', label: 'Fitur', icon: SparklesIcon, color: 'from-indigo-500 to-indigo-600' },
  { id: 'angka', label: 'KUD Angka', icon: ChartBarIcon, color: 'from-emerald-500 to-emerald-600' },
  { id: 'mitra', label: 'Mitra', icon: BuildingOffice2Icon, color: 'from-cyan-500 to-cyan-600' },
  { id: 'testimoni', label: 'Testimoni', icon: ChatBubbleLeftRightIcon, color: 'from-pink-500 to-pink-600' },
  { id: 'faq', label: 'FAQ', icon: QuestionMarkCircleIcon, color: 'from-violet-500 to-violet-600' },
  { id: 'layanan', label: 'Layanan', icon: PhoneIcon, color: 'from-rose-500 to-rose-600' },
];

const SECTION_LABELS = {
  langkah: { title: '6 Langkah Jadi Anggota', desc: 'Atur alur pendaftaran anggota KUD', icon: ClipboardDocumentListIcon, color: 'from-blue-500 to-blue-600' },
  sertifikasi: { title: 'Sertifikasi & Penghargaan', desc: 'Kelola data sertifikasi dan penghargaan', icon: AcademicCapIcon, color: 'from-purple-500 to-purple-600' },
  dokumentasi: { title: 'Dokumentasi Kegiatan', desc: 'Upload foto dokumentasi kegiatan KUD', icon: PhotoIcon, color: 'from-green-500 to-green-600' },
  video: { title: 'Multimedia Video', desc: 'Kelola video YouTube kegiatan KUD', icon: VideoCameraIcon, color: 'from-red-500 to-red-600' },
  keuntungan: { title: 'Keuntungan Bergabung', desc: 'Atur daftar keuntungan menjadi anggota', icon: StarIcon, color: 'from-yellow-500 to-amber-600' },
  fitur: { title: 'Fitur Aplikasi', desc: 'Kelola fitur-fitur aplikasi KUD', icon: SparklesIcon, color: 'from-indigo-500 to-indigo-600' },
  angka: { title: 'KUD dalam Angka', desc: 'Atur statistik dan angka KUD', icon: ChartBarIcon, color: 'from-emerald-500 to-emerald-600' },
  mitra: { title: 'Mitra & Kolaborasi', desc: 'Kelola daftar mitra KUD', icon: BuildingOffice2Icon, color: 'from-cyan-500 to-cyan-600' },
  testimoni: { title: 'Testimoni Anggota', desc: 'Kelola testimoni anggota KUD', icon: ChatBubbleLeftRightIcon, color: 'from-pink-500 to-pink-600' },
  faq: { title: 'FAQ', desc: 'Pertanyaan yang sering diajukan', icon: QuestionMarkCircleIcon, color: 'from-violet-500 to-violet-600' },
  layanan: { title: 'Layanan', desc: 'Daftar layanan KUD', icon: PhoneIcon, color: 'from-rose-500 to-rose-600' },
};

export default function LandingPageAdmin() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('langkah');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [lightbox, setLightbox] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback((section) => {
    setLoading(true);
    api.admin.landing.list(section || activeTab)
      .then((res) => setItems(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [activeTab, toast]);

  useEffect(() => {
    startTransition(() => setLoading(true));
    fetchData(activeTab);
    setSelected(new Set());
    setSearchQuery('');
  }, [activeTab, fetchData]);

  const handleFormSaved = useCallback(() => {
    fetchData(activeTab);
  }, [fetchData, activeTab]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.admin.landing.delete(deleteModal.id);
      toast.success('Data berhasil dihapus');
      setDeleteModal(null);
      fetchData(activeTab);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleBulkToggle = async (active) => {
    if (selected.size === 0) return;
    try {
      await api.admin.landing.bulkToggle([...selected], active);
      toast.success(`${selected.size} data ${active ? 'diaktifkan' : 'dinonaktifkan'}`);
      setSelected(new Set());
      fetchData(activeTab);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const moveItem = async (idx, direction) => {
    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
    const reorderPayload = sorted.map((item, i) => ({ id: item.id, order: i }));

    try {
      await api.admin.landing.reorder(reorderPayload);
      fetchData(activeTab);
    } catch (err) {
      toast.error('Gagal mengatur ulang urutan');
    }
  };

  const section = SECTION_LABELS[activeTab];
  const TabIcon = section?.icon;

  const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const filteredItems = searchQuery
    ? sortedItems.filter((i) =>
        (i.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedItems;

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section?.color} flex items-center justify-center shrink-0`}>
            {TabIcon && <TabIcon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{section?.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{section?.desc}</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <PlusIcon className="w-4 h-4" /> Tambah Data
        </Button>
      </motion.div>

      {/* TABS */}
      <motion.div variants={fadeUp} className="flex gap-1.5 mb-4 overflow-x-auto pb-2 scrollbar-thin">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : 'bg-white text-slate-600 border border-border hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* SEARCH + BULK ACTIONS */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari data..."
            className="w-full pl-3 pr-8 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-gray-500 mr-1">{selected.size} dipilih</span>
            <button onClick={() => handleBulkToggle(true)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-emerald-200">
              <EyeIcon className="w-3.5 h-3.5" /> Aktifkan
            </button>
            <button onClick={() => handleBulkToggle(false)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-gray-200">
              <EyeSlashIcon className="w-3.5 h-3.5" /> Nonaktifkan
            </button>
            <button onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
              Batal
            </button>
          </div>
        )}
      </motion.div>

      {/* FORM MODAL */}
      <FormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        editing={editing}
        sectionType={activeTab}
        onSaved={handleFormSaved}
      />

      {/* DATA LIST */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-2xl border border-border">
          <TabIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{searchQuery ? 'Data tidak ditemukan' : `Belum ada data ${activeTab}`}</p>
          <p className="text-gray-300 text-sm mt-1">
            {searchQuery ? 'Coba kata kunci lain' : 'Klik "Tambah Data" untuk mulai'}
          </p>
        </motion.div>
      ) : (
        <>
          {/* SELECT ALL CHECKBOX */}
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-2 px-1">
            <input
              type="checkbox"
              checked={selected.size === filteredItems.length && filteredItems.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-xs text-gray-400">Pilih semua ({filteredItems.length} data)</span>
          </motion.div>

          <motion.div variants={containerAnim} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className={`bg-white rounded-2xl border p-4 hover:shadow-lg transition-all duration-200 group relative ${
                  item.is_active === false ? 'border-red-200 bg-red-50/30' : 'border-border'
                }`}
              >
                {/* SELECT CHECKBOX */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                {/* STATUS BADGE */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {item.is_active === false && (
                    <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">Nonaktif</span>
                  )}
                  {item.is_active !== false && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Aktif</span>
                  )}
                </div>

                {/* MEDIA */}
                {item.media_url && (
                  <div className="mb-3 mt-6 cursor-pointer" onClick={() => setLightbox(item.media_url)}>
                    <img src={item.media_url} alt="" className="w-full h-36 object-cover rounded-xl hover:opacity-90 transition-opacity" loading="lazy" />
                  </div>
                )}

                {/* TITLE + ORDER */}
                <div className="flex items-start justify-between gap-2 mb-1 mt-1">
                  <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
                    {item.meta_data?.icon && <span className="mr-1">{item.meta_data.icon}</span>}
                    {item.title || '(tanpa judul)'}
                  </h3>
                  {item.order !== undefined && item.order !== null && (
                    <span className="shrink-0 text-[10px] font-bold text-white bg-gradient-to-r from-slate-500 to-slate-600 px-2 py-0.5 rounded-full">
                      #{item.order}
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}

                {/* META DATA */}
                {item.meta_data && Object.keys(item.meta_data).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.meta_data.rating && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        {'★'.repeat(Number(item.meta_data.rating))}{'☆'.repeat(5 - Number(item.meta_data.rating))}
                      </span>
                    )}
                    {item.meta_data.nilai && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        {item.meta_data.nilai}{item.meta_data.satuan || ''}
                      </span>
                    )}
                    {item.meta_data.lembaga && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        {item.meta_data.lembaga}
                      </span>
                    )}
                    {item.meta_data.alamat && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {item.meta_data.alamat}
                      </span>
                    )}
                    {item.meta_data.youtube_id && (
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        YouTube
                      </span>
                    )}
                    {item.meta_data.kontak && (
                      <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                        {item.meta_data.kontak}
                      </span>
                    )}
                    {item.meta_data.nomor && (
                      <span className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {item.meta_data.nomor}
                      </span>
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(item); setShowForm(true); }}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-all cursor-pointer">
                      <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteModal(item)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all cursor-pointer">
                      <TrashIcon className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      title="Naik"
                    >
                      <ChevronUpIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === filteredItems.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      title="Turun"
                    >
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 cursor-pointer">
              <XMarkIcon className="w-8 h-8" />
            </button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              src={lightbox}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Data" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm">
          Yakin ingin menghapus <strong>{deleteModal?.title || 'data ini'}</strong>?
        </p>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </motion.div>
  );
}