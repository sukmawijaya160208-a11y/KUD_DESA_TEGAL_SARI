'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  UsersIcon, ClipboardDocumentListIcon, MapPinIcon, CheckBadgeIcon,
  ClockIcon, ChartBarIcon, BookOpenIcon, UserGroupIcon,
  ArrowRightIcon, ArrowDownTrayIcon, Cog6ToothIcon, PlusCircleIcon,
  EyeIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const statCards = [
  { key: 'total_users', label: 'Total Pengguna', icon: UsersIcon, gradient: 'from-blue-500 to-blue-600' },
  { key: 'total_pekebun', label: 'Total Pekebun', icon: UserGroupIcon, gradient: 'from-blue-500 to-indigo-600' },
  { key: 'total_pekebun_pending', label: 'Menunggu Verifikasi', icon: ClockIcon, gradient: 'from-amber-500 to-amber-600' },
  { key: 'total_pekebun_verified', label: 'Terverifikasi', icon: CheckBadgeIcon, gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'total_program', label: 'Program KUD', icon: ClipboardDocumentListIcon, gradient: 'from-purple-500 to-purple-600' },
  { key: 'total_pendaftaran', label: 'Total Pendaftaran', icon: BookOpenIcon, gradient: 'from-pink-500 to-pink-600' },
  { key: 'total_pendaftaran_pending', label: 'Pendaftaran Pending', icon: ClockIcon, gradient: 'from-rose-500 to-rose-600' },
  { key: 'total_lahan', label: 'Total Lahan', icon: MapPinIcon, gradient: 'from-orange-500 to-orange-600' },
  { key: 'total_tbs', label: 'Total TBS', icon: ChartBarIcon, gradient: 'from-cyan-500 to-cyan-600' },
];

const shadowMap = {
  'from-blue-500 to-blue-600': 'shadow-blue-500/20',
  'from-blue-500 to-indigo-600': 'shadow-blue-600/20',
  'from-amber-500 to-amber-600': 'shadow-amber-500/20',
  'from-emerald-500 to-emerald-600': 'shadow-emerald-500/20',
  'from-purple-500 to-purple-600': 'shadow-purple-500/20',
  'from-pink-500 to-pink-600': 'shadow-pink-500/20',
  'from-rose-500 to-rose-600': 'shadow-rose-500/20',
  'from-orange-500 to-orange-600': 'shadow-orange-500/20',
  'from-cyan-500 to-cyan-600': 'shadow-cyan-500/20',
};

function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl border border-border p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="space-y-2 flex-1"><div className="h-3 bg-gray-200 rounded w-2/3" /><div className="h-6 bg-gray-200 rounded w-1/3" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data TBS</p>;
  const max = Math.max(...data.map((d) => Number(d.total) || 0), 1);
  return (
    <div className="flex items-end gap-2 pt-4" style={{ height: 180 }}>
      {data.map((d, i) => {
        const h = (Number(d.total) / max) * 140;
        const label = d.bulan ? d.bulan.slice(-2) + '/' + d.bulan.slice(2, 4) : '';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[10px] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{d.total}</span>
            <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-blue-400 transition-all duration-300 group-hover:opacity-80 cursor-pointer" style={{ height: h }} />
            <span className="text-[9px] text-gray-400 truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data</p>;
  const total = data.reduce((s, d) => s + Number(d.total), 0) || 1;
  const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-red-400', 'bg-blue-400'];
  const labels = { verified: 'Terverifikasi', pending: 'Pending', rejected: 'Ditolak' };
  return (
    <div className="space-y-3 pt-2">
      {data.map((d, i) => {
        const pct = ((Number(d.total) / total) * 100).toFixed(1);
        return (
          <div key={d.status}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{labels[d.status] || d.status}</span>
              <span className="font-semibold text-foreground">{d.total} ({pct}%)</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${colors[i] || 'bg-gray-400'} transition-all duration-700`} style={{ width: pct + '%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [laporan, setLaporan] = useState(null);
  const [verifikasi, setVerifikasi] = useState([]);
  const [pendaftaran, setPendaftaran] = useState([]);
  const [tbsList, setTbsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.admin.dashboard(),
      api.admin.laporan().catch(() => null),
      api.admin.verifikasiLog.list().catch(() => []),
      api.admin.pendaftaran.list().catch(() => []),
      api.admin.tbs.list().catch(() => []),
    ])
      .then(([s, l, v, p, t]) => startTransition(() => {
        setStats(s); setLaporan(l);
        setVerifikasi(Array.isArray(v) ? v.slice(0, 5) : []);
        setPendaftaran(Array.isArray(p) ? p.slice(0, 5) : []);
        setTbsList(Array.isArray(t) ? t.slice(0, 5) : []);
      }))
      .catch((e) => toast.error(e.message))
      .finally(() => startTransition(() => setLoading(false)));
  }, [toast]);

  if (loading) return (
    <div className="space-y-6">
      <div className="mb-6"><div className="h-7 bg-gray-200 rounded w-48 animate-pulse" /><div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse" /></div>
      <StatSkeleton />
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview data KUD Desa Tegal Sari</p>
      </motion.div>

      <motion.div variants={itemAnim} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="bg-surface rounded-2xl border border-border p-5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg ${shadowMap[card.gradient]}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.[card.key] || 0}</p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemAnim}>
          <Card title="Tren TBS per Bulan" subtitle="Grafik jumlah TBS berdasarkan bulan">
            <BarChart data={laporan?.total_tbs_per_bulan} />
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Status Pekebun" subtitle="Distribusi status pekebun">
            <PieChart data={laporan?.pekebun_per_status} />
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemAnim}>
          <Card title="Verifikasi Terbaru" subtitle="Aktivitas verifikasi terkini">
            {verifikasi.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada aktivitas verifikasi</p>
            ) : (
              <div className="space-y-3">
                {verifikasi.map((v, i) => (
                  <div key={v.id || i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${v.tindakan === 'terima' ? 'bg-success' : 'bg-destructive'}`}>
                      {v.tindakan === 'terima' ? 'V' : 'X'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {v.tindakan === 'terima' ? 'Menerima' : 'Menolak'} pendaftaran
                      </p>
                      <p className="text-xs text-gray-400">
                        {v.user?.name || 'Admin'} — {v.created_at ? new Date(v.created_at).toLocaleDateString('id-ID') : ''}
                      </p>
                    </div>
                    {v.catatan && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{v.catatan}</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Pendaftaran Terbaru" subtitle="Program yang baru didaftarkan">
            {pendaftaran.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada pendaftaran</p>
            ) : (
              <div className="space-y-3">
                {pendaftaran.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {p.pekebun?.nama?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.pekebun?.nama || '-'}</p>
                      <p className="text-xs text-gray-400 truncate">{p.program_kud?.nama || '-'}</p>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemAnim}>
          <Card title="TBS Terbaru" subtitle="Catatan TBS terkini">
            {tbsList.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada data TBS</p>
            ) : (
              <div className="space-y-3">
                {tbsList.map((t, i) => (
                  <div key={t.id || i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                      T
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.pekebun?.nama || '-'}</p>
                      <p className="text-xs text-gray-400">{Number(t.jumlah_tbs || 0).toLocaleString()} kg — {t.tanggal ? new Date(t.tanggal).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <span className="text-sm font-bold text-cyan-600">{Number(t.jumlah_tbs || 0).toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Aksi Cepat" subtitle="Menu shortcut operasional">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tambah Pekebun', icon: PlusCircleIcon, href: '/admin/pekebun', gradient: 'from-blue-500 to-indigo-600' },
                { label: 'Buat Program', icon: ClipboardDocumentListIcon, href: '/admin/program', gradient: 'from-purple-500 to-purple-600' },
                { label: 'Backup Data', icon: ArrowDownTrayIcon, href: '/admin/backup-restore', gradient: 'from-teal-500 to-teal-600' },
                { label: 'Pengaturan', icon: Cog6ToothIcon, href: '/admin/pengaturan', gradient: 'from-gray-500 to-gray-600' },
              ].map((act, i) => {
                const ActIcon = act.icon;
                return (
                  <button key={i} onClick={() => router.push(act.href)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-white hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <ActIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
