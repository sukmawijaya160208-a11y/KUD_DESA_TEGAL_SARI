'use client';

import { useState, useRef, useEffect } from 'react';

function formatIndonesianDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DatePicker({
  label,
  value = '',
  onChange = () => {},
  min,
  max,
  error,
  helperText,
  placeholder = 'Pilih tanggal',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const nativeInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContainerClick = () => {
    if (disabled) return;
    if (nativeInputRef.current && typeof nativeInputRef.current.showPicker === 'function') {
      try {
        nativeInputRef.current.showPicker();
        return;
      } catch (_) {}
    }
    setIsOpen(!isOpen);
  };

  const displayValue = formatIndonesianDate(value);
  const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground/80 mb-1.5">
          {label}
        </label>
      )}

      <div
        onClick={handleContainerClick}
        className={`group flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer select-none ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : value
              ? 'border-emerald-500 ring-2 ring-emerald-500/10 text-foreground font-medium shadow-sm bg-white'
              : error
                ? 'border-red-300 bg-red-50 text-red-900'
                : 'border-border bg-white text-gray-400 hover:border-emerald-400 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <svg
            className={`w-4 h-4 shrink-0 transition-colors ${
              value ? 'text-emerald-600' : error ? 'text-red-400' : 'text-gray-400 group-hover:text-emerald-500'
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="truncate">{displayValue || placeholder}</span>
        </div>

        {value && !disabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      <input
        ref={nativeInputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only opacity-0 absolute pointer-events-none"
        id={!label ? inputId : undefined}
      />

      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}
    </div>
  );
}
