'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

const cards = [
  { photo: '/images/team/sekretaris.jpg', name: 'Sahuri', role: 'Sekretaris', desc: 'Mengelola administrasi dan kesekretariatan koperasi dengan sistem digital yang transparan dan akuntabel.' },
  { photo: '/images/team/ketua.jpg', name: 'Dedek Sulaiman, S.Pd.I', role: 'Ketua KUD', desc: 'Memimpin koperasi dengan visi kemandirian dan profesionalisme sejak 2010. Berpengalaman 20+ tahun di bidang perkebunan sawit.' },
  { photo: '/images/team/bendahara.jpg', name: 'Mas Prapto', role: 'Bendahara', desc: 'Bertanggung jawab atas pengelolaan keuangan koperasi yang sehat dan transparan untuk kesejahteraan anggota.' },
  { photo: '/images/team/manager.jpg', name: 'Triono', role: 'Manager Operasional', desc: 'Mengelola operasional harian koperasi termasuk pelayanan anggota, program PSR, dan pemasaran TBS.' },
  { photo: '/images/team/pengawas.jpg', name: 'M. Sukma Wijaya', role: 'Ketua Pengawas', desc: 'Memastikan seluruh kegiatan koperasi berjalan sesuai AD/ART dan peraturan yang berlaku.' },
];

export default function HeroCards() {
  const cardsRef = useRef([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const cards = cardsRef.current;
    gsap.fromTo(cards,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, stagger: 0.1, ease: 'power3.out' }
    );
    return () => gsap.killTweensOf(cards);
  }, []);

  const handleEnter = useCallback((idx) => {
    if (!isDesktop) return;
    setHoveredIdx(idx);
  }, [isDesktop]);

  const handleLeave = useCallback(() => {
    if (!isDesktop) return;
    setHoveredIdx(null);
  }, [isDesktop]);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row w-full max-w-6xl mx-auto min-h-[280px] lg:min-h-[520px] lg:rounded-2xl lg:overflow-hidden lg:border lg:border-white/10"
      onMouseLeave={handleLeave}>
      {cards.map((card, idx) => {
        const isHovered = isDesktop && hoveredIdx === idx;
        const isShrunken = isDesktop && hoveredIdx !== null && hoveredIdx !== idx;
        const flexVal = isDesktop ? (hoveredIdx === null ? 1 : isHovered ? 2.8 : 0.55) : 1;

        return (
          <div key={card.name}
            ref={(el) => { if (el) cardsRef.current[idx] = el; }}
            onMouseEnter={() => handleEnter(idx)}
            className="relative overflow-hidden cursor-pointer min-h-[260px] lg:min-h-0 lg:border-r lg:border-white/10 last:border-r-0 lg:rounded-none rounded-xl sm:rounded-xl"
            style={{
              clipPath: 'inset(100% 0% 0% 0%)',
              flex: `${flexVal} 1 0%`,
              transition: 'flex 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <img src={card.photo} alt={card.name} loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                transition: 'transform 0.5s ease',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              }} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute inset-0"
              style={{
                background: isShrunken ? 'rgba(0,0,0,0.35)' : 'transparent',
                transition: 'background 0.3s ease',
              }} />

            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 z-10"
              style={{
                transition: 'opacity 0.3s ease',
                opacity: isShrunken ? 0.5 : 1,
              }}>
              <h3 className="text-white font-heading font-bold text-sm lg:text-base drop-shadow-sm">{card.name}</h3>
              <span className="inline-block px-2 py-0.5 bg-primary/30 backdrop-blur-sm text-primary-light text-[10px] font-semibold rounded-full mt-1 mb-1">
                {card.role}
              </span>
              <p className="text-white/60 text-xs leading-relaxed mt-2"
                style={{
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  opacity: isDesktop ? (isHovered ? 1 : 0) : 1,
                  transform: isDesktop ? (isHovered ? 'translateY(0)' : 'translateY(10px)') : 'translateY(0)',
                }}>
                {card.desc}
              </p>
            </div>

            <div className="absolute inset-0 rounded-xl sm:rounded-xl lg:rounded-none border border-white/5 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
