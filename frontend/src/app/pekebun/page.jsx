'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { UserIcon, DocumentTextIcon, ClipboardDocumentListIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PekebunDashboard() {
  const router = useRouter();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { api.pekebun.profil().then(setProfil).catch(() => setError('Gagal memuat profil')).finally(() => setLoading(false)); }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-surface rounded-2xl border border-border p-6"><div className="h-16 bg-gray-200 rounded-xl w-2/3" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map((i) => <div key={i} className="bg-surface rounded-2xl border border-border p-6"><div className="h-24 bg-gray-200 rounded-xl" /></div>)}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-destructive">!</span>
      </div>
      <p className="text-destructive font-semibold">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm cursor-pointer">Coba Lagi</button>
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Pekebun</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Selamat datang di sistem informasi KUD</p>
      </motion.div>

      {profil && (
        <motion.div variants={itemAnim}>
          <Card className="border border-primary/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/20">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground">{profil.nama}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">NIK: {profil.nik}</p>
                  <Badge status={profil.status} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemAnim} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: DocumentTextIcon, label: 'Data Lahan', desc: `${profil?.lahan?.length || 0} lahan terdaftar`, href: '/pekebun/lahan', gradient: 'from-emerald-500 to-emerald-600' },
          { icon: ClipboardDocumentListIcon, label: 'Program KUD', desc: 'Daftar & ikuti program', href: '/pekebun/program', gradient: 'from-primary to-primary-dark' },
          { icon: UserIcon, label: 'Profil Saya', desc: 'Kelola data diri & dokumen', href: '/pekebun/profil', gradient: 'from-amber-500 to-amber-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => router.push(item.href)}
              className="bg-surface rounded-2xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-foreground">{item.label}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
