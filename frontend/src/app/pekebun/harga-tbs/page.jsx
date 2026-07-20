'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import {
  CurrencyDollarIcon, CalendarDaysIcon, CheckCircleIcon,
  ClockIcon, XCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatDateShort, todayStr } from '@/lib/date';

const KELAS_DISPLAY = {
  A: { label: 'Tandan Buah Segar A', desc: 'Kualitas premium', gradient: 'from-emerald-500 via-emerald-600 to-emerald-700', shadow: 'shadow-emerald-200/50', ring: 'ring-emerald-500/20' },
  B: { label: 'Tandan Buah Segar B', desc: 'Kualitas menengah', gradient: 'from-amber-500 via-amber-600 to-amber-700', shadow: 'shadow-amber-200/50', ring: 'ring-amber-500/20' },
  C: { label: 'Tandan Buah Segar C', desc: 'Kualitas standar', gradient: 'from-sky-500 via-sky-600 to-sky-700', shadow: 'shadow-sky-200/50', ring: 'ring-sky-500/20' },
};

function formatRp(n) {
  const num = Number(n);
  if (isNaN(num)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

function getState(item) {
  const today = todayStr();
  if (item.dari_tanggal <= today && (!item.sampai_tanggal || item.sampai_tanggal >= today)) return 'active';
  if (item.dari_tanggal > today) return 'upcoming';
  return 'expired';
}

function StateBadge({ state }) {
  const cfg = {
    active: { icon: CheckCircleIcon, label: 'Berlaku', classes: 'bg-green-100 text-green-700 border-green-200' },
    upcoming: { icon: ClockIcon, label: 'Akan Datang', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
    expired: { icon: XCircleIcon, label: 'Berakhir', classes: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const c = cfg[state];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${c.classes}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export default function PekebunHargaTbsPage() {
  const toast = useToast();
  const [allData, setAllData] = useState([]);
  const [aktifMap, setAktifMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.hargaTbs.list(),
      api.hargaTbs.latest(),
    ])
      .then(([list, aktif]) => {
        setAllData(list.data || list || []);
        setAktifMap(aktif || {});
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['A', 'B', 'C'].map((k) => <div key={k} className="h-52 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
        <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const grouped = { A: [], B: [], C: [] };
  allData.forEach((item) => { if (grouped[item.kelas]) grouped[item.kelas].push(item); });

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <CurrencyDollarIcon className="w-7 h-7 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Harga TBS</h1>
          <p className="text-sm text-gray-500 mt-0.5">Informasi harga TBS terkini per kelas dari KUD</p>
        </div>
      </div>

      {/* 3 HERO CARDS — Active Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {['A', 'B', 'C'].map((kelas) => {
          const meta = KELAS_DISPLAY[kelas];
          const aktif = aktifMap[kelas];

          return (
            <div key={kelas} className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} rounded-2xl p-6 text-white shadow-xl ${meta.shadow} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ring-1 ring-white/10`}>
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.06] rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/[0.04] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-bold tracking-wide border border-white/10">
                    {meta.label}
                  </span>
                </div>
                {aktif ? (
                  <>
                    <div className="mt-4">
                      <span className="text-3xl md:text-4xl font-bold tracking-tight">{formatRp(aktif.harga_per_kg)}</span>
                      <span className="text-white/60 text-sm ml-1">/ kg</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                      <p className="text-white/70 text-xs flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Mulai: <strong>{formatDate(aktif.dari_tanggal)}</strong></span>
                      </p>
                      {aktif.sampai_tanggal ? (
                        <p className="text-white/70 text-xs flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Sampai: <strong>{formatDate(aktif.sampai_tanggal)}</strong></span>
                        </p>
                      ) : (
                        <p className="text-white/50 text-[10px] italic">Belum ada batas akhir</p>
                      )}
                    </div>
                    {aktif.keterangan && (
                      <p className="text-white/60 text-[11px] mt-3 border-t border-white/5 pt-2 line-clamp-2">{aktif.keterangan}</p>
                    )}
                    <div className="mt-4">
                      <StateBadge state="active" />
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <CurrencyDollarIcon className="w-10 h-10 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Belum ada harga</p>
                    <p className="text-white/30 text-[11px] mt-1">Silakan cek kembali nanti</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Movement Summary */}
      {['A', 'B', 'C'].some((k) => aktifMap[k]) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {['A', 'B', 'C'].map((kelas) => {
            const items = grouped[kelas] || [];
            if (items.length < 2) return null;
            const sorted = [...items].sort((a, b) => (a.dari_tanggal || '').localeCompare(b.dari_tanggal || ''));
            const prev = sorted[sorted.length - 2];
            const curr = sorted[sorted.length - 1];
            if (!prev || !curr) return null;
            const diff = curr.harga_per_kg - prev.harga_per_kg;
            const pct = prev.harga_per_kg > 0 ? ((diff / prev.harga_per_kg) * 100).toFixed(1) : 0;
            const up = diff > 0;
            const down = diff < 0;
            return (
              <div key={kelas} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl text-xs">
                <span className="font-medium text-gray-600">{KELAS_DISPLAY[kelas].label.replace(' —', ':')}</span>
                <span className={`flex items-center gap-0.5 font-semibold ${up ? 'text-green-600' : down ? 'text-red-500' : 'text-gray-500'}`}>
                  {up ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : down ? <ArrowTrendingDownIcon className="w-3.5 h-3.5" /> : null}
                  {up ? `+${formatRp(diff)}` : down ? `-${formatRp(Math.abs(diff))}` : 'Tetap'} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* HISTORY PER KELAS */}
      {allData.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Riwayat Harga</h2>
          {['A', 'B', 'C'].map((kelas) => {
            const meta = KELAS_DISPLAY[kelas];
            const aktif = aktifMap[kelas];
            const items = allData.filter((i) => i.kelas === kelas && (!aktif || i.id !== aktif.id));

            if (items.length === 0) return null;

            return (
              <div key={kelas} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">{meta.label}</h3>
                  <span className="text-[10px] text-gray-400">{items.length} riwayat</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => {
                    const state = getState(item);
                    return (
                      <div key={item.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${state === 'expired' ? 'opacity-60 border-gray-200' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${state === 'expired' ? 'bg-gray-50' : state === 'upcoming' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                              <CurrencyDollarIcon className={`w-4 h-4 ${state === 'expired' ? 'text-gray-400' : state === 'upcoming' ? 'text-blue-500' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                              <p className={`font-bold ${state === 'expired' ? 'text-gray-500 line-through' : 'text-foreground'}`}>{formatRp(item.harga_per_kg)}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <CalendarDaysIcon className="w-3 h-3" />
                                {formatDateShort(item.dari_tanggal)}{item.sampai_tanggal ? ` — ${formatDateShort(item.sampai_tanggal)}` : ' — ∞'}
                              </p>
                            </div>
                          </div>
                          <StateBadge state={state} />
                        </div>
                        {item.keterangan && (
                          <p className={`text-[11px] mt-2 ${state === 'expired' ? 'text-gray-400' : 'text-gray-500'}`}>{item.keterangan}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {allData.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CurrencyDollarIcon className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Belum ada informasi harga TBS</p>
          <p className="text-gray-400 text-sm mt-1">Admin belum menetapkan harga TBS</p>
        </div>
      )}
    </div>
  );
}
