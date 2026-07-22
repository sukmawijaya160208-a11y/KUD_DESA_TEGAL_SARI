'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { formatDateLong } from '@/lib/date';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  NewspaperIcon, ClockIcon, EyeIcon, ArrowLeftIcon,
  ChevronLeftIcon, ShareIcon, PhotoIcon, VideoCameraIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_COLORS = {
  Pelatihan: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  Sosial: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  Pendidikan: { bg: 'bg-purple-500/10', text: 'text-purple-600', dot: 'bg-purple-500' },
  PSR: { bg: 'bg-orange-500/10', text: 'text-orange-600', dot: 'bg-orange-500' },
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

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewsCount, setViewsCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState([]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.blog.show(slug),
      api.blog.related(slug).catch(() => []),
      api.blog.popular().catch(() => []),
      api.blog.incrementViews(slug).catch(() => ({ views: 0 })),
    ])
      .then(([postData, relatedData, popularData, viewData]) => {
        setPost(postData);
        setRelatedPosts(Array.isArray(relatedData) ? relatedData : []);
        setPopularPosts(Array.isArray(popularData) ? popularData : []);
        setViewsCount(viewData?.views ?? postData?.views ?? 0);
      })
      .catch((err) => {
        if (err?.status === 404) setError('Artikel tidak ditemukan');
        else setError('Gagal memuat artikel');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const openLightbox = (media, index) => {
    setLightboxMedia(media);
    setLightboxIndex(index);
    setLightbox(media[index]?.url);
  };

  const lightboxPrev = () => {
    const i = lightboxIndex > 0 ? lightboxIndex - 1 : lightboxMedia.length - 1;
    setLightboxIndex(i);
    setLightbox(lightboxMedia[i].url);
  };

  const lightboxNext = () => {
    const i = lightboxIndex < lightboxMedia.length - 1 ? lightboxIndex + 1 : 0;
    setLightboxIndex(i);
    setLightbox(lightboxMedia[i].url);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div>
        <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 px-6 lg:px-12 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-4" />
            <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse mb-3" />
            <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
          </div>
        </section>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 space-y-4">
          <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <NewspaperIcon className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h1 className="font-heading font-bold text-foreground text-2xl mb-2">
            {error || 'Artikel tidak ditemukan'}
          </h1>
          <p className="text-gray-500 mb-6">
            Halaman yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Kembali ke Blog
          </Link>
        </div>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[post.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-500' };
  const time = readingTime(post.content);
  const hasYouTube = parseYouTubeId(post.content);
  const thumb = post.media?.[0]?.url || null;

  return (
    <div>
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[9999] origin-left" style={{ scaleX }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 px-6 lg:px-12 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm mb-6 group">
              <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali ke Blog
            </Link>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text} backdrop-blur-sm`}>
                {post.category}
              </span>
              {post.featured && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-600 backdrop-blur-sm">
                  Unggulan
                </span>
              )}
            </div>

            <h1 className="font-heading font-bold text-white text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-white/60 text-base md:text-lg mb-4 max-w-2xl">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-white/50 flex-wrap">
              {post.author && (
                <span>Oleh <span className="text-white/70">{post.author.name || post.author.email}</span></span>
              )}
              <span className="hidden sm:inline">·</span>
              <span>{formatDateLong(post.published_at || post.created_at)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                {time} menit baca
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                {formatViews(viewsCount)} dilihat
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Featured Image */}
          {thumb && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-100 border border-border">
              <img src={thumb} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Media Gallery */}
          {post.media?.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
              {post.media.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => openLightbox(post.media, i)}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-gray-50 group cursor-pointer"
                >
                  {m.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <video src={m.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-gray-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </>
                  )}
                  {m.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-white text-[10px] font-medium">{m.caption}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* YouTube Embed */}
          {hasYouTube && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-900">
              <iframe
                src={`https://www.youtube.com/embed/${hasYouTube}`}
                title="YouTube video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Content Body */}
          <article className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-8">
            {post.content}
          </article>

          {/* Tags / Meta Footer */}
          <div className="border-t border-border pt-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text}`}>
                  {post.category}
                </span>
                {post.media?.length > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <PhotoIcon className="w-3.5 h-3.5" />
                    <span>{post.media.length} media</span>
                  </>
                )}
                {post.media?.filter((m) => m.type === 'video').length > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <VideoCameraIcon className="w-3.5 h-3.5" />
                    <span>{post.media.filter((m) => m.type === 'video').length} video</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Bagikan:</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-600 transition-colors"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-600 transition-colors"
                  title="Facebook"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center text-sky-600 transition-colors"
                  title="Twitter"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <button
                  onClick={share}
                  className="w-8 h-8 rounded-full bg-gray-500/10 hover:bg-gray-500/20 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                  title={copySuccess ? 'Tersalin!' : 'Salin tautan'}
                >
                  {copySuccess ? (
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <ShareIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-border pt-8 mb-8">
              <h2 className="font-heading font-bold text-foreground text-lg mb-5">Artikel Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.slice(0, 3).map((rp) => {
                  const rc = CATEGORY_COLORS[rp.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
                  return (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      className="block bg-gray-50 rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group"
                    >
                      <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                        {rp.media?.[0]?.url ? (
                          <img src={rp.media[0].url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <NewspaperIcon className="w-8 h-8 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>{rp.category}</span>
                        <h3 className="text-xs font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Posts Sidebar */}
          {popularPosts.length > 0 && (
            <div className="border-t border-border pt-8">
              <h2 className="font-heading font-bold text-foreground text-lg mb-5">Artikel Populer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularPosts.slice(0, 3).map((pp) => {
                  const pc = CATEGORY_COLORS[pp.category] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
                  return (
                    <Link
                      key={pp.id}
                      href={`/blog/${pp.slug}`}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {pp.media?.[0]?.url ? (
                          <img src={pp.media[0].url} alt={pp.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <NewspaperIcon className="w-5 h-5 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-semibold ${pc.text}`}>{pp.category}</span>
                        <h3 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{pp.title}</h3>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <EyeIcon className="w-3 h-3" />
                          {formatViews(pp.views || 0)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="border-t border-border pt-8 mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kembali ke Blog
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {lightboxMedia.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); lightboxPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); lightboxNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {lightboxMedia.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); setLightbox(lightboxMedia[i].url); }}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === lightboxIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}
          <motion.div
            key={lightbox}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
