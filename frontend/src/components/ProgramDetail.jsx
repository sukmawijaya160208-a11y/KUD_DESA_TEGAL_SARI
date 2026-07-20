'use client';

import { useState } from 'react';
import {
  XMarkIcon, CalendarDaysIcon, UsersIcon, DocumentTextIcon,
  CheckCircleIcon, ChevronRightIcon, PhotoIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP', foto_kk: 'Foto KK', akte: 'Akte',
  foto_pekebun: 'Foto Pekebun', foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

export default function ProgramDetail({ program, open, onClose, role, onDaftar, sudahDaftar, penuh }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (!open || !program) return null;

  const fotos = Array.isArray(program.foto) ? program.foto.filter(Boolean) : [];
  const persyaratan = Array.isArray(program.persyaratan) ? program.persyaratan : [];
  const pendaftar = program.pendaftaran_program_count || 0;

  const handleDaftar = () => {
    if (onDaftar) onDaftar(program);
    if (onClose) onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          </button>

          {/* ===== GALLERY ===== */}
          {fotos.length > 0 ? (
            <div className="relative">
              <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={fotos[heroIndex]}
                  alt={program.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                {fotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setHeroIndex((prev) => (prev - 1 + fotos.length) % fotos.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all cursor-pointer"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-700 rotate-180" />
                    </button>
                    <button
                      onClick={() => setHeroIndex((prev) => (prev + 1) % fotos.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all cursor-pointer"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      {fotos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setHeroIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            idx === heroIndex ? 'bg-white w-5' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {fotos.length > 1 && (
                <div className="flex gap-2 px-6 py-3 bg-gray-50 border-b border-border overflow-x-auto">
                  {fotos.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === heroIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    onClick={() => setGalleryOpen(true)}
                    className="shrink-0 w-16 h-12 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center hover:border-primary transition-all cursor-pointer"
                  >
                    <PhotoIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <div className="text-center">
                <PhotoIcon className="w-12 h-12 text-primary/30 mx-auto" />
                <p className="text-sm text-gray-400 mt-2">Tidak ada foto</p>
              </div>
            </div>
          )}

          {/* ===== CONTENT ===== */}
          <div className="px-6 lg:px-10 py-8 space-y-8">
            {/* TITLE + JENIS */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground leading-tight">
                  {program.nama}
                </h2>
                <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                  {program.jenis}
                </span>
              </div>
            </div>

            {/* ===== INFO CARDS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tanggal */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-blue-600/60 uppercase tracking-wider">Tanggal</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {program.tanggal_mulai
                      ? new Date(program.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                      : '-'}
                    {program.tanggal_selesai &&
                      ` - ${new Date(program.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              </div>

              {/* Kuota */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <UsersIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-emerald-600/60 uppercase tracking-wider">Kuota</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {program.kuota ? `${pendaftar}/${program.kuota}` : 'Tidak terbatas'}
                  </p>
                  {program.kuota && (
                    <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min((pendaftar / program.kuota) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Persyaratan */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-xl p-4 border border-amber-100/50">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-600/60 uppercase tracking-wider">Persyaratan</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {persyaratan.length > 0 ? `${persyaratan.length} dokumen` : 'Tidak ada'}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== DESKRIPSI ===== */}
            {program.deskripsi && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                  Tentang Program
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm lg:text-base">
                  {program.deskripsi}
                </div>
              </div>
            )}

            {/* ===== PERSYARATAN ===== */}
            {persyaratan.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                  Persyaratan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {persyaratan.map((s) => (
                    <div
                      key={s}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border/60"
                    >
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium text-foreground">
                        {PERSYARATAN_LABEL[s] || s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== ACTION BUTTON ===== */}
            <div className="border-t border-border pt-6">
              {role === 'pekebun' ? (
                sudahDaftar ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                      <p className="font-bold text-green-800">Anda sudah terdaftar</p>
                      <p className="text-sm text-green-600">Status pendaftaran dapat dilihat di bagian Program Saya</p>
                    </div>
                  </div>
                ) : penuh ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <UsersIcon className="w-8 h-8 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-700">Kuota Penuh</p>
                      <p className="text-sm text-gray-500">Program ini sudah mencapai batas kuota pendaftaran</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDaftar}
                    className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl text-lg font-bold hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Daftar Sekarang
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                )
              ) : role === 'admin' && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                    <PencilSquareIcon className="w-4 h-4" />
                    Admin dapat mengelola program ini melalui halaman utama
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== GALLERY FULLSCREEN ===== */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setGalleryOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm font-medium cursor-pointer"
            >
              Tutup
            </button>
            <img
              src={fotos[heroIndex]}
              alt=""
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
            {fotos.length > 1 && (
              <>
                <button
                  onClick={() => setHeroIndex((prev) => (prev - 1 + fotos.length) % fotos.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
                >
                  <ChevronRightIcon className="w-6 h-6 text-white rotate-180" />
                </button>
                <button
                  onClick={() => setHeroIndex((prev) => (prev + 1) % fotos.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
                >
                  <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {fotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        idx === heroIndex ? 'bg-white w-6' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
