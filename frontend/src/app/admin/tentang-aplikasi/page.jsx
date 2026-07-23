'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { SparklesIcon } from '@heroicons/react/24/outline';
import HeroDeveloper from '@/components/tentang-aplikasi/HeroDeveloper';
import VideoGallery from '@/components/tentang-aplikasi/VideoGallery';
import AboutSection from '@/components/tentang-aplikasi/AboutSection';
import InfoCards from '@/components/tentang-aplikasi/InfoCards';
import DonasiCard from '@/components/tentang-aplikasi/DonasiCard';
import EditModal from '@/components/tentang-aplikasi/EditModal';

export default function AdminTentangAplikasiPage() {
  const toast = useToast();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState({});

  useEffect(() => {
    api.tentangAplikasi.get()
      .then((res) => { setData(res); setEdit({ ...res }); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleEditFoto = useCallback(async (file) => {
    try {
      const res = await api.upload('/upload/foto-pengembang', file);
      setEdit((prev) => ({ ...prev, foto_pengembang: res.url }));
      toast.success('Foto berhasil diupload');
    } catch (err) { toast.error('Upload gagal: ' + err.message); }
  }, [toast]);

  const persistVideos = useCallback(async (videos) => {
    try {
      await api.admin.tentangAplikasi.update({ videos });
    } catch {
    }
  }, []);

  const handleUploadVideo = useCallback(async (file, folderUrl) => {
    if (folderUrl) {
      setEdit((prev) => {
        const next = [...(Array.isArray(prev.videos) ? prev.videos : []), folderUrl];
        setData((d) => ({ ...d, videos: next }));
        persistVideos(next);
        return { ...prev, videos: next };
      });
      toast.success('Video ditambahkan dari folder');
      return;
    }
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await api.upload('/upload/video-tentang-aplikasi', file);
      setEdit((prev) => {
        const next = [...(Array.isArray(prev.videos) ? prev.videos : []), res.url];
        setData((d) => ({ ...d, videos: next }));
        persistVideos(next);
        return { ...prev, videos: next };
      });
      toast.success('Video berhasil diupload');
    } catch (err) { toast.error('Upload video gagal: ' + err.message); }
    setUploadingVideo(false);
  }, [toast, persistVideos]);

  const handleRemoveVideo = useCallback((idx) => {
    setEdit((prev) => {
      const next = Array.isArray(prev.videos) ? [...prev.videos] : [];
      if (typeof idx === 'number') next.splice(idx, 1);
      setData((d) => ({ ...d, videos: next }));
      persistVideos(next);
      return { ...prev, videos: next };
    });
  }, [persistVideos]);

  const handleSave = useCallback(async (editData) => {
    setSaving(true);
    try {
      await api.admin.tentangAplikasi.update(editData);
      setData({ ...editData });
      setShowModal(false);
      toast.success('Tentang aplikasi berhasil disimpan');
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <HeroDeveloper data={data} admin onEdit={() => setShowModal(true)} />
      <VideoGallery
        videos={edit.videos || data.videos}
        isAdmin
        onUpload={handleUploadVideo}
        onRemoveVideo={handleRemoveVideo}
        uploading={uploadingVideo}
      />
      <AboutSection teks={data.teks} />
      <InfoCards data={data} />
      <DonasiCard data={data} />

      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-px bg-gray-200 rounded-full mx-auto mb-8" />
          <p className="text-gray-400 text-sm italic">Wassalamu&apos;alaikum, Wr.Wb</p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400 text-xs">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>KUD Desa Sari Subur</span>
          </div>
        </div>
      </section>

      <EditModal
        show={showModal}
        onClose={() => setShowModal(false)}
        data={edit}
        onSave={handleSave}
        onUploadFoto={handleEditFoto}
        onUploadVideo={handleUploadVideo}
        onRemoveVideo={handleRemoveVideo}
        videos={edit.videos || data.videos}
        saving={saving}
        uploadingVideo={uploadingVideo}
      />
    </div>
  );
}
