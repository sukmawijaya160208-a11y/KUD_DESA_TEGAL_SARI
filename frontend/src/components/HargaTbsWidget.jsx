'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon, ArrowPathIcon, CalendarDaysIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

const KELAS_INFO = {
  A: { label: 'Kelas A', desc: 'Kualitas Terbaik', bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-600', badge: 'bg-emerald-500' },
  B: { label: 'Kelas B', desc: 'Kualitas Standar', bg: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/30', text: 'text-teal-600', badge: 'bg-teal-500' },
  C: { label: 'Kelas C', desc: 'Kualitas Ekonomis', bg: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/30', text: 'text-slate-600', badge: 'bg-slate-500' },
};

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white/80 rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="h-4 w-20 bg-gray-200 rounded-full" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      <div className="h-3 w-28 bg-gray-200 rounded" />
    </div>
  );
}

function PriceCard({ kelas, data, index }) {
  const info = KELAS_INFO[kelas] || KELAS_INFO.C;
  const Icon = kelas === 'A' ? CheckBadgeIcon : kelas === 'B' ? CurrencyDollarIcon : CurrencyDollarIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${info.bg} border ${info.border} p-5 sm:p-6 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider ${info.badge} shadow-sm`}>
            {kelas === 'A' ? (
              <CheckBadgeIcon className="w-3 h-3" />
            ) : (
              <CurrencyDollarIcon className="w-3 h-3" />
            )}
            {info.label}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{info.desc}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${info.badge} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="mb-4">
        <div className={`text-3xl sm:text-4xl font-extrabold font-heading ${info.text} leading-tight`}>
          Rp {Number(data.harga_per_kg).toLocaleString('id-ID')}
          <span className="text-base sm:text-lg font-medium text-gray-400">/kg</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <CalendarDaysIcon className="w-3.5 h-3.5" />
        <span>Berlaku {new Date(data.dari_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      {data.keterangan && (
        <p className="mt-2 text-[11px] text-gray-400 italic leading-relaxed">{data.keterangan}</p>
      )}

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
    </motion.div>
  );
}

export default function HargaTbsWidget() {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.hargaTbs.latest();
      setPrices(res || res?.data || null);
      setError(false);
    } catch {
      if (!silent) setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(true), 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const kelasList = prices ? ['A', 'B', 'C'].filter(k => prices[k]) : [];
  const hasData = kelasList.length > 0;
  const latestDate = hasData ? prices[kelasList[0]].dari_tanggal : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40 shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground">Harga TBS Terkini</h3>
              {latestDate && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  Update: {new Date(latestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchPrices(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all disabled:opacity-50 cursor-pointer"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memuat...' : 'Refresh'}
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <CurrencyDollarIcon className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Gagal memuat harga TBS</p>
            <button onClick={() => fetchPrices()} className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer">
              Coba Lagi
            </button>
          </motion.div>
        ) : !hasData ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CurrencyDollarIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Belum ada data harga TBS</p>
            <p className="text-xs text-gray-400 mt-1">Admin akan mengupdate harga segera.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {kelasList.map((kelas, idx) => (
              <PriceCard key={kelas} kelas={kelas} data={prices[kelas]} index={idx} />
            ))}
          </div>
        )}

        {hasData && (
          <p className="text-[11px] text-gray-400 text-center mt-5">
            Harga resmi KUD Sari Subur. Data otomatis diperbarui setiap 60 detik.
          </p>
        )}
      </div>
    </motion.div>
  );
}
