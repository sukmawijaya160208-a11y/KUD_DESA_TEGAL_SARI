'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Memproses...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus(decodeURIComponent(error));
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (!token) {
      setStatus('Token tidak ditemukan');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    localStorage.setItem('token', token);

    api.auth.me()
      .then((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        const role = user.role;
        if (role === 'admin') router.push('/admin');
        else if (role === 'verifikator') router.push('/verifikator');
        else router.push('/pekebun');
      })
      .catch(() => {
        setStatus('Gagal memuat data user');
        setTimeout(() => router.push('/login'), 2000);
      });
  }, [router, searchParams]);

  return (
    <div className="text-center">
      <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-white/70 text-sm">{status}</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2744] to-slate-800 flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/70 text-sm">Memuat...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
