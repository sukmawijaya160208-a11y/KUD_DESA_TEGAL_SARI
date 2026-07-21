'use client';

const ORBS = [
  { size: 400, blur: 'blur-3xl', opacity: 0.12, bg: '#4CAF50' },
  { size: 320, blur: 'blur-3xl', opacity: 0.10, bg: '#FFD700' },
  { size: 360, blur: 'blur-3xl', opacity: 0.08, bg: '#2E7D32' },
  { size: 280, blur: 'blur-3xl', opacity: 0.10, bg: '#1B5E20' },
  { size: 240, blur: 'blur-3xl', opacity: 0.06, bg: '#FFC107' },
  { size: 200, blur: 'blur-3xl', opacity: 0.07, bg: '#66BB6A' },
  { size: 180, blur: 'blur-3xl', opacity: 0.05, bg: '#A5D6A7' },
  { size: 160, blur: 'blur-3xl', opacity: 0.06, bg: '#FFD54F' },
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
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            filter: orb.blur,
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
