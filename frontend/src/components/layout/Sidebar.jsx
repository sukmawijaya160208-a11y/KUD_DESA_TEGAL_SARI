'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, startTransition } from 'react';
import { api } from '@/lib/api';
import { useLogo } from '@/hooks/useLogo';
import { useToast } from '@/components/ToastProvider';
import NotifDropdown from '@/components/NotifDropdown';
import {
  HomeIcon, UsersIcon, ClipboardDocumentListIcon, Cog6ToothIcon,
  ChartBarIcon, CheckBadgeIcon, ClockIcon, UserIcon,
  DocumentTextIcon, ArrowRightOnRectangleIcon, Bars3Icon,
  BellIcon, MapPinIcon, ShieldExclamationIcon, UserGroupIcon,
  BookOpenIcon, CurrencyDollarIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon, InformationCircleIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon, NewspaperIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  Dashboard: HomeIcon, 'Data Pekebun': UsersIcon, 'Program KUD': ClipboardDocumentListIcon,
  Pengaturan: Cog6ToothIcon, Laporan: ChartBarIcon, 'Verifikasi Pekebun': CheckBadgeIcon,
  'Verifikasi Program': DocumentTextIcon, Riwayat: ClockIcon, 'Profil Saya': UserIcon,
  'Data Lahan': DocumentTextIcon, 'TBS Sync': ChartBarIcon,
  'Data TBS': ChartBarIcon, 'Data Lahan Admin': MapPinIcon,
  'Verifikasi Log': ShieldExclamationIcon, 'Manajemen User': UserGroupIcon,
  Pendaftaran: BookOpenIcon,
  'Harga TBS': CurrencyDollarIcon,
  'Backup & Restore': ArrowDownTrayIcon,
  Blog: NewspaperIcon,
  Pesan: ChatBubbleLeftRightIcon,
  'Tentang Aplikasi': InformationCircleIcon,
};

const menuTheme = {
  Dashboard: 'from-blue-500 to-blue-600',
  'Data Pekebun': 'from-blue-500 to-indigo-600',
  'Program KUD': 'from-purple-500 to-purple-600',
  'Data Lahan Admin': 'from-orange-500 to-orange-600',
  'Data TBS': 'from-cyan-500 to-cyan-600',
  'Harga TBS': 'from-emerald-500 to-emerald-600',
  Pendaftaran: 'from-pink-500 to-pink-600',
  'Manajemen User': 'from-slate-600 to-slate-700',
  'Verifikasi Log': 'from-amber-500 to-amber-600',
  Laporan: 'from-indigo-500 to-indigo-600',
  Pengaturan: 'from-gray-500 to-gray-600',
  'Backup & Restore': 'from-teal-500 to-teal-600',
  Blog: 'from-rose-500 to-rose-600',
  Pesan: 'from-sky-500 to-blue-600',
  'Tentang Aplikasi': 'from-sky-500 to-sky-600',
  'Verifikasi Pekebun': 'from-blue-500 to-indigo-600',
  'Verifikasi Program': 'from-purple-500 to-purple-600',
  Riwayat: 'from-amber-500 to-amber-600',
  'Profil Saya': 'from-blue-400 to-blue-600',
  'Data Lahan': 'from-orange-500 to-orange-600',
  'TBS Sync': 'from-cyan-500 to-cyan-600',
};

const menuItems = {
  admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Data Pekebun', href: '/admin/pekebun' },
    { label: 'Program KUD', href: '/admin/program' },
    { label: 'Data Lahan Admin', href: '/admin/lahan' },
    { label: 'Data TBS', href: '/admin/tbs' },
    { label: 'Harga TBS', href: '/admin/harga-tbs' },
    { label: 'Pendaftaran', href: '/admin/pendaftaran' },
    { label: 'Manajemen User', href: '/admin/users' },
    { label: 'Verifikasi Log', href: '/admin/verifikasi-log' },
    { label: 'Laporan', href: '/admin/laporan' },
    { label: 'Pengaturan', href: '/admin/pengaturan' },
    { label: 'Backup & Restore', href: '/admin/backup-restore' },
    { label: 'Blog', href: '/admin/blog' },
    { label: 'Pesan', href: '/admin/pesan' },
    { label: 'Tentang Aplikasi', href: '/admin/tentang-aplikasi' },
  ],
  verifikator: [
    { label: 'Verifikasi Pekebun', href: '/verifikator' },
    { label: 'Verifikasi Program', href: '/verifikator/program' },
    { label: 'Riwayat', href: '/verifikator/riwayat' },
    { label: 'Pesan', href: '/verifikator/pesan' },
    { label: 'Tentang Aplikasi', href: '/verifikator/tentang-aplikasi' },
  ],
  pekebun: [
    { label: 'Dashboard', href: '/pekebun' },
    { label: 'Profil Saya', href: '/pekebun/profil' },
    { label: 'Data Lahan', href: '/pekebun/lahan' },
    { label: 'Program KUD', href: '/pekebun/program' },
    { label: 'TBS Sync', href: '/pekebun/tbs' },
    { label: 'Harga TBS', href: '/pekebun/harga-tbs' },
    { label: 'Pesan', href: '/pekebun/pesan' },
    { label: 'Tentang Aplikasi', href: '/pekebun/tentang-aplikasi' },
  ],
};

export default function Sidebar({ role, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true' && window.innerWidth >= 1024) startTransition(() => setCollapsed(true));
  }, []);
  const [user, setUser] = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);

  const logoUrl = useLogo();
const items = menuItems[role] || [];

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u.name) {
      setTimeout(() => setUser(u), 0);
    }

  }, []);

  const handleLogout = async () => {
    try { await api.auth.logout(); } catch {}
    localStorage.removeItem('token'); localStorage.removeItem('user');
    router.push('/login');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPhotoUploading(true);
    try {
      const res = await api.auth.uploadProfilePhoto(file);
      const updated = { ...user, foto_profil: res.url };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Foto profil berhasil diupload');
    } catch (err) { toast.error('Upload gagal: ' + err.message); }
    setPhotoUploading(false);
  };

  const toggleCollapse = () => setCollapsed((prev) => {
    const next = !prev;
    localStorage.setItem('sidebar_collapsed', next);
    return next;
  });

  const isChatPage = pathname?.includes('/pesan');

  const NavItem = ({ label, href }) => {
    const Icon = iconMap[label];
    const active = pathname === href;
    const gradient = menuTheme[label] || 'from-gray-400 to-gray-500';
    return (
      <button onClick={() => { router.push(href); setOpen(false); }}
        className={`w-full text-left sidebar-link relative group ${active ? 'active shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'} ${collapsed ? 'justify-center px-0' : ''}`}>
        {active && !collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-primary-dark" />}
        <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm ${collapsed ? '' : ''}`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gradient-to-br ${gradient} text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[999] shadow-xl">
            {label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-50 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-72'}`}>
        <div className={`border-b border-white/10 ${collapsed ? 'p-4' : 'p-6'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3.5'}`}>
            <div className={`rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-white shadow-md ${collapsed ? 'w-9 h-9' : 'w-10 h-10'}`}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <h2 className="text-white font-heading font-bold text-sm leading-tight">KUD Tegal Sari</h2>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">{role}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto sidebar-scroll overscroll-contain">
          {items.map((item) => <NavItem key={item.href} {...item} />)}
        </nav>

        <div className={`border-t border-white/10 space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
          <button onClick={() => { router.push('/notifikasi'); setOpen(false); }}
            className={`sidebar-link w-full text-left text-white/70 hover:text-white hover:bg-white/10 relative group ${collapsed ? 'justify-center px-0' : ''}`}>
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <BellIcon className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span>Notifikasi</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[999] shadow-xl">
                Notifikasi
              </div>
            )}
          </button>

          <div className={`${collapsed ? 'px-0 py-2 mt-0 flex justify-center' : 'px-4 py-2.5 mt-1.5'}`}>
            <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-2.5'}`}>
              <label className={`relative rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-all shrink-0 group ${collapsed ? 'w-9 h-9' : 'w-8 h-8'}`} style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
                {user.foto_profil ? (
                  <img src={user.foto_profil} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-[10px] font-bold text-white">{user.name?.charAt(0) || 'U'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <span className="text-white text-[8px]">{photoUploading ? '...' : 'Edit'}</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={photoUploading} />
              </label>
              {!collapsed && (
                <div className="min-w-0 transition-opacity duration-200">
                  <div className="text-white text-sm font-medium truncate">{user.name || role}</div>
                  <div className="text-white/40 text-[10px] truncate">{user.email || role}</div>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleLogout}
            className={`sidebar-link w-full text-left text-white/40 hover:text-red-300 text-xs relative group ${collapsed ? 'justify-center px-0 mt-0' : 'mt-1'}`}>
            <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <ArrowRightOnRectangleIcon className="w-4 h-4 text-white" />
            </div>
            {!collapsed && <span>Keluar</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[999] shadow-xl">
                Keluar
              </div>
            )}
          </button>

          <button onClick={toggleCollapse}
            className="w-full flex items-center justify-center py-2 text-white/30 hover:text-white/60 transition-colors cursor-pointer group">
            {collapsed ? (
              <ChevronDoubleRightIcon className="w-4 h-4" />
            ) : (
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={`flex-1 flex flex-col overflow-hidden ${isChatPage ? '' : ''}`}>
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 border-b border-white/10 px-6 py-3 flex items-center gap-4 lg:hidden shadow-md">
          <button onClick={() => setOpen(true)} className="text-white p-2 cursor-pointer">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center overflow-hidden shadow-sm">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-primary font-bold text-xs">K</span>
              )}
            </div>
            <span className="font-heading font-bold text-sm text-white">KUD Tegal Sari</span>
          </div>
          <div className="ml-auto"><NotifDropdown /></div>
        </header>
        <main className={`flex-1 overflow-y-auto ${pathname?.includes('tentang-aplikasi') ? 'p-0' : 'p-6 lg:p-8'} ${isChatPage ? '!p-0 overflow-hidden' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
