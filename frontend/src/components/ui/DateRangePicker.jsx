'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, parse, isBefore, startOfDay, isAfter, isWithinInterval
} from 'date-fns';
import { id } from 'date-fns/locale';

const DAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function DateRangePicker({ label, value, onChange, min, max, error, helperText, placeholder, disabled, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const startDate = useMemo(() => {
    if (!value?.start) return null;
    const d = typeof value.start === 'string' ? parse(value.start, 'yyyy-MM-dd', new Date()) : value.start;
    return isNaN(d.getTime()) ? null : d;
  }, [value?.start]);

  const endDate = useMemo(() => {
    if (!value?.end) return null;
    const d = typeof value.end === 'string' ? parse(value.end, 'yyyy-MM-dd', new Date()) : value.end;
    return isNaN(d.getTime()) ? null : d;
  }, [value?.end]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (startDate && !isNaN(startDate.getTime())) return startDate;
    return new Date();
  });

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
    if (!selectingEnd || !startDate) {
      onChange({ start: format(day, 'yyyy-MM-dd'), end: '' });
      setSelectingEnd(true);
    } else {
      if (isBefore(day, startDate)) {
        onChange({ start: format(day, 'yyyy-MM-dd'), end: format(startDate, 'yyyy-MM-dd') });
      } else {
        onChange({ start: format(startDate, 'yyyy-MM-dd'), end: format(day, 'yyyy-MM-dd') });
      }
      setSelectingEnd(false);
      setIsOpen(false);
    }
  };

  const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;
  const displayValue = startDate
    ? `${format(startDate, 'dd MMM yyyy', { locale: id })}${endDate ? ` – ${format(endDate, 'dd MMM yyyy', { locale: id })}` : ' (pilih akhir)'}`
    : '';

  const inRange = (day) => {
    if (!startDate) return false;
    if (!endDate) return isSameDay(day, startDate);
    if (isBefore(startDate, endDate)) {
      return isWithinInterval(day, { start: startOfDay(startDate), end: startOfDay(endDate) });
    }
    return isWithinInterval(day, { start: startOfDay(endDate), end: startOfDay(startDate) });
  };

  const isRangeStart = (day) => startDate && isSameDay(day, startDate);
  const isRangeEnd = (day) => endDate && isSameDay(day, endDate);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>}
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setSelectingEnd(!!startDate); }}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary flex items-center justify-between gap-2 ${error ? 'border-red-300 bg-red-50 text-red-900' : 'border-border bg-white'} ${!displayValue ? 'text-gray-400' : 'text-foreground'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate">{displayValue || placeholder || 'Pilih rentang tanggal'}</span>
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
            <div className="text-xs text-gray-400 mb-3 text-center">
              {selectingEnd ? 'Pilih tanggal akhir' : 'Pilih tanggal awal'}
            </div>

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
                const today = isToday(day);
                const isSel = isRangeStart(day) || isRangeEnd(day);
                const range = inRange(day);
                const minDate = min ? startOfDay(parse(min, 'yyyy-MM-dd', new Date())) : null;
                const maxDate = max ? startOfDay(parse(max, 'yyyy-MM-dd', new Date())) : null;
                const disabledDay = (minDate && isBefore(day, minDate)) || (maxDate && isBefore(maxDate, day));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => handleSelect(day)}
                    className={`relative text-sm py-2 transition-all cursor-pointer ${
                      range && !isSel ? 'bg-primary/10' : ''
                    } ${isSel ? 'bg-primary text-white font-semibold shadow-sm z-10' : ''} ${
                      !isSel && today ? 'font-semibold text-primary' : ''
                    } ${!isSel && inMonth && !today ? 'text-foreground hover:bg-gray-100' : ''} ${
                      !inMonth && !isSel ? 'text-gray-300' : ''
                    } ${disabledDay ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex justify-center">
              <button
                type="button"
                onClick={() => { onChange({ start: '', end: '' }); setSelectingEnd(false); setIsOpen(false); }}
                className="text-xs text-gray-400 hover:text-destructive transition-colors cursor-pointer"
              >
                Hapus rentang
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
