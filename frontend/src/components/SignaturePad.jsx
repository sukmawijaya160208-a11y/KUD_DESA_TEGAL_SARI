'use client';

import { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ value, onChange, height = 180 }) {
  const sigRef = useRef(null);

  useEffect(() => {
    if (value && sigRef.current) {
      sigRef.current.fromDataURL(value);
    }
  }, [value]);

  const handleClear = () => {
    sigRef.current?.clear();
    onChange(null);
  };

  const handleEndStroke = () => {
    if (sigRef.current) {
      const dataUrl = sigRef.current.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigRef}
          onEnd={handleEndStroke}
          penColor="#1e293b"
          minWidth={1}
          maxWidth={3}
          canvasProps={{
            width: 600,
            height,
            className: 'w-full cursor-crosshair',
            style: { width: '100%', height: `${height}px` },
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
        >
          Hapus Tanda Tangan
        </button>
        {!value && (
          <p className="text-xs text-gray-400">Gambar tanda tangan Anda di atas</p>
        )}
        {value && (
          <p className="text-xs text-green-600 font-medium">✓ Tanda tangan sudah diisi</p>
        )}
      </div>
    </div>
  );
}
