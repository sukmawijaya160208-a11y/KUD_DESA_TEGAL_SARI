'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { UserIcon, DocumentTextIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-red-500">!</span>
      </div>
      <p className="text-red-500 font-semibold">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm cursor-pointer">Coba Lagi</button>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard Pekebun</h1>

      {profil && (
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{profil.nama}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">NIK: {profil.nik}</p>
                <Badge status={profil.status} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: DocumentTextIcon, label: 'Data Lahan', desc: `${profil?.lahan?.length || 0} lahan terdaftar`, href: '/pekebun/lahan', gradient: 'from-orange-400 to-orange-600' },
          { icon: ClipboardDocumentListIcon, label: 'Program KUD', desc: 'Daftar & ikuti program', href: '/pekebun/program', gradient: 'from-purple-500 to-purple-600' },
          { icon: ChartBarIcon, label: 'TBS Sync', desc: 'Catat hasil TBS', href: '/pekebun/tbs', gradient: 'from-cyan-500 to-cyan-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => router.push(item.href)}
              className="bg-surface rounded-2xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-foreground">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
