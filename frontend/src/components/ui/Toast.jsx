'use client';

import { useEffect, useState } from 'react';

const icons = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
};

const bg = { success: 'bg-green-50 border-green-200', error: 'bg-red-50 border-red-200', info: 'bg-blue-50 border-blue-200' };

export default function Toast({ message, type = 'info', onClose }) {
  const [show, setShow] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShow(true)); const t = setTimeout(() => { setShow(false); setTimeout(onClose, 300); }, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div role="alert" aria-live="polite" className={`${bg[type]} border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {icons[type]}
      <p className="text-sm text-gray-800 flex-1">{message}</p>
      <button onClick={() => { setShow(false); setTimeout(onClose, 300); }} className="text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
