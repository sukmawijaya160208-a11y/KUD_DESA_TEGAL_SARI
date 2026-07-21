'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONTEN = [
  {
    id: 'konten1',
    title: 'Rapat Koordinasi & Sosialisasi',
    cards: [
      {
        src: '/images/kegiatan/konten1/1.jpeg',
        title: 'Rapat Koordinasi & Sosialisasi',
        desc: 'Suasana rapat koordinasi antara pengurus KUD, pekebun, dan stakeholder dalam merumuskan program kerja.',
      },
      {
        src: '/images/kegiatan/konten1/2.jpeg',
        title: 'Sosialisasi Program KUD',
        desc: 'Penyampaian program dan kebijakan terbaru KUD kepada para pekebun sawit.',
      },
      {
        src: '/images/kegiatan/konten1/3.jpeg',
        title: 'Diskusi Kelompok Tani',
        desc: 'Sesi diskusi kelompok tani dalam rangka meningkatkan produktivitas sawit.',
      },
      {
        src: '/images/kegiatan/konten1/4.jpeg',
        title: 'Pemaparan Materi',
        desc: 'Pemaparan materi teknis budidaya sawit oleh tim pendamping KUD.',
      },
      {
        src: '/images/kegiatan/konten1/5.jpeg',
        title: 'Tanya Jawab',
        desc: 'Sesi tanya jawab antara pekebun dan narasumber mengenai program KUD.',
      },
      {
        src: '/images/kegiatan/konten1/6.jpeg',
        title: 'Dokumentasi Peserta',
        desc: 'Foto bersama seluruh peserta rapat koordinasi dan sosialisasi KUD.',
      },
    ],
  },
  {
    id: 'konten2',
    title: 'Pendampingan Program PSR',
    cards: [
      {
        src: '/images/kegiatan/konten2/1.jpeg',
        title: 'Sosialisasi PSR',
        desc: 'Sosialisasi program Peremajaan Sawit Rakyat (PSR) kepada pekebun.',
      },
      {
        src: '/images/kegiatan/konten2/2.jpeg',
        title: 'Pendaftaran Peserta PSR',
        desc: 'Proses pendaftaran dan verifikasi awal calon peserta program PSR.',
      },
      {
        src: '/images/kegiatan/konten2/3.jpeg',
        title: 'Verifikasi Lahan',
        desc: 'Tim KUD melakukan verifikasi data lahan sawit milik pekebun.',
      },
      {
        src: '/images/kegiatan/konten2/4.jpeg',
        title: 'Pendataan Lapangan',
        desc: 'Pendataan langsung ke lapangan untuk memastikan kelayakan lahan PSR.',
      },
      {
        src: '/images/kegiatan/konten2/5.jpeg',
        title: 'Koordinasi Tim',
        desc: 'Koordinasi tim pendamping PSR dalam menyusun jadwal verifikasi.',
      },
      {
        src: '/images/kegiatan/konten2/6.jpeg',
        title: 'Dokumentasi PSR',
        desc: 'Foto bersama tim pendamping dan peserta program PSR.',
      },
    ],
  },
  {
    id: 'konten3',
    title: 'Kegiatan Lapangan & Verifikasi',
    cards: [
      {
        src: '/images/kegiatan/konten3/1.jpeg',
        title: 'Verifikasi Lapangan',
        desc: 'Tim KUD melakukan verifikasi lapangan untuk mengecek kondisi kebun sawit.',
      },
      {
        src: '/images/kegiatan/konten3/2.jpeg',
        title: 'Pendataan Lahan',
        desc: 'Pendataan luas lahan dan jumlah pohon sawit milik pekebun.',
      },
      {
        src: '/images/kegiatan/konten3/3.jpeg',
        title: 'Survey Lokasi',
        desc: 'Survey lokasi perkebunan sawit untuk pemetaan data yang akurat.',
      },
      {
        src: '/images/kegiatan/konten3/4.jpeg',
        title: 'Monitoring Tanaman',
        desc: 'Monitoring kondisi tanaman sawit dan identifikasi kebutuhan perawatan.',
      },
      {
        src: '/images/kegiatan/konten3/5.jpeg',
        title: 'Koordinasi Lapangan',
        desc: 'Koordinasi tim lapangan dalam pelaksanaan verifikasi data pekebun.',
      },
      {
        src: '/images/kegiatan/konten3/6.jpeg',
        title: 'Dokumentasi Lapangan',
        desc: 'Foto dokumentasi kegiatan verifikasi lapangan bersama pekebun.',
      },
    ],
  },
];

function BlogCard({ card, index, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group text-left w-full cursor-pointer"
    >
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <img
            src={card.src}
            alt={card.title}
            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {card.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {card.desc}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function LightboxModal({ cards, currentIdx, onClose, onNavigate }) {
  const card = cards[currentIdx];

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
        className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 flex flex-col items-center justify-center"
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
            src={card.src}
            alt={card.title}
            className="w-full h-full max-h-[75vh] object-contain rounded-lg"
          />
        </AnimatePresence>

        <div className="mt-4 text-center max-w-2xl">
          <h3 className="text-white text-lg font-semibold mb-1">{card.title}</h3>
          <p className="text-white/60 text-sm">{card.desc}</p>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i - currentIdx)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIdx ? 'bg-white w-5 h-2' : 'bg-white/30 w-1.5 h-1.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {cards.length > 1 && (
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
  const cards = konten.cards;

  const openModal = useCallback((idx) => {
    setModalIdx(idx);
    setModalOpen(true);
  }, []);

  const handleNavigate = useCallback((dir) => {
    setModalIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return cards.length - 1;
      if (next >= cards.length) return 0;
      return next;
    });
  }, [cards]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <BlogCard key={i} card={card} index={i} onClick={() => openModal(i)} />
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <LightboxModal
            cards={cards}
            currentIdx={modalIdx}
            onClose={() => setModalOpen(false)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
