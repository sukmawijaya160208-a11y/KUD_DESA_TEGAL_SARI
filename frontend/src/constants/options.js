export const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

export const JENIS_OPTIONS = [
  { value: '', label: 'Semua Jenis' },
  { value: 'PSR', label: 'PSR' },
  { value: 'Intensifikasi', label: 'Intensifikasi' },
  { value: 'Ekstensifikasi', label: 'Ekstensifikasi' },
  { value: 'Pelatihan SDMPKS', label: 'Pelatihan SDMPKS' },
  { value: 'Beasiswa SDMPKS', label: 'Beasiswa SDMPKS' },
  { value: 'Kemitraan', label: 'Kemitraan' },
];

export const JENIS_SURAT = ['SHM', 'HGB', 'HGU', 'Girik', 'Lainnya'];

export const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP',
  foto_kk: 'Foto KK',
  akte: 'Akte',
  foto_pekebun: 'Foto Pekebun',
  foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

export const PAGE_SIZES = [10, 25, 50, 100];

export const FILTER_TABS = [
  { label: 'Semua', value: 'semua' },
  { label: 'Pending', value: 'pending' },
  { label: 'Disetujui', value: 'verified' },
  { label: 'Ditolak', value: 'rejected' },
];

export const STATUS_BG = (s) =>
  s === 'verified' ? 'bg-green-100 text-green-700' :
  s === 'rejected' ? 'bg-red-100 text-red-700' :
  'bg-yellow-100 text-yellow-700';
