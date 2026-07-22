'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function PekebunLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role !== 'pekebun') { router.push('/login'); }
  }, [router]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u.pekebun?.status) { setStatus(u.pekebun.status); return; }
        const profil = await api.pekebun.profil();
        if (profil?.status) {
          setStatus(profil.status);
          u.pekebun = profil;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch {}
    };
    fetchStatus();
  }, []);

  const isProgramPage = pathname?.includes('/pekebun/program');

  if (isProgramPage && status === 'pending') {
    return (
      <Sidebar role="pekebun">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Menunggu Verifikasi</h2>
            <p className="text-gray-500 mb-2">Profil Anda masih dalam proses verifikasi oleh petugas KUD.</p>
            <p className="text-sm text-gray-400">Setelah diverifikasi, Anda dapat mengakses dan mendaftar program KUD. Silakan lengkapi profil Anda dan pastikan dokumen sudah diupload.</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (isProgramPage && status === 'rejected') {
    return (
      <Sidebar role="pekebun">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Verifikasi Ditolak</h2>
            <p className="text-gray-500 mb-4">Profil Anda ditolak oleh verifikator. Silakan perbaiki data diri atau upload ulang dokumen yang sesuai.</p>
            <button onClick={() => router.push('/pekebun/profil')} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all cursor-pointer">
              Perbaiki Profil
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  return <Sidebar role="pekebun">{children}</Sidebar>;
}
