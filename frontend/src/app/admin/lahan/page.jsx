'use client';

import { useEffect, useState, useRef, useCallback, memo, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import ExportDropdown from '@/components/ExportDropdown';
import { motion } from 'framer-motion';
import { MapPinIcon, XMarkIcon, MagnifyingGlassIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const JENIS_SURAT = ['SHM', 'HGB', 'HGU', 'Girik', 'Lainnya'];

function StatsCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  );
}

function LahanRow({ lahan, onPreview }) {
  const fotoKebunArr = (() => {
    if (!lahan.foto_kebun) return [];
    try { return JSON.parse(lahan.foto_kebun); } catch { return []; }
  })();

  const openMaps = (coord) => {
    if (!coord) return;
    const q = coord.includes('http') ? coord : `https://www.google.com/maps?q=${encodeURIComponent(coord)}`;
    window.open(q, '_blank');
  };

  return (
    <motion.tr variants={fadeUp} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-3 px-3">
        <div className="font-medium text-foreground">{lahan.pekebun?.nama || '-'}</div>
        {lahan.pekebun?.nik && <div className="text-xs text-gray-400">{lahan.pekebun.nik}</div>}
      </td>
      <td className="py-3 px-3 text-gray-600 max-w-[200px] truncate" title={lahan.alamat_lahan}>{lahan.alamat_lahan || '-'}</td>
      <td className="py-3 px-3">
        {lahan.jenis_surat && (
          <>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{lahan.jenis_surat}</span>
            {lahan.nomor_surat && <div className="text-[10px] text-gray-400 mt-0.5">{lahan.nomor_surat}</div>}
          </>
        )}
        {!lahan.jenis_surat && <span className="text-xs text-gray-400">-</span>}
      </td>
      <td className="py-3 px-3 text-right font-semibold text-foreground">{Number(lahan.luas_lahan_m2 || 0).toLocaleString()}</td>
      <td className="py-3 px-3">
        <div className="flex gap-1.5">
          {lahan.foto_petani && (
            <button onClick={() => onPreview(lahan.foto_petani, `Foto Petani - ${lahan.pekebun?.nama}`)}
              className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-0.5">
              <PhotoIcon className="w-3 h-3" /> Petani
            </button>
          )}
          {fotoKebunArr.map((url, idx) => (
            <button key={idx} onClick={() => onPreview(url, `Foto Kebun ${idx + 1} - ${lahan.pekebun?.nama}`)}
              className="text-xs text-green-600 hover:underline cursor-pointer flex items-center gap-0.5">
              <PhotoIcon className="w-3 h-3" /> K{idx + 1}
            </button>
          ))}
          {!lahan.foto_petani && fotoKebunArr.length === 0 && <span className="text-xs text-gray-400">-</span>}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex gap-2">
          {lahan.upload_surat_tanah && (
            <a href={lahan.upload_surat_tanah} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              <DocumentTextIcon className="w-3 h-3" /> Tanah
            </a>
          )}
          {lahan.upload_surat_keterangan && (
            <a href={lahan.upload_surat_keterangan} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              <DocumentTextIcon className="w-3 h-3" /> Ket
            </a>
          )}
          {!lahan.upload_surat_tanah && !lahan.upload_surat_keterangan && <span className="text-xs text-gray-400">-</span>}
        </div>
      </td>
      <td className="py-3 px-3">
        {lahan.titik_koordinat ? (
          <button onClick={() => openMaps(lahan.titik_koordinat)}
            className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline cursor-pointer">
            <MapPinIcon className="w-3.5 h-3.5" /> Buka
          </button>
        ) : <span className="text-xs text-gray-400">-</span>}
      </td>
    </motion.tr>
  );
}

const LahanRowMemo = memo(LahanRow);

export default function AdminLahanPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const searchTimer = useRef(null);

  const fetchData = useCallback((params = {}) => {
    const p = {};
    if (params.search || search) p.search = params.search || search;
    if (params.jenis_surat || filterJenis) p.jenis_surat = params.jenis_surat || filterJenis;
    p.page = params.page || 1;
    p.per_page = 15;
    api.admin.lahan.list(Object.keys(p).length ? p : undefined)
      .then((res) => {
        setData(res.data || []);
        setMeta(res.meta || null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [search, filterJenis, toast]);

  const fetchStats = useCallback(() => {
    api.admin.lahan.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    startTransition(() => { setLoading(true); });
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchData({ search: val, page: 1 }), 300);
  }, [fetchData]);

  const handleFilter = useCallback((val) => {
    setFilterJenis(val);
    fetchData({ jenis_surat: val, page: 1 });
  }, [fetchData]);

  const handlePage = useCallback((page) => {
    fetchData({ page });
  }, [fetchData]);

  const handlePreview = useCallback((url, label) => {
    setPreviewImage(url);
    setPreviewLabel(label);
  }, []);

  if (loading) return <TableSkeleton />;

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <MapPinIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Lahan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Semua data lahan pekebun terdaftar</p>
          </div>
        </div>
        <ExportDropdown
          title="Data Lahan"
          fetchAll={() => api.admin.lahan.list({ per_page: 9999 }).then((res) => res.data || res)}
          pdfUrl={api.admin.export.lahanPdf()}
          csvUrl={api.admin.export.lahanCsv()}
          filename="data-lahan"
          renderPrintContent={(items) => `
            <table class="print-table">
              <thead>
                <tr>
                  <th style="width:36px">No</th>
                  <th>Pekebun</th>
                  <th>NIK</th>
                  <th>Alamat Lahan</th>
                  <th>Jenis Surat</th>
                  <th style="text-align:right">Luas (M2)</th>
                  <th>Koordinat</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((d, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${d.pekebun?.nama || '-'}</strong></td>
                    <td>${d.pekebun?.nik || '-'}</td>
                    <td>${d.alamat_lahan}</td>
                    <td>${d.jenis_surat || '-'}</td>
                    <td style="text-align:right;font-weight:700">${d.luas_lahan_m2 ? Number(d.luas_lahan_m2).toLocaleString() : '0'}</td>
                    <td>${d.titik_koordinat || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        />
      </motion.div>

      {stats && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatsCard label="Total Lahan" value={stats.total_lahan} icon={MapPinIcon} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatsCard label="Total Luas (MÂ²)" value={Number(stats.total_luas_m2).toLocaleString()} icon={DocumentTextIcon} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatsCard label="Pekebun dengan Lahan" value={stats.total_pekebun_dengan_lahan} icon={PhotoIcon} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Cari alamat atau pekebun..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
              />
            </div>
            <select
              value={filterJenis}
              onChange={(e) => handleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            >
              <option value="">Semua Surat</option>
              {JENIS_SURAT.map((j) => (<option key={j} value={j}>{j}</option>))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white rounded-xl">
                  <th className="text-left py-3 px-3 font-semibold text-white/80 first:rounded-l-lg">Pekebun</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Alamat Lahan</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Surat</th>
                  <th className="text-right py-3 px-3 font-semibold text-white/80">Luas (MÂ²)</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Foto</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Dokumen</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80 last:rounded-r-lg">Map</th>
                </tr>
              </thead>
              <tbody>
                {data.map((l) => (
                  <LahanRowMemo key={l.id} lahan={l} onPreview={handlePreview} />
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="7" className="text-center py-12 text-gray-400">{search || filterJenis ? 'Tidak ada lahan yang cocok' : 'Belum ada data lahan'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-sm text-gray-500">{meta.total} data - Halaman {meta.current_page} dari {meta.last_page}</span>
              <div className="flex gap-2">
                <button disabled={meta.current_page <= 1} onClick={() => handlePage(meta.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Prev</button>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => handlePage(meta.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next</button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">{previewLabel}</span>
              <button onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all">
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
            <img src={previewImage} alt="" className="w-full h-auto rounded-2xl shadow-2xl mt-6" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

