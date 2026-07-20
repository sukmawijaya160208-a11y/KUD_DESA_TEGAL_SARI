'use client';

import Button from '@/components/ui/Button';

export default function AdminError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-md">{error.message || 'Gagal memuat halaman admin'}</p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
