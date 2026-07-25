'use client';

import { useEffect, useState, useCallback, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormModal from './components/FormModal';
import { motion } from 'framer-motion';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  ClipboardDocumentListIcon, AcademicCapIcon, PhotoIcon,
  VideoCameraIcon, StarIcon, SparklesIcon,
  ChartBarIcon, BuildingOffice2Icon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
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
  testimoni: { title: 'Testimoni Anggota', desc: 'Atur testimoni anggota KUD', icon: ChatBubbleLeftRightIcon, color: 'from-pink-500 to-pink-600' },
};

export default function LandingPageAdmin() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('langkah');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

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

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section?.color} flex items-center justify-center`}>
            {TabIcon && <TabIcon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{section?.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{section?.desc}</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <PlusIcon className="w-4 h-4" /> Tambah Data
        </Button>
      </motion.div>

      {/* TABS */}
      <motion.div variants={fadeUp} className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
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
      ) : items.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-2xl border border-border">
          <TabIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Belum ada data {activeTab}</p>
          <p className="text-gray-300 text-sm mt-1">Klik &quot;Tambah Data&quot; untuk mulai</p>
        </motion.div>
      ) : (
        <motion.div variants={containerAnim} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-all duration-200 group"
            >
              {/* MEDIA */}
              {item.media_url && (
                <div className="mb-3">
                  <img src={item.media_url} alt="" className="w-full h-32 object-cover rounded-xl" />
                </div>
              )}

              {/* TITLE + BADGE */}
              <div className="flex items-start justify-between gap-2 mb-1">
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
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditing(item); setShowForm(true); }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-all cursor-pointer">
                  <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteModal(item)}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all cursor-pointer">
                  <TrashIcon className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
