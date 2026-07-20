'use client';

import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const overlayRef = useRef();
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center p-4 overflow-y-auto" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div className={`relative bg-surface rounded-2xl shadow-2xl w-full ${maxWidth} p-6 animate-scale-in my-8`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-foreground text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-foreground transition-colors p-2 cursor-pointer">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
