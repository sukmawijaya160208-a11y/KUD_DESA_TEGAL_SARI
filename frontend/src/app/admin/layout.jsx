'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role !== 'admin') { router.push('/login'); }
  }, [router]);

  return <Sidebar role="admin">{children}</Sidebar>;
}
