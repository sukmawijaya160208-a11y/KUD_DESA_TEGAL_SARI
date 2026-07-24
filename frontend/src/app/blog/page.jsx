'use client';

import { useState, useEffect, useCallback, startTransition, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { formatDateLong } from '@/lib/date';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  NewspaperIcon, MagnifyingGlassIcon, ClockIcon,
  XMarkIcon, PlayIcon, PhotoIcon, VideoCameraIcon, EyeIcon,
  ArrowUpIcon, ShareIcon, ArrowLeftIcon, ArrowRightIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_COLORS = {
  Pelatihan: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  Sosial: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  Pendidikan: { bg: 'bg-purple-500/10', text: 'text-purple-600', dot: 'bg-purple-500' },
  PSR: { bg: 'bg-orange-500/10', text: 'text-orange-600', dot: 'bg-orange-500' },
};

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function readingTime(text) {
  if (!text) return 1;
  const wpm = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

function formatViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'rb';
  return n;
}

function imgUrl(url) {
  if (!url) return null;
  return url.replace(/ /g, '%20');
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

function parseYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [detailPost, setDetailPost] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [viewsCount, setViewsCount] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const searchTimer = useRef(null);
  const topRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, perPage: 12 };
    if (filterCategory) params.category = filterCategory;
    if (search) params.search = search;
    api.blog.list(params)
      .then((res) => startTransition(() => {
        if (res.data) {
          setPosts(res.data);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        }
      }))
      .catch(() => setError('Gagal memuat postingan'))
      .finally(() => setLoading(false));
  }, [page, search, filterCategory]);

  const fetchCategories = useCallback(() => {
    api.blog.categories()
      .then((res) => startTransition(() => setCategories(res)))
      .catch(() => setError('Gagal memuat kategori'));
  }, []);

  useEffect(() => { fetchData(); fetchCategories(); }, [fetchData, fetchCategories]);

  useEffect(() => {
    if (relatedPosts.length > 0) return;
    api.blog.popular().then((res) => startTransition(() => {
      if (Array.isArray(res)) setRelatedPosts(res);
    })).catch(() => setError('Gagal memuat artikel populer'));
  }, [relatedPosts.length]);

  const handleSearch = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => startTransition(() => setPage(1)), 300);
  };

  const openDetail = useCallback((post) => {
    setViewsCount(post.views || 0);
    api.blog.incrementViews(post.slug).then((res) => {
      if (res?.views) setViewsCount(res.views);
    }).catch(() => {});
    if (post.category) {
      api.blog.related(post.slug).then((res) => {
        if (Array.isArray(res)) setRelatedPosts(res);
      }).catch(() => {});
    }
    setDetailPost(post);
  }, []);

  const openLightbox = (media, index) => {
    setLightboxMedia(media);
    setLightboxIndex(index);
    setLightbox(imgUrl(media[index]?.url));
  };

  const lightboxPrev = () => {
    const i = lightboxIndex > 0 ? lightboxIndex - 1 : lightboxMedia.length - 1;
    setLightboxIndex(i);
    setLightbox(imgUrl(lightboxMedia[i].url));
  };

  const lightboxNext = () => {
    const i = lightboxIndex < lightboxMedia.length - 1 ? lightboxIndex + 1 : 0;
    setLightboxIndex(i);
    setLightbox(imgUrl(lightboxMedia[i].url));
  };

  const share = async (post) => {
    const url = window.location.origin + '/blog/' + post.slug;
    const text = `${post.title}\n\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div>
        <div ref={topRef} />
        <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[9999] origin-left" style={{ scaleX }} />
        <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 px-6 lg:px-12 pb-16 pt-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm mb-4">
              <NewspaperIcon className="w-4 h-4" />
              Blog KUD
            </div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">Berita & Artikel KUD Sari Subur</h1>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef}>
      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[9999] origin-left" style={{ scaleX }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 px-6 lg:px-12 pb-16 pt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm mb-4 border border-white/10">
              <NewspaperIcon className="w-4 h-4" />
              Blog KUD
            </div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">
              Berita & Artikel <span className="bg-gradient-to-r from-primary-light to-blue-300 bg-clip-text text-transparent">KUD Sari Subur</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Ikuti perkembangan kegiatan, program, dan informasi terbaru dari KUD Desa Sari Subur
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Search */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari artikel..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => startTransition(() => { setFilterCategory(''); setPage(1); })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                !filterCategory ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.category}
                onClick={() => startTransition(() => { setFilterCategory(c.category); setPage(1); })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filterCategory === c.category
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.category} ({c.total})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {loading && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <div key={post.id} className="bg-surface rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-gray-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            {error ? (
              <>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">!</span>
                </div>
                <p className="text-red-500 text-lg font-semibold">Gagal memuat artikel</p>
                <p className="text-gray-400 text-sm mt-1">{error}</p>
              </>
            ) : (
              <>
                <NewspaperIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Tidak ada artikel ditemukan</p>
              </>
            )}
          </div>
        ) : (
          <motion.div variants={containerAnim} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const catColor = CATEGORY_COLORS[post.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
              const thumb = post.media?.[0]?.url || null;
              const time = readingTime(post.content);

              return (
                <motion.div
                  key={post.id}
                  variants={fadeUp}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer"
                  onClick={() => openDetail(post)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    {thumb ? (
                      <>
                        <img src={imgUrl(thumb)} alt={post.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <NewspaperIcon className="w-14 h-14 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-lg ${catColor.bg} ${catColor.text} backdrop-blur-md`}>
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/90 px-2 py-1 rounded-lg text-[11px]">
                      <EyeIcon className="w-3 h-3" />
                      {formatViews(post.views || 0)}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <ClockIcon className="w-3 h-3" />
                        {time} menit
                      </span>
                      <span className="text-[11px] text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        {formatDateLong(post.published_at || post.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-foreground text-sm md:text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs md:text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt || (post.content ?? '').slice(0, 120) + '...'}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <PhotoIcon className="w-3 h-3" />
                        {post.media?.length || 0} media
                      </span>
                      <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Baca Detail <ChevronDownIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.04] group-hover:ring-primary/20 pointer-events-none transition-all duration-500" />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {meta.lastPage > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border text-sm">
            <span className="text-gray-500">
              Halaman {meta.currentPage} dari {meta.lastPage} (Total: {meta.total})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.currentPage <= 1}
                onClick={() => startTransition(() => setPage((p) => Math.max(1, p - 1)))}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
              >
                Prev
              </button>
              <button
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => startTransition(() => setPage((p) => p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {detailPost && (() => {
          const post = detailPost;
          const catColor = CATEGORY_COLORS[post.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
          const time = readingTime(post.content);
          const hasYouTube = post.content ? parseYouTubeId(post.content) : null;
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 md:pt-20 overflow-y-auto"
              onClick={() => setDetailPost(null)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateLong(post.published_at || post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => share(post)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Bagikan">
                      {copySuccess ? <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> : <ShareIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDetailPost(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-foreground transition-colors cursor-pointer">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                  <h2 className="font-heading font-bold text-foreground text-2xl md:text-3xl mb-4 leading-tight">
                    {post.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-6">
                    <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{time} menit baca</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{formatViews(viewsCount ?? post.views ?? 0)} dilihat</span>
                    {post.author && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>oleh {post.author.name || post.author.email}</span>
                      </>
                    )}
                  </div>

                  {/* Media Gallery */}
                  {post.media?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                      {post.media.map((m, i) => (
                        <button key={m.id} onClick={() => openLightbox(post.media, i)}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-gray-50 group cursor-pointer">
                          {m.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                              <video src={m.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><PlayIcon className="w-5 h-5 text-gray-900 ml-0.5" /></div></div>
                            </div>
                          ) : (
                            <>
                              <img src={imgUrl(m.url)} alt={m.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </>
                          )}
                          {m.caption && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"><span className="text-white text-[10px] font-medium">{m.caption}</span></div>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* YouTube Embed */}
                  {hasYouTube && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-900">
                      <iframe src={`https://www.youtube.com/embed/${hasYouTube}`} title="YouTube video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Share */}
                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <span className="text-xs text-gray-400">{post.media?.length || 0} media · {post.media?.filter(m => m.type === 'video').length || 0} video</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">Bagikan:</span>
                        <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.origin + '/blog/' + post.slug)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-600 transition-colors" title="WhatsApp">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/blog#' + post.slug)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-600 transition-colors" title="Facebook">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.origin + '/blog#' + post.slug)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center text-sky-600 transition-colors" title="Twitter">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Related Articles */}
                  {relatedPosts.length >= 3 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-heading font-bold text-foreground text-base mb-4 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-primary" />
                        Artikel Terkait
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedPosts.slice(0, 3).map((rp) => {
                          const rc = CATEGORY_COLORS[rp.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
                          return (
                            <button key={rp.id} onClick={() => { setDetailPost(null); setTimeout(() => openDetail(rp), 300); }}
                              className="text-left bg-gray-50 rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group cursor-pointer">
                              <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                                {rp.media?.[0]?.url ? (
                                  <img src={imgUrl(rp.media[0].url)} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10"><NewspaperIcon className="w-8 h-8 text-primary/20" /></div>
                                )}
                              </div>
                              <div className="p-3">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>{rp.category}</span>
                                <h4 className="text-xs font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h4>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Lightbox with Carousel */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            {lightboxMedia.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); lightboxPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10">
                  <ArrowLeftIcon className="w-5 h-5 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); lightboxNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10">
                  <ArrowRightIcon className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  {lightboxMedia.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); setLightbox(lightboxMedia[i].url); }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        i === lightboxIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <motion.div
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={imgUrl(lightbox)} alt="" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center z-50 cursor-pointer"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
