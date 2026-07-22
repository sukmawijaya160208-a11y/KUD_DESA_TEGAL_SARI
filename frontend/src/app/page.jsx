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
  { slug: 'panen-raya-sawit', title: 'Panen Raya Sawit di Desa Tegal Sari', excerpt: 'Musim panen tahun ini menghasilkan lebih dari 500 ton TBS berkualitas tinggi berkat program pemupukan berimbang.', date: '15 Mar 2025', author: 'Admin KUD', image: '/blog/panen-raya.jpg', category: 'Panen' },
  { slug: 'pelatihan-budidaya', title: 'Pelatihan Budidaya Sawit Berkelanjutan', excerpt: 'KUD mengadakan pelatihan budidaya sawit berkelanjutan yang diikuti oleh 120 petani dari 5 desa sekitar.', date: '28 Feb 2025', author: 'Admin KUD', image: '/blog/pelatihan.jpg', category: 'Pelatihan' },
  { slug: 'program-kemitraan-baru', title: 'Program Kemitraan Baru Tahun Ini', excerpt: 'KUD meluncurkan program kemitraan baru dengan skema bagi hasil yang lebih menguntungkan bagi petani.', date: '10 Feb 2025', author: 'Admin KUD', image: '/blog/kemitraan.jpg', category: 'Program' },
  { slug: 'harga-tbs-januari', title: 'Update Harga TBS Januari 2025', excerpt: 'Berikut adalah daftar harga TBS terkini yang berlaku mulai 1 Januari 2025 berdasarkan Rapat Anggota.', date: '1 Jan 2025', author: 'Admin KUD', image: '/blog/harga.jpg', category: 'Info' },
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
    <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
      {children}
    </motion.span>
  );
}

function SectionHeader({ badge, title, subtitle, light }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
      <SectionBadge>{badge}</SectionBadge>
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }} className={`mt-4 text-3xl md:text-4xl lg:text-5xl font-bold font-heading ${light ? 'text-white' : 'text-foreground'}`}>
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
      <div className="text-4xl md:text-5xl font-bold font-heading text-primary">{prefix}{count.toLocaleString()}{suffix}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgramModal({ program, onClose }) {
  return (
    <AnimatePresence>
      {program && (
        <motion.div key={program.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} transition={{ type: 'spring', damping: 25 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><program.icon className="w-7 h-7 text-primary" /></div>
            <h3 className="text-2xl font-bold font-heading text-foreground mb-2">{program.title}</h3>
            <p className="text-muted-foreground mb-6">{program.desc}</p>
            <h4 className="font-semibold text-foreground mb-3">Manfaat Program:</h4>
            <ul className="space-y-2.5">
              {program.manfaat.map((m, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                  <span className="text-foreground/80">{m}</span>
                </li>
              ))}
            </ul>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Daftar Program</motion.button>
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
        <motion.div key={videoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
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
  const [loggedIn, setLoggedIn] = useState(false);
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

  useEffect(() => { setMounted(true); setLoggedIn(!!localStorage.getItem('token')); }, []);
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 50); setShowBackTop(window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredBlogs = blogCategory === 'Semua' ? BLOG_POSTS : BLOG_POSTS.filter((b) => b.category === blogCategory);

  const navLinks = [
    { href: '#fitur', label: 'Fitur', icon: Squares2X2Icon },
    { href: '#tentang', label: 'Tentang', icon: InformationCircleIcon },
    { href: '#testimoni', label: 'Testimoni', icon: ChatBubbleLeftRightIcon },
    { href: '#faq', label: 'FAQ', icon: QuestionMarkCircleIcon },
    { href: '#blog', label: 'Blog', icon: NewspaperIcon },
  ];

  return (
    <>

      {/* ===== NAVBAR ===== */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-glass border-b border-white/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">K</div>
              <span className={`font-bold font-heading text-lg transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>KUD Sari Subur</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary flex items-center gap-1.5 ${scrolled ? 'text-foreground/70' : 'text-white/80'}`}>
                  <link.icon className="w-4 h-4" />{link.label}
                </a>
              ))}
              {mounted && !loggedIn ? (
                <div className="flex items-center gap-2 ml-3">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/login')} className="px-4 py-2 rounded-lg text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors">Masuk</motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/login?tab=register')} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">Daftar</motion.button>
                </div>
              ) : mounted && loggedIn ? (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/dashboard')} className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">Dashboard</motion.button>
              ) : null}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden border-t border-white/10 bg-white/95 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
                    <link.icon className="w-5 h-5" /><span className="font-medium">{link.label}</span>
                  </a>
                ))}
                <div className="pt-3 border-t border-gray-100 flex gap-2">
                  {mounted && !loggedIn ? (
                    <>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); router.push('/login'); }} className="flex-1 py-2.5 rounded-lg border border-primary text-primary font-semibold text-sm">Masuk</motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); router.push('/login?tab=register'); }} className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm">Daftar</motion.button>
                    </>
                  ) : mounted && loggedIn ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); router.push('/dashboard'); }} className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm">Dashboard</motion.button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.2),transparent_50%)]" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse animate-delay-700" />
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} animate={{ y: [0, -30, 0], opacity: [0, 1, 0], }} transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }} />
          ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm mb-6">
              Koperasi Unit Desa Tegal Sari
            </motion.span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-heading text-white leading-tight max-w-5xl mx-auto">
            Maju Bersama{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">KUD Sari Subur</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Koperasi petani kelapa sawit yang berkomitmen meningkatkan kesejahteraan anggota melalui kemitraan berkelanjutan, inovasi, dan gotong royong.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/login?tab=register')} className="px-8 py-3.5 rounded-xl bg-white text-emerald-900 font-bold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all flex items-center gap-2 text-base">
              Jadi Anggota <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
            <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="#tentang" className="px-8 py-3.5 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2 text-base backdrop-blur-sm">
              Pelajari Lebih Lanjut <ChevronDownIcon className="w-5 h-5" />
            </motion.a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="mt-12 flex items-center justify-center gap-6 md:gap-10 text-white/60 text-sm">
            <div className="flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4 text-green-400" />Terpercaya</div>
            <div className="flex items-center gap-2"><UserGroupIcon className="w-4 h-4 text-green-400" />500+ Anggota</div>
            <div className="flex items-center gap-2"><HeartIcon className="w-4 h-4 text-green-400" />Ramah Lingkungan</div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.a href="#harga" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors text-xs">
            <span>Scroll</span>
            <ChevronDownIcon className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </section>

      {/* ===== HARGA TBS LIVE ===== */}
      <section id="harga" className="relative -mt-20 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><CurrencyDollarIcon className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h3 className="font-bold font-heading text-foreground">Harga TBS Hari Ini</h3>
                <p className="text-xs text-muted-foreground">Update terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { grade: 'TBS Super', price: 'Rp 2.850', kg: 'kg', change: '+50', up: true },
              { grade: 'TBS Grade A', price: 'Rp 2.650', kg: 'kg', change: '+30', up: true },
              { grade: 'TBS Grade B', price: 'Rp 2.450', kg: 'kg', change: '-20', up: false },
              { grade: 'TBS Grade C', price: 'Rp 2.250', kg: 'kg', change: '+10', up: true },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="relative p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
                <div className="text-xs text-muted-foreground mb-1">{item.grade}</div>
                <div className="text-2xl font-bold font-heading text-foreground">{item.price}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">/{item.kg}</span>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${item.up ? 'text-green-600' : 'text-red-500'}`}>
                    {item.up ? '\u2191' : '\u2193'} {item.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== KUD DALAM ANGKA ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Statistik" title="KUD dalam Angka" subtitle="Capaian dan dampak nyata KUD Desa Sari Subur bagi petani kelapa sawit di wilayah Kecamatan Tegal Sari." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <Counter end={532} suffix="+" label="Anggota Aktif" />
            <Counter end={1250} suffix="+" label="Hektar Lahan" />
            <Counter end={8500} suffix=" Ton" label="TBS per Tahun" />
            <Counter end={15} suffix="+" label="Tahun Berdiri" />
          </div>
        </div>
      </section>

      {/* ===== KEGIATAN GALLERY ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Dokumentasi" title="Kegiatan Kami" subtitle="Dokumentasi berbagai kegiatan dan program yang telah dilaksanakan KUD Desa Sari Subur." />
        </div>
        <KegiatanGallery />
      </section>

      {/* ===== VIDEO KUD ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-emerald-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Multimedia" title="Video KUD Sari Subur" subtitle="Tonton berbagai kegiatan, profil, dan informasi seputar KUD Desa Sari Subur." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {YT_VIDEOS.map((video, idx) => (
              <motion.div key={video.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -6 }} className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all" onClick={() => setVideoModal(video.id)}>
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><PlayIcon className="w-6 h-6 text-emerald-700 ml-0.5" /></div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">KUD Sari Subur</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BLOG TERBARU ===== */}
      <section id="blog" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Blog" title="Artikel & Berita Terbaru" subtitle="Informasi terkini seputar KUD, pertanian sawit, dan kegiatan anggota." />
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <div className="relative flex-1 w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Cari artikel..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Semua', 'Panen', 'Pelatihan', 'Program', 'Info'].map((cat) => (
                <button key={cat} onClick={() => setBlogCategory(cat)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${blogCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-foreground/60 hover:bg-gray-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBlogs.filter((b) => !blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase())).length > 0 ? (
              filteredBlogs.filter((b) => !blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase())).map((post, idx) => (
                <motion.article key={post.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -5 }} className="group rounded-xl overflow-hidden bg-white shadow-card border border-gray-100 hover:shadow-card-hover transition-all cursor-pointer" onClick={() => router.push(`/blog/${post.slug}`)}>
                  <div className="relative h-44 bg-gradient-to-br from-emerald-100 to-teal-50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-[1]" />
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
          </div>
        </div>
      </section>

      {/* ===== TENTANG ===== */}
      <section id="tentang" className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/30 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <SectionBadge>Tentang Kami</SectionBadge>
              <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground leading-tight">Koperasi yang <span className="text-primary">Berkembang</span> Bersama Petani</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                KUD Desa Sari Subur didirikan pada tahun 2010 oleh sekelompok petani kelapa sawit di Kecamatan Tegal Sari. Berawal dari keprihatinan terhadap praktik tengkulak yang merugikan petani, koperasi ini hadir sebagai solusi untuk meningkatkan posisi tawar petani dalam rantai pasok kelapa sawit.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Kini, KUD Sari Subur telah berkembang menjadi koperasi yang melayani lebih dari 500 petani anggota. Dengan semangat gotong royong dan transparansi, kami terus berinovasi untuk memberikan pelayanan terbaik bagi anggota.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: EyeIcon, label: 'Visi', text: 'Menjadi koperasi petani sawit terdepan dan mandiri.' },
                  { icon: HeartIcon, label: 'Misi', text: 'Mensejahterakan anggota melalui kemitraan berkelanjutan.' },
                ].map((item, idx) => {
                  const Icn = item.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><Icn className="w-4 h-4 text-primary" /></div>
                      <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-emerald-200 via-green-100 to-teal-50">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent z-[1]" />
                <div className="absolute bottom-6 left-6 right-6 z-[2]">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">K</div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">KUD Sari Subur</div>
                        <div className="text-xs text-muted-foreground">Berkembang Bersama Petani</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center hidden lg:flex">
                <div className="text-center">
                  <div className="text-2xl font-bold font-heading text-primary">15+</div>
                  <div className="text-[10px] text-muted-foreground">Tahun</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Perjalanan" title="Sejarah & Perjalanan KUD" subtitle="Dari awal berdiri hingga menjadi koperasi kebanggaan petani kelapa sawit di Tegal Sari." />
        </div>
        <Timeline />
      </section>

      {/* ===== PROGRAM UNGGULAN ===== */}
      <section id="program" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Program" title="Program Unggulan" subtitle="Berbagai program dirancang khusus untuk meningkatkan kesejahteraan dan produktivitas petani." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((program, idx) => {
              const Icon = program.icon;
              return (
                <motion.div key={program.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -6 }} className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer" onClick={() => setProgramModal(program)}>
                  <div className={`w-12 h-12 rounded-xl ${PROGRAM_COLORS[program.color].bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${PROGRAM_COLORS[program.color].icon}`} />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-foreground">{program.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{program.desc}</p>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{program.manfaat.length} Manfaat</span>
                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">Detail <ArrowRightIcon className="w-4 h-4" /></span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== KEUNTUNGAN ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Mengapa KUD" title="Keuntungan Bergabung" subtitle="Rasakan manfaat nyata menjadi bagian dari keluarga besar KUD Desa Sari Subur." light />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CurrencyDollarIcon, title: 'Harga TBS Kompetitif', desc: 'Harga terbaik untuk TBS anggota dengan sistem bagi hasil yang transparan dan adil.' },
              { icon: AcademicCapIcon, title: 'Pendampingan Teknis', desc: 'Tim ahli siap mendampingi petani dalam teknik budidaya sawit yang baik dan benar.' },
              { icon: ShieldCheckIcon, title: 'Jaminan Pembelian', desc: 'KUD menjamin pembelian seluruh hasil panen anggota dengan harga pasar yang wajar.' },
              { icon: UserGroupIcon, title: 'Komunitas Solid', desc: 'Bergabung dengan komunitas petani yang solid, saling mendukung, dan berbagai pengalaman.' },
            ].map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icn className="w-6 h-6 text-emerald-300" /></div>
                  <h3 className="text-lg font-bold font-heading text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FITUR ===== */}
      <section id="fitur" className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Layanan Digital" title="Fitur Aplikasi KUD" subtitle="Nikmati kemudahan akses informasi dan layanan KUD melalui aplikasi digital kami." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ChartBarIcon, title: 'Pantau Harga', desc: 'Cek harga TBS terkini secara real-time langsung dari smartphone Anda.' },
              { icon: DocumentTextIcon, title: 'Riwayat Transaksi', desc: 'Akses riwayat setoran TBS, penjualan, dan peminjaman kapan saja.' },
              { icon: BellAlertIcon, title: 'Notifikasi Cerdas', desc: 'Dapatkan pemberitahuan otomatis untuk harga baru, jadwal, dan pengumuman.' },
              { icon: MapPinIcon, title: 'Lacak Pengiriman', desc: 'Pantau status pengiriman TBS dari kebun ke pabrik secara langsung.' },
              { icon: CalendarDaysIcon, title: 'Jadwal Kegiatan', desc: 'Lihat jadwal pelatihan, penyuluhan, dan kegiatan KUD lainnya.' },
              { icon: ChatBubbleLeftRightIcon, title: 'Konsultasi Online', desc: 'Tanya langsung ke tim penyuluh KUD lewat fitur chat terintegrasi.' },
            ].map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -5 }} className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all"><Icn className="w-6 h-6 text-primary" /></div>
                  <h3 className="text-lg font-bold font-heading text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== KALKULATOR TBS ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kalkulator" title="Kalkulator TBS" subtitle="Simulasi pendapatan Anda dari hasil kebun kelapa sawit." />
          <TbsCalculator />
        </div>
      </section>

      {/* ===== ALUR 6 LANGKAH ===== */}
      <section className="py-20 md:py-28 bg-white">
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
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/30">
                        <Icn className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="md:hidden flex-1">
                      <h4 className="font-bold font-heading text-foreground text-lg">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Pengurus" title="Tim Pengurus KUD" subtitle="Kenali pengurus KUD Desa Sari Subur yang berdedikasi melayani anggota." />
        </div>
        <TeamSection />
      </section>

      {/* ===== SERTIFIKASI & PENGHARGAAN ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Pengakuan" title="Sertifikasi & Penghargaan" subtitle="Berbagai sertifikasi dan penghargaan yang telah diraih KUD Desa Sari Subur." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheckIcon, title: 'ISO 9001:2015', desc: 'Sistem Manajemen Mutu' },
              { icon: GlobeAltIcon, title: 'ISPO', desc: 'Indonesian Sustainable Palm Oil' },
              { icon: StarIcon, title: 'Koperasi Teladan', desc: 'Tingkat Provinsi 2023' },
              { icon: GlobeAltIcon, title: 'SNI 8900', desc: 'Sistem Koperasi Indonesia' },
            ].map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="p-6 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-emerald-50/30 text-center hover:shadow-md transition-all">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3"><Icn className="w-7 h-7 text-primary" /></div>
                  <h4 className="font-bold font-heading text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== MITRA & KOLABORASI ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kolaborasi" title="Mitra & Kolaborasi" subtitle="Kemitraan strategis dengan berbagai lembaga untuk mendukung kemajuan KUD." />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {MITRA.map((mitra, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{mitra.logo}</div>
                <div className="text-xs font-medium text-foreground/70">{mitra.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONI ===== */}
      <section id="testimoni" className="py-20 md:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Testimoni" title="Apa Kata Anggota?" subtitle="Pengalaman nyata dari para anggota yang telah merasakan manfaat bergabung dengan KUD." light />
          <div className="relative max-w-4xl mx-auto">
            <motion.div key={testiIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                {TESTIMONI[testiIdx].nama.charAt(0)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < TESTIMONI[testiIdx].rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                ))}
              </div>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium italic">"{TESTIMONI[testiIdx].quote}"</p>
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
      <section id="layanan" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kontak" title="Layanan & Dukungan" subtitle="Hubungi kami melalui berbagai saluran yang tersedia." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LAYANAN.map((item, idx) => {
              const Icn = item.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all text-center group">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Icn className="w-7 h-7 text-primary" /></div>
                  <h4 className="font-bold font-heading text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                  <p className="text-sm font-semibold text-primary mt-3">{item.contact}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Tanya Jawab" title="Pertanyaan Umum" subtitle="Temukan jawaban atas pertanyaan yang sering diajukan tentang KUD Desa Sari Subur." />
          <div className="space-y-3">
            {FAQ_DATA.map((faq, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} className="w-full flex items-center justify-between p-4 md:p-5 text-left">
                  <span className="font-medium text-foreground text-sm md:text-base pr-4">{faq.q}</span>
                  <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-muted-foreground leading-relaxed border-t border-gray-50 pt-3">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Lokasi" title="Temukan Kami" subtitle="Kunjungi kantor KUD Desa Sari Subur untuk informasi lebih lanjut." />
        </div>
        <MapSection />
      </section>

      {/* ===== NEWSLETTER CTA ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.2),transparent_60%)]" />
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 max-w-md mx-auto flex gap-3">
            <input type="email" placeholder="Masukkan email Anda" className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 backdrop-blur-sm" />
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold shadow-xl hover:shadow-2xl transition-all text-sm">Langganan</motion.button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-foreground text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">K</div>
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
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-4 md:right-6 z-40 w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center">
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
    </>
  );
}
