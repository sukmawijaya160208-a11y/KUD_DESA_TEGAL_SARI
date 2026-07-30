'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { Sparkles } from '@/lib/animated-icons';
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

  const handleUpdateYoutubeUrl = useCallback(async (url) => {
    try {
      const next = { ...edit, youtube_url: url };
      setEdit(next);
      setData((d) => ({ ...d, youtube_url: url }));
      await api.admin.tentangAplikasi.update({ youtube_url: url });
      toast.success(url ? 'Link YouTube berhasil disimpan' : 'Video berhasil dihapus');
    } catch (err) { toast.error(err.message); }
  }, [toast, edit]);

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
        youtubeUrl={data.youtube_url || edit.youtube_url}
        isAdmin
        onUpdateUrl={handleUpdateYoutubeUrl}
      />
      <AboutSection teks={data.teks} />
      <InfoCards data={data} />
      <DonasiCard data={data} />

      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-px bg-gray-200 rounded-full mx-auto mb-8" />
          <p className="text-gray-400 text-sm italic">Wassalamu&apos;alaikum, Wr.Wb</p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
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
        saving={saving}
      />
    </div>
  );
}
