'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { SparklesIcon } from '@heroicons/react/24/outline';
import HeroDeveloper from '@/components/tentang-aplikasi/HeroDeveloper';
import VideoGallery from '@/components/tentang-aplikasi/VideoGallery';
import AboutSection from '@/components/tentang-aplikasi/AboutSection';
import InfoCards from '@/components/tentang-aplikasi/InfoCards';
import DonasiCard from '@/components/tentang-aplikasi/DonasiCard';

export default function PekebunTentangAplikasiPage() {
  const toast = useToast();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tentangAplikasi.get()
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
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
      <HeroDeveloper data={data} />
      <VideoGallery videos={data.videos} />
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
    </div>
  );
}
