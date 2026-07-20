'use client';

import { useEffect, useState, useRef, useCallback, memo, startTransition } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import PrintButton from '@/components/PrintButton';
import DatePicker from '@/components/ui/DatePicker';
import { motion } from 'framer-motion';
import {
  PencilSquareIcon, TrashIcon, PlusIcon, EyeIcon, XMarkIcon,
  MagnifyingGlassIcon, UsersIcon, CheckCircleIcon, ClockIcon,
  PhotoIcon, IdentificationIcon, DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/date';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

function StatsCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  );
}

function PekebunRow({ pekebun, onEdit, onDelete, onDetail, onPreview }) {
  return (
    <motion.tr variants={fadeUp} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {pekebun.foto_pekebun ? (
              <img src={pekebun.foto_pekebun} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-sm">{pekebun.nama?.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{pekebun.nama}</div>
            <div className="text-xs text-gray-400">{pekebun.nik}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-3">
        <div className="text-gray-600 font-mono text-sm">{pekebun.nik}</div>
      </td>
      <td className="py-3.5 px-3 text-gray-600">{pekebun.no_whatsapp || '-'}</td>
      <td className="py-3.5 px-3 text-gray-500">{pekebun.lahan_count || pekebun.lahan?.length || 0} lahan</td>
      <td className="py-3.5 px-3">
        <div className="flex gap-1.5">
          {pekebun.foto_pekebun && (
            <button onClick={() => onPreview(pekebun.foto_pekebun)}
              className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-0.5">
              <PhotoIcon className="w-3 h-3" /> Foto
            </button>
          )}
          {pekebun.upload_ktp && (
            <button onClick={() => onPreview(pekebun.upload_ktp)}
              className="text-xs text-purple-600 hover:underline cursor-pointer flex items-center gap-0.5">
              <IdentificationIcon className="w-3 h-3" /> KTP
            </button>
          )}
          {pekebun.upload_kk && (
            <button onClick={() => onPreview(pekebun.upload_kk)}
              className="text-xs text-green-600 hover:underline cursor-pointer flex items-center gap-0.5">
              <DevicePhoneMobileIcon className="w-3 h-3" /> KK
            </button>
          )}
          {!pekebun.foto_pekebun && !pekebun.upload_ktp && !pekebun.upload_kk && (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-3"><Badge status={pekebun.status} /></td>
      <td className="py-3.5 px-3">
        <div className="flex gap-1">
          <button onClick={() => onDetail(pekebun)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Detail">
            <EyeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(pekebun)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="Edit">
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(pekebun)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer" title="Hapus">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

const PekebunRowMemo = memo(PekebunRow);

const FORM_INIT = { nama: '', nik: '', no_kk: '', tempat_lahir: '', tanggal_lahir: '', no_whatsapp: '', alamat: '', status: 'pending', foto_pekebun: '', upload_ktp: '', upload_kk: '', email: '', password: '' };

export default function AdminPekebunPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [form, setForm] = useState({ ...FORM_INIT });
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef(null);

  const fetchData = useCallback((params = {}) => {
    const p = {};
    if (params.search || search) p.search = params.search || search;
    if (params.status || filterStatus) p.status = params.status || filterStatus;
    p.page = params.page || 1;
    p.per_page = 15;
    api.admin.pekebun.list(Object.keys(p).length ? p : undefined)
      .then((res) => {
        setData(res.data || []);
        setMeta(res.meta || null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [search, filterStatus, toast]);

  useEffect(() => {
    startTransition(() => { setLoading(true); });
    fetchData();
  }, [fetchData]);

  const stats = {
    total: meta?.total || data.length,
    pending: data.filter((d) => d.status === 'pending').length,
    verified: data.filter((d) => d.status === 'verified').length,
    rejected: data.filter((d) => d.status === 'rejected').length,
  };

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchData({ search: val, page: 1 }), 300);
  }, [fetchData]);

  const handleFilter = useCallback((val) => {
    setFilterStatus(val);
    fetchData({ status: val, page: 1 });
  }, [fetchData]);

  const handlePage = useCallback((page) => {
    fetchData({ page });
  }, [fetchData]);

  const openCreate = useCallback(() => {
    setForm({ ...FORM_INIT });
    setCreateModal(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditModal({ ...item, tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '' });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.admin.pekebun.create(form);
      toast.success('Pekebun berhasil ditambahkan');
      setCreateModal(false);
      setForm({ ...FORM_INIT });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.admin.pekebun.update(editModal.id, editModal);
      toast.success('Pekebun berhasil diperbarui');
      setEditModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await api.admin.pekebun.delete(deleteModal.id);
      toast.success('Pekebun berhasil dihapus');
      setDeleteModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePreview = useCallback((url) => setPreviewImage(url), []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Pekebun</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola data pekebun KUD</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton
            title="Data Pekebun - KUD Desa Sari Subur"
            fetchAll={() => api.admin.pekebun.list({ per_page: 9999 }).then((res) => res.data || res)}
            renderContent={(items) => `
              <table class="print-table">
                <thead>
                  <tr>
                    <th style="width:36px">No</th>
                    <th>Nama</th>
                    <th>NIK</th>
                    <th>Kontak</th>
                    <th style="width:80px">Status</th>
                    <th style="width:60px;text-align:center">Lahan</th>
                    <th>Dokumen</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((d, i) => {
                    const docs = [];
                    if (d.foto_pekebun) docs.push({ url: d.foto_pekebun, label: 'Foto' });
                    if (d.upload_ktp) docs.push({ url: d.upload_ktp, label: 'KTP' });
                    if (d.upload_kk) docs.push({ url: d.upload_kk, label: 'KK' });
                    return `
                    <tr>
                      <td>${i + 1}</td>
                      <td><strong>${d.nama}</strong></td>
                      <td>${d.nik}</td>
                      <td style="font-size:10px">${[d.no_whatsapp, d.alamat].filter(Boolean).join('<br>') || '-'}</td>
                      <td><span class="badge badge-${d.status}">${d.status}</span></td>
                      <td class="text-center font-bold">${d.lahan?.length || 0}</td>
                      <td>
                        <div class="doc-grid">
                          ${docs.length > 0 ? docs.map((doc) =>
                            `<a href="${doc.url}" target="_blank"><img src="${doc.url}" alt="${doc.label}" title="${doc.label}" /></a>`
                          ).join('') : '<span class="text-muted">-</span>'}
                        </div>
                      </td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          />
          <Button onClick={openCreate}><PlusIcon className="w-4 h-4" /> Tambah Pekebun</Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
        <StatsCard label="Total Pekebun" value={stats.total} icon={UsersIcon} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatsCard label="Pending" value={stats.pending} icon={ClockIcon} color="bg-gradient-to-br from-yellow-500 to-yellow-600" />
        <StatsCard label="Verified" value={stats.verified} icon={CheckCircleIcon} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatsCard label="Rejected" value={stats.rejected} icon={XMarkIcon} color="bg-gradient-to-br from-red-500 to-red-600" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Cari nama, NIK, atau WhatsApp..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white rounded-xl">
                  <th className="text-left py-3 px-3 font-semibold text-white/80 first:rounded-l-lg">Pekebun</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">NIK</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">WhatsApp</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Lahan</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Dokumen</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-white/80 last:rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <PekebunRowMemo
                    key={d.id}
                    pekebun={d}
                    onEdit={openEdit}
                    onDelete={setDeleteModal}
                    onDetail={setDetailModal}
                    onPreview={handlePreview}
                  />
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="7" className="py-12 text-center text-gray-400">
                    {search || filterStatus ? 'Tidak ada pekebun yang cocok' : 'Belum ada data pekebun'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-sm text-gray-500">{meta.total} data - Halaman {meta.current_page} dari {meta.last_page}</span>
              <div className="flex gap-2">
                <button disabled={meta.current_page <= 1} onClick={() => handlePage(meta.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Prev</button>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => handlePage(meta.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next</button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tambah Pekebun" maxWidth="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required placeholder="Nama lengkap" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Email (untuk login)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="pekebun@email.com" />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 karakter" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="NIK (16 digit)" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} required maxLength={16} />
            <Input label="No. KK" value={form.no_kk} onChange={(e) => setForm({ ...form, no_kk: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Tempat Lahir" value={form.tempat_lahir} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} required />
            <DatePicker label="Tanggal Lahir" value={form.tanggal_lahir} onChange={(v) => setForm({ ...form, tanggal_lahir: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="No. WhatsApp" value={form.no_whatsapp} onChange={(e) => setForm({ ...form, no_whatsapp: e.target.value })} required placeholder="08xxxxxxxxxx" />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
          <Input label="Alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} required />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setCreateModal(false)}>Batal</Button>
            <Button type="submit" loading={submitting}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Pekebun" maxWidth="max-w-lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                {detailModal.foto_pekebun ? (
                  <img src={detailModal.foto_pekebun} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(detailModal.foto_pekebun)} />
                ) : <span className="text-primary font-bold text-xl">{detailModal.nama?.charAt(0)}</span>}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{detailModal.nama}</h3>
                <Badge status={detailModal.status} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ['NIK', detailModal.nik],
                ['No. KK', detailModal.no_kk],
                ['Tempat Lahir', detailModal.tempat_lahir],
                ['Tanggal Lahir', detailModal.tanggal_lahir ? formatDate(detailModal.tanggal_lahir) : '-'],
                ['WhatsApp', detailModal.no_whatsapp],
                ['Lahan', `${detailModal.lahan?.length || 0} lahan`],
                ['Alamat', detailModal.alamat],
              ].map(([label, value]) => (
                <div key={label} className={label === 'Alamat' ? 'col-span-2' : ''}>
                  <span className="text-gray-400 text-xs block">{label}</span>
                  <span className="font-medium text-foreground">{value || '-'}</span>
                </div>
              ))}
            </div>
            {(detailModal.foto_pekebun || detailModal.upload_ktp || detailModal.upload_kk) && (
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium text-foreground mb-2">Dokumen Upload</p>
                <div className="grid grid-cols-3 gap-3">
                  {detailModal.foto_pekebun && (
                    <button onClick={() => setPreviewImage(detailModal.foto_pekebun)} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                      <img src={detailModal.foto_pekebun} alt="Foto" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Foto</span>
                    </button>
                  )}
                  {detailModal.upload_ktp && (
                    <button onClick={() => setPreviewImage(detailModal.upload_ktp)} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                      <img src={detailModal.upload_ktp} alt="KTP" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">KTP</span>
                    </button>
                  )}
                  {detailModal.upload_kk && (
                    <button onClick={() => setPreviewImage(detailModal.upload_kk)} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                      <img src={detailModal.upload_kk} alt="KK" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">KK</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Pekebun" maxWidth="max-w-lg">
        <form onSubmit={handleEdit} className="space-y-3">
          <Input label="Nama" value={editModal?.nama || ''} onChange={(e) => setEditModal({ ...editModal, nama: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="NIK (16 digit)" value={editModal?.nik || ''} onChange={(e) => setEditModal({ ...editModal, nik: e.target.value })} required maxLength={16} />
            <Input label="No. KK" value={editModal?.no_kk || ''} onChange={(e) => setEditModal({ ...editModal, no_kk: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Tempat Lahir" value={editModal?.tempat_lahir || ''} onChange={(e) => setEditModal({ ...editModal, tempat_lahir: e.target.value })} required />
            <DatePicker label="Tanggal Lahir" value={editModal?.tanggal_lahir || ''} onChange={(v) => setEditModal({ ...editModal, tanggal_lahir: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="No. WhatsApp" value={editModal?.no_whatsapp || ''} onChange={(e) => setEditModal({ ...editModal, no_whatsapp: e.target.value })} />
            <Select label="Status" value={editModal?.status || 'pending'} onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
          <Input label="Alamat" value={editModal?.alamat || ''} onChange={(e) => setEditModal({ ...editModal, alamat: e.target.value })} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditModal(null)}>Batal</Button>
            <Button type="submit" loading={submitting}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Pekebun" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm">
          Yakin ingin menghapus <strong>{deleteModal?.nama}</strong>?
          {deleteModal?.lahan?.length > 0 && (
            <> Data lahan terkait ({deleteModal.lahan.length} lahan) juga akan terhapus.</>
          )}
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Fullscreen Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
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
