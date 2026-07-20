const styles = {
  verified: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  pending: 'bg-warning/10 text-warning',
  aktif: 'bg-success/10 text-success',
  nonaktif: 'bg-muted text-gray-500',
  default: 'bg-muted text-gray-600',
};

const labels = {
  verified: 'Disetujui', rejected: 'Ditolak', pending: 'Menunggu',
  aktif: 'Aktif', nonaktif: 'Nonaktif',
};

export default function Badge({ status, className = '' }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[status] || styles.default} ${className}`}>
      {labels[status] || status}
    </span>
  );
}
