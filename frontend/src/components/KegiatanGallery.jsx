'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONTEN = [
  {
    id: 'konten1',
    title: 'Rapat Koordinasi & Sosialisasi',
    deskripsi: 'Kegiatan rapat koordinasi antara pihak KUD, pekebun, dan stakeholder dalam rangka sosialisasi program dan kebijakan terbaru.',
    images: Array.from({ length: 6 }, (_, i) => `/images/kegiatan/konten1/${i + 1}.jpeg`),
  },
  {
    id: 'konten2',
    title: 'Pendampingan Program PSR',
    deskripsi: 'Pendampingan teknis kepada pekebun dalam proses peremajaan sawit rakyat (PSR), dari pendaftaran hingga verifikasi lapangan.',
    images: Array.from({ length: 6 }, (_, i) => `/images/kegiatan/konten2/${i + 1}.jpeg`),
  },
  {
    id: 'konten3',
    title: 'Kegiatan Lapangan & Verifikasi',
    deskripsi: 'Tim KUD melakukan verifikasi lapangan dan pendataan lahan sawit pekebun untuk memastikan data yang akurat dan terpercaya.',
    images: Array.from({ length: 6 }, (_, i) => `/images/kegiatan/konten3/${i + 1}.jpeg`),
  },
];

function BentoGrid({ images, onImageClick, kontenIdx }) {
  const photos = images.slice(0, 6);

  const layouts = [
    { span: 'md:col-span-2 md:row-span-2', aspect: 'aspect-[4/5] md:aspect-[3/4]' },
    { span: 'md:col-span-1 md:row-span-1', aspect: 'aspect-[4/3]' },
    { span: 'md:col-span-1 md:row-span-1', aspect: 'aspect-[4/3]' },
    { span: 'md:col-span-1 md:row-span-1', aspect: 'aspect-[4/3]' },
    { span: 'md:col-span-1 md:row-span-1', aspect: 'aspect-[4/3]' },
    { span: 'md:col-span-1 md:row-span-1', aspect: 'aspect-[4/3]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-auto">
      {photos.map((src, i) => {
        const layout = layouts[i % layouts.length];
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileHover={{ scale: 1.015, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onImageClick(i)}
            className={`relative group overflow-hidden rounded-xl bg-slate-100 cursor-pointer ${layout.span}`}
          >
            <div className={`relative w-full ${layout.aspect} overflow-hidden`}>
              <img
                src={src}
                alt={`Kegiatan ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  Foto {i + 1}
                </span>
              </div>
              {i === 0 && (
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold text-white bg-primary/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    Unggulan
                  </span>
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function LightboxModal({ images, currentIdx, onClose, onNavigate }) {
  const touchStart = { x: 0 };
  const handleTouchStart = (e) => { touchStart.x = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStart.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) onNavigate(diff > 0 ? 1 : -1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative w-full h-full max-w-6xl max-h-[90vh] m-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            src={images[currentIdx]}
            alt=""
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i - currentIdx)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIdx ? 'bg-white w-5 h-2' : 'bg-white/30 w-1.5 h-1.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => onNavigate(-1)}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate(1)}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function KegiatanGallery() {
  const [kontenIdx, setKontenIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);

  const konten = KONTEN[kontenIdx];

  const openModal = useCallback((idx) => {
    setModalIdx(idx);
    setModalOpen(true);
  }, []);

  const handleNavigate = useCallback((dir) => {
    setModalIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return konten.images.length - 1;
      if (next >= konten.images.length) return 0;
      return next;
    });
  }, [konten]);

  return (
    <section className="py-14 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">
          GALERI KEGIATAN
        </span>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
          Dokumentasi <span className="text-primary">Kegiatan KUD</span>
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto">
          Berbagai kegiatan dan momen penting KUD Desa Sari Subur dalam melayani pekebun sawit.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {KONTEN.map((k, i) => (
          <button
            key={k.id}
            onClick={() => { setKontenIdx(i); setModalIdx(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              kontenIdx === i
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white text-gray-600 border border-border hover:border-primary/30 hover:text-primary'
            }`}
          >
            {k.title}
          </button>
        ))}
      </div>

      <BentoGrid
        images={konten.images}
        onImageClick={openModal}
        kontenIdx={kontenIdx}
      />

      <p className="text-center text-xs text-gray-400 mt-4">
        Klik foto untuk melihat lebih detail
      </p>

      <AnimatePresence>
        {modalOpen && (
          <LightboxModal
            images={konten.images}
            currentIdx={modalIdx}
            onClose={() => setModalOpen(false)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
