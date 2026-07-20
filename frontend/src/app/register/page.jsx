'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">Mengalihkan...</div>;
}
