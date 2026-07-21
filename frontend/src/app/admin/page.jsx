'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { formatDate, formatRelative, todayStr } from '@/lib/date';
import {
  UsersIcon, ClipboardDocumentListIcon, MapPinIcon, CheckBadgeIcon,
  ClockIcon, ChartBarIcon, BookOpenIcon, UserGroupIcon,
  ArrowRightIcon, ArrowDownTrayIcon, Cog6ToothIcon, PlusCircleIcon,
  EyeIcon, ChevronRightIcon, SparklesIcon, BanknotesIcon,
  DocumentTextIcon, PhotoIcon, ArrowPathIcon, CalendarDaysIcon,
  MagnifyingGlassIcon, ExclamationTriangleIcon, TrophyIcon,
  CurrencyDollarIcon, BellAlertIcon, ShieldCheckIcon,
  SunIcon, MoonIcon, UserCircleIcon, ArrowTrendingUpIcon,
  ArrowTrendingDownIcon, FireIcon, RocketLaunchIcon,
} from '@heroicons/react/24/outline';

/* ============================================================
   CONSTANTS
   ============================================================ */
const CONFETTI_ACTIVE = true;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const itemAnimL = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
const AREA_GRADIENT = { g1: '#3B82F6', g2: '#93C5FD' };
const BAR_COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

const ACTIONS = [
  { label: 'Tambah Pekebun', desc: 'Registrasi pekebun baru', icon: PlusCircleIcon, href: '/admin/pekebun', gradient: 'from-blue-500 to-indigo-600' },
  { label: 'Buat Program', desc: 'Buka program KUD baru', icon: ClipboardDocumentListIcon, href: '/admin/program', gradient: 'from-purple-500 to-purple-600' },
  { label: 'Atur Harga TBS', desc: 'Update harga TBS per kelas', icon: CurrencyDollarIcon, href: '/admin/harga-tbs', gradient: 'from-emerald-500 to-emerald-600' },
  { label: 'Lihat Laporan', desc: 'Analitik dan rekap data', icon: ChartBarIcon, href: '/admin/laporan', gradient: 'from-cyan-500 to-cyan-600' },
  { label: 'Verifikasi', desc: 'Review pendaftaran masuk', icon: ShieldCheckIcon, href: '/admin/pendaftaran', gradient: 'from-amber-500 to-amber-600' },
  { label: 'Kelola User', desc: 'Manajemen akun pengguna', icon: UsersIcon, href: '/admin/users', gradient: 'from-rose-500 to-rose-600' },
  { label: 'Backup Data', desc: 'Download backup database', icon: ArrowDownTrayIcon, href: '/admin/backup-restore', gradient: 'from-teal-500 to-teal-600' },
  { label: 'Pengaturan', desc: 'Konfigurasi aplikasi', icon: Cog6ToothIcon, href: '/admin/pengaturan', gradient: 'from-gray-500 to-gray-600' },
];

const SUMMARY_STATS = [
  { key: 'total_users', label: 'Total User', icon: UsersIcon, href: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'total_pekebun', label: 'Pekebun', icon: UserGroupIcon, href: '/admin/pekebun', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { key: 'total_program', label: 'Program', icon: ClipboardDocumentListIcon, href: '/admin/program', color: 'text-purple-600', bg: 'bg-purple-100' },
  { key: 'total_lahan', label: 'Lahan', icon: MapPinIcon, href: '/admin/lahan', color: 'text-orange-600', bg: 'bg-orange-100' },
  { key: 'total_tbs', label: 'TBS Tercatat', icon: ChartBarIcon, href: '/admin/tbs', color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { key: 'total_pendaftaran', label: 'Pendaftaran', icon: BookOpenIcon, href: '/admin/pendaftaran', color: 'text-pink-600', bg: 'bg-pink-100' },
];

const SYSTEM_INFO = [
  { label: 'PHP', value: '8.2' },
  { label: 'Database', value: 'SQLite' },
  { label: 'Laravel', value: '12.x' },
  { label: 'Next.js', value: '16.2' },
];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function AnimatedCounter({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const controls = animate(prev.current, Number(value), {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v * 10 ** decimals) / 10 ** decimals),
    });
    prev.current = Number(value);
    return () => controls.stop();
  }, [value, decimals]);

  return <span>{display.toLocaleString('id-ID')}{suffix}</span>;
}

function StatCard({ icon: Icon, label, value, href, color, bg, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer text-left w-full"
    >
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg font-bold text-foreground tabular-nums">
          <AnimatedCounter value={value || 0} />
        </p>
      </div>
    </motion.button>
  );
}

function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} bg-gray-200 rounded animate-pulse`} />;
}

function FullSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2"><SkeletonLine w="w-48" h="h-5" /><SkeletonLine w="w-64" h="h-4" /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );
}

function AreaChartWidget({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data TBS</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="tbsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={AREA_GRADIENT.g1} stopOpacity={0.3} />
            <stop offset="95%" stopColor={AREA_GRADIENT.g2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="bulan" tickFormatter={(v) => v?.slice(-2) + '/' + v?.slice(2, 4)} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E9EDEF', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          labelFormatter={(v) => formatDate(v + '-01', 'MMMM yyyy')}
          formatter={(v) => [Number(v).toLocaleString('id-ID') + ' kg', 'TBS']}
        />
        <Area type="monotone" dataKey="total" stroke={AREA_GRADIENT.g1} strokeWidth={2} fill="url(#tbsGradient)" animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DonutChartWidget({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data</p>;
  const total = data.reduce((s, d) => s + Number(d.total), 0) || 1;
  const labels = { verified: 'Terverifikasi', pending: 'Pending', rejected: 'Ditolak' };
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} animationDuration={1000}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E9EDEF' }}
            formatter={(v) => [Number(v).toLocaleString('id-ID') + ' pekebun', '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 text-sm">
        {data.map((d, i) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-gray-500 w-24">{labels[d.status] || d.status}</span>
            <span className="font-semibold text-foreground">{d.total}</span>
            <span className="text-gray-400 text-xs">({((d.total / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBarsWidget({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data pendaftaran</p>;
  const max = Math.max(...data.map((d) => Number(d.total) || 0), 1);
  return (
    <div className="space-y-4">
      {data.slice(0, 6).map((d, i) => {
        const pct = ((Number(d.total) / max) * 100).toFixed(0);
        return (
          <div key={d.program_kud_id || i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 truncate max-w-[180px]">{d.program_kud?.nama || 'Program'}</span>
              <span className="font-semibold text-foreground tabular-nums">{d.total} peserta</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTimeline({ verifikasi, pendaftaran, tbsList }) {
  const items = useMemo(() => {
    const all = [
      ...(verifikasi || []).map((v) => ({
        id: `v-${v.id}`,
        time: v.created_at,
        type: 'verifikasi',
        icon: v.tindakan === 'terima' ? '✅' : v.tindakan === 'tolak' ? '❌' : '📝',
        label: v.tindakan === 'terima' ? 'Menerima' : v.tindakan === 'tolak' ? 'Menolak' : 'Memperbaiki',
        desc: v.user?.name || 'Admin',
        extra: v.catatan,
      })),
      ...(pendaftaran || []).map((p) => ({
        id: `p-${p.id}`,
        time: p.created_at,
        type: 'pendaftaran',
        icon: '📋',
        label: 'Mendaftar',
        desc: p.pekebun?.nama || '-',
        extra: p.program_kud?.nama || '-',
      })),
      ...(tbsList || []).map((t) => ({
        id: `t-${t.id}`,
        time: t.created_at,
        type: 'tbs',
        icon: '📦',
        label: 'Catat TBS',
        desc: t.pekebun?.nama || '-',
        extra: `${Number(t.jumlah_tbs || 0).toLocaleString()} kg`,
      })),
    ];
    return all.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
  }, [verifikasi, pendaftaran, tbsList]);

  if (items.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada aktivitas</p>;
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3 pb-4 relative last:pb-0">
          {i < items.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200" />}
          <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">{item.label}</span>{' '}
              <span className="text-gray-500">{item.desc}</span>
            </p>
            {item.extra && <p className="text-xs text-gray-400 mt-0.5">{item.extra}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">{formatRelative(item.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HargaTbsCards({ data }) {
  const kelasStyle = {
    A: { dot: 'bg-emerald-500', border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'text-emerald-600' },
    B: { dot: 'bg-amber-500', border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'text-amber-600' },
    C: { dot: 'bg-sky-500', border: 'border-l-sky-500', bg: 'bg-sky-50', text: 'text-sky-700', label: 'text-sky-600' },
  };
  const today = todayStr();
  const aktif = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data
      .filter((h) => h.dari_tanggal <= today && (!h.sampai_tanggal || h.sampai_tanggal >= today))
      .reduce((acc, h) => { if (!acc[h.kelas] || h.dari_tanggal > acc[h.kelas].dari_tanggal) acc[h.kelas] = h; return acc; }, {});
  }, [data, today]);

  const kelasList = ['A', 'B', 'C'];
  const hasAny = kelasList.some((k) => aktif[k]);

  if (!hasAny) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada harga aktif</p>;
  return (
    <div className="space-y-2">
      {kelasList.map((k) => {
        const h = aktif[k];
        const s = kelasStyle[k];
        return (
          <div key={k} className={`flex items-center justify-between p-3 rounded-xl border-l-4 ${s.border} ${s.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${s.dot} flex items-center justify-center text-white font-bold text-sm`}>{k}</div>
              <div>
                <p className={`text-xs font-semibold ${s.label}`}>TBS Kelas {k}</p>
                <p className="text-sm font-bold text-foreground">
                  {h ? `Rp ${Number(h.harga_per_kg).toLocaleString('id-ID')}/kg` : '-'}
                </p>
              </div>
            </div>
            {h && (
              <Badge status={h.sampai_tanggal && h.sampai_tanggal < today ? 'rejected' : 'verified'} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgramAktifCards({ stats, pendaftaranPerProgram }) {
  const countPerProgram = useMemo(() => {
    if (!pendaftaranPerProgram) return {};
    const map = {};
    pendaftaranPerProgram.forEach((p) => { map[p.program_kud_id] = Number(p.total); });
    return map;
  }, [pendaftaranPerProgram]);

  if (!stats || !stats.aktif) return <p className="text-sm text-gray-400 py-8 text-center">Tidak ada program aktif</p>;

  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: Math.min(stats.aktif, 4) }).map((_, i) => {
        const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600'];
        return (
          <div key={i} className="p-3 rounded-xl bg-white border border-border">
            <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${colors[i % 4]} mb-2`} />
            <p className="text-xs font-semibold text-foreground truncate">Program {i + 1}</p>
            <p className="text-[10px] text-gray-400">Aktif</p>
          </div>
        );
      })}
    </div>
  );
}

function TopPekebun({ tbsList }) {
  const ranking = useMemo(() => {
    if (!tbsList || !Array.isArray(tbsList)) return [];
    const grouped = {};
    tbsList.forEach((t) => {
      const name = t.pekebun?.nama || 'Unknown';
      grouped[name] = (grouped[name] || 0) + Number(t.jumlah_tbs || 0);
    });
    return Object.entries(grouped)
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [tbsList]);

  if (ranking.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data TBS</p>;
  const max = ranking[0]?.total || 1;
  return (
    <div className="space-y-3">
      {ranking.map((p, i) => {
        const pct = (p.total / max) * 100;
        const medals = ['🥇', '🥈', '🥉'];
        return (
          <div key={p.nama} className="flex items-center gap-3">
            <span className="text-base w-5 text-center">{medals[i] || `#${i + 1}`}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-0.5">
                <span className="text-foreground font-medium truncate">{p.nama}</span>
                <span className="text-gray-500 tabular-nums">{Number(p.total).toLocaleString('id-ID')} kg</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-blue-400'}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuickActionsGrid({ router }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ACTIONS.map((act, i) => {
        const ActIcon = act.icon;
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(act.href)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-white hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
              <ActIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground leading-tight">{act.label}</span>
            <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{act.desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const confettiFired = useRef(false);

  const [stats, setStats] = useState(null);
  const [laporan, setLaporan] = useState(null);
  const [verifikasi, setVerifikasi] = useState([]);
  const [pendaftaran, setPendaftaran] = useState([]);
  const [tbsList, setTbsList] = useState([]);
  const [hargaTbs, setHargaTbs] = useState([]);
  const [lahanStats, setLahanStats] = useState(null);
  const [programStats, setProgramStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [user, setUser] = useState(null);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 10) setGreeting('Selamat pagi');
    else if (h < 15) setGreeting('Selamat siang');
    else if (h < 18) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [s, l, v, p, t, h, ls, ps] = await Promise.all([
        api.admin.dashboard(),
        api.admin.laporan().catch(() => null),
        api.admin.verifikasiLog.list().catch(() => []),
        api.admin.pendaftaran.list().catch(() => []),
        api.admin.tbs.list().catch(() => []),
        api.admin.hargaTbs.list().catch(() => ({ data: [] })),
        api.admin.lahan.stats().catch(() => null),
        api.admin.program.stats().catch(() => null),
      ]);
      setStats(s);
      setLaporan(l);
      setVerifikasi(Array.isArray(v) ? v : []);
      setPendaftaran(Array.isArray(p) ? p : []);
      setTbsList(Array.isArray(t) ? t : []);
      setHargaTbs(Array.isArray(h?.data) ? h.data : []);
      setLahanStats(ls);
      setProgramStats(ps);
      setLastRefresh(new Date());

      if (CONFETTI_ACTIVE && !confettiFired.current) {
        import('canvas-confetti').then((confetti) => {
          confetti.default({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#2563EB', '#059669', '#F59E0B', '#8B5CF6'] });
        });
        confettiFired.current = true;
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAll]);

  const handleRefresh = () => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  };

  const totalLuasHa = lahanStats?.total_luas_m2 ? (Number(lahanStats.total_luas_m2) / 10000).toFixed(1) : null;

  if (loading && !stats) return <FullSkeleton />;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-8">
      {/* ===== HEADER ===== */}
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <UserCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-heading">{greeting}, {user?.name || 'Admin'}</h1>
            <p className="text-sm text-gray-500">{formatDate(new Date(), 'EEEE, dd MMMM yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-xl border border-border bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh data"
          >
            <ArrowPathIcon className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${autoRefresh ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border bg-white text-gray-400'}`}
            title={autoRefresh ? 'Auto-refresh aktif' : 'Auto-refresh mati'}
          >
            <ClockIcon className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-gray-400 hidden sm:block">
            {autoRefresh ? `Auto ${formatRelative(lastRefresh)}` : 'Manual'}
          </span>
        </div>
      </motion.div>

      {/* ===== SUMMARY STATS ROW ===== */}
      <motion.div variants={itemAnim} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SUMMARY_STATS.map((s) => (
          <StatCard
            key={s.key}
            icon={s.icon}
            label={s.label}
            value={stats?.[s.key] || 0}
            color={s.color}
            bg={s.bg}
            onClick={() => router.push(s.href)}
          />
        ))}
      </motion.div>

      {/* ===== EXTRA STATS STRIP ===== */}
      <motion.div variants={itemAnim} className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {totalLuasHa && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 font-medium">
            <MapPinIcon className="w-3 h-3" /> Total Lahan: {totalLuasHa} ha
          </span>
        )}
        {lahanStats?.total_pekebun_dengan_lahan > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
            <UserGroupIcon className="w-3 h-3" /> {lahanStats.total_pekebun_dengan_lahan} pekebun punya lahan
          </span>
        )}
        {programStats && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-medium">
            <FireIcon className="w-3 h-3" /> {programStats.aktif} program aktif dari {programStats.total}
          </span>
        )}
        {stats?.total_pekebun_pending > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-medium">
            <ExclamationTriangleIcon className="w-3 h-3" /> {stats.total_pekebun_pending} pekebun pending
          </span>
        )}
        {stats?.total_pendaftaran_pending > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-medium">
            <BellAlertIcon className="w-3 h-3" /> {stats.total_pendaftaran_pending} pendaftaran pending
          </span>
        )}
      </motion.div>

      {/* ===== CHARTS ROW (3 columns) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemAnim}>
          <Card title="Status Pekebun" subtitle="Distribusi status verifikasi" className="h-full">
            <DonutChartWidget data={laporan?.pekebun_per_status} />
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Tren TBS per Bulan" subtitle="Grafik jumlah TBS" className="h-full">
            <AreaChartWidget data={laporan?.total_tbs_per_bulan} />
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Pendaftaran per Program" subtitle="Registrasi terbanyak" className="h-full">
            <ProgressBarsWidget data={laporan?.pendaftaran_per_program} />
          </Card>
        </motion.div>
      </div>

      {/* ===== MIDDLE ROW (2 columns) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemAnim}>
          <Card
            title="Aktivitas Terbaru"
            subtitle="Feed verifikasi, pendaftaran & TBS"
            className="h-full"
          >
            <ActivityTimeline verifikasi={verifikasi} pendaftaran={pendaftaran} tbsList={tbsList} />
            <div className="mt-3 pt-3 border-t border-border flex gap-3">
              <button onClick={() => router.push('/admin/verifikasi-log')} className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                Semua Verifikasi <ChevronRightIcon className="w-3 h-3" />
              </button>
              <button onClick={() => router.push('/admin/pendaftaran')} className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                Semua Pendaftaran <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Harga TBS Saat Ini" subtitle="Tarif aktif per kelas" className="h-full">
            <HargaTbsCards data={hargaTbs} />
            <div className="mt-3 pt-3 border-t border-border">
              <button onClick={() => router.push('/admin/harga-tbs')} className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                Kelola Harga TBS <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ===== BOTTOM ROW (2 columns) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemAnim}>
          <Card title="Top Pekebun" subtitle="Peringkat berdasarkan total TBS" className="h-full">
            <TopPekebun tbsList={tbsList} />
            <div className="mt-3 pt-3 border-t border-border">
              <button onClick={() => router.push('/admin/pekebun')} className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                Semua Pekebun <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemAnim}>
          <Card title="Aksi Cepat" subtitle="Shortcut operasional harian">
            <QuickActionsGrid router={router} />
          </Card>
        </motion.div>
      </div>

      {/* ===== SYSTEM INFO FOOTER ===== */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground">Sistem</span>
            {SYSTEM_INFO.map((info) => (
              <span key={info.label} className="inline-flex items-center gap-1">
                <span className="text-gray-500">{info.label}:</span>
                <span className="font-medium text-foreground">{info.value}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span>Last refresh: {formatRelative(lastRefresh)}</span>
            <span className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
              {autoRefresh ? 'Auto-refresh 30s' : 'Refresh manual'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
