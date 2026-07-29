'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogo } from '@/hooks/useLogo';
import { api } from '@/lib/api';
import MapSection from '@/components/MapSection';
import Modal from '@/components/ui/Modal';
import Hero3DScene from '@/components/Hero3DScene';
import HargaTbsWidget from '@/components/HargaTbsWidget';

import {
  LayoutGrid, MessageCircle, CircleHelp, Newspaper,
  Phone, CalendarDays, MapPin, GraduationCap,
  ShieldCheck, Hand, DollarSign, BarChart3,
  BadgeCheck, FileText, Globe, Bell, Folder,
  Building2, Image, Video, ClipboardList,
  Building,
} from 'lucide-react';

import { AnimateIcon } from '@/components/animate-ui/icons/icon';

import { ArrowRightIcon } from '@/components/animate-ui/icons/arrow-right';
import { ChevronDownIcon } from '@/components/animate-ui/icons/chevron-down';
import { MenuIcon } from '@/components/animate-ui/icons/menu';
import { XIcon } from '@/components/animate-ui/icons/x';
import { PlayIcon } from '@/components/animate-ui/icons/play';
import { UsersIcon as UserGroupIcon } from '@/components/animate-ui/icons/users';
import { HeartIcon } from '@/components/animate-ui/icons/heart';
import { StarIcon } from '@/components/animate-ui/icons/star';
import { SearchIcon } from '@/components/animate-ui/icons/search';
import { SparklesIcon } from '@/components/animate-ui/icons/sparkles';
import { ArrowUpIcon } from '@/components/animate-ui/icons/arrow-up';
import { ChevronLeftIcon } from '@/components/animate-ui/icons/chevron-left';
import { ChevronRightIcon } from '@/components/animate-ui/icons/chevron-right';

const easeSmooth = [0.16, 1, 0.3, 1];
const easeSpring = { type: 'spring', stiffness: 260, damping: 28 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeSmooth } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeSmooth } },
};

const HERO_STYLES_BLOCK = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .bg-gradient-hero {
    background: linear-gradient(-45deg, #064E3B, #065F46, #0F766E, #115E59);
    background-size: 400% 400%;
    animation: gradientShift 12s ease infinite;
  }
`;

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

const JENIS_ICON = {
  PSR: GraduationCap,
  Intensifikasi: BarChart3,
  Ekstensifikasi: Globe,
  'Pelatihan SDMPKS': GraduationCap,
  'Beasiswa SDMPKS': GraduationCap,
  Kemitraan: Hand,
};

const JENIS_COLORS = {
  PSR: { bg: 'bg-indigo-50', icon: 'text-indigo-600', card: 'indigo' },
  Intensifikasi: { bg: 'bg-blue-50', icon: 'text-blue-600', card: 'blue' },
  Ekstensifikasi: { bg: 'bg-teal-50', icon: 'text-teal-600', card: 'teal' },
  'Pelatihan SDMPKS': { bg: 'bg-amber-50', icon: 'text-amber-600', card: 'amber' },
  'Beasiswa SDMPKS': { bg: 'bg-rose-50', icon: 'text-rose-600', card: 'rose' },
  Kemitraan: { bg: 'bg-emerald-50', icon: 'text-emerald-600', card: 'emerald' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-50', icon: 'text-gray-600', card: 'gray' };

const BLOG_CATEGORIES = ['Semua', 'Pelatihan', 'Sosial', 'Pendidikan'];

const ICON_MAP = {
  DocumentTextIcon: FileText,
  FolderIcon: Folder,
  ShieldCheckIcon: ShieldCheck,
  HandRaisedIcon: Hand,
  UserGroupIcon: UserGroupIcon,
  CheckBadgeIcon: BadgeCheck,
  CurrencyDollarIcon: DollarSign,
  AcademicCapIcon: GraduationCap,
  ChartBarIcon: BarChart3,
  GlobeAltIcon: Globe,
  StarIcon: StarIcon,
  PhoneIcon: Phone,
  MapPinIcon: MapPin,
  ChatBubbleLeftRightIcon: MessageCircle,
  Squares2X2Icon: LayoutGrid,
  CalendarDaysIcon: CalendarDays,
  BellAlertIcon: Bell,
  BuildingOfficeIcon: Building2,
  ArrowRightIcon: ArrowRightIcon,
  HeartIcon: HeartIcon,
  PlayIcon: PlayIcon,
  NewspaperIcon: Newspaper,
  QuestionMarkCircleIcon: CircleHelp,
  PhotoIcon: Image,
  VideoCameraIcon: Video,
  SparklesIcon: SparklesIcon,
  ClipboardDocumentListIcon: ClipboardList,
  BuildingOffice2Icon: Building,
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
    <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
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
    <div ref={ref} className="text-center transform-gpu">
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-primary">{prefix}{count.toLocaleString()}{suffix}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgramModal({ program, onClose }) {
  const router = useRouter();
  const colors = JENIS_COLORS[program?.jenis] || DEFAULT_COLOR;
  const Icon = JENIS_ICON[program?.jenis] || LayoutGrid;
  return (
    <AnimatePresence>
      {program && (
        <motion.div key={program.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} transition={{ type: 'spring', damping: 25 }} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden border border-white/50 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent pointer-events-none" />
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 transition-colors shadow-sm"><XIcon className="w-5 h-5" /></button>
            <div className="relative z-10 flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shadow-sm`}><Icon className={`w-7 h-7 ${colors.icon}`} /></div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-foreground">{program.nama}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">{program.jenis}</span>
              </div>
            </div>
            <p className="relative z-10 text-muted-foreground mb-5 leading-relaxed">{program.deskripsi}</p>

            {program.foto?.length > 0 && (
              <div className="relative z-10 flex gap-2 overflow-x-auto pb-2 mb-5">
                {program.foto.map((url, idx) => (
                  <img key={idx} src={url} alt={`${program.nama} ${idx + 1}`} className="w-32 h-24 rounded-xl object-cover flex-shrink-0 border border-white/40 shadow-sm" loading="lazy" />
                ))}
              </div>
            )}

            <div className="relative z-10 grid grid-cols-2 gap-3 mb-5">
              {program.tanggal_mulai && (
                <div className="p-3 rounded-xl bg-gray-50/80 border border-white/40">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mulai</div>
                  <div className="text-sm font-medium text-foreground">{new Date(program.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              )}
              {program.tanggal_selesai && (
                <div className="p-3 rounded-xl bg-gray-50/80 border border-white/40">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Selesai</div>
                  <div className="text-sm font-medium text-foreground">{new Date(program.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              )}
              {program.kuota && (
                <div className="p-3 rounded-xl bg-gray-50/80 border border-white/40">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Kuota</div>
                  <div className="text-sm font-medium text-foreground">{program.kuota} orang</div>
                </div>
              )}
            </div>

            {program.persyaratan?.length > 0 && (
              <div className="relative z-10 mb-5">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Folder className="w-4 h-4 text-primary" /> Persyaratan</h4>
                <ul className="space-y-2">
                  {program.persyaratan.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-[10px] font-bold mt-0.5">{idx + 1}</span>
                      <span className="text-sm text-foreground/80 capitalize">{s.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {program.manfaat?.length > 0 && (
              <div className="relative z-10 mb-5">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500" /> Manfaat Program</h4>
                <ul className="space-y-2">
                  {program.manfaat.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-[10px] font-bold mt-0.5 shadow-sm">{idx + 1}</span>
                      <span className="text-sm text-foreground/80">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/login')} className="relative z-10 mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/30">Daftar Program</motion.button>
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
            <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors border border-white/20"><XIcon className="w-5 h-5" /></button>
            <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroDecorativeVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative z-10 flex items-center justify-center">
        <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-emerald-400/20 via-emerald-300/10 to-teal-400/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br from-emerald-500/30 via-emerald-400/20 to-teal-500/30 border border-white/20 flex items-center justify-center shadow-2xl shadow-emerald-500/20 overflow-hidden p-2">
            <img src="/logo-hero.png" alt="KUD Sari Subur" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>
      </div>
      <motion.div className="absolute -top-3 -right-3 w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400/20 to-transparent border border-white/10 backdrop-blur-sm flex items-center justify-center"
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <LeafIcon className="w-6 h-6 text-emerald-300/60" />
      </motion.div>
      <motion.div className="absolute -bottom-2 -left-5 w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400/20 to-transparent border border-white/10 backdrop-blur-sm flex items-center justify-center"
        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
        <LeafIcon className="w-5 h-5 text-teal-300/60" />
      </motion.div>
    </div>
  );
}

function LeafIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C12 2 12 12 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 4C16 6 18 10 18 14C18 16 16 18 14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M12 4C8 6 6 10 6 14C6 16 8 18 10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M8 23L16 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
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
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [showBackTop, setShowBackTop] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [videos, setVideos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [layananData, setLayananData] = useState([]);
  const [mitraData, setMitraData] = useState([]);
  const [langkah, setLangkah] = useState([]);
  const [sertifikasi, setSertifikasi] = useState([]);
  const [keuntungan, setKeuntungan] = useState([]);
  const [fiturData, setFiturData] = useState([]);
  const [angkaData, setAngkaData] = useState([]);
  const [dokumentasiData, setDokumentasiData] = useState([]);
  const [sertifikasiDetail, setSertifikasiDetail] = useState(null);
  const [pengaturan, setPengaturan] = useState({});
  const [heroData, setHeroData] = useState(null);
  const [newsletterTab, setNewsletterTab] = useState('email');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeState, setSubscribeState] = useState('idle');
  const [subscribeMsg, setSubscribeMsg] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactState, setContactState] = useState('idle');
  const [contactStatus, setContactStatus] = useState('');
  const heroRef = useRef(null);
  const blogTimer = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 50); setShowBackTop(window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    api.program.list().then((res) => {
      setPrograms(Array.isArray(res) ? res : res.data || []);
    }).catch(() => {
      setPrograms([]);
    }).finally(() => setLoadingPrograms(false));
  }, []);
  useEffect(() => {
    api.blog.list({ perPage: 4 }).then((res) => {
      setBlogPosts(res?.data || []);
    }).catch(() => {
      setBlogPosts([]);
    }).finally(() => setLoadingBlogs(false));
  }, []);
  useEffect(() => { api.landing.list('langkah').then(r => setLangkah(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('sertifikasi').then(r => setSertifikasi(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('video').then(r => setVideos(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('keuntungan').then(r => setKeuntungan(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('fitur').then(r => setFiturData(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('angka').then(r => setAngkaData(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('mitra').then(r => setMitraData(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('testimoni').then(r => setTestimonials(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('layanan').then(r => setLayananData(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('faq').then(r => setFaqs(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('dokumentasi').then(r => setDokumentasiData(r.data || [])).catch(() => {}); }, []);
  useEffect(() => { api.landing.list('hero').then(r => setHeroData(r.data?.[0] || null)).catch(() => {}); }, []);
  useEffect(() => { api.pengaturan.get().then(setPengaturan).catch(() => {}); }, []);

  const filteredBlogs = blogPosts.filter((b) => {
    const matchCategory = blogCategory === 'Semua' || b.category === blogCategory;
    const matchSearch = !blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase()) || b.excerpt?.toLowerCase().includes(blogSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const blogItems = filteredBlogs.length > 0 ? filteredBlogs.map((post, idx) => (
    <motion.article key={post.slug || post.id} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }}
      className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onClick={() => { if (post.slug) router.push('/blog'); }}>
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50 z-0" />
        {post.image || post.media?.[0]?.url ? (
          <>
            <img src={post.image || post.media?.[0]?.url} alt={post.title}
              className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-[1]"
              loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-[2]" />
          </>
        ) : null}
        <div className="absolute top-3 left-3 z-[2] px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-sm text-primary shadow-sm">
          {post.category}
        </div>
        <div className="absolute bottom-3 left-3 z-[2] flex items-center gap-1.5 text-xs text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <CalendarDaysIcon className="w-3 h-3" />
          {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : post.date}
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-base md:text-lg leading-snug mb-2">
          {post.title}
        </h4>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {post.excerpt || (post.content || '').slice(0, 120) + '...'}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{post.author?.name || post.author || 'Admin KUD'}</span>
          <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Baca <ArrowRightIcon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.04] group-hover:ring-primary/20 pointer-events-none transition-all duration-500" />
    </motion.article>
  )) : (<div className="col-span-full text-center py-12">
      <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500 text-lg font-medium">Tidak ada artikel dengan kategori &quot;{blogCategory}&quot;</p>
      <p className="text-gray-300 text-sm mt-1">Coba kategori lain atau lihat semua artikel</p>
      <button onClick={() => { setBlogCategory('Semua'); setBlogSearch(''); }} className="mt-4 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
        Reset Filter
      </button>
    </div>
  );

  const navLinks = [
    { href: '#blog', label: 'Blog', icon: Newspaper },
    { href: '#program', label: 'Program', icon: LayoutGrid },
    { href: '#harga-tbs', label: 'Harga TBS', icon: DollarSign },
    { href: '#fitur', label: 'Fitur', icon: BarChart3 },
    { href: '#layanan', label: 'Layanan', icon: Phone },
    { href: '#testimoni', label: 'Testimoni', icon: MessageCircle },
    { href: '#faq', label: 'FAQ', icon: CircleHelp },
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
                <div className="flex items-center gap-2 ml-3">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); router.push(u.role === 'admin' ? '/admin' : u.role === 'verifikator' ? '/verifikator' : u.role === 'pekebun' ? '/pekebun' : '/login'); } catch { router.push('/login'); } }} className="px-4 py-2 rounded-lg text-sm font-bold border-2 border-emerald-500/50 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 transition-all shadow-sm">Masuk</motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/login?tab=register')} className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all hover:from-emerald-700 hover:to-emerald-800">Daftar</motion.button>
                </div>
              ) : null}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>
              {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
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
                    <>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); try { const u = JSON.parse(localStorage.getItem('user') || '{}'); router.push(u.role === 'admin' ? '/admin' : u.role === 'verifikator' ? '/verifikator' : u.role === 'pekebun' ? '/pekebun' : '/login'); } catch { router.push('/login'); } }} className="flex-1 py-2.5 rounded-lg border-2 border-emerald-500/50 bg-emerald-50 text-emerald-700 font-bold text-sm shadow-sm">Masuk</motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMobileOpen(false); router.push('/login?tab=register'); }} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30">Daftar</motion.button>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{HERO_STYLES_BLOCK}</style>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.35),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(13,148,136,0.25),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.12),transparent_70%)]" />
        </div>

        <div className="hidden lg:block absolute inset-0 z-[2] pointer-events-none">
          <Hero3DScene />
        </div>

        <div className="block lg:hidden absolute inset-0 z-[2] overflow-hidden pointer-events-none">
          <motion.div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
          <motion.div className="absolute top-1/3 right-1/3 w-48 h-48 bg-green-400/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
        </div>

        <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none opacity-10 lg:opacity-20">
          <img src="/logo-hero.png" alt="" className="w-72 h-72 lg:w-96 lg:h-96 object-contain" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 md:pt-32 md:pb-24 text-center">
          {mounted && !heroData ? (
            <div className="space-y-4 sm:space-y-6 animate-pulse max-w-3xl mx-auto">
              <div className="h-5 w-48 bg-white/10 rounded-full mx-auto" />
              <div className="h-10 sm:h-16 w-full max-w-lg bg-white/10 rounded-xl mx-auto" />
              <div className="h-4 w-full max-w-md bg-white/10 rounded mx-auto" />
              <div className="h-4 w-3/4 max-w-sm bg-white/10 rounded mx-auto" />
              <div className="flex gap-3 justify-center">
                <div className="h-12 w-36 bg-white/10 rounded-xl" />
                <div className="h-12 w-44 bg-white/10 rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm mb-4 sm:mb-6">
                  {heroData?.meta_data?.sub_judul || 'Koperasi Unit Desa Tegal Sari'}
                </motion.span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                className={`${heroData?.meta_data?.ukuran_font === 'kecil' ? 'text-2xl sm:text-5xl md:text-6xl lg:text-6xl' : heroData?.meta_data?.ukuran_font === 'besar' ? 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'} font-bold font-heading text-white leading-tight max-w-5xl mx-auto`}>
                {heroData?.title ? (
                  heroData.title.includes('KUD') ? (
                    <>{heroData.title.split('KUD')[0]}<span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">KUD{heroData.title.split('KUD')[1] || ''}</span></>
                  ) : heroData.title
                ) : (
                  <>Maju Bersama{' '}<span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">KUD Sari Subur</span></>
                )}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-snug sm:leading-relaxed">
                {heroData?.meta_data?.deskripsi || heroData?.description || 'Koperasi petani kelapa sawit yang berkomitmen meningkatkan kesejahteraan anggota melalui kemitraan berkelanjutan, inovasi, dan gotong royong.'}
              </motion.p>
              {(heroData?.meta_data?.catatan_hukum) && (
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-2 sm:mt-4 text-[11px] sm:text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-snug sm:leading-relaxed italic">
                  {heroData.meta_data.catatan_hukum}
                </motion.p>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="mt-5 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/login?tab=register')} className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-emerald-900 font-bold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-white to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10">Jadi Anggota</span>
                  <ArrowRightIcon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
                <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#tentang" onClick={(e) => { e.preventDefault(); document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base backdrop-blur-sm overflow-hidden">
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10">Pelajari Lebih Lanjut</span>
                  <ChevronDownIcon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                </motion.a>
              </motion.div>
            </>
          )}

          {mounted && heroData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="mt-8 sm:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-10 text-white/60 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />Terpercaya</div>
              <div className="flex items-center gap-1.5"><UserGroupIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />371+ Anggota</div>
              <div className="flex items-center gap-1.5"><HeartIcon animateOnHover className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />Ramah Lingkungan</div>
              <div className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />Berbadan Hukum</div>
            </motion.div>
          )}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="hidden sm:block absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <motion.a href="#tentang" onClick={(e) => { e.preventDefault(); document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors duration-300"
            animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="text-[11px] font-medium uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60"
                animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </motion.a>
        </motion.div>
      </section>







      


{/* ===== PROGRAM UNGGULAN ===== */}
      <section id="program" className="py-12 md:py-20 bg-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Program" title="Program KUD" subtitle="Berbagai program dirancang khusus untuk meningkatkan kesejahteraan dan produktivitas petani." />
          {loadingPrograms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl p-6 bg-gray-50/50 border border-gray-100 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4" />
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded-lg w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded-lg w-2/3 mb-4" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-16">
              <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground">Belum ada program tersedia</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => {
                const Icon = JENIS_ICON[program.jenis] || LayoutGrid;
                const colors = JENIS_COLORS[program.jenis] || DEFAULT_COLOR;
                return (
                  <motion.div key={program.id} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="group relative rounded-2xl p-6 cursor-pointer overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl hover:border-white/60 transition-all" onClick={() => setProgramModal(program)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      {program.foto?.length > 0 && (
                        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-white/40 shadow-sm ml-auto">
                          <img src={program.foto[0]} alt={program.nama} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      )}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold font-heading text-foreground">{program.nama}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">{program.jenis}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{program.deskripsi}</p>
                      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{program.persyaratan?.length || 0} Persyaratan</span>
                        <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">Detail <ArrowRightIcon className="w-4 h-4" /></span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      

{/* ===== ALUR 6 LANGKAH ===== */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Panduan" title="6 Langkah Jadi Anggota" subtitle="Proses mudah dan cepat untuk bergabung menjadi anggota KUD Desa Sari Subur." />
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden md:block" />
            <div className="space-y-8 md:space-y-0">
              {langkah.map((item, idx) => {
                const Icn = ICON_MAP[item.meta_data?.icon] || FileText;
                const isLeft = idx % 2 === 0;
                return (
                  <motion.div key={item.id || item.order || idx} initial={{ opacity: 0, x: isLeft ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }} className={`relative flex items-start gap-6 md:gap-0 md:flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} py-4 md:py-0 md:h-40`}>
                    <div className="hidden md:flex md:w-1/2 items-center">
                      <div className={`${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'} w-full`}>
                        <h4 className="font-bold font-heading text-foreground text-lg">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 relative z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                      <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/30 border-2 border-emerald-400/30">
                        <Icn className="w-4 h-4 md:w-5 md:h-5" />
                      </motion.div>
                    </div>
                    <div className="md:hidden flex-1 min-w-0">
                      <h4 className="font-bold font-heading text-foreground text-sm sm:text-lg">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      



      

{/* ===== SERTIFIKASI & PENGHARGAAN ===== */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Pengakuan" title="Sertifikasi & Penghargaan" subtitle="Berbagai sertifikasi dan penghargaan yang telah diraih KUD Desa Sari Subur." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sertifikasi.map((item, idx) => {
              const Icn = ICON_MAP[item.meta_data?.icon] || ShieldCheck;
              return (
                <motion.div key={item.id || idx} variants={scaleIn} whileHover={{ y: -4 }} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                  {item.media_url ? (
                    <div className="h-36 sm:h-40 overflow-hidden">
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ) : (
                    <div className="h-36 sm:h-40 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Icn className="w-14 h-14 text-white/60" />
                    </div>
                  )}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <h4 className="font-bold font-heading text-foreground leading-snug text-sm sm:text-base">{item.title}</h4>
                    {item.meta_data?.lembaga && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-medium border border-purple-100">
                        {item.meta_data.lembaga}
                      </span>
                    )}
                    {item.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>}
                    <div className="pt-1">
                      <button onClick={() => setSertifikasiDetail(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
                        <FileText className="w-3.5 h-3.5" /> Detail
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <Modal open={!!sertifikasiDetail} onClose={() => setSertifikasiDetail(null)} title={sertifikasiDetail?.title || 'Detail Sertifikasi'} maxWidth="max-w-lg">
        {sertifikasiDetail && (
          <div className="space-y-4">
            {sertifikasiDetail.media_url && (
              <img src={sertifikasiDetail.media_url} alt={sertifikasiDetail.title} className="w-full h-48 object-cover rounded-xl" />
            )}
            <div>
              {sertifikasiDetail.meta_data?.lembaga && (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100 mb-2">
                  {sertifikasiDetail.meta_data.lembaga}
                </span>
              )}
              {sertifikasiDetail.meta_data?.nomor && (
                <p className="text-xs text-gray-400 mt-1">No: {sertifikasiDetail.meta_data.nomor}</p>
              )}
            </div>
            {sertifikasiDetail.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{sertifikasiDetail.description}</p>
            ) : (
              <p className="text-sm text-gray-400">Tidak ada informasi detail tersedia.</p>
            )}
          </div>
        )}
      </Modal>

      

{/* ===== KEGIATAN GALLERY ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Dokumentasi" title="Kegiatan Kami" subtitle="Dokumentasi berbagai kegiatan dan program yang telah dilaksanakan KUD Desa Sari Subur." />
          {dokumentasiData.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Belum ada dokumentasi</p>
            </div>
          ) : (
            <DokumentasiGallery items={dokumentasiData} />
          )}
        </div>
      </section>

      



      

{/* ===== VIDEO KUD ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-white via-emerald-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Multimedia" title="Video KUD Sari Subur" subtitle="Tonton berbagai kegiatan, profil, dan informasi seputar KUD Desa Sari Subur." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, idx) => {
              const vidId = video.media_url || video.meta_data?.youtube_id || '';
              return (
                <motion.div key={video.id || idx} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="group cursor-pointer rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all" onClick={() => setVideoModal(vidId)}>
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    <img src={`https://img.youtube.com/vi/${vidId}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all"><PlayIcon animateOnHover className="w-6 h-6 text-emerald-700 ml-0.5" /></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{video.description || 'KUD Sari Subur'}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== KEUNTUNGAN ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Mengapa KUD" title="Keuntungan Bergabung" subtitle="Rasakan manfaat nyata menjadi bagian dari keluarga besar KUD Desa Sari Subur." light />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keuntungan.map((item, idx) => {
              const Icn = ICON_MAP[item.meta_data?.icon] || DollarSign;
              return (
                <motion.div key={item.id || idx} variants={itemVariants} whileHover={{ y: -6, scale: 1.03 }} className="group relative p-5 sm:p-6 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all shadow-lg shadow-black/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-white/20 transition-all border border-white/10"><Icn className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" /></div>
                  <h3 className="relative z-10 text-base sm:text-lg font-bold font-heading text-white">{item.title}</h3>
                  <p className="relative z-10 mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/60">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== HARGA TBS TERKINI ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Harga TBS" title="Harga TBS Terkini" subtitle="Pantau harga TBS terbaru yang ditetapkan oleh KUD. Data langsung dari sistem, diperbarui otomatis." />
          <HargaTbsWidget />
        </div>
      </section>

{/* ===== BLOG TERBARU ===== */}
      <section id="blog" className="py-10 md:py-12 bg-gradient-to-b from-white to-emerald-50/30 scroll-mt-16 md:scroll-mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="Blog" title="Artikel & Berita Terbaru" subtitle="Informasi terkini seputar KUD, pertanian sawit, dan kegiatan anggota." />
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
            <div className="relative flex-1 w-full max-w-md">
              <SearchIcon animateOnHover className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari artikel..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
              {BLOG_CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setBlogCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    blogCategory === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                      : 'bg-white text-gray-500 hover:text-primary hover:bg-primary/5 border border-gray-200 hover:border-primary/30 shadow-sm'
                  }`}>{cat}</button>
              ))}
            </div>
          </div>
          {loadingBlogs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-start">
              {blogItems}
            </motion.div>
          )}
          <div className="text-center mt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
              Lihat Semua Artikel
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      

{/* ===== FITUR ===== */}
      <section id="fitur" className="py-10 md:py-12 bg-white overflow-hidden scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Layanan Digital" title="Fitur Aplikasi KUD" subtitle="Nikmati kemudahan akses informasi dan layanan KUD melalui aplikasi digital kami." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fiturData.map((item, idx) => {
              const Icn = ICON_MAP[item.meta_data?.icon] || SparklesIcon;
              const bento = idx === 0 ? 'lg:col-span-2 lg:row-span-1' : '';
              return (
                <motion.div key={item.id || idx} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className={`group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100/60 shadow-md hover:shadow-xl transition-all ${bento}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-bl-full" />
                  {item.media_url ? (
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md shadow-emerald-500/20"><Icn className="w-6 h-6 text-white" /></div>
                  )}
                  <h3 className="text-lg font-bold font-heading text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== KUD DALAM ANGKA ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Statistik" title="KUD dalam Angka" subtitle="Capaian dan dampak nyata KUD Desa Sari Subur bagi petani kelapa sawit di wilayah Kecamatan Tegal Sari." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {angkaData.map((item, idx) => {
              const nilai = parseInt(item.meta_data?.nilai) || 0;
              const satuan = item.meta_data?.satuan || '';
              return (
                <motion.div key={item.id || idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="relative p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-md text-center group hover:shadow-lg transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent rounded-2xl pointer-events-none" />
                  <Counter end={nilai} suffix={satuan} label={item.title} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      

{/* ===== MITRA & KOLABORASI ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kolaborasi" title="Mitra & Kolaborasi" subtitle="Kemitraan strategis dengan berbagai lembaga untuk mendukung kemajuan KUD." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mitraData.map((mitra, idx) => {
              const initials = mitra.title.split(' ').slice(0, 2).map((w) => w[0]).join('');
              return (
                <motion.div key={mitra.id || idx} variants={scaleIn} whileHover={{ y: -6, scale: 1.04 }} className="group relative p-5 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-xl transition-all text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/30 pointer-events-none" />
                  {mitra.media_url ? (
                    <img src={mitra.media_url} alt={mitra.title} className="relative z-10 w-12 h-12 mx-auto mb-3 object-contain group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                      <span className="text-white text-xs font-bold">{initials}</span>
                    </div>
                  )}
                  <div className="relative z-10 text-xs font-semibold text-foreground/80 leading-tight">{mitra.title}</div>
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-emerald-400/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== TESTIMONI ===== */}
      <section id="testimoni" className="py-10 md:py-12 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden scroll-mt-16 md:scroll-mt-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.1),transparent_50%)]" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl transform-gpu" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-teal-400/5 rounded-full blur-3xl transform-gpu" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Testimoni" title="Apa Kata Anggota?" subtitle="Pengalaman nyata dari para anggota yang telah merasakan manfaat bergabung dengan KUD." light />
          <div className="relative max-w-4xl mx-auto">
            {testimonials.length > 0 ? (
              <>
                <motion.div key={testiIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 text-center overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/60 to-emerald-400/0" />
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 shadow-lg overflow-hidden ring-4 ring-emerald-400/30">
                    {testimonials[testiIdx]?.media_url ? (
                      <img src={testimonials[testiIdx].media_url} alt={testimonials[testiIdx].title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-2xl font-bold">
                        {(testimonials[testiIdx]?.title || 'A').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`w-5 h-5 ${i < (testimonials[testiIdx]?.meta_data?.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                  <p className="text-base sm:text-xl md:text-2xl text-white/90 leading-relaxed font-medium italic">{'\u201C'}{testimonials[testiIdx]?.description}{'\u201D'}</p>
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="font-bold text-white text-lg">{testimonials[testiIdx]?.title}</div>
                    <div className="text-white/50 text-sm">{testimonials[testiIdx]?.meta_data?.alamat || ''}</div>
                  </div>
                </motion.div>
                <div className="flex items-center justify-center gap-3 mt-8">
                  {testimonials.map((_, idx) => (
                    <button key={idx} onClick={() => setTestiIdx(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === testiIdx ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'}`} />
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTestiIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTestiIdx((prev) => (prev + 1) % testimonials.length)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronRightIcon className="w-5 h-5" /></motion.button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto text-white/20 mb-4" />
                <p className="text-white/50">Belum ada testimoni</p>
              </div>
            )}
          </div>
        </div>
      </section>

      

{/* ===== LAYANAN & DUKUNGAN ===== */}
      <section id="layanan" className="py-10 md:py-12 bg-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Kontak" title="Layanan & Dukungan" subtitle="Hubungi kami melalui berbagai saluran yang tersedia." />
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {layananData.map((item, idx) => {
              const Icn = ICON_MAP[item.meta_data?.icon] || Phone;
              return (
                <motion.div key={item.id || idx} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="group relative p-5 sm:p-6 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/30 pointer-events-none" />
                  <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20"><Icn className="w-6 h-6 sm:w-7 sm:h-7 text-white" /></div>
                  <h4 className="relative z-10 font-bold font-heading text-foreground text-sm sm:text-base">{item.title}</h4>
                  <p className="relative z-10 text-sm text-muted-foreground mt-2">{item.description}</p>
                  <p className="relative z-10 text-sm font-semibold text-primary mt-3">{item.meta_data?.kontak || ''}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      

{/* ===== FAQ ===== */}
      <section id="faq" className="py-10 md:py-12 bg-gradient-to-b from-emerald-50/30 to-white scroll-mt-16 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Tanya Jawab" title="Pertanyaan Umum" subtitle="Temukan jawaban atas pertanyaan yang sering diajukan tentang KUD Desa Sari Subur." />
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div key={faq.id || idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-lg transition-all">
                <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} className="w-full flex items-center justify-between p-4 md:p-5 text-left">
                  <span className="font-medium text-foreground text-sm md:text-base pr-4">{faq.title}</span>
                  <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/10 pt-3">{faq.description}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

{/* ===== MAP ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-emerald-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Lokasi" title="Temukan Kami" subtitle="Kunjungi kantor KUD Desa Sari Subur untuk informasi lebih lanjut." />
        </div>
        <MapSection />
      </section>

      

{/* ===== NEWSLETTER CTA ===== */}
      <section className="py-10 md:py-12 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
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

          {/* Tab Navigation */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="mt-8 flex items-center justify-center gap-2">
            {[
              { id: 'email', label: '📧 Email', desc: 'Langganan newsletter' },
              { id: 'wa', label: '💬 WhatsApp', desc: 'Hubungi via WA' },
              { id: 'kontak', label: '📞 Kontak', desc: 'Info kontak admin' },
            ].map((t) => (
              <button key={t.id} onClick={() => setNewsletterTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  newsletterTab === t.id
                    ? 'bg-white text-emerald-900 shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </motion.div>

          {/* Feature Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {[
              { icon: '📧', label: 'Newsletter Email', desc: 'Info & update langsung ke inbox', color: 'from-emerald-400/20 to-emerald-500/10', border: 'border-emerald-400/20' },
              { icon: '💬', label: 'WhatsApp', desc: 'Respon cepat & personal', color: 'from-green-400/20 to-green-500/10', border: 'border-green-400/20' },
              { icon: '📞', label: 'Kontak Admin', desc: 'Call center & alamat kantor', color: 'from-teal-400/20 to-teal-500/10', border: 'border-teal-400/20' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 + i * 0.08 }}
                className={`relative group p-4 rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-md border ${card.border} hover:bg-white/15 transition-all duration-300 cursor-default`}
                whileHover={{ y: -4, scale: 1.02 }}>
                <div className="text-2xl mb-2">{card.icon}</div>
                <h4 className="text-white font-semibold text-sm">{card.label}</h4>
                <p className="text-white/50 text-xs mt-0.5">{card.desc}</p>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-white/20 transition-all pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div key={newsletterTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-8 max-w-md mx-auto px-4 sm:px-0">
            {/* TAB 1: EMAIL */}
            {newsletterTab === 'email' && (
              <div className="space-y-4">
                {subscribeState === 'success' ? (
                  <div className="p-5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl backdrop-blur-sm">
                    <p className="text-emerald-300 font-semibold text-sm">✅ {subscribeMsg}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-white/60 text-sm">Masukkan email Anda untuk mendapatkan info terbaru langsung ke inbox.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Masukkan email Anda"
                        className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 backdrop-blur-sm transition-all" />
                      <button onClick={async () => {
                        if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
                          setSubscribeState('error'); setSubscribeMsg('Email tidak valid');
                          return;
                        }
                        setSubscribeState('loading');
                        try {
                          const res = await api.newsletter.subscribe(newsletterEmail);
                          setSubscribeState('success'); setSubscribeMsg(res.message || 'Berhasil berlangganan!');
                          setNewsletterEmail('');
                        } catch (err) {
                          setSubscribeState('error'); setSubscribeMsg(err.message || 'Gagal, coba lagi nanti');
                        }
                      }} disabled={subscribeState === 'loading'}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 transition-all text-sm hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 cursor-pointer">
                        {subscribeState === 'loading' ? 'Mengirim...' : 'Langganan'}
                      </button>
                    </div>
                    {subscribeState === 'error' && (
                      <p className="text-red-300 text-xs flex items-center gap-1 mt-1">{subscribeMsg}</p>
                    )}
                  </>
                )}
                {subscribeState === 'success' && (
                  <button onClick={() => { setSubscribeState('idle'); setSubscribeMsg(''); }}
                    className="text-white/50 hover:text-white text-xs underline transition-colors cursor-pointer">
                    Kirim ulang dengan email lain
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: WHATSAPP */}
            {newsletterTab === 'wa' && (
              <div className="space-y-4">
                <p className="text-white/60 text-sm">Punya pertanyaan atau ingin konsultasi? Hubungi kami langsung via WhatsApp.</p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <MessageCircle className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-white/80 text-sm font-medium">Admin KUD Sari Subur</p>
                    <p className="text-emerald-400 font-bold text-lg">{pengaturan.wa_admin || '08xxxxxxxxx'}</p>
                    <a href={`https://wa.me/${(pengaturan.wa_admin || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-600/30 hover:bg-emerald-600 transition-all text-sm">
                      <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
                    </a>
                  </div>
                </div>
                <p className="text-white/40 text-xs">Klik tombol di atas untuk memulai percakapan di WhatsApp.</p>
              </div>
            )}

            {/* TAB 3: KONTAK */}
            {newsletterTab === 'kontak' && (
              <div className="space-y-4">
                <p className="text-white/60 text-sm">Hubungi kami melalui kontak resmi KUD Desa Sari Subur.</p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Email</p>
                      <p className="text-white font-medium text-sm">{pengaturan.email_admin || 'admin@kud-sari-subur.my.id'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">WhatsApp</p>
                      <p className="text-white font-medium text-sm">{pengaturan.wa_admin || '08xxxxxxxxx'}</p>
                    </div>
                  </div>
                  {pengaturan.alamat_kud && (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm text-left">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Alamat</p>
                        <p className="text-white font-medium text-sm">{pengaturan.alamat_kud}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 flex items-center justify-center gap-6 text-white/40 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {sertifikasi.length} Sertifikasi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {programs.length} Program Aktif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {blogPosts.length} Artikel
            </span>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-foreground text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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
                {programs.length > 0 ? programs.map((p) => (
                  <li key={p.id}><a href="#" className="hover:text-white transition-colors">{p.nama}</a></li>
                )) : (
                  <li className="text-white/40 italic">Belum ada program</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 font-heading">Kontak</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />Jl. Tegal Sari No. 123, Kec. Tegal Sari</li>
                <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />0851-6988-3337</li>
                <li className="flex items-start gap-2"><Globe className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />kud-sari-subur.my.id</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <img src="/images/qr-link-kud.jpg" alt="Scan QR" className="w-10 h-10 rounded-lg border border-white/10" />
              <p>&copy; {new Date().getFullYear()} KUD Desa Sari Subur. Hak Cipta Dilindungi.</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING REFRESH ===== */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, rotate: 180 }}
        onClick={() => router.refresh()}
        className="fixed bottom-6 left-4 md:left-6 z-40 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md text-emerald-700 shadow-lg shadow-black/10 hover:shadow-xl hover:bg-white transition-all flex items-center justify-center border border-emerald-200/50"
        title="Muat ulang halaman"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      </motion.button>

      {/* ===== BACK TO TOP ===== */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} whileHover={{ scale: 1.1 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-4 md:right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center border border-emerald-400/30">
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

/* ===== DOKUMENTASI GALLERY ===== */
function DokumentasiGallery({ items }) {
  const [open, setOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [detailItem, setDetailItem] = useState(null);

  const imgItems = items.filter(i => i.media_url);
  if (imgItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Image className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Belum ada foto dokumentasi</p>
      </div>
    );
  }

  const openLightbox = (idx) => { setCurrentIdx(idx); setOpen(true); };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {imgItems.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={item.media_url}
                alt={item.title || 'Dokumentasi'}
                className="w-full object-cover transition-all duration-500 group-hover:scale-105 cursor-pointer"
                style={{ minHeight: '200px' }}
                loading="lazy"
                onClick={() => openLightbox(idx)}
              />
              <div className="p-3 space-y-1.5 bg-white">
                {item.title && <h4 className="font-semibold text-foreground text-sm leading-snug">{item.title}</h4>}
                {item.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>}
                <button onClick={() => setDetailItem(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer mt-1">
                  <FileText className="w-3.5 h-3.5" /> Detail
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem?.title || 'Detail Dokumentasi'} maxWidth="max-w-lg">
        {detailItem && (
          <div className="space-y-4">
            {detailItem.media_url && (
              <img src={detailItem.media_url} alt={detailItem.title} className="w-full h-48 object-cover rounded-xl" />
            )}
            <div>
              {detailItem.created_at && (
                <p className="text-xs text-gray-400 mb-1">{new Date(detailItem.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
              {detailItem.title && <h3 className="font-bold text-foreground text-lg">{detailItem.title}</h3>}
            </div>
            {detailItem.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{detailItem.description}</p>
            ) : (
              <p className="text-sm text-gray-400">Tidak ada informasi detail tersedia.</p>
            )}
            {detailItem.meta_data && Object.keys(detailItem.meta_data).length > 0 && (
              <div className="border-t border-gray-100 pt-3 mt-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Informasi Tambahan</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(detailItem.meta_data).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">{k}</span>
                      <span className="text-foreground font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 cursor-pointer">
              <XIcon className="w-8 h-8" />
            </button>
            {imgItems.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCurrentIdx((currentIdx - 1 + imgItems.length) % imgItems.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 cursor-pointer">
                  <ChevronLeftIcon className="w-10 h-10" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentIdx((currentIdx + 1) % imgItems.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 cursor-pointer">
                  <ChevronRightIcon className="w-10 h-10" />
                </button>
              </>
            )}
            <motion.img
              key={currentIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              src={imgItems[currentIdx]?.media_url}
              alt={imgItems[currentIdx]?.title || 'Dokumentasi'}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            {imgItems[currentIdx]?.title && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm" onClick={(e) => e.stopPropagation()}>
                {imgItems[currentIdx]?.title}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
