'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import KartuAdmin from '@/components/KartuAdmin';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, PrinterIcon, ShareIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function AdminKartuPage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);

    Promise.all([
      api.admin.settingKud.get().catch(() => null),
      api.admin.pengaturan.getAll().catch(() => ({})),
    ]).then(([settingKud, pengaturan]) => {
      setData({
        admin: {
          name: u.name || 'Admin KUD',
          jabatan: pengaturan?.jabatan_admin || 'Administrator',
          nip: pengaturan?.nip_admin || '-',
          foto_profil: u.foto_profil || '',
        },
        setting_kud: settingKud || {},
        pengaturan: pengaturan || {},
        admin_card_config: settingKud?.admin_card_config || {},
        nomor_induk: 'ADM-' + String(u.id || '001').padStart(3, '0'),
        tanggal_terbit: new Date().toISOString().split('T')[0],
        masa_berlaku: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-400 text-sm">Gagal memuat data</div>;
  }

  const loc = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${loc}/admin/kartu-admin`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <CreditCardIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">Kartu Identitas Admin</h3>
            <p className="text-xs text-gray-400 mt-0.5">Kartu identitas resmi untuk admin KUD Sari Subur</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const el = document.querySelector('[data-kartu-admin]');
              if (el) {
                const btn = el.querySelector('[data-download-btn]');
                if (btn) btn.click();
              }
            }} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer">
              <ArrowDownTrayIcon className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={() => {
              const el = document.querySelector('[data-kartu-admin]');
              if (el) {
                const btn = el.querySelector('[data-print-btn]');
                if (btn) btn.click();
              }
            }} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all cursor-pointer">
              <PrinterIcon className="w-4 h-4" /> Cetak
            </button>
            <button onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                setShareText('Tersalin!');
                setTimeout(() => setShareText(''), 2000);
              } catch {}
            }} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer">
              <ShareIcon className="w-4 h-4" /> {shareText || 'Bagikan'}
            </button>
          </div>
        </div>
        <div className="p-5 flex justify-center">
          <div data-kartu-admin className="w-full max-w-lg">
            <KartuAdmin data={data} width={9999} showActions={true} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
