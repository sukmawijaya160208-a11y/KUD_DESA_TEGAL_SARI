'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/date';


import {
  BookOpenIcon, EyeIcon, CheckCircleIcon, XCircleIcon,
  XMarkIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon,
  ClockIcon, DocumentTextIcon, PrinterIcon
} from '@heroicons/react/24/outline';
import ReviewModal from '@/components/ReviewModal';
const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP', foto_kk: 'Foto KK', akte: 'Akte',
  foto_pekebun: 'Foto Pekebun', foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

export default function AdminPendaftaranPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [kartuAnggota, setKartuAnggota] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    api.admin.pendaftaran.list()
      .then((d) => setData((d.data || []).map((item) => ({ ...item, data: typeof item.data === 'string' ? (() => { try { return JSON.parse(item.data); } catch { return item.data; } })() : item.data }))))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [toast]);

  const filtered = data.filter((d) => !filterStatus || d.status === filterStatus);

  const handleVerifikasi = async (id, status, catatan = '') => {
    const note = catatan ?? prompt(`Masukkan catatan untuk ${status === 'verified' ? 'menerima' : 'menolak'} pendaftaran ini:`);
    if (note === null) return;
    try {
      await api.admin.pendaftaran.verifikasi(id, { status, catatan: note });
      toast.success(`Pendaftaran berhasil ${status === 'verified' ? 'diterima' : 'ditolak'}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReview = async (item) => {
    try {
      const card = await api.admin.settingKud.kartuAnggota(item.pekebun?.id);
      setKartuAnggota(card);
      setReviewModal(item);
    } catch (err) {
      toast.error('Gagal memuat data kartu: ' + err.message);
      setReviewModal(item);
      setKartuAnggota(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pendaftaran ini?')) return;
    try {
      await api.admin.pendaftaran.delete(id);
      toast.success('Pendaftaran berhasil dihapus');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statusBg = (s) => s === 'verified' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  if (loading) return <TableSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpenIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pendaftaran Program</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola pendaftaran peserta program KUD</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Belum ada pendaftaran</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">{d.pekebun?.nama?.charAt(0) || '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{d.pekebun?.nama || '-'}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{d.programKud?.nama}</span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{formatDate(d.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBg(d.status)}`}>{d.status}</span>
                    <button onClick={() => setExpandedId(expandedId === d.id ? null : d.id)} className="p-1.5 text-gray-400 hover:text-foreground transition-colors cursor-pointer">
                      {expandedId === d.id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedId === d.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data Diri</h4>
                        <div className="text-sm space-y-1 text-gray-600">
                          <p><span className="text-gray-400">NIK:</span> {d.pekebun?.nik || '-'}</p>
                          <p><span className="text-gray-400">KK:</span> {d.pekebun?.no_kk || '-'}</p>
                          <p><span className="text-gray-400">WhatsApp:</span> {d.pekebun?.no_whatsapp || '-'}</p>
                          <p><span className="text-gray-400">Alamat:</span> {d.pekebun?.alamat || '-'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data Lahan</h4>
                        {d.lahan ? (
                          <div className="text-sm space-y-1 text-gray-600">
                            <p><span className="text-gray-400">Alamat:</span> {d.lahan.alamat_lahan}</p>
                            <p><span className="text-gray-400">Surat:</span> {d.lahan.jenis_surat} - {d.lahan.nomor_surat}</p>
                            <p><span className="text-gray-400">Luas:</span> {Number(d.lahan.luas_lahan_m2).toLocaleString()} M²</p>
                          </div>
                        ) : <p className="text-sm text-gray-400">Tidak ada data lahan</p>}
                      </div>
                    </div>

                    {d.data?.dokumen && Object.keys(d.data.dokumen).length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dokumen Terupload</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {Object.entries(d.data.dokumen).map(([key, url]) => (
                            <button key={key} onClick={() => { setPreviewImage(url); setPreviewLabel(PERSYARATAN_LABEL[key] || key); }}
                              className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={key} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <span className="text-white text-[10px] font-medium block truncate">{PERSYARATAN_LABEL[key] || key}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {d.setuju_surat_1 !== undefined && d.programKud?.aktifkan_surat && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          <DocumentTextIcon className="w-3.5 h-3.5 inline mr-1" />
                          Status Persetujuan Surat
                        </h4>
                        <div className="space-y-2">
                          {[
                            { label: 'Surat 1', value: d.setuju_surat_1, judul: d.programKud?.surat_1_judul },
                            { label: 'Surat 2', value: d.setuju_surat_2, judul: d.programKud?.surat_2_judul },
                            { label: 'Surat 3', value: d.setuju_surat_3, judul: d.programKud?.surat_3_judul },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-border">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${s.value ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className="text-sm text-gray-700">{s.judul || s.label}</span>
                              </div>
                              <span className={`text-xs font-semibold ${s.value ? 'text-green-600' : 'text-gray-400'}`}>
                                {s.value ? '✓ Disetujui' : '✗ Belum'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {d.tanda_tangan_digital && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tanda Tangan Digital</h4>
                        <div className="bg-white rounded-lg border border-border p-4 inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.tanda_tangan_digital} alt="Tanda Tangan" className="h-16 object-contain" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button size="sm" variant="secondary" onClick={() => handleReview(d)}>
                        <PrinterIcon className="w-4 h-4" /> Review & Cetak
                      </Button>
                      {d.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => handleVerifikasi(d.id, 'verified')}>
                            <CheckCircleIcon className="w-4 h-4" /> Terima
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleVerifikasi(d.id, 'rejected')}>
                            <XCircleIcon className="w-4 h-4" /> Tolak
                          </Button>
                        </>
                      )}
                      {d.catatan_verifikasi && (
                        <span className="text-xs text-gray-400 ml-auto">Catatan: {d.catatan_verifikasi}</span>
                      )}
                      <button onClick={() => handleDelete(d.id)} className="ml-auto p-1.5 text-gray-400 hover:text-destructive transition-colors cursor-pointer" title="Hapus">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">{previewLabel}</span>
              <button onClick={() => { setPreviewImage(null); setPreviewLabel(''); }} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all">
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="" className="w-full h-auto rounded-2xl shadow-2xl mt-6" />
          </div>
        </div>
      )}

      <ReviewModal
        open={!!reviewModal}
        onClose={() => { setReviewModal(null); setKartuAnggota(null); }}
        data={reviewModal}
        kartuAnggota={kartuAnggota}
        onVerifikasi={reviewModal?.status === 'pending' ? (id, status, catatan) => handleVerifikasi(id, status) : undefined}
      />
    </div>
  );
}
