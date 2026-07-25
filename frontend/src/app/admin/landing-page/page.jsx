'use client';

import { useEffect, useState, useCallback, memo, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormModal from './components/FormModal';
import HeroSectionCMS from './components/HeroSectionCMS';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon,
  ClipboardDocumentListIcon, AcademicCapIcon, PhotoIcon,
  VideoCameraIcon, StarIcon, SparklesIcon,
  ChartBarIcon, BuildingOffice2Icon, ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon, PhoneIcon,
  ChevronUpIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon,
  CalendarDaysIcon, BuildingOfficeIcon, MapPinIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.015 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const TABS = [
  { id: 'hero', label: 'Hero Section', icon: NewspaperIcon, color: 'from-emerald-500 to-teal-600' },
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
  hero: { title: 'Hero Section', desc: 'Atur teks utama landing page KUD', icon: NewspaperIcon, color: 'from-emerald-500 to-teal-600' },
  langkah: { title: '6 Langkah Jadi Anggota', desc: 'Atur alur pendaftaran anggota KUD', icon: ClipboardDocumentListIcon, color: 'from-blue-500 to-blue-600' },
  sertifikasi: { title: 'Sertifikasi & Penghargaan', desc: 'Kelola sertifikasi, penghargaan, dan akreditasi', icon: AcademicCapIcon, color: 'from-purple-500 to-purple-600' },
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

const SertifikasiCard = memo(function SertifikasiCard({ item, onEdit, onDelete }) {
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 group will-change-transform">
      {/* HEADER */}
      <div className="relative h-20 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.3),transparent_50%)]" />
        {item.media_url ? (
          <img src={item.media_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : null}
        <div className="relative z-10 flex items-center gap-3">
          {item.media_url ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/30 shadow-lg">
              <img src={item.media_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="text-white">
            {item.meta_data?.nomor && <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{item.meta_data.nomor}</span>}
            <h3 className="font-bold text-sm leading-tight">{item.title || '(tanpa judul)'}</h3>
          </div>
        </div>
        {item.is_active === false && (
          <span className="absolute top-2 right-2 text-[9px] font-bold text-red-300 bg-red-500/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm">Nonaktif</span>
        )}
      </div>

      {/* BODY */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {item.meta_data?.lembaga && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-medium border border-purple-100">
              <BuildingOfficeIcon className="w-3 h-3" /> {item.meta_data.lembaga}
            </span>
          )}
          {item.order !== undefined && item.order !== null && (
            <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium">#{item.order}</span>
          )}
        </div>
        {item.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-border">
        <button onClick={() => onEdit(item)}
          className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer">
          <PencilSquareIcon className="w-3.5 h-3.5" /> Edit Data
        </button>
        <button onClick={() => onDelete(item)}
          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer">
          <TrashIcon className="w-3.5 h-3.5" /> Hapus
        </button>
      </div>
    </motion.div>
  );
});

const DefaultCard = memo(function DefaultCard({ item, activeTab, onEdit, onDelete, onLightbox }) {
  return (
    <motion.div variants={fadeUp}
      className={`bg-white rounded-2xl border p-4 hover:shadow-lg transition-shadow duration-200 group relative will-change-transform ${
        item.is_active === false ? 'border-red-200 bg-red-50/30' : 'border-border'
      }`}
    >
      {activeTab !== 'sertifikasi' && (
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
            item.is_active === false ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {item.is_active === false ? 'Nonaktif' : 'Aktif'}
          </span>
        </div>
      )}

      {/* MEDIA */}
      {item.media_url && (
        <div className="mb-3 mt-6 cursor-pointer" onClick={() => onLightbox && onLightbox(item.media_url)}>
          <img src={item.media_url} alt="" className="w-full h-36 object-cover rounded-xl hover:opacity-90 transition-opacity" loading="lazy" />
        </div>
      )}

      {/* TITLE + ORDER */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
          {item.meta_data?.icon && <span className="mr-1">{item.meta_data.icon}</span>}
          {item.title || '(tanpa judul)'}
        </h3>
        {item.order !== undefined && item.order !== null && (
          <span className="shrink-0 text-[10px] font-bold text-white bg-gradient-to-r from-slate-500 to-slate-600 px-2 py-0.5 rounded-full">#{item.order}</span>
        )}
      </div>

      {/* DESCRIPTION */}
      {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}

      {/* META */}
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
              <MapPinIcon className="w-3 h-3 inline mr-0.5" />{item.meta_data.alamat}
            </span>
          )}
          {item.meta_data.youtube_id && (
            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
              <VideoCameraIcon className="w-3 h-3 inline mr-0.5" />YouTube
            </span>
          )}
          {item.meta_data.kontak && (
            <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">
              {item.meta_data.kontak}
            </span>
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer">
            <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(item)}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer">
            <TrashIcon className="w-3.5 h-3.5" /> Hapus
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => {}}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
            title="Naik">
            <ChevronUpIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => {}}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 cursor-pointer"
            title="Turun">
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default function LandingPageAdmin() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('langkah');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
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
    <>
      {activeTab === 'hero' ? (
        <HeroSectionCMS />
      ) : (
      <motion.div variants={containerAnim} initial="hidden" animate="show" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${section?.color} flex items-center justify-center shadow-md shrink-0`}>
            {TabIcon && <TabIcon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{section?.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{section?.desc || 'Kelola konten landing page'}</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <PlusIcon className="w-4 h-4" /> Tambah Data
        </Button>
      </motion.div>

      {/* TABS */}
      <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = isActive ? items.length : null;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : 'bg-white text-slate-600 border border-border hover:bg-slate-50 hover:border-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== null && <span className="ml-1 text-[10px] opacity-70">({count})</span>}
            </button>
          );
        })}
      </motion.div>

      {/* SEARCH */}
      <motion.div variants={fadeUp}>
        <div className="relative w-full sm:w-72">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari data di tab ini..."
            className="w-full pl-3 pr-8 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      <FormModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} editing={editing} sectionType={activeTab} onSaved={handleFormSaved} />

      {/* DATA LIST */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-2xl border border-border">
          <TabIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{searchQuery ? 'Data tidak ditemukan' : `Belum ada data ${activeTab}`}</p>
          <p className="text-gray-300 text-sm mt-1">{searchQuery ? 'Coba kata kunci lain' : 'Klik "Tambah Data" untuk mulai'}</p>
        </motion.div>
      ) : (
        <motion.div variants={containerAnim} className={'card-grid ' + (activeTab === 'sertifikasi' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4')}>
          {filteredItems.map((item) =>
            activeTab === 'sertifikasi' ? (
              <SertifikasiCard key={item.id} item={item} onEdit={setEditing} onDelete={setDeleteModal} />
            ) : (
              <DefaultCard key={item.id} item={item} activeTab={activeTab} onEdit={(i) => { setEditing(i); setShowForm(true); }} onDelete={setDeleteModal} onLightbox={setLightbox} />
            )
          )}
        </motion.div>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 cursor-pointer">
              <XMarkIcon className="w-8 h-8" />
            </button>
            <motion.img key={lightbox} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()} src={lightbox} alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Data" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm">Yakin ingin menghapus <strong>{deleteModal?.title || 'data ini'}</strong>?</p>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </motion.div>
      )}
    </>
  );
}