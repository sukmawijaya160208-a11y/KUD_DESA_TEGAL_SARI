'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function LenisProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: 80 },
      allowNestedScroll: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });
    return () => lenis.destroy();
  }, []);

  return children;
}
