'use client';

import { useRef, useEffect, useCallback } from 'react';

function getCanvasPoint(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export default function SignaturePad({ value, onChange, height = 180 }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    if (hasDrawn.current) return;
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      hasDrawn.current = true;
    };
    img.src = value;
  }, [value]);

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const point = getCanvasPoint(canvas, e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    isDrawing.current = true;
    hasDrawn.current = true;
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const point = getCanvasPoint(canvas, e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    if (onChange) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    if (onChange) onChange(null);
  };

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white relative"
        style={{ touchAction: 'none' }}
      >
        {!value && !hasDrawn.current && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-gray-300 text-sm font-medium">Tanda tangan di sini</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={height}
          style={{
            width: '100%',
            height: `${height}px`,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            display: 'block',
            cursor: 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
        >
          Ulangi Tanda Tangan
        </button>
        {!value && !hasDrawn.current && (
          <p className="text-xs text-gray-400">Gambar tanda tangan Anda di atas</p>
        )}
        {(value || hasDrawn.current) && (
          <p className="text-xs text-green-600 font-medium">✓ Tanda tangan sudah diisi</p>
        )}
      </div>
    </div>
  );
}
