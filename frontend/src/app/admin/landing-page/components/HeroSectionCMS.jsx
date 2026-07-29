'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function HeroSectionCMS() {
  const [formData, setFormData] = useState({
    sub_judul: 'Koperasi Unit Desa Tegal Sari',
    judul_utama: 'Maju Bersama KUD Sari Subur',
    deskripsi: 'Koperasi petani kelapa sawit yang berkomitmen meningkatkan kesejahteraan anggota melalui kemitraan berkelanjutan, inovasi, dan gotong royong. Berdiri sejak 2019, KUD Sari Subur telah melayani lebih dari 371 pekebun aktif dengan total lahan kelola 850 hektar dan produksi TBS mencapai 5.000 ton per tahun.',
    catatan_hukum: 'Berbadan hukum, terverifikasi Dinas Koperasi & UKM, dan berkomitmen pada prinsip transparansi, akuntabilitas, serta kemandirian anggota.',
    ukuran_font: 'sedang',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [pesan, setPesan] = useState({ tipe: '', teks: '' });

  useEffect(() => {
    api.admin.landing.getHero()
      .then((res) => {
        if (res?.data) {
          setFormData({
            sub_judul: res.data.sub_judul || '',
            judul_utama: res.data.judul_utama || '',
            deskripsi: res.data.deskripsi || '',
            catatan_hukum: res.data.catatan_hukum || '',
            ukuran_font: res.data.ukuran_font || 'sedang',
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'radio' ? e.target.value : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPesan({ tipe: '', teks: '' });
    try {
      const res = await api.admin.landing.saveHero(formData);
      setPesan({ tipe: 'sukses', teks: res.message || 'Berhasil menyimpan perubahan teks Hero!' });
    } catch (err) {
      setPesan({ tipe: 'error', teks: err.message || 'Gagal menyimpan' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ sub_judul: '', judul_utama: '', deskripsi: '', catatan_hukum: '', ukuran_font: 'sedang' });
    setPesan({ tipe: 'info', teks: 'Semua teks telah dikosongkan.' });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const previewFontSize = formData.ukuran_font === 'kecil' ? 'text-xl' : formData.ukuran_font === 'besar' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b border-slate-200 pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">Hero Section</h1>
            <p className="text-xs sm:text-sm text-slate-500">Atur teks utama landing page: nama koperasi, tagline, deskripsi, legalitas & ukuran font judul</p>
          </div>
        </div>
      </div>

      {pesan.teks && (
        <div className={`p-3 rounded-xl text-xs font-medium transition-all ${
          pesan.tipe === 'sukses' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          pesan.tipe === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {pesan.teks}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* FORM EDIT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs sm:text-base flex items-center gap-1.5">
              <span>📝</span> Form Edit Teks
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-400">Admin Mode</span>
          </div>

          <form onSubmit={handleSimpan} className="space-y-2.5 sm:space-y-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Sub-Judul / Nama Koperasi</label>
              <input type="text" name="sub_judul" value={formData.sub_judul} onChange={handleChange}
                placeholder="Contoh: Koperasi Unit Desa Tegal Sari"
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Judul Utama (Tagline)</label>
              <input type="text" name="judul_utama" value={formData.judul_utama} onChange={handleChange}
                placeholder="Contoh: Maju Bersama KUD Sari Subur"
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Deskripsi Utama</label>
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange}
                rows="4" placeholder="Masukkan deskripsi KUD..."
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed transition-all" />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Catatan Legalitas</label>
              <textarea name="catatan_hukum" value={formData.catatan_hukum} onChange={handleChange}
                rows="2" placeholder="Masukkan status badan hukum..."
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed transition-all" />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">Ukuran Font Judul</label>
              <div className="flex gap-3">
                {[
                  { value: 'kecil', label: 'Kecil', desc: '2xl / 5xl' },
                  { value: 'sedang', label: 'Sedang', desc: '4xl / 7xl' },
                  { value: 'besar', label: 'Besar', desc: '4xl / 8xl' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.ukuran_font === opt.value
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                    <input type="radio" name="ukuran_font" value={opt.value} checked={formData.ukuran_font === opt.value} onChange={handleChange} className="sr-only" />
                    <span className={`font-bold leading-none ${
                      opt.value === 'kecil' ? 'text-lg' : opt.value === 'besar' ? 'text-2xl' : 'text-xl'
                    } ${formData.ukuran_font === opt.value ? 'text-emerald-700' : 'text-slate-600'}`}>Aa</span>
                    <span className={`text-[11px] font-semibold ${formData.ukuran_font === opt.value ? 'text-emerald-700' : 'text-slate-500'}`}>{opt.label}</span>
                    <span className="text-[10px] text-slate-400">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all cursor-pointer">
                🗑️ Reset
              </button>
              <button type="submit" disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer">
                {loading ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </form>
        </div>

        {/* LIVE PREVIEW */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white flex flex-col relative overflow-hidden shadow-xl border border-slate-800 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tampilan di Website</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">Live Preview</span>
          </div>

          <div className="space-y-2 sm:space-y-3.5 my-auto">
            {formData.sub_judul ? (
              <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-medium rounded-full border border-emerald-500/30 leading-none">
                {formData.sub_judul}
              </span>
            ) : (
              <span className="inline-block text-xs text-slate-500 italic">[Sub-Judul Kosong]</span>
            )}

            <h2 className={`${previewFontSize} sm:${formData.ukuran_font === 'kecil' ? 'text-3xl' : formData.ukuran_font === 'besar' ? 'text-5xl' : 'text-4xl'} font-extrabold text-white leading-tight tracking-tight`}>
              {formData.judul_utama || <span className="text-slate-500 italic">[Judul Utama Kosong]</span>}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-snug sm:leading-relaxed">
              {formData.deskripsi || <span className="text-slate-500 italic">[Deskripsi Kosong]</span>}
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-800 text-[10px] sm:text-xs text-slate-400 leading-normal">
            {formData.catatan_hukum || <span className="italic text-slate-600">[Catatan Legalitas Kosong]</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
