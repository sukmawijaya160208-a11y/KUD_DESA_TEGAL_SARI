'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function NotifikasiLayout({ children }) {
  const router = useRouter();
  const [role] = useState(() => {
    if (typeof window === 'undefined') return null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || null;
  });

  useEffect(() => {
    if (!role) router.push('/login');
  }, [role, router]);

  if (!role) return null;
  return <Sidebar role={role}>{children}</Sidebar>;
}
