'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function NotifikasiLayout({ children }) {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const r = user.role || null;
    setRole(r);
    if (!r) router.push('/login');
  }, [router]);

  if (!role) return null;
  return <Sidebar role={role}>{children}</Sidebar>;
}
