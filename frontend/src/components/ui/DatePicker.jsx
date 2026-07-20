'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, parse, isBefore, startOfDay
} from 'date-fns';
import { id } from 'date-fns/locale';

const DAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function DatePicker({ label, value, onChange, min, max, error, helperText, placeholder, disabled, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = useMemo(() => {
    if (!value) return null;
    const d = typeof value === 'string' ? parse(value, 'yyyy-MM-dd', new Date()) : value;
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selected && !isNaN(selected.getTime())) return selected;
    return new Date();
  });

  useEffect(() => {
    if (selected && !isSameMonth(selected, currentMonth)) {
      setCurrentMonth(selected);
    }
  }, [value]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { locale: id });
  const calEnd = endOfWeek(monthEnd, { locale: id });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleSelect = (day) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;
  const displayValue = selected ? format(selected, 'dd MMMM yyyy', { locale: id }) : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>}
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary flex items-center justify-between gap-2 ${error ? 'border-red-300 bg-red-50 text-red-900' : 'border-border bg-white'} ${!displayValue ? 'text-gray-400' : 'text-foreground'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate">{displayValue || placeholder || 'Pilih tanggal'}</span>
        <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-border p-4 w-[300px] origin-top"
          >
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm font-semibold text-foreground capitalize">{format(currentMonth, 'MMMM yyyy', { locale: id })}</span>
              <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const isSel = selected && isSameDay(day, selected);
                const today = isToday(day);
                const minDate = min ? startOfDay(parse(min, 'yyyy-MM-dd', new Date())) : null;
                const maxDate = max ? startOfDay(parse(max, 'yyyy-MM-dd', new Date())) : null;
                const disabledDay = (minDate && isBefore(day, minDate)) || (maxDate && isBefore(maxDate, day));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => handleSelect(day)}
                    className={`text-sm py-2 rounded-lg transition-all cursor-pointer ${
                      isSel
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : today
                          ? 'bg-primary/10 text-primary font-semibold'
                          : inMonth
                            ? 'text-foreground hover:bg-gray-100'
                            : 'text-gray-300'
                    } ${disabledDay ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
              <button
                type="button"
                onClick={() => { onChange(format(new Date(), 'yyyy-MM-dd')); setIsOpen(false); }}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                Hari ini
              </button>
              {selected && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setIsOpen(false); }}
                  className="text-xs text-gray-400 hover:text-destructive transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
