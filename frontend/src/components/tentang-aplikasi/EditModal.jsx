'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  CameraIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function EditModal({ show, onClose, data, onSave, onUploadFoto, onUploadVideo, onRemoveVideo, saving, uploadingVideo }) {
  const fileFotoRef = useRef(null);
  const fileVideoRef = useRef(null);
  const [edit, setEdit] = useState({});

  useEffect(() => {
    if (data) {
      setEdit({ ...data });
    }
  }, [data]);

  const upd = (key) => (e) => setEdit((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    if (onSave) onSave(edit);
  };

  const handleFotoClick = () => {
    fileFotoRef.current?.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadFoto) {
      onUploadFoto(file);
    }
    e.target.value = '';
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadVideo) {
      onUploadVideo(file);
    }
    e.target.value = '';
  };

  const handleVideoRemove = () => {
    if (onRemoveVideo) {
      onRemoveVideo();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Edit Profil Pengembang</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Foto Pengembang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Foto Pengembang</label>
            <div className="flex items-center gap-4">
              <div
                onClick={handleFotoClick}
                className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer bg-gray-50 flex items-center justify-center group"
              >
                {edit.foto_pengembang ? (
                  <>
                    <img src={edit.foto_pengembang} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <CameraIcon className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Klik untuk upload foto</p>
                <p>JPG, PNG. Maks. 2MB</p>
              </div>
              <input
                ref={fileFotoRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Developer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nama Pengembang" value={edit.developer_name || ''} onChange={upd('developer_name')} />
            <Input label="Peran / Jabatan" value={edit.developer_role || ''} onChange={upd('developer_role')} />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Kontak (No. HP)" value={edit.kontak || ''} onChange={upd('kontak')} />
            <Input label="Email" type="email" value={edit.email || ''} onChange={upd('email')} />
          </div>

          {/* Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Instagram" value={edit.instagram || ''} onChange={upd('instagram')} />
            <Input label="Facebook" value={edit.facebook || ''} onChange={upd('facebook')} />
          </div>

          {/* Web & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Website" value={edit.website || ''} onChange={upd('website')} />
            <Input label="Alamat" value={edit.alamat || ''} onChange={upd('alamat')} />
          </div>

          {/* Bank Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Informasi Bank (Dukungan)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Bank" value={edit.bank || ''} onChange={upd('bank')} />
              <Input label="No. Rekening" value={edit.rekening || ''} onChange={upd('rekening')} />
              <Input label="A.N." value={edit.rekening_an || ''} onChange={upd('rekening_an')} />
            </div>
          </div>

          {/* Video Profil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Video Profil</label>
            {edit.url_video ? (
              <div className="space-y-3">
                {uploadingVideo && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengupload video...
                  </div>
                )}
                <video
                  src={edit.url_video}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full rounded-xl border border-gray-200 max-h-48"
                >
                  <source src={edit.url_video} type="video/mp4" />
                </video>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileVideoRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Ganti Video
                  </button>
                  <button
                    type="button"
                    onClick={handleVideoRemove}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Hapus Video
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileVideoRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer bg-gray-50 transition-colors"
              >
                <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Upload Video Profil</p>
                <p className="text-xs text-gray-400">MP4, WebM</p>
              </div>
            )}
            <input
              ref={fileVideoRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>

          {/* Teks */}
          <div>
            <Textarea
              label="Tentang Aplikasi"
              rows={6}
              value={edit.teks || ''}
              onChange={upd('teks')}
              placeholder="Tulis deskripsi tentang aplikasi..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
            {saving ? (
              'Menyimpan...'
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
