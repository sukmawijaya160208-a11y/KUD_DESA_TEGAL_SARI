'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLogo } from '@/hooks/useLogo';

export default function BlogLayout({ children }) {
  const router = useRouter();
  const logoUrl = useLogo();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center overflow-hidden h-10 max-w-[160px] rounded-lg bg-white shadow-sm px-1">
                {logoUrl ? (
                  <img src={logoUrl} alt="KUD Desa Tegal Sari" className="h-full w-auto max-h-10 object-contain" />
                ) : (
                  <span className="font-heading font-bold text-lg text-primary px-2">K</span>
                )}
              </div>
              <span className="font-heading font-bold tracking-tight text-foreground">KUD Tegal Sari</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-foreground transition-colors">
                Beranda
              </Link>
              <span className="text-xs text-gray-300">|</span>
              <Link href="/blog" className="text-sm font-semibold text-primary transition-colors">
                Blog
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {loggedIn ? (
                <button onClick={() => router.push('/login')}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm cursor-pointer"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => router.push('/login')}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Masuk
                  </button>
                  <button onClick={() => router.push('/login')}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm cursor-pointer"
                  >
                    Daftar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      <main className="pt-20">{children}</main>
    </div>
  );
}
