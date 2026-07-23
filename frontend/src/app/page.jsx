'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogo } from '@/hooks/useLogo';
import Timeline from '@/components/Timeline';
import KegiatanGallery from '@/components/KegiatanGallery';
import TeamSection from '@/components/TeamSection';
import MapSection from '@/components/MapSection';
import TbsCalculator from '@/components/TbsCalculator';

import {
  Squares2X2Icon, InformationCircleIcon, ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon, NewspaperIcon, ArrowRightIcon,
  ChevronDownIcon, Bars3Icon, XMarkIcon, PhoneIcon,
  PlayIcon, CalendarDaysIcon, UserGroupIcon,
  MapPinIcon, AcademicCapIcon,
  ShieldCheckIcon, HandRaisedIcon, CurrencyDollarIcon,
  ChartBarIcon, CheckBadgeIcon,
  StarIcon, HeartIcon, ArrowUpIcon,
  ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon,
  DocumentTextIcon, BuildingOfficeIcon, GlobeAltIcon,
  TruckIcon, EyeIcon, BellAlertIcon, FolderIcon
} from '@heroicons/react/24/outline';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const PalmSvg = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1">
    <path d="M4 28Q16 14 28 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 23Q14 19 16 21Q13 21.5 9 23Z" fill="currentColor"/>
    <path d="M12 18Q18 14 20 16Q17 16.5 13 18Z" fill="currentColor"/>
    <path d="M16 13Q22 9 24 11Q21 11.5 17 13Z" fill="currentColor"/>
    <path d="M20 8Q26 4 27 6Q25 6.5 21 8Z" fill="currentColor"/>
    <path d="M10 24Q8 21 10 20Q11 22 11 23.5Z" fill="currentColor"/>
    <path d="M14 19Q12 16 14 15Q15 17 15 18.5Z" fill="currentColor"/>
    <path d="M18 14Q16 11 18 10Q19 12 19 13.5Z" fill="currentColor"/>
  </svg>
);

function LogoDisplay({ logoUrl, className }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="KUD Logo" className={`w-full h-full object-contain ${className || ''}`} />;
  }
  return <PalmSvg />;
}

const YT_VIDEOS = [
  { id: 'o7k3SZ0sIVQ', title: 'Profil KUD Desa Sari Subur' },
  { id: 'GtjnnCBx5bY', title: 'Panen Raya Kelapa Sawit' },
  { id: 'Q2WCqyTHYHk', title: 'Program Kemitraan Petani' },
  { id: 'XS-ZFdyJNwg', title: 'Teknologi Pengolahan TBS' },
  { id: 'JOAETvOj5OY', title: 'Wawancara Ketua KUD' },
  { id: 'n3pzigELRcg', title: 'Kegiatan Sosial KUD' },
];

const TESTIMONI = [
  { nama: 'Suparman', asal: 'Desa Tegal Sari', rating: 5, quote: 'Sejak bergabung dengan KUD, hasil kebun saya meningkat 40%. Pelayanan ramah dan harga TBS transparan.', warna: 'from-emerald-400 to-green-500' },
  { nama: 'Rohmatiah', asal: 'Desa Sumber Makmur', rating: 5, quote: 'KUD benar-benar membantu petani kecil. Program kemitraannya sangat menguntungkan dan bibit berkualitas.', warna: 'from-blue-400 to-indigo-500' },
  { nama: 'Karsono', asal: 'Desa Tegal Sari', rating: 4, quote: 'Saya sudah 10 tahun menjadi anggota. Alhamdulillah, KUD selalu tepat waktu dalam pembayaran TBS.', warna: 'from-amber-400 to-orange-500' },
  { nama: 'Sri Mulyani', asal: 'Desa Marga Asih', rating: 5, quote: 'Program simpan pinjam KUD sangat membantu modal usaha tani saya. Bunganya ringan dan prosesnya cepat.', warna: 'from-pink-400 to-rose-500' },
  { nama: 'H. Ahmad', asal: 'Desa Tegal Sari', rating: 5, quote: 'KUD membuktikan bahwa koperasi bisa maju. Pengurusnya amanah dan transparan. Saya percaya penuh.', warna: 'from-purple-400 to-violet-500' },
  { nama: 'Wahyuni', asal: 'Desa Sumber Rejeki', rating: 4, quote: 'Pelatihan budidaya sawit dari KUD sangat bermanfaat. Sekarang saya bisa panen 2x lebih banyak.', warna: 'from-teal-400 to-cyan-500' },
];

const PROGRAMS = [
  { id: 1, icon: Squares2X2Icon, title: 'Kemitraan Petani', desc: 'Program kemitraan berkelanjutan antara KUD dengan petani kelapa sawit di wilayah Kecamatan Tegal Sari.', manfaat: ['Bibit unggul bersertifikat', 'Pendampingan teknis rutin', 'Harga TBS kompetitif', 'Jaminan pembelian hasil panen', 'Akses pupuk bersubsidi'], color: 'emerald' },
  { id: 2, icon: CurrencyDollarIcon, title: 'Simpan Pinjam', desc: 'Layanan simpan pinjam dengan bunga ringan untuk anggota KUD. Proses cepat dan persyaratan mudah.', manfaat: ['Bunga 0.5% per bulan', 'Plafon hingga Rp50 juta', 'Proses cair 1-3 hari', 'Tanpa agunan berat', 'Tenor fleksibel 6-24 bulan'], color: 'blue' },
  { id: 3, icon: AcademicCapIcon, title: 'Pelatihan & Penyuluhan', desc: 'Program pelatihan rutin untuk meningkatkan kapasitas dan pengetahuan petani dalam budidaya sawit.', manfaat: ['Teknik budidaya modern', 'Manajemen keuangan', 'Pemasaran hasil panen', 'Pengendalian hama terpadu', 'Sertifikat pelatihan'], color: 'amber' },
  { id: 4, icon: TruckIcon, title: 'Distribusi & Logistik', desc: 'Layanan distribusi TBS dari kebun ke pabrik pengolahan dengan armada truk yang memadai.', manfaat: ['Penjemputan TBS ke kebun', 'Armada terawat & tepat waktu', 'Tim pengangkut profesional', 'Tracking pengiriman real-time', 'Tarif kompetitif per kg'], color: 'purple' },
  { id: 5, icon: ShieldCheckIcon, title: 'Asuransi Tani', desc: 'Perlindungan asuransi untuk lahan dan hasil panen petani dari risiko gagal panen dan bencana alam.', manfaat: ['Premi terjangkau', 'Santunan gagal panen', 'Perlindungan hama & penyakit', 'Bantuan bencana alam', 'Klaim cepat 7-14 hari'], color: 'rose' },
  { id: 6, icon: BuildingOfficeIcon, title: 'Koperasi Konsumsi', desc: 'Unit usaha konsumsi yang menyediakan kebutuhan pokok dan sarana produksi pertanian dengan harga terjangkau.', manfaat: ['Sembako murah anggota', 'Pupuk & pestisida lengkap', 'Alat & mesin pertanian', 'Suku cadang tersedia', 'Beli grosir & eceran'], color: 'teal' },
];

const FAQ_DATA = [
  { q: 'Apa itu KUD Desa Sari Subur?', a: 'KUD (Koperasi Unit Desa) Sari Subur adalah koperasi petani kelapa sawit di Desa Tegal Sari yang bertujuan meningkatkan kesejahteraan petani melalui berbagai program kemitraan, simpan pinjam, dan pelatihan.' },
  { q: 'Bagaimana cara menjadi anggota?', a: 'Calon anggota dapat mendaftar ke kantor KUD dengan membawa KTP, KK, dan surat keterangan dari kepala desa. Setelah verifikasi data, calon anggota akan mengikuti masa orientasi selama 1 bulan.' },
  { q: 'Berapa harga TBS saat ini?', a: 'Harga TBS (Tandan Buah Segar) diperbarui setiap minggu berdasarkan harga pasar dan kesepakatan Rapat Anggota. Cek halaman utama atau hubungi kantor KUD untuk harga terbaru.' },
  { q: 'Apa saja syarat pinjaman?', a: 'Syarat pinjaman: anggota aktif minimal 6 bulan, memiliki agunan ringan, mengisi formulir permohonan, dan mendapatkan persetujuan dari 2 orang penjamin yang juga anggota KUD.' },
  { q: 'Bagaimana cara menghubungi KUD?', a: 'Kantor KUD buka Senin-Jumat pukul 08.00-16.00 WITA. Alamat: Jl. Tegal Sari No. 123, Kec. Tegal Sari. Telepon/WA: 085169883337.' },
  { q: 'Apakah ada program untuk pemuda tani?', a: 'Ya, KUD memiliki program Petani Muda Berdikari yang memberikan pelatihan, pendampingan, dan akses permodalan khusus untuk petani milenial usia 18-35 tahun.' },
];

const BLOG_POSTS = [
  { slug: 'tingkatkan-kompetensi-pekebun-sawit-kud-sari-subur-kirim-45-anggota', title: '45 Anggota Ikut Pelatihan Sawit BPDP di Palembang', excerpt: 'KUD Sari Subur kirim 45 anggota ikut pelatihan budidaya kelapa sawit yang diselenggarakan AKPY, BPDP dan Ditjenbun.', date: '21 Mei 2025', author: 'Admin KUD', image: '/images/blog/budidaya sawit 1.jpg', category: 'Pelatihan' },
  { slug: 'kud-sari-subur-kirim-16-anggota-pelatihan-panen-pasca-panen', title: '16 Anggota Ikut Pelatihan Panen & Pasca Panen', excerpt: 'KUD kirim 16 anggota untuk mengikuti pelatihan panen dan pasca panen di Palembang guna meningkatkan kompetensi pekebun.', date: '16 Jun 2025', author: 'Admin KUD', image: '/images/blog/panen dan pasca 1.jpg', category: 'Pelatihan' },
  { slug: 'anggota-kud-sari-subur-bpjs-ketenagakerjaan-dbh-sawit', title: '371 Anggota Terima BPJS Ketenagakerjaan', excerpt: 'Anggota KUD dapat perlindungan jaminan sosial BPJS Ketenagakerjaan dari DBH Sawit Sumsel sebanyak 371 orang.', date: '10 Jul 2025', author: 'Admin KUD', image: '/images/blog/image.png', category: 'Sosial' },
  { slug: 'bupati-musi-rawas-lepas-52-mahasiswa-beasiswa-sdm-sawit-bpdpks', title: '52 Mahasiswa Terima Beasiswa SDM Sawit BPDPKS', excerpt: 'Bupati Musi Rawas lepas 52 calon mahasiswa penerima Beasiswa Pendidikan Pengembangan SDM Sawit dari BPDPKS.', date: '28 Agu 2024', author: 'Admin KUD', image: '/images/blog/beasiswa 1.jpg', category: 'Pendidikan' },
];

const LAYANAN = [
  { icon: PhoneIcon, title: 'Call Center', desc: 'Hubungi kami setiap hari kerja pukul 08.00-16.00 WITA', contact: '085169883337' },
  { icon: MapPinIcon, title: 'Kantor Pusat', desc: 'Jalan Tegal Sari No. 123, Kecamatan Tegal Sari', contact: 'Lihat di Google Maps' },
  { icon: GlobeAltIcon, title: 'Layanan Online', desc: 'Pantau harga, jadwal, dan informasi terbaru lewat website', contact: 'kud-sari-subur.my.id' },
];

const MITRA = [
  { name: 'Dinas Pertanian', logo: '🏛️' },
  { name: 'PTPN V', logo: '🏭' },
  { name: 'Bank BRI', logo: '🏦' },
  { name: 'Universitas Riau', logo: '🎓' },
  { name: 'LSM Swadaya', logo: '🤝' },
  { name: 'Kementan RI', logo: '🌾' },
];

const PROGRAM_COLORS = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
};

function SectionBadge({ children }) {
  return (
    <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 overflow-hidden">
      <span className="relative z-10">{children}</span>
    </motion.span>
  );
}

function SectionHeader({ badge, title, subtitle, light }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
      <SectionBadge>{badge}</SectionBadge>
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }} className={`mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading ${light ? 'text-white' : 'text-foreground'}`}>
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }} className={`mt-4 text-lg ${light ? 'text-white/70' : 'text-muted-foreground'}`}>
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

function Counter({ end, suffix, label, duration = 2000, prefix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-primary">{prefix}{count.toLocaleString()}{suffix}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgramModal({ program, onClose }) {
  return (
    <AnimatePresence>
      {program && (
        <motion.div key={program.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} transition={{ type: 'spring', damping: 25 }} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent pointer-events-none" />
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 transition-colors shadow-sm"><XMarkIcon className="w-5 h-5" /></button>
            <div className="relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20"><program.icon className="w-7 h-7 text-white" /></div>
            <h3 className="relative z-10 text-2xl font-bold font-heading text-foreground mb-2">{program.title}</h3>
            <p className="relative z-10 text-muted-foreground mb-6">{program.desc}</p>
            <h4 className="relative z-10 font-semibold text-foreground mb-3">Manfaat Program:</h4>
            <ul className="relative z-10 space-y-2.5">
              {program.manfaat.map((m, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm">{idx + 1}</span>
                  <span className="text-foreground/80">{m}</span>
                </li>
              ))}
            </ul>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative z-10 mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/30">Daftar Program</motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VideoModal({ videoId, onClose }) {
  return (
    <AnimatePresence>
      {videoId && (
        <motion.div key={videoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 25 }} className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors border border-white/20"><XMarkIcon className="w-5 h-5" /></button>
            <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const router = useRouter();
  const logoUrl = useLogo();
  const [loggedIn, setLoggedIn] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem('token'));
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [testiIdx, setTestiIdx] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programModal, setProgramModal] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategory, setBlogCategory] = useState('Semua');
  const [showBackTop, setShowBackTop] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 50); setShowBackTop(window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredBlogs = blogCategory === 'Semua' ? BLOG_POSTS : BLOG_POSTS.filter((b) => b.category === blogCategory);

  const navLinks = [
    { href: '#blog', label: 'Blog', icon: NewspaperIcon },
    { href: '#program', label: 'Program', icon: Squares2X2Icon },
    { href: '#fitur', label: 'Fitur', icon: ChartBarIcon },
    { href: '#testimoni', label: 'Testimoni', icon: ChatBubbleLeftRightIcon },
    { href: '#faq', label: 'FAQ', icon: QuestionMarkCircleIcon },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ===== NAVBAR ===== */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0 min-w-0" onClick={() => router.push('/')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 shadow-lg shadow-emerald-500/30 overflow-hidden"><LogoDisplay logoUrl={logoUrl} /></div>
              <span className={`font-bold font-heading text-sm sm:text-lg truncate transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>KUD Sari Subur</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary flex items-center gap-1.5 ${scrolled ? 'text-foreground/70' : 'text-white/80'}`}>
                  <link.icon className="w-4 h-4" />{link.label}
                </a>
              ))}
              {mounted && !loggedIn ? (
                <div className="flex items-center gap-2 ml-3">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/login')} className="px-4 py-2 rounded-lg text-sm font-bold border-2 border-emerald-500/50 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 transition-all shadow-sm">Masuk</motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/login?tab=register')} className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all hover:from-emerald-700 hover:to-emerald-800">Daftar</motion.button>
                </div>
              ) : mounted && loggedIn ? (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); router.push(u.role === 'admin' ? '/admin' : u.role === 'verifikator' ? '/verifikator' : u.role === 'pekebun' ? '/pekebun' : '/login'); } catch { router.push('/login'); } }} className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-600/30">{(() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.role === 'admin') return 'Admin'; if (u.role === 'verifikator') return 'Verifikator'; if (u.role === 'pekebun') return 'Pekebun'; return 'Dashboard'; } catch { return 'Dashboard'; } })()}</motion.button>
              ) : null}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl overflow-hidden shadow-lg">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <motion.a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
                    <link.icon className="w-5 h-5" /><span className="font-medium">{link.label}</span>
                  </motion.a>
                ))}
                <div className="pt-3 border-t border-gray-100 flex gap-2">
                  {mounted && !loggedIn ? (
                    <>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); router.push('/login'); }} className="flex-1 py-2.5 rounded-lg border-2 border-emerald-500/50 bg-emerald-50 text-emerald-700 font-bold text-sm shadow-sm">Masuk</motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); router.push('/login?tab=register'); }} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30">Daftar</motion.button>
                    </>
                  ) : mounted && loggedIn ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); try { const u = JSON.parse(localStorage.getItem('user') || '{}'); router.push(u.role === 'admin' ? '/admin' : u.role === 'verifikator' ? '/verifikator' : u.role === 'pekebun' ? '/pekebun' : '/login'); } catch { router.push('/login'); } }} className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm">{(() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.role === 'admin') return 'Menu Admin'; if (u.role === 'verifikator') return 'Menu Verifikator'; if (u.role === 'pekebun') return 'Menu Pekebun'; return 'Dashboard'; } catch { return 'Dashboard'; } })()}</motion.button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.4),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.15),transparent_70%)]" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse animate-delay-700" />
          <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-green-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-10 md:pt-24 md:pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm mb-6">
              Koperasi Unit Desa Tegal Sari
            </motion.span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-heading text-white leading-tight max-w-5xl mx-auto">
            Maju Bersama{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">KUD Sari Subur</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed px-2">
            Koperasi petani kelapa sawit yang berkomitmen meningkatkan kesejahteraan anggota melalui kemitraan berkelanjutan, inovasi, dan gotong royong. Berdiri sejak 2019, KUD Sari Subur telah melayani lebih dari 371 pekebun aktif dengan total lahan kelola 850 hektar dan produksi TBS mencapai 5.000 ton per tahun.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-3 text-xs sm:text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed px-2 italic">
            Berbadan hukum, terverifikasi Dinas Koperasi & UKM, dan berkomitmen pada prinsip transparansi, akuntabilitas, serta kemandirian anggota.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/login?tab=register')} className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-white text-emerald-900 font-bold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-white to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Jadi Anggota</span> <ArrowRightIcon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#tentang" className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base backdrop-blur-sm overflow-hidden">
              <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Pelajari Lebih Lanjut</span> <ChevronDownIcon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform" />
            </motion.a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="mt-4 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-10 text-white/60 text-sm">
            <div className="flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4 text-green-400" />Terpercaya</div>
            <div className="flex items-center gap-2"><UserGroupIcon className="w-4 h-4 text-green-400" />371+ Anggota</div>
            <div className="flex items-center gap-2"><HeartIcon className="w-4 h-4 text-green-400" />Ramah Lingkungan</div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.a href="#tentang" onClick={(e) => { e.preventDefault(); document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors text-xs">
            <span>Scroll</span>
            <ChevronDownIcon className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </section>







      

{/* ===== TIMELINE ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-white to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Perjalanan" title="Sejarah & Perjalanan KUD" subtitle="Dari 50 pekebun hingga 371+ anggota — perjalanan KUD Sari Subur membangun koperasi sawit yang mandiri dan profesional." />
        </div>
        <div className="relative z-10"><Timeline /></div>
      </section>

      

{/* ===== PROGRAM UNGGULAN ===== */}
      <section id="program" className="py-14 md:py-28 bg-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Program" title="Program Unggulan" subtitle="Berbagai program dirancang khusus untuk meningkatkan kesejahteraan dan produktivitas petani." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((program, idx) => {
              const Icon = program.icon;
              return (
                <motion.div key={program.id} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="group relative rounded-2xl p-6 cursor-pointer overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl hover:border-white/60 transition-all" onClick={() => setProgramModal(program)}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                  <div className={`relative z-10 w-12 h-12 rounded-xl ${PROGRAM_COLORS[program.color].bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className={`w-6 h-6 ${PROGRAM_COLORS[program.color].icon}`} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold font-heading text-foreground">{program.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{program.desc}</p>
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{program.manfaat.length} Manfaat</span>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">Detail <ArrowRightIcon className="w-4 h-4" /></span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== ALUR 6 LANGKAH ===== */}
      <section className="py-14 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Panduan" title="6 Langkah Jadi Anggota" subtitle="Proses mudah dan cepat untuk bergabung menjadi anggota KUD Desa Sari Subur." />
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden md:block" />
            <div className="space-y-8 md:space-y-0">
              {[
                { icon: DocumentTextIcon, step: 1, title: 'Isi Formulir', desc: 'Ambil dan isi formulir pendaftaran di kantor KUD atau unduh dari website.' },
                { icon: FolderIcon, step: 2, title: 'Siapkan Berkas', desc: 'Lengkapi persyaratan: KTP, KK, surat keterangan desa, dan pas foto 3x4.' },
                { icon: ShieldCheckIcon, step: 3, title: 'Verifikasi Data', desc: 'Petugas KUD akan memverifikasi kelengkapan dan keabsahan data Anda.' },
                { icon: HandRaisedIcon, step: 4, title: 'Ikuti Orientasi', desc: 'Ikuti masa orientasi anggota selama 1 bulan untuk memahami AD/ART KUD.' },
                { icon: UserGroupIcon, step: 5, title: 'Bayar Simpanan', desc: 'Bayar simpanan pokok dan simpanan wajib sesuai ketentuan koperasi.' },
                { icon: CheckBadgeIcon, step: 6, title: 'Jadi Anggota', desc: 'Resmi menjadi anggota aktif KUD dan nikmati seluruh layanan dan program.' },
              ].map((item, idx) => {
                const Icn = item.icon;
                const isLeft = idx % 2 === 0;
                return (
                  <motion.div key={item.step} initial={{ opacity: 0, x: isLeft ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }} className={`relative flex items-start gap-6 md:gap-0 md:flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} py-4 md:py-0 md:h-40`}>
                    <div className="hidden md:flex md:w-1/2 items-center">
                      <div className={`${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'} w-full`}>
                        <h4 className="font-bold font-heading text-foreground text-lg">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 relative z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                      <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/30 border-2 border-emerald-400/30">
                        <Icn className="w-4 h-4 md:w-5 md:h-5" />
                      </motion.div>
                    </div>
                    <div className="md:hidden flex-1 min-w-0">
                      <h4 className="font-bold font-heading text-foreground text-sm sm:text-lg">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      

{/* ===== TEAM ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-white to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Pengurus" title="Tim Pengurus KUD" subtitle="Kenali pengurus KUD Desa Sari Subur yang berdedikasi melayani anggota." />
        </div>
        <div className="relative z-10"><TeamSection /></div>
      </section>

      

{/* ===== SERTIFIKASI & PENGHARGAAN ===== */}
      <section className="py-14 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Pengakuan" title="Sertifikasi & Penghargaan" subtitle="Berbagai sertifikasi dan penghargaan yang telah diraih KUD Desa Sari Subur." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheckIcon, title: 'ISO 9001:2015', desc: 'Sistem Manajemen Mutu' },
              { icon: GlobeAltIcon, title: 'ISPO', desc: 'Indonesian Sustainable Palm Oil' },
              { icon: StarIcon, title: 'Koperasi Teladan', desc: 'Tingkat Provinsi 2023' },
              { icon: GlobeAltIcon, title: 'SNI 8900', desc: 'Sistem Koperasi Indonesia' },
            ].map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} variants={scaleIn} whileHover={{ y: -4, scale: 1.02 }} className="group relative p-4 sm:p-6 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />
                  <div className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md shadow-emerald-500/20"><Icn className="w-5 h-5 sm:w-7 sm:h-7 text-white" /></div>
                  <h4 className="relative z-10 font-bold font-heading text-foreground">{item.title}</h4>
                  <p className="relative z-10 text-xs text-muted-foreground mt-1">{item.desc}</p>
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400/50 to-emerald-400/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== KEGIATAN GALLERY ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Dokumentasi" title="Kegiatan Kami" subtitle="Dokumentasi berbagai kegiatan dan program yang telah dilaksanakan KUD Desa Sari Subur." />
        </div>
        <KegiatanGallery />
      </section>

      

{/* ===== TENTANG ===== */}
      <section id="tentang" className="py-14 md:py-28 bg-gradient-to-b from-emerald-50/30 via-white to-white overflow-hidden scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <SectionBadge>Tentang Kami</SectionBadge>
              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground leading-tight">Koperasi yang <span className="text-primary">Berkembang</span> Bersama Petani</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                KUD Desa Sari Subur didirikan pada tahun 2019 oleh sekelompok petani kelapa sawit di Kecamatan Megang Sakti, Kabupaten Musi Rawas. Berawal dari keprihatinan terhadap praktik tengkulak yang merugikan petani, koperasi ini hadir sebagai solusi untuk meningkatkan posisi tawar petani dalam rantai pasok kelapa sawit.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Kini, KUD Sari Subur telah berkembang menjadi koperasi yang melayani lebih dari 371 petani anggota dengan total lahan kelola 850 hektar dan produksi TBS mencapai 5.000 ton per tahun. Kami mengelola 6 program unggulan: Kemitraan Petani, Simpan Pinjam, Pelatihan & Penyuluhan, Distribusi & Logistik, Asuransi Tani, dan Koperasi Konsumsi.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Dengan semangat gotong royong dan transparansi, kami terus berinovasi untuk memberikan pelayanan terbaik bagi anggota. KUD Sari Subur telah terverifikasi dan berbadan hukum resmi melalui Dinas Koperasi & UKM, serta berkomitmen pada prinsip-prinsip koperasi yang mandiri, profesional, dan berkelanjutan.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: EyeIcon, label: 'Visi', text: 'Menjadi koperasi petani sawit terdepan dan mandiri.' },
                  { icon: HeartIcon, label: 'Misi', text: 'Mensejahterakan anggota melalui kemitraan berkelanjutan.' },
                ].map((item, idx) => {
                  const Icn = item.icon;
                  return (
                    <motion.div key={idx} whileHover={{ y: -3, scale: 1.02 }} className="group p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-emerald-100/60 shadow-md hover:shadow-lg transition-all">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-2 shadow-md shadow-emerald-500/20"><Icn className="w-4 h-4 text-white" /></div>
                      <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img src="/images/foto.jpg" alt="Kegiatan KUD Sari Subur" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent z-[1]" />
                <div className="absolute bottom-6 left-6 right-6 z-[2]">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30 overflow-hidden"><LogoDisplay logoUrl={logoUrl} /></div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">KUD Sari Subur</div>
                        <div className="text-xs text-muted-foreground">Berkembang Bersama Petani</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, type: 'spring' }} className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-400/30 flex items-center justify-center hidden lg:flex shadow-xl shadow-emerald-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold font-heading text-white">7+</div>
                  <div className="text-[10px] text-emerald-200">Tahun</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      

{/* ===== VIDEO KUD ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-white via-emerald-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Multimedia" title="Video KUD Sari Subur" subtitle="Tonton berbagai kegiatan, profil, dan informasi seputar KUD Desa Sari Subur." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {YT_VIDEOS.map((video, idx) => (
              <motion.div key={video.id} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="group cursor-pointer rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all" onClick={() => setVideoModal(video.id)}>
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all"><PlayIcon className="w-6 h-6 text-emerald-700 ml-0.5" /></div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">KUD Sari Subur</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      

{/* ===== KEUNTUNGAN ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Mengapa KUD" title="Keuntungan Bergabung" subtitle="Rasakan manfaat nyata menjadi bagian dari keluarga besar KUD Desa Sari Subur." light />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CurrencyDollarIcon, title: 'Harga TBS Kompetitif', desc: 'Harga terbaik untuk TBS anggota dengan sistem bagi hasil yang transparan dan adil.' },
              { icon: AcademicCapIcon, title: 'Pendampingan Teknis', desc: 'Tim ahli siap mendampingi petani dalam teknik budidaya sawit yang baik dan benar.' },
              { icon: ShieldCheckIcon, title: 'Jaminan Pembelian', desc: 'KUD menjamin pembelian seluruh hasil panen anggota dengan harga pasar yang wajar.' },
              { icon: UserGroupIcon, title: 'Komunitas Solid', desc: 'Bergabung dengan komunitas petani yang solid, saling mendukung, dan berbagai pengalaman.' },
            ].map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} variants={itemVariants} whileHover={{ y: -6, scale: 1.03 }} className="group relative p-5 sm:p-6 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all shadow-lg shadow-black/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-white/20 transition-all border border-white/10"><Icn className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" /></div>
                  <h3 className="relative z-10 text-base sm:text-lg font-bold font-heading text-white">{item.title}</h3>
                  <p className="relative z-10 mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/60">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== KALKULATOR TBS ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kalkulator" title="Kalkulator TBS" subtitle="Simulasi pendapatan Anda dari hasil kebun kelapa sawit." />
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg p-6 md:p-8">
            <TbsCalculator />
          </div>
        </div>
      </section>

      

{/* ===== BLOG TERBARU ===== */}
      <section id="blog" className="py-14 md:py-28 bg-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Blog" title="Artikel & Berita Terbaru" subtitle="Informasi terkini seputar KUD, pertanian sawit, dan kegiatan anggota." />
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <div className="relative flex-1 w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Cari artikel..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
              {['Semua', 'Pelatihan', 'Sosial', 'Pendidikan'].map((cat) => (
                <button key={cat} onClick={() => setBlogCategory(cat)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${blogCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-foreground/60 hover:bg-gray-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBlogs.filter((b) => !blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase())).length > 0 ? (
              filteredBlogs.filter((b) => !blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase())).map((post, idx) => (
                <motion.article key={post.slug} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="group rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push(`/blog/${post.slug}`)}>
                  <div className="relative h-44 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50 z-0" />
                    <img src={post.image} alt={post.title} className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-[1]" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[2]" />
                    <div className="absolute top-3 left-3 z-[2] px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-sm text-foreground">{post.category}</div>
                    <div className="absolute bottom-3 left-3 z-[2] flex items-center gap-2 text-xs text-white">
                      <CalendarDaysIcon className="w-3.5 h-3.5" />{post.date}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">{post.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs text-muted-foreground">{post.author}</span>
                      <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">Baca <ArrowRightIcon className="w-3 h-3" /></span>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">Tidak ada artikel ditemukan.</div>
            )}
          </motion.div>
        </div>
      </section>

      

{/* ===== FITUR ===== */}
      <section id="fitur" className="py-14 md:py-28 bg-white overflow-hidden scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Layanan Digital" title="Fitur Aplikasi KUD" subtitle="Nikmati kemudahan akses informasi dan layanan KUD melalui aplikasi digital kami." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ChartBarIcon, title: 'Pantau Harga', desc: 'Cek harga TBS terkini secara real-time langsung dari smartphone Anda.' },
              { icon: DocumentTextIcon, title: 'Riwayat Transaksi', desc: 'Akses riwayat setoran TBS, penjualan, dan peminjaman kapan saja.' },
              { icon: BellAlertIcon, title: 'Notifikasi Cerdas', desc: 'Dapatkan pemberitahuan otomatis untuk harga baru, jadwal, dan pengumuman.' },
              { icon: MapPinIcon, title: 'Lacak Pengiriman', desc: 'Pantau status pengiriman TBS dari kebun ke pabrik secara langsung.' },
              { icon: CalendarDaysIcon, title: 'Jadwal Kegiatan', desc: 'Lihat jadwal pelatihan, penyuluhan, dan kegiatan KUD lainnya.' },
              { icon: ChatBubbleLeftRightIcon, title: 'Konsultasi Online', desc: 'Tanya langsung ke tim penyuluh KUD lewat fitur chat terintegrasi.' },
            ].map((item, idx) => {
              const Icn = item.icon;
              const bento = idx === 0 ? 'lg:col-span-2 lg:row-span-1' : '';
              return (
                <motion.div key={idx} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className={`group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100/60 shadow-md hover:shadow-xl transition-all ${bento}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-bl-full" />
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md shadow-emerald-500/20"><Icn className="w-6 h-6 text-white" /></div>
                  <h3 className="text-lg font-bold font-heading text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== KUD DALAM ANGKA ===== */}
      <section className="py-16 md:py-28 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Statistik" title="KUD dalam Angka" subtitle="Capaian dan dampak nyata KUD Desa Sari Subur bagi petani kelapa sawit di wilayah Kecamatan Tegal Sari." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {[
              { end: 371, suffix: '+', label: 'Anggota Aktif' },
              { end: 850, suffix: '+', label: 'Hektar Lahan' },
              { end: 5000, suffix: ' Ton', label: 'TBS per Tahun' },
              { end: 7, suffix: '+', label: 'Tahun Berdiri' },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="relative p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-md text-center group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent rounded-2xl pointer-events-none" />
                <Counter end={item.end} suffix={item.suffix} label={item.label} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

{/* ===== MITRA & KOLABORASI ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kolaborasi" title="Mitra & Kolaborasi" subtitle="Kemitraan strategis dengan berbagai lembaga untuk mendukung kemajuan KUD." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
            {MITRA.map((mitra, idx) => (
              <motion.div key={idx} variants={scaleIn} whileHover={{ y: -4, scale: 1.05 }} className="group relative p-4 sm:p-6 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-lg transition-all text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/30 pointer-events-none" />
                <div className="relative z-10 text-4xl mb-2 group-hover:scale-110 transition-transform">{mitra.logo}</div>
                <div className="relative z-10 text-xs font-medium text-foreground/70">{mitra.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      

{/* ===== TESTIMONI ===== */}
      <section id="testimoni" className="py-14 md:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden scroll-mt-16 md:scroll-mt-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.1),transparent_50%)]" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-teal-400/5 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Testimoni" title="Apa Kata Anggota?" subtitle="Pengalaman nyata dari para anggota yang telah merasakan manfaat bergabung dengan KUD." light />
          <div className="relative max-w-4xl mx-auto">
            <motion.div key={testiIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/60 to-emerald-400/0" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                {TESTIMONI[testiIdx].nama.charAt(0)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < TESTIMONI[testiIdx].rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                ))}
              </div>
              <p className="text-base sm:text-xl md:text-2xl text-white/90 leading-relaxed font-medium italic">{'\u201C'}{TESTIMONI[testiIdx].quote}{'\u201D'}</p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="font-bold text-white text-lg">{TESTIMONI[testiIdx].nama}</div>
                <div className="text-white/50 text-sm">{TESTIMONI[testiIdx].asal}</div>
              </div>
            </motion.div>
            <div className="flex items-center justify-center gap-3 mt-8">
              {TESTIMONI.map((_, idx) => (
                <button key={idx} onClick={() => setTestiIdx(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === testiIdx ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'}`} />
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTestiIdx((prev) => (prev - 1 + TESTIMONI.length) % TESTIMONI.length)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTestiIdx((prev) => (prev + 1) % TESTIMONI.length)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronRightIcon className="w-5 h-5" /></motion.button>
            </div>
          </div>
        </div>
      </section>

      

{/* ===== LAYANAN & DUKUNGAN ===== */}
      <section id="layanan" className="py-14 md:py-28 bg-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kontak" title="Layanan & Dukungan" subtitle="Hubungi kami melalui berbagai saluran yang tersedia." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LAYANAN.map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="group relative p-5 sm:p-6 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/30 pointer-events-none" />
                  <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20"><Icn className="w-6 h-6 sm:w-7 sm:h-7 text-white" /></div>
                  <h4 className="relative z-10 font-bold font-heading text-foreground text-sm sm:text-base">{item.title}</h4>
                  <p className="relative z-10 text-sm text-muted-foreground mt-2">{item.desc}</p>
                  <p className="relative z-10 text-sm font-semibold text-primary mt-3">{item.contact}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== FAQ ===== */}
      <section id="faq" className="py-14 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Tanya Jawab" title="Pertanyaan Umum" subtitle="Temukan jawaban atas pertanyaan yang sering diajukan tentang KUD Desa Sari Subur." />
          <div className="space-y-3">
            {FAQ_DATA.map((faq, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-lg transition-all">
                <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} className="w-full flex items-center justify-between p-4 md:p-5 text-left">
                  <span className="font-medium text-foreground text-sm md:text-base pr-4">{faq.q}</span>
                  <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/10 pt-3">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

{/* ===== MAP ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-b from-emerald-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Lokasi" title="Temukan Kami" subtitle="Kunjungi kantor KUD Desa Sari Subur untuk informasi lebih lanjut." />
        </div>
        <MapSection />
      </section>

      

{/* ===== NEWSLETTER CTA ===== */}
      <section className="py-14 md:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.2),transparent_60%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm mb-6">
            Tetap Terhubung
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white">
            Dapatkan Info Terbaru dari KUD
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
            Berlangganan newsletter kami untuk mendapatkan update harga TBS, program, dan kegiatan KUD.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3 px-4 sm:px-0">
            <input type="email" placeholder="Masukkan email Anda" className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 backdrop-blur-sm transition-all" />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 transition-all text-sm hover:from-emerald-600 hover:to-emerald-700">Langganan</motion.button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-foreground text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30 overflow-hidden"><LogoDisplay logoUrl={logoUrl} /></div>
                <span className="font-bold font-heading text-lg text-white">KUD Sari Subur</span>
              </div>
              <p className="text-sm leading-relaxed">Koperasi Unit Desa Sari Subur berkomitmen meningkatkan kesejahteraan petani kelapa sawit melalui kemitraan berkelanjutan.</p>
              <div className="flex items-center gap-3 mt-5">
                {['🌐', '📱', '📧'].map((emoji, idx) => (
                  <div key={idx} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-sm hover:bg-white/10 hover:text-white transition-all cursor-pointer">{emoji}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 font-heading">Tautan</h4>
              <ul className="space-y-2.5 text-sm">
                {['Beranda', 'Fitur', 'Tentang', 'Program', 'Blog', 'Kontak'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 font-heading">Program</h4>
              <ul className="space-y-2.5 text-sm">
                {PROGRAMS.map((p) => (
                  <li key={p.id}><a href="#" className="hover:text-white transition-colors">{p.title}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 font-heading">Kontak</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />Jl. Tegal Sari No. 123, Kec. Tegal Sari</li>
                <li className="flex items-start gap-2"><PhoneIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />0851-6988-3337</li>
                <li className="flex items-start gap-2"><GlobeAltIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />kud-sari-subur.my.id</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} KUD Desa Sari Subur. Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-4">
              <a href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== BACK TO TOP ===== */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} whileHover={{ scale: 1.1 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-20 right-4 md:right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center border border-emerald-400/30">
            <ArrowUpIcon className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== WHATSAPP FLOATING ===== */}
      <motion.a
        href="https://wa.me/6285169883337?text=Halo%20KUD%20Sari%20Subur%2C%20saya%20ingin%20bertanya"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-4 md:right-6 z-40 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all flex items-center justify-center group"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Chat WhatsApp</span>
      </motion.a>

      {/* ===== PROGRAM MODAL ===== */}
      <ProgramModal program={programModal} onClose={() => setProgramModal(null)} />

      {/* ===== VIDEO MODAL ===== */}
      <VideoModal videoId={videoModal} onClose={() => setVideoModal(null)} />
    </div>
  );
}
