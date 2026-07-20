'use client';

import ToastProvider from '@/components/ToastProvider';

export default function ClientLayout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
