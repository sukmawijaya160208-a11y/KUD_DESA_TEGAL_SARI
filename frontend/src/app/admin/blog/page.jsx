'use client';

import { useEffect, useState, useRef, useCallback, startTransition } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  NewspaperIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, EyeIcon, XMarkIcon, PhotoIcon,
  VideoCameraIcon, StarIcon, ClockIcon, DocumentTextIcon,
  Cog6ToothIcon, BoltIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_COLORS = {
  Pelatihan: 'bg-blue-100 text-blue-700',
  Sosial: 'bg-green-100 text-green-700',
  Pendidikan: 'bg-purple-100 text-purple-700',
  PSR: 'bg-orange-100 text-orange-700',
};

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value ?? '-'}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function formatViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'rb';
  return n;
}

const FORM_INIT = { title: '', slug: '', excerpt: '', content: '', category: 'Pelatihan', status: 'draft', featured: false };

export default function AdminBlogPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [stats, setStats] = useState({ total: 0, draft: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [form, setForm] = useState(FORM_INIT);
  const [submitting, setSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [editingMedia, setEditingMedia] = useState([]);
  const searchTimer = useRef(null);
  const fileInputRef = useRef(null);

  // Category management
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, per_page: 10 };
    if (search) params.search = search;
    if (filterCategory) params.category = filterCategory;
    api.admin.blog.list(params)
      .then((res) => startTransition(() => {
        if (res.data) {
          setData(res.data);
          setMeta({ currentPage: res.current_page, lastPage: res.last_page, total: res.total });
        }
      }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [page, search, filterCategory, toast]);

  const fetchStats = useCallback(() => {
    api.admin.blog.list({ per_page: 100 })
      .then((res) => {
        if (res.data) {
          const draft = res.data.filter((p) => p.status === 'draft').length;
          startTransition(() => setStats({ total: res.total, draft, published: res.total - draft }));
        }
      })
      .catch(() => {});
  }, []);

  const fetchCategories = useCallback(() => {
    api.admin.blog.categories().then((res) => {
      if (Array.isArray(res)) startTransition(() => setCategories(res));
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); fetchStats(); fetchCategories(); }, [fetchData, fetchStats, fetchCategories]);

  const handleSearch = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => startTransition(() => setPage(1)), 300);
  };

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (v) => {
    setForm((p) => ({ ...p, title: v, slug: p.slug || slugify(v) }));
  };

  const resetForm = () => {
    setForm(FORM_INIT);
    setMediaFiles([]);
    setEditingMedia([]);
  };

  const openEdit = (post) => {
    setEditModal(post.id);
    setForm({
      title: post.title, slug: post.slug || '',
      excerpt: post.excerpt || '', content: post.content,
      category: post.category, status: post.status, featured: post.featured,
    });
    setEditingMedia(post.media || []);
    setMediaFiles([]);
  };

  const ensureSlug = () => {
    if (!form.slug) setForm((p) => ({ ...p, slug: slugify(p.title) }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.content) { toast.error('Judul dan konten harus diisi'); return; }
    ensureSlug();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.slug) payload.slug = slugify(payload.title);
      const res = await api.admin.blog.create(payload);
      const postId = res.id;

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          await api.admin.blog.uploadMedia(postId, file.file, file.caption || '');
        }
      }

      toast.success('Artikel berhasil dibuat');
      setCreateModal(false);
      resetForm();
      fetchData();
      fetchStats();
    } catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!form.title || !form.content) { toast.error('Judul dan konten harus diisi'); return; }
    ensureSlug();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.slug) payload.slug = slugify(payload.title);
      await api.admin.blog.update(editModal, payload);

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          await api.admin.blog.uploadMedia(editModal, file.file, file.caption || '');
        }
      }

      toast.success('Artikel berhasil diupdate');
      setEditModal(null);
      resetForm();
      fetchData();
      fetchStats();
    } catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSubmitting(true);
    try {
      await api.admin.blog.delete(deleteModal);
      toast.success('Artikel berhasil dihapus');
      setDeleteModal(null);
      fetchData();
      fetchStats();
    } catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleToggleFeatured = async (id, featured) => {
    try {
      await api.admin.blog.toggleFeatured(id, !featured);
      toast.success(featured ? 'Artikel tidak lagi unggulan' : 'Artikel dijadikan unggulan');
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await api.admin.blog.deleteMedia(mediaId);
      setEditingMedia((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success('Media berhasil dihapus');
    } catch (err) { toast.error(err.message); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({ file: f, url: URL.createObjectURL(f), caption: '', type: f.type.startsWith('video/') ? 'video' : 'image' }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setCatSubmitting(true);
    try {
      await api.admin.blog.createCategory(newCategory.trim());
      toast.success('Kategori berhasil ditambahkan');
      setNewCategory('');
      fetchCategories();
    } catch (err) { toast.error(err.message); } finally { setCatSubmitting(false); }
  };

  const handleDeleteCategory = async (name) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    try {
      await api.admin.blog.deleteCategory(name);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-sm">
            <NewspaperIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola artikel dan berita</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => { fetchCategories(); setCatModal(true); }}>
            <Cog6ToothIcon className="w-4 h-4" /> Kategori
          </Button>
          <Button onClick={() => { resetForm(); setCreateModal(true); }}>
            <PlusIcon className="w-4 h-4" /> Artikel Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard icon={NewspaperIcon} label="Total Artikel" value={stats.total} color="rose" />
        <StatsCard icon={DocumentTextIcon} label="Draft" value={stats.draft} color="warning" />
        <StatsCard icon={ClockIcon} label="Published" value={stats.published} color="success" />
      </div>

      <div className="bg-surface rounded-2xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Cari judul artikel..." defaultValue={search} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
          </div>
          <select value={filterCategory} onChange={(e) => startTransition(() => { setFilterCategory(e.target.value); setPage(1); })} className="px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all">
            <option value="">Semua Kategori</option>
            {categories.map((c) => (<option key={c.category} value={c.category}>{c.category}</option>))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data...
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center">
              <NewspaperIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada artikel</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
                  <th className="text-left py-3 px-3 font-semibold text-white/80 first:rounded-l-lg">Judul</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Kategori</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Views</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Penulis</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Unggulan</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Tanggal</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80 last:rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((post) => (
                  <motion.tr key={post.id} variants={fadeUp} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {post.media?.[0]?.url ? (
                          <img src={post.media[0].url} alt="" className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <NewspaperIcon className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground line-clamp-1">{post.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3 px-3"><Badge status={post.status === 'published' ? 'verified' : 'pending'} /></td>
                    <td className="py-3 px-3 text-xs text-gray-400">{formatViews(post.views || 0)}</td>
                    <td className="py-3 px-3 text-xs text-gray-400">{post.author?.name || post.author?.email || '-'}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleFeatured(post.id, post.featured)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${post.featured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'}`}
                        title={post.featured ? 'Hapus unggulan' : 'Jadikan unggulan'}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={`/blog#${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Preview"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </a>
                        <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer" title="Edit">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteModal(post.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {meta.lastPage > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-gray-500">Halaman {meta.currentPage} dari {meta.lastPage} (Total: {meta.total})</span>
            <div className="flex items-center gap-2">
              <button disabled={meta.currentPage <= 1} onClick={() => startTransition(() => setPage((p) => Math.max(1, p - 1)))} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer">Prev</button>
              <button disabled={meta.currentPage >= meta.lastPage} onClick={() => startTransition(() => setPage((p) => p + 1))} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Category Management Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Kelola Kategori" maxWidth="max-w-md">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Nama kategori baru..."
              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            />
            <Button loading={catSubmitting} onClick={handleAddCategory}>Tambah</Button>
          </div>
          <div className="max-h-[40vh] overflow-y-auto space-y-1">
            {categories.map((c) => (
              <div key={c.category} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-foreground">{c.category} <span className="text-gray-400 font-normal">({c.total})</span></span>
                <button onClick={() => handleDeleteCategory(c.category)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => { setCreateModal(false); resetForm(); }} title="Buat Artikel Baru" maxWidth="max-w-2xl">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Judul</label>
            <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" placeholder="Masukkan judul artikel" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Slug (URL)</label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400 shrink-0">/blog/</span>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" placeholder="judul-artikel" />
              <button onClick={() => setForm((p) => ({ ...p, slug: slugify(p.title) }))} className="text-xs text-primary hover:text-primary-dark shrink-0 cursor-pointer" title="Generate dari judul">
                <BoltIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all">
                {categories.map((c) => (<option key={c.category} value={c.category}>{c.category}</option>))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ringkasan (Excerpt)</label>
            <textarea value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" rows={2} placeholder="Ringkasan singkat artikel" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Konten</label>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-border">
                {[
                  { cmd: 'bold', label: 'B', style: 'font-bold' },
                  { cmd: 'italic', label: 'I', style: 'italic' },
                  { cmd: 'underline', label: 'U', style: 'underline' },
                ].map((t) => (
                  <button
                    key={t.cmd}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const ta = document.getElementById('blog-content');
                      if (!ta) return;
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const text = ta.value;
                      const selected = text.substring(start, end);
                      let wrapped;
                      if (t.cmd === 'bold') wrapped = `**${selected}**`;
                      else if (t.cmd === 'italic') wrapped = `_${selected}_`;
                      else wrapped = `<u>${selected}</u>`;
                      setForm((p) => ({ ...p, content: text.substring(0, start) + wrapped + text.substring(end) }));
                      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + wrapped.length, start + wrapped.length); }, 0);
                    }}
                    className={`px-2 py-0.5 rounded text-xs ${t.style} text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer`}
                  >
                    {t.label}
                  </button>
                ))}
                <span className="text-gray-300 mx-1">|</span>
                <span className="text-[10px] text-gray-400">Markdown support: **bold** _italic_</span>
              </div>
              <textarea
                id="blog-content"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="w-full px-3 py-2 text-sm resize-none bg-white outline-none"
                rows={8}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Media (Foto / Video)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mediaFiles.map((f, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-gray-50 group">
                  {f.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <VideoCameraIcon className="w-6 h-6 text-white/50" />
                    </div>
                  ) : (
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => setMediaFiles((prev) => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <XMarkIcon className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer">
                <PlusIcon className="w-5 h-5" />
                <span className="text-[9px] mt-0.5">Tambah</span>
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
          <Button variant="secondary" onClick={() => { setCreateModal(false); resetForm(); }}>Batal</Button>
          <Button loading={submitting} onClick={handleCreate}>Simpan</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); resetForm(); }} title="Edit Artikel" maxWidth="max-w-2xl">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Judul</label>
            <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Slug</label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400 shrink-0">/blog/</span>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
              <button onClick={() => setForm((p) => ({ ...p, slug: slugify(p.title) }))} className="text-xs text-primary hover:text-primary-dark shrink-0 cursor-pointer">
                <BoltIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all">
                {categories.map((c) => (<option key={c.category} value={c.category}>{c.category}</option>))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ringkasan</label>
            <textarea value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Konten</label>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-border">
                {[
                  { cmd: 'bold', label: 'B', style: 'font-bold' },
                  { cmd: 'italic', label: 'I', style: 'italic' },
                  { cmd: 'underline', label: 'U', style: 'underline' },
                ].map((t) => (
                  <button
                    key={t.cmd}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const ta = document.getElementById('blog-content-edit');
                      if (!ta) return;
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const text = ta.value;
                      const selected = text.substring(start, end);
                      let wrapped;
                      if (t.cmd === 'bold') wrapped = `**${selected}**`;
                      else if (t.cmd === 'italic') wrapped = `_${selected}_`;
                      else wrapped = `<u>${selected}</u>`;
                      setForm((p) => ({ ...p, content: text.substring(0, start) + wrapped + text.substring(end) }));
                      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + wrapped.length, start + wrapped.length); }, 0);
                    }}
                    className={`px-2 py-0.5 rounded text-xs ${t.style} text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer`}
                  >
                    {t.label}
                  </button>
                ))}
                <span className="text-gray-300 mx-1">|</span>
                <span className="text-[10px] text-gray-400">Markdown: **bold** _italic_</span>
              </div>
              <textarea
                id="blog-content-edit"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="w-full px-3 py-2 text-sm resize-none bg-white outline-none"
                rows={8}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Media ({editingMedia.length + mediaFiles.length})</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editingMedia.map((m) => (
                <div key={m.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-gray-50 group">
                  {m.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <VideoCameraIcon className="w-6 h-6 text-white/50" />
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => handleDeleteMedia(m.id)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <XMarkIcon className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {mediaFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-gray-50 group">
                  {f.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <VideoCameraIcon className="w-6 h-6 text-white/50" />
                    </div>
                  ) : (
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => setMediaFiles((prev) => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <XMarkIcon className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer">
                <PlusIcon className="w-5 h-5" />
                <span className="text-[9px] mt-0.5">Tambah</span>
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
          <Button variant="secondary" onClick={() => { setEditModal(null); resetForm(); }}>Batal</Button>
          <Button loading={submitting} onClick={handleEdit}>Simpan</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Artikel">
        <p className="text-sm text-gray-600 mb-4">Apakah Anda yakin ingin menghapus artikel ini? Semua media terkait akan ikut terhapus.</p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" loading={submitting} onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[9998] bg-black/85 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 cursor-pointer">
              <XMarkIcon className="w-4 h-4 text-gray-700" />
            </button>
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
