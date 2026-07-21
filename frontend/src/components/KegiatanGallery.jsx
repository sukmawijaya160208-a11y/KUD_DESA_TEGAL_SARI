'use client';

import { useState, useCallback } from 'react';
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

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function KegiatanGallery() {
  const [kontenIdx, setKontenIdx] = useState(0);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFotoIdx, setModalFotoIdx] = useState(0);

  const konten = KONTEN[kontenIdx];

  const paginate = useCallback((newDir) => {
    setDir(newDir);
    setFotoIdx((prev) => {
      const next = prev + newDir;
      if (next < 0) return KONTEN[kontenIdx].images.length - 1;
      if (next >= KONTEN[kontenIdx].images.length) return 0;
      return next;
    });
  }, [kontenIdx]);

  const openModal = (idx) => {
    setModalFotoIdx(idx);
    setModalOpen(true);
  };

  const modalPaginate = useCallback((newDir) => {
    setModalFotoIdx((prev) => {
      const next = prev + newDir;
      if (next < 0) return konten.images.length - 1;
      if (next >= konten.images.length) return 0;
      return next;
    });
  }, [konten]);

  const touchStart = { x: 0 };
  const handleTouchStart = (e) => { touchStart.x = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStart.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) paginate(diff > 0 ? 1 : -1);
  };

  return (
    <section className="py-14 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
        className="text-center mb-8">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">GALERI KEGIATAN</span>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
          Dokumentasi <span className="text-primary">Kegiatan KUD</span>
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto">
          Berbagai kegiatan dan momen penting KUD Desa Sari Subur dalam melayani pekebun sawit.
        </p>
      </motion.div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {KONTEN.map((k, i) => (
          <button key={k.id} onClick={() => { setKontenIdx(i); setFotoIdx(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              kontenIdx === i
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white text-gray-600 border border-border hover:border-primary/30 hover:text-primary'
            }`}>
            {k.title}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative max-w-4xl mx-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.img key={fotoIdx} custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              src={konten.images[fotoIdx]} alt={`${konten.title} ${fotoIdx + 1}`}
              className="absolute inset-0 w-full h-full object-contain bg-slate-900 cursor-pointer"
              onClick={() => openModal(fotoIdx)}
            />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => paginate(-1)}
            className="p-2 rounded-xl bg-white border border-border hover:bg-gray-50 transition-colors cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {konten.images.map((_, i) => (
              <button key={i} onClick={() => { setDir(i > fotoIdx ? 1 : -1); setFotoIdx(i); }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === fotoIdx ? 'bg-primary w-6 h-2.5' : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                }`} />
            ))}
          </div>

          <button onClick={() => paginate(1)}
            className="p-2 rounded-xl bg-white border border-border hover:bg-gray-50 transition-colors cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Counter */}
        <p className="text-center text-xs text-gray-400 mt-2">
          {fotoIdx + 1} / {konten.images.length} — {konten.deskripsi}
        </p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setModalOpen(false)}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors z-10 cursor-pointer">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900"
                onTouchStart={(e) => { touchStart.x = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  const diff = touchStart.x - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 50) modalPaginate(diff > 0 ? 1 : -1);
                }}>
                <AnimatePresence mode="wait">
                  <motion.img key={modalFotoIdx}
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    src={konten.images[modalFotoIdx]} alt=""
                    className="w-full h-full object-contain" />
                </AnimatePresence>
                <button onClick={() => modalPaginate(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-all cursor-pointer">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button onClick={() => modalPaginate(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-all cursor-pointer">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {konten.images.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === modalFotoIdx ? 'bg-white w-4' : 'bg-white/40'
                    }`} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
