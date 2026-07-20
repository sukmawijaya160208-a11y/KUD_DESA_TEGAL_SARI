export const BENEFITS = [
  { icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Verifikasi cepat & real-time — dokumen terverifikasi dalam 1-2 hari kerja' },
  { icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605', text: 'Pantau lahan & hasil panen — data tersimpan aman, akses kapan saja via HP' },
  { icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Informasi harga TBS terkini — update harga per kelas mutu secara real-time' },
  { icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', text: 'Komunitas pekebun aktif — sharing ilmu, info, dan pengalaman antar anggota' },
];

export const PASS_REQUIREMENTS = [
  { label: 'Minimal 8 karakter', test: (v) => v.length >= 8 },
  { label: 'Huruf kapital', test: (v) => /[A-Z]/.test(v) },
  { label: 'Huruf kecil', test: (v) => /[a-z]/.test(v) },
  { label: 'Angka', test: (v) => /\d/.test(v) },
  { label: 'Simbol (@$!%*?&)', test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];
