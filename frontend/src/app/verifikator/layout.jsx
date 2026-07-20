'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function VerifikatorLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role !== 'verifikator') { router.push('/login'); }
  }, [router]);

  return <Sidebar role="verifikator">{children}</Sidebar>;
}
