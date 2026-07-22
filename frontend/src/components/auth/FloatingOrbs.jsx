'use client';

import { useEffect, useRef } from 'react';

const ORBS = [
  { size: 400, blur: 80, opacity: 0.12, bg: '#15803D' },
  { size: 320, blur: 64, opacity: 0.10, bg: '#FFD700' },
  { size: 360, blur: 72, opacity: 0.08, bg: '#166534' },
  { size: 280, blur: 56, opacity: 0.10, bg: '#14532D' },
  { size: 240, blur: 48, opacity: 0.06, bg: '#FFC107' },
  { size: 200, blur: 40, opacity: 0.07, bg: '#22C55E' },
  { size: 180, blur: 36, opacity: 0.05, bg: '#4ADE80' },
  { size: 160, blur: 32, opacity: 0.06, bg: '#FBBF24' },
];

const positions = [
  { top: '10%', left: '5%' },
  { top: '60%', left: '75%' },
  { top: '30%', left: '80%' },
  { top: '70%', left: '10%' },
  { top: '15%', left: '50%' },
  { top: '80%', left: '40%' },
  { top: '45%', left: '20%' },
  { top: '20%', left: '65%' },
];

export default function FloatingOrbs() {
  const prefersReduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.current = mq.matches;
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            filter: `blur(${orb.blur}px)`,
            opacity: orb.opacity,
            background: orb.bg,
            top: positions[i].top,
            left: positions[i].left,
            transform: `scale(${0.6 + (i % 3) * 0.3})`,
          }}
        />
      ))}
    </div>
  );
}
