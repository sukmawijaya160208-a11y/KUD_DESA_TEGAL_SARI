'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogo } from '@/hooks/useLogo';
import Timeline from '@/components/Timeline';
import KegiatanGallery from '@/components/KegiatanGallery';
import TeamSection from '@/components/TeamSection';
import MapSection from '@/components/MapSection';
import {
  Squares2X2Icon, InformationCircleIcon, ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon, NewspaperIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const logoUrl = useLogo();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [testiIdx, setTestiIdx] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef(null);
  const heroTextRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(!!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroTextVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  };
  const heroItemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  useEffect(() => {
    const t = setInterval(() => setTestiIdx((i) => (i + 1) % 3), 4500);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const NAV_LINKS = [
    { label: 'Fitur', href: '#fitur', icon: Squares2X2Icon },
    { label: 'Tentang', href: '#tentang', icon: InformationCircleIcon },
    { label: 'Testimoni', href: '#testimoni', icon: ChatBubbleLeftRightIcon },
    { label: 'FAQ', href: '#faq', icon: QuestionMarkCircleIcon },
    { label: 'Blog', href: '/blog', icon: NewspaperIcon, external: true },
  ];
  const testiData = [
    { q: 'Aplikasi ini sangat membantu saya mendaftar program PSR tanpa harus bolak-balik ke kantor KUD. Prosesnya cepat dan transparan!', n: 'Sutarno', r: 'Pekebun Sawit, Muara Kelingi' },
    { q: 'Saya bisa pantau harga TBS setiap hari dan catat hasil panen langsung dari HP. Ini yang saya butuhkan sebagai pekebun modern.', n: 'Kartini', r: 'Pekebun Sawit, Megang Sakti' },
    { q: 'Dulu verifikasi data butuh waktu berminggu-minggu. Sekarang cukup upload dari rumah, 2 hari sudah terverifikasi. Mantab!', n: 'Bambang', r: 'Pekebun Sawit, Tugu Sari' },
  ];
  const faqData = [
    { q: 'Apa itu KUD Desa Sari Subur?', a: 'KUD (Koperasi Unit Desa) Sari Subur adalah lembaga koperasi yang bergerak di bidang perkebunan kelapa sawit, melayani pekebun di Kecamatan Megang Sakti dan sekitarnya dalam pengelolaan lahan, program PSR, dan pemasaran TBS.' },
    { q: 'Siapa yang bisa mendaftar jadi anggota?', a: 'Setiap pekebun kelapa sawit yang berdomisili di wilayah Kecamatan Megang Sakti, Kabupaten Musi Rawas, dan sekitarnya dapat mendaftar menjadi anggota KUD dengan melengkapi data diri, KTP, KK, dan dokumen pendukung lainnya.' },
    { q: 'Apa itu Program PSR?', a: 'PSR (Peremajaan Sawit Rakyat) adalah program pemerintah untuk meremajakan tanaman sawit pekebun yang sudah tua atau tidak produktif. KUD membantu pekebun dalam proses pendaftaran, verifikasi, dan pencairan bantuan.' },
    { q: 'Bagaimana cara cek harga TBS terkini?', a: 'Harga TBS (Tandan Buah Segar) diperbarui secara berkala oleh KUD dan dapat diakses melalui aplikasi di menu Harga TBS. Harga dibedakan berdasarkan kelas mutu A, B, dan C sesuai standar yang berlaku.' },
    { q: 'Apakah data saya aman di aplikasi ini?', a: 'Ya, seluruh data pribadi Anda dilindungi dengan enkripsi SSL dan hanya digunakan untuk keperluan administrasi KUD. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa persetujuan.' },
  ];

  const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } };
  function Counter({ v, s, l, color, icon, delay: d }) {
    const [c, setC] = useState(0);
    const ref = useRef(null);
    const counted = useRef(false);
    const icons = {
      UserGroupIcon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
      MapPinIcon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
      ClipboardDocumentListIcon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
      ChartBarIcon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
      BuildingOfficeIcon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
      CalendarDaysIcon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' };
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !counted.current) {
          counted.current = true;
          const steps = 40;
          const inc = v / steps;
          let cur = 0;
          const t = setInterval(() => {
            cur += inc;
            if (cur >= v) { setC(v); clearInterval(t); }
            else setC(Math.floor(cur));
          }, 2000 / steps);
        }
      }, { threshold: 0.5 });
      obs.observe(el);
      return () => obs.disconnect();
    }, [v]);
    return (
      <motion.div ref={ref} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: d }}>
        <div className={'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ' + color}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
          </svg>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white mb-1 font-heading">{c.toLocaleString()}{s}</div>
        <div className="text-white/50 text-xs uppercase tracking-wider">{l}</div>
        <motion.div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
          <motion.div className={'h-full rounded-full ' + color.replace('/80', '')} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 + d }} style={{ transformOrigin: 'left' }} />
        </motion.div>
      </motion.div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ' + (scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-border/50' : 'bg-transparent')}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 cursor-pointer"
            >
              <motion.div whileHover={{ rotate: 5 }}
                className={'flex items-center justify-center overflow-hidden transition-all h-10 max-w-[160px] rounded-lg ' + (scrolled ? 'bg-white shadow-sm px-1' : 'bg-white/15 backdrop-blur-sm px-0.5')}
              >
                {logoUrl ? <img src={logoUrl} alt="KUD Desa Sari Subur" className="h-full w-auto max-h-10 object-contain" /> : <span className="font-heading font-bold text-lg text-white px-2">K</span>}
              </motion.div>
              <span className={'font-heading font-bold tracking-tight transition-colors ' + (scrolled ? 'text-foreground' : 'text-white')}>KUD Sari Subur</span>
            </motion.button>
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label}
                    onClick={() => item.external ? router.push(item.href) : scrollTo(item.href.replace('#', ''))}
                    className={'group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ' + (scrolled ? 'text-gray-600 hover:text-foreground hover:bg-gray-100/50' : 'text-white/70 hover:text-white hover:bg-white/10')}
                  >
                    <Icon className={'w-4 h-4 transition-transform duration-200 ' + (scrolled ? 'group-hover:rotate-6' : 'group-hover:rotate-6')} />
                    {item.label}
                    {item.external && (
                      <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Mobile hamburger */}
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className={'md:hidden p-2 rounded-lg transition-colors cursor-pointer ' + (scrolled ? 'text-foreground hover:bg-gray-100' : 'text-white hover:bg-white/10')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </motion.button>
            {/* Mobile drawer */}
            <div className="flex items-center gap-3">
              {loggedIn ? (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/login')}
                  className={'px-5 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer ' + (scrolled ? 'bg-primary text-white hover:bg-primary-dark shadow-sm' : 'bg-white text-primary hover:bg-gray-100 shadow-lg')}>
                  Dashboard
                </motion.button>
              ) : (
                <>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/login')}
                    className={'px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-all cursor-pointer ' + (scrolled ? 'text-gray-600 hover:text-foreground' : 'text-white/80 hover:text-white')}>
                    Masuk
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => router.push('/login')}
                    className={'px-3.5 lg:px-5 py-1.5 lg:py-2 rounded-xl font-semibold text-xs lg:text-sm transition-all cursor-pointer ' + (scrolled ? 'bg-primary text-white hover:bg-primary-dark shadow-sm' : 'bg-white text-primary hover:bg-gray-100 shadow-lg')}>
                    Daftar
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile drawer overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" />
          )}
        </AnimatePresence>
        {/* Mobile drawer */}
        <motion.div initial={{ x: '100%' }} animate={{ x: mobileOpen ? 0 : '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-white/95 backdrop-blur-xl border-l border-border shadow-2xl md:hidden">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" /> : <span className="font-heading font-bold text-sm text-white">K</span>}
                </div>
                <span className="font-heading font-bold text-foreground text-sm">KUD Sari Subur</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {NAV_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label}
                    onClick={() => {
                      if (item.external) { router.push(item.href); setMobileOpen(false); }
                      else { scrollTo(item.href.replace('#', '')); setMobileOpen(false); }
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-foreground font-medium text-sm hover:bg-primary/5 hover:text-primary transition-all cursor-pointer flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4 text-primary/60" />
                    {item.label}
                    {item.external && (
                      <svg className="w-3 h-3 ml-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-border space-y-2">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { router.push('/login'); setMobileOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm cursor-pointer shadow-sm">
                Daftar / Masuk
              </motion.button>
              <p className="text-center text-[10px] text-gray-400">KUD Desa Sari Subur &copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </motion.div>
      </motion.nav>
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full opacity-[0.03]" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 450 Q 360 200, 720 450 T 1440 450" stroke="white" strokeWidth="0.5" />
            <path d="M0 500 Q 360 250, 720 500 T 1440 500" stroke="white" strokeWidth="0.3" />
            <path d="M0 400 Q 360 650, 720 400 T 1440 400" stroke="white" strokeWidth="0.3" />
          </svg>
        </div>
        <div className="absolute rounded-full bg-emerald-500/20 top-10 left-10 w-72 h-72 opacity-20 animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute rounded-full bg-kud-gold/10 top-1/3 right-10 w-56 h-56 opacity-20 animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute rounded-full bg-emerald-500/15 bottom-1/4 left-1/3 w-44 h-44 opacity-15 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute rounded-full bg-kud-gold/10 bottom-10 right-1/4 w-64 h-64 opacity-15 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 pt-24 pb-14">
          <motion.div ref={heroTextRef} variants={heroTextVariants} initial="hidden" animate="visible" className="text-center">
            <motion.div variants={heroItemVariants}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm mb-6 border border-white/10 mx-auto w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Koperasi Unit Digital — Kab. Musi Rawas
            </motion.div>
            <motion.h1 variants={heroItemVariants} className="font-heading font-bold text-white leading-tight mb-6 max-w-5xl mx-auto">
              <span className="inline-block text-3xl md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-primary-light to-blue-300 bg-clip-text text-transparent">
                  KOLABORASI MULTI-PIHAK
                </span>
              </span>
              <span className="block text-2xl md:text-4xl lg:text-5xl mt-2 text-white/90">
                MENUJU TATA KELOLA PERKEBUNAN SAWIT YANG BAIK DAN BERKELANJUTAN
              </span>
            </motion.h1>
            <motion.p variants={heroItemVariants} className="text-base md:text-lg text-white/50 max-w-4xl mx-auto mb-6 leading-relaxed">
              KUD Sari Subur Kab. Musi Rawas Berkolaborasi dengan multi pihak dalam pengelolaan
              data anggota, lahan sawit, program PSR, dan hasil panen TBS secara digital menuju
              perkebunan jaya.
            </motion.p>

            {/* Value proposition row */}
            <motion.div variants={heroItemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-2xl mx-auto">
              {[
                { icon: 'M3.75 9h16.5m-16.5 6h16.5M4.5 3h15a1.5 1.5 0 011.5 1.5v15A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V4.5A1.5 1.5 0 014.5 3z', t: 'Daftar Program', d: 'PSR, Intensifikasi & Beasiswa' },
                { icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', t: 'Pantau Harga', d: 'Update TBS real-time per kelas' },
                { icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', t: 'Kelola Lahan', d: 'Data sawit lengkap & dokumen digital' },
              ].map((v, idx) => (
                <motion.div key={idx} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-white text-sm font-semibold">{v.t}</p>
                    <p className="text-white/40 text-xs">{v.d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
              <motion.button whileHover={{ scale: 1.04, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} whileTap={{ scale: 0.96 }}
                onClick={() => router.push('/login')}
                className="px-8 py-3.5 bg-white text-primary rounded-xl font-heading font-bold text-lg hover:bg-gray-100 transition-all shadow-xl shadow-black/10 inline-flex items-center gap-2 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v-1m0 0a3 3 0 00-3-3m3 3a3 3 0 013 3v1m-7 3.75c-1.688 0-3.75.75-3.75 2.25v.75h7.5V12c0-1.5-2.062-2.25-3.75-2.25zM3.75 9h1.5m-1.5 3h1.5m-1.5 3h1.5m12.75-6h1.5m-1.5 3h1.5m-1.5 3h1.5M5.625 21h12.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H5.625A2.25 2.25 0 003.375 7.5v11.25A2.25 2.25 0 005.625 21z" /></svg>
                Daftar Jadi Pekebun
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => scrollTo('tentang')}
                className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm cursor-pointer">
                Pelajari Lebih Lanjut
              </motion.button>
            </motion.div>

            <motion.div variants={heroItemVariants} className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8">
              <span className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Mitra & Dukungan</span>
              {['Kemdikbud', 'Kementan', 'BPDPKS', 'Dinas Perkebunan', 'Pemda Mura'].map((m) => (
                <span key={m} className="text-white/20 hover:text-white/50 transition-colors font-medium text-sm tracking-wide">{m}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      <KegiatanGallery />

      <section id="keuntungan" className="py-14 lg:py-20 bg-muted/50 px-6 lg:px-12 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-4">KEUNTUNGAN</span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              Kenapa <span className="text-accent">Bergabung</span> dengan KUD?
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              Nikmati berbagai kemudahan dan keuntungan dengan menjadi anggota aktif KUD Desa Sari Subur.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', title: 'Pendaftaran Mudah', desc: 'Daftar online dalam 2 menit, upload dokumen langsung dari HP. Tanpa antri, tanpa ribet.', color: 'from-blue-500 to-blue-600' },
              { icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Verifikasi Cepat', desc: 'Dokumen diverifikasi dalam 1-2 hari kerja. Pantau status verifikasi secara real-time.', color: 'from-emerald-500 to-emerald-600' },
              { icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', title: 'Pantau Harga TBS', desc: 'Update harga TBS harian per kelas mutu. Dapatkan notifikasi setiap ada perubahan harga.', color: 'from-amber-500 to-amber-600' },
              { icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Program Bantuan', desc: 'Akses program PSR, Intensifikasi, Ekstensifikasi, dan beasiswa untuk pekebun dan keluarga.', color: 'from-violet-500 to-violet-600' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                className="bg-white rounded-2xl border border-border p-6 text-center hover:border-accent/20 transition-all duration-300 group relative overflow-hidden">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-foreground text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="tentang" className="py-14 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24">
        <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">TENTANG KUD</span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
            Koperasi <span className="text-primary">Modern</span> untuk Pekebun Sawit
          </h2>
          <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
            KUD Desa Sari Subur didirikan pada tahun 2010 dengan tujuan meningkatkan kesejahteraan pekebun sawit
            di Kecamatan Megang Sakti melalui pelayanan koperasi yang transparan, profesional, dan berbasis teknologi.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div initial={{ x: -30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-border p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary-light rounded-l-2xl" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/[0.03] rounded-full blur-2xl" />
            <h3 className="font-heading font-bold text-foreground text-lg mb-4 flex items-center gap-2 relative">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Sejarah Singkat
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 relative">
              Berawal dari perkumpulan pekebun sawit binaan CV. Sumatera Multi Jaya, KUD Desa Sari Subur resmi
              berdiri pada 12 Juli 2010. Dengan modal awal 50 anggota, koperasi ini terus berkembang hingga kini
              memiliki lebih dari 1.250 anggota aktif.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed relative">
              Sejak 2025, KUD bertransformasi digital dengan meluncurkan sistem informasi terpadu untuk
              memudahkan anggota dalam mengakses layanan koperasi — dari pendaftaran program PSR,
              pencatatan hasil panen TBS, hingga informasi harga terkini.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { t: 'Visi', d: 'Menjadi koperasi sawit terdepan di Sumatera Selatan yang mandiri, profesional, dan berkelanjutan.', c: 'bg-blue-50 border-blue-100', ic: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
              { t: 'Misi 1', d: 'Meningkatkan kesejahteraan anggota melalui layanan koperasi yang transparan dan berkeadilan.', c: 'bg-green-50 border-green-100', ic: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { t: 'Misi 2', d: 'Mengembangkan sistem digital untuk efisiensi pengelolaan data, program, dan hasil panen anggota.', c: 'bg-amber-50 border-amber-100', ic: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ x: 30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className={'rounded-xl border p-4 flex items-start gap-3 ' + item.c}>
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ' + (i === 0 ? 'bg-blue-200' : i === 1 ? 'bg-green-200' : 'bg-amber-200')}>
                  <svg className={'w-4 h-4 ' + (i === 0 ? 'text-blue-700' : i === 1 ? 'text-green-700' : 'text-amber-700')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.ic} />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-0.5">{item.t}</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: 'Gotong Royong', d: 'Bekerja bersama untuk kemajuan pekebun dan koperasi.', icon: 'M12 21v-6m0 0l-3-3m3 3l3-3m-6-3a3 3 0 100-6 3 3 0 000 6zm9 0a3 3 0 100-6 3 3 0 000 6z' },
            { t: 'Transparansi', d: 'Seluruh informasi dikelola secara terbuka dan dapat diakses anggota.', icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { t: 'Profesional', d: 'Pelayanan prima dengan standar mutu dan teknologi terkini.', icon: 'M11.42 15.17l-5.1 2.51 2.51-5.1m0 0l5.1-2.51-2.51 5.1m0 0l-5.1 5.1 2.51 5.1 5.1-2.51m0-5.1l5.1-2.51-2.51 5.1' },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(37,99,235,0.08)' }}
              className="bg-white rounded-xl border border-border p-6 text-center hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-foreground text-base mb-2">{item.t}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{item.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <Timeline />

      <section className="py-14 lg:py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 rounded-full text-xs font-semibold mb-4 border border-white/10">CAPAIAN KAMI</span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
              KUD dalam <span className="text-primary-light">Angka</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Selama lebih dari 15 tahun melayani pekebun sawit, berikut capaian yang telah kami raih bersama.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { v: 1250, s: '+', l: 'Pekebun', icon: 'UserGroupIcon', color: 'bg-blue-500/80', d: 0 },
              { v: 48, s: '', l: 'Program Aktif', icon: 'ClipboardDocumentListIcon', color: 'bg-emerald-500/80', d: 0.1 },
              { v: 3200, s: '+', l: 'Lahan (Ha)', icon: 'MapPinIcon', color: 'bg-amber-500/80', d: 0.2 },
              { v: 8500, s: '+', l: 'TBS Tercatat', icon: 'ChartBarIcon', color: 'bg-violet-500/80', d: 0.3 },
              { v: 5, s: '', l: 'Desa Binaan', icon: 'BuildingOfficeIcon', color: 'bg-rose-500/80', d: 0.4 },
              { v: 15, s: '+', l: 'Tahun Berdiri', icon: 'CalendarDaysIcon', color: 'bg-cyan-500/80', d: 0.5 },
            ].map((s) => <Counter key={s.l} {...s} />)}
          </div>
        </div>
      </section>
      <section id="fitur" className="py-14 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24">
        <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">FITUR UNGGULAN</span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
            Semua Kebutuhan <span className="text-primary">Dalam Satu Aplikasi</span>
          </h2>
          <p className="text-gray-500 max-w-3xl mx-auto">
            Nikmati kemudahan mengelola data pekebun, lahan, program KUD, dan hasil panen TBS
            secara digital — kapan saja, di mana saja.
          </p>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { t: 'Data Pekebun', d: 'Kelola profil lengkap anggota dengan upload KTP, KK, foto, dan status verifikasi.', color: 'bg-blue-500', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', bullets: ['Upload dokumen otomatis', 'Status verifikasi real-time', 'Riwayat perubahan data'], popular: true },
            { t: 'Program KUD', d: 'Daftar dan ikuti program PSR, Intensifikasi, Ekstensifikasi, dan beasiswa.', color: 'bg-emerald-500', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z', bullets: ['Pendaftaran online', 'Pantau status verifikasi', 'Notifikasi program baru'] },
            { t: 'Harga TBS', d: 'Update harga TBS per kelas mutu dengan periode berlaku dan riwayat perubahan.', color: 'bg-amber-500', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bullets: ['Kelas A/B/C otomatis', 'Grafik riwayat harga', 'Notifikasi perubahan'] },
            { t: 'Sinkron TBS', d: 'Catat hasil panen Tandan Buah Segar secara real-time.', color: 'bg-violet-500', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', bullets: ['Input panen harian', 'Riwayat per periode', 'Rekap bulanan otomatis'] },
            { t: 'Data Lahan', d: 'Kelola data lahan sawit dengan luas, lokasi, status kepemilikan, dan dokumen.', color: 'bg-rose-500', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', bullets: ['Peta lokasi lahan', 'Upload surat tanah', 'Status verifikasi lahan'] },
            { t: 'Laporan & Dashboard', d: 'Pantau seluruh aktivitas melalui dashboard interaktif dan laporan berkala.', color: 'bg-cyan-500', icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605', bullets: ['Dashboard peran (Admin/Pekebun)', 'Cetak laporan PDF', 'Grafik dan statistik'] },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants}
              onMouseMove={(e) => { const c = e.currentTarget; const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${y * -6}deg) translateY(-6px)`; c.style.boxShadow = '0 16px 32px rgba(37,99,235,0.08)'; }}
              onMouseLeave={(e) => { const c = e.currentTarget; c.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0)'; c.style.boxShadow = ''; }}
              className={'relative bg-white rounded-2xl border border-border p-5 hover:border-primary/20 transition-all duration-300 cursor-default ' + (i === 5 ? 'md:col-span-2 lg:col-span-1' : '')}>
              {item.popular && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-primary to-primary-light text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  Populer
                </div>
              )}
              <div className={'w-11 h-11 rounded-xl ' + item.color + ' flex items-center justify-center shadow-sm'}>
                <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-foreground text-base mt-3 mb-1.5">{item.t}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">{item.d}</p>
              <ul className="space-y-1">
                {item.bullets.map((b, j) => (
                  <motion.li key={j} initial={{ x: -10, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 * j }}
                    className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {b}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section id="cara-kerja" className="py-14 lg:py-20 bg-muted/50 px-6 lg:px-12 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-4">CARA KERJA</span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              Mulai Dalam <span className="text-accent">3 Langkah Mudah</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Daftar akun, lengkapi data lahan, dan ikuti program KUD — semua dari satu akun,
              tanpa perlu antre di kantor.
            </p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: '1', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', title: 'Daftar Akun', desc: 'Buat akun pekebun dengan mengisi data diri lengkap — nama, email, password, dan informasi pribadi. Proses pendaftaran hanya memakan waktu 2-3 menit.' },
              { num: '2', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', title: 'Lengkapi Data', desc: 'Input data lahan sawit, upload dokumen KTP, KK, surat tanah, dan foto. Dokumen akan diverifikasi oleh tim KUD dalam waktu 1-2 hari kerja.' },
              { num: '3', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Ikuti Program', desc: 'Pilih program KUD yang tersedia — PSR, Intensifikasi, Ekstensifikasi, atau beasiswa. Pantau status pendaftaran dan verifikasi secara real-time.' },
            ].map((step, idx) => (
              <motion.div key={step.num} variants={itemVariants} whileHover={{ y: -6 }} className="relative text-center">
                {idx < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-gray-300" />}
                <motion.div whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold font-heading shadow-lg shadow-accent/20">
                  {step.num}
                </motion.div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <TeamSection />

      <section id="testimoni" className="py-14 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24">
        <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-4">TESTIMONI</span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
            Apa Kata <span className="text-accent">Pekebun</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Dengarkan langsung pengalaman pekebun yang telah merasakan manfaat layanan digital KUD.
          </p>
        </motion.div>
         <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 rounded-[2rem] blur-3xl -z-10" />
          <AnimatePresence mode="wait">
            <motion.div
              key={testiIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-white rounded-2xl border border-border p-8 md:p-10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40" />
              <svg className="w-8 h-8 text-accent/30 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.405-.644-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.405-.644-2.917-1.179z" /></svg>
              <div className="flex items-center justify-center gap-0.5 mb-4">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed italic mb-6">&ldquo;{testiData[testiIdx].q}&rdquo;</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">{testiData[testiIdx].n[0]}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">{testiData[testiIdx].n}</p>
                  <p className="text-gray-400 text-xs">{testiData[testiIdx].r}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <button key={i} onClick={() => setTestiIdx(i)}
                className={'rounded-full transition-all duration-300 cursor-pointer ' + (i === testiIdx ? 'bg-accent w-6 h-2.5' : 'bg-gray-300 w-2 h-2 hover:bg-gray-400')} />
            ))}
          </div>
        </div>
      </section>
      <section id="faq" className="py-14 lg:py-20 px-6 lg:px-12 max-w-3xl mx-auto scroll-mt-24">
        <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">FAQ</span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
            Pertanyaan <span className="text-primary">Umum</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan yang sering diajukan tentang layanan KUD.
          </p>
        </motion.div>
        <div className="space-y-3">
          {faqData.map((item, i) => (
            <motion.div key={i} initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className={'bg-white rounded-2xl border overflow-hidden transition-all duration-300 ' + (faqOpen === i ? 'border-primary/30 shadow-sm' : 'border-border')}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center gap-3 p-5 text-left cursor-pointer">
                <span className={'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ' + (faqOpen === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold text-foreground text-sm flex-1">{item.q}</span>
                <motion.div animate={{ rotate: faqOpen === i ? 45 : 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                  <svg className={'w-4 h-4 shrink-0 ' + (faqOpen === i ? 'text-primary' : 'text-gray-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </motion.div>
              </button>
              <AnimatePresence>
                {faqOpen === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                    <div className="h-px bg-primary/10 mx-5" />
                    <p className="px-5 pb-5 pt-4 text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="py-14 lg:py-20 bg-gradient-to-br from-emerald-800 to-emerald-950 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 border border-white/10">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25" />
            </svg>
          </motion.div>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">
            Siap Bergabung dengan{' '}
            <span className="text-primary-light">KUD Desa Sari Subur</span>?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed">
            Lebih dari <strong className="text-white">1.250 pekebun</strong> telah merasakan manfaat layanan digital KUD.
            Daftar sekarang dan nikmati kemudahan mengelola lahan sawit, mengikuti program, dan memantau
            harga TBS dari genggaman Anda.
          </p>
          <motion.div whileHover={{ boxShadow: '0 0 40px rgba(255,255,255,0.2)' }}
            className="inline-block rounded-2xl p-[1px] bg-gradient-to-r from-primary-light to-blue-300 mb-4">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/login')}
              className="px-8 py-3.5 bg-white text-primary rounded-2xl font-heading font-bold text-lg hover:bg-gray-50 transition-all inline-flex items-center gap-2 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v-1m0 0a3 3 0 00-3-3m3 3a3 3 0 013 3v1m-7 3.75c-1.688 0-3.75.75-3.75 2.25v.75h7.5V12c0-1.5-2.062-2.25-3.75-2.25zM3.75 9h1.5m-1.5 3h1.5m-1.5 3h1.5m12.75-6h1.5m-1.5 3h1.5m-1.5 3h1.5M5.625 21h12.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H5.625A2.25 2.25 0 003.375 7.5v11.25A2.25 2.25 0 005.625 21z" />
              </svg>
              Daftar Sekarang — Gratis
            </motion.button>
          </motion.div>
          <p className="text-white/40 text-xs">Tidak perlu kartu kredit • Verifikasi cepat • Dukungan WhatsApp 24/7</p>
        </motion.div>
      </section>
      <MapSection />

      <footer className="bg-slate-900 border-t border-white/5 px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 max-w-[160px] rounded-lg bg-white/10 flex items-center justify-center overflow-hidden px-1">
                  {logoUrl ? <img src={logoUrl} alt="KUD Desa Sari Subur" className="h-full w-auto max-h-10 object-contain" /> : <span className="font-heading font-bold text-white text-lg px-2">K</span>}
                </div>
                <span className="font-heading font-bold text-white">KUD Sari Subur</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed mb-4 max-w-xs">
                Koperasi Unit Digital yang melayani pekebun sawit di Kabupaten Musi Rawas, Sumatera Selatan.
              </p>
              <div className="flex gap-2">
                {['M16.5 6v3m0 0v3m0-3h3m-3 0h-3m-2.25-3c.125 0 .25-.007.375-.018a9.058 9.058 0 01.9 7.428 9.026 9.026 0 01-1.295 2.44l-.273.387a9.032 9.032 0 01-3.815 2.976l-.334.133a9.028 9.028 0 01-7.447-.189l-.26-.125A9.061 9.061 0 012.25 6.75H3m5.25 0a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM12.75 3.75h.008v.008h-.008V3.75z', 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'].map((icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            {[
              { t: 'Layanan', l: ['Data Pekebun', 'Program KUD', 'Harga TBS', 'Sinkron TBS', 'Data Lahan'] },
              { t: 'Program', l: ['PSR', 'Intensifikasi', 'Ekstensifikasi', 'Beasiswa', 'Kemitraan'] },
              { t: 'Bantuan', l: ['Pusat Bantuan', 'FAQ', 'Hubungi Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan'] },
            ].map((col) => (
              <div key={col.t}>
                <h4 className="font-heading font-bold text-white text-sm mb-4">{col.t}</h4>
                <ul className="space-y-2.5">
                  {col.l.map((link) => (
                    <li key={link}><a href="#" className="text-gray-500 text-xs hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} KUD Desa Sari Subur — CV. Sumatera Multi Jaya. All rights reserved.
            </p>
            <p className="text-gray-600 text-[10px]">
              Developer: M. Sukma Wijaya | UX Designer: Dedek Sulaiman
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
