'use client';

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { formatDateLong, formatDateShort } from '@/lib/date';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Newspaper, Search, Clock, Eye, ArrowUp } from 'lucide-react';

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

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchTimer = useRef(null);
  const searchRef = useRef('');
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
    if (posts.length === 0) setLoading(true);
    const params = { page, perPage: 12 };
    if (filterCategory) params.category = filterCategory;
    if (search) params.search = search;
    api.blog.list(params)
      .then((res) => {
        if (res.data) {
          setPosts(res.data);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        }
      })
      .catch(() => setError('Gagal memuat postingan'))
      .finally(() => { if (posts.length === 0) setLoading(false); });
  }, [page, search, filterCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = useCallback(() => {
    api.blog.categories()
      .then((res) => startTransition(() => setCategories(res)))
      .catch(() => setError('Gagal memuat kategori'));
  }, []);

  useEffect(() => { fetchData(); fetchCategories(); }, [fetchData, fetchCategories]);

  const handleSearch = (v) => {
    searchRef.current = v;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => startTransition(() => {
      setSearch(searchRef.current);
      setPage(1);
    }), 400);
  };

  if (loading && posts.length === 0) {
    return (
      <div>
        <div ref={topRef} />
        <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[9999] origin-left" style={{ scaleX }} />
        <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 px-6 lg:px-12 pb-16 pt-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm mb-4">
              <Newspaper className="w-4 h-4" />
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
              <Newspaper className="w-4 h-4" />
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari artikel..."
              value={search}
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
          ) : posts.length === 0 && !isPending ? (
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
                <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Tidak ada artikel ditemukan</p>
              </>
            )}
          </div>
        ) : (
          <motion.div variants={containerAnim} initial="hidden" animate="show" className="space-y-8">
            {/* Featured: first post as hero card */}
            {posts.length > 0 && (
              <Link href={`/blog/${posts[0].slug}`} className="block">
                <motion.div variants={fadeUp} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  <div className="md:flex">
                    <div className="relative md:w-3/5 aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      {posts[0].media?.[0]?.url ? (
                        <img src={imgUrl(posts[0].media[0].url)} alt={posts[0].title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-20 h-20 text-primary/20" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                    </div>
                    <div className="p-6 md:p-8 md:w-2/5 flex flex-col justify-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold shadow-sm w-fit mb-3 ${CATEGORY_COLORS[posts[0].category]?.bg || 'bg-gray-500/10'} ${CATEGORY_COLORS[posts[0].category]?.text || 'text-gray-600'}`}>
                        {posts[0].category || 'Artikel'}
                      </span>
                      <h2 className="font-heading font-bold text-foreground text-xl md:text-2xl leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-3">
                        {posts[0].title}
                      </h2>
                      <p className="text-sm md:text-base text-gray-500 leading-relaxed line-clamp-3 mb-4 whitespace-pre-line text-justify">
                        {posts[0].excerpt || (posts[0].content ?? '').slice(0, 200) + '...'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readingTime(posts[0].content)} menit</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{formatDateLong(posts[0].published_at || posts[0].created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(posts[0].views || 0)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Remaining posts: 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.slice(1).map((post) => {
                const catColor = CATEGORY_COLORS[post.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
                const thumb = post.media?.[0]?.url || null;
                const time = readingTime(post.content);
                return (
                  <motion.div key={post.id} variants={fadeUp}>
                    <Link href={`/blog/${post.slug}`} className="block group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 h-full">
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                        {thumb ? (
                          <img src={imgUrl(thumb)} alt={post.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-14 h-14 text-primary/20" /></div>
                        )}
                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold shadow-lg ${catColor.bg} ${catColor.text} backdrop-blur-md`}>
                          {post.category || 'Artikel'}
                        </span>
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-lg text-xs">
                          <Eye className="w-3.5 h-3.5" />
                          {formatViews(post.views || 0)}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading font-bold text-foreground text-base md:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 whitespace-pre-line text-justify">
                          {post.excerpt || (post.content ?? '').slice(0, 150) + '...'}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            {time} menit
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateShort(post.published_at || post.created_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
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
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
