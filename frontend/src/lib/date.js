import { format as fnsFormat, formatDistanceToNow, isToday, isYesterday, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date, fmt = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return fnsFormat(d, fmt, { locale: id });
}

export function formatDateLong(date) {
  return formatDate(date, 'dd MMMM yyyy');
}

export function formatDateShort(date) {
  return formatDate(date, 'dd MMM yy');
}

export function formatDateFull(date) {
  return formatDate(date, 'EEEE, dd MMMM yyyy');
}

export function formatRelative(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  if (isToday(d)) {
    const hours = Math.abs(new Date() - d) / 36e5;
    if (hours < 1) {
      const mins = Math.floor(Math.abs(new Date() - d) / 6e4);
      if (mins < 1) return 'baru saja';
      return `${mins} menit lalu`;
    }
    return `${Math.floor(hours)} jam lalu`;
  }
  if (isYesterday(d)) return 'kemarin';
  const days = Math.floor(Math.abs(new Date() - d) / 864e5);
  if (days < 7) return `${days} hari lalu`;
  return formatDate(d, 'dd MMM yyyy');
}

export function formatDateRange(start, end) {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  if (!isValid(s) || !isValid(e)) return '';
  if (fnsFormat(s, 'MM yyyy') === fnsFormat(e, 'MM yyyy')) {
    return `${fnsFormat(s, 'dd')}–${fnsFormat(e, 'dd MMM yyyy', { locale: id })}`;
  }
  return `${formatDateShort(s)} – ${formatDateShort(e)}`;
}

export function toInputDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return fnsFormat(d, 'yyyy-MM-dd');
}

export function todayStr() {
  return fnsFormat(new Date(), 'yyyy-MM-dd');
}

export { formatDistanceToNow, parseISO, isValid };
