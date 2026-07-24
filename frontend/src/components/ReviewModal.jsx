'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import KartuAnggotaKud from '@/components/KartuAnggotaKud';
import { formatDate } from '@/lib/date';
import {
  EyeIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon,
  CreditCardIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP', foto_kk: 'Foto KK', akte: 'Akte',
  foto_pekebun: 'Foto Pekebun', foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

const TABS = [
  { id: 'detail', label: 'Detail Pendaftaran', icon: EyeIcon },
  { id: 'kartu', label: 'Kartu Anggota', icon: CreditCardIcon },
];

export default function ReviewModal({ open, onClose, data, onVerifikasi, kartuAnggota }) {
  const [tab, setTab] = useState('detail');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!data) return null;

  const tabs = onVerifikasi
    ? [...TABS, { id: 'verifikasi', label: 'Verifikasi', icon: CheckCircleIcon }]
    : TABS;

  const d = data;
  const dokumen = d.data?.dokumen || {};
  const hasDokumen = Object.keys(dokumen).length > 0;
  const hasSurat = d.setuju_surat_1 !== undefined && d.programKud?.aktifkan_surat;

  const handleVerifikasi = async (status) => {
    if (!onVerifikasi) return;
    setSubmitting(true);
    try {
      await onVerifikasi(d.id, status, catatan);
      onClose();
    } catch (err) {
      // error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const statusBg = (s) =>
    s === 'verified' ? 'bg-green-100 text-green-700' :
    s === 'rejected' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700';

  return (
    <>
      <Modal open={open} onClose={onClose} title="Review & Cetak" maxWidth="max-w-3xl">
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                tab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-gray-500 hover:text-foreground'
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'detail' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">{d.pekebun?.nama?.charAt(0) || '?'}</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">{d.pekebun?.nama || '-'}</h3>
                <p className="text-xs text-gray-500">NIK: {d.pekebun?.nik || '-'}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${statusBg(d.status)}`}>
                {d.status === 'verified' ? 'Disetujui' : d.status === 'rejected' ? 'Ditolak' : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-400 text-xs block">Program</span>
                <span className="font-medium text-foreground">{d.programKud?.nama || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 text-xs block">Tanggal Daftar</span>
                <span className="font-medium text-foreground">{d.created_at ? formatDate(d.created_at) : '-'}</span>
              </div>
              {d.lahan && (
                <>
                  <div className="space-y-1">
                    <span className="text-gray-400 text-xs block">Alamat Lahan</span>
                    <span className="font-medium text-foreground">{d.lahan.alamat_lahan}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 text-xs block">Luas Lahan</span>
                    <span className="font-medium text-foreground">{Number(d.lahan.luas_lahan_m2).toLocaleString()} M²</span>
                  </div>
                </>
              )}
            </div>

            {hasDokumen && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dokumen Terupload</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {Object.entries(dokumen).map(([key, url]) => (
                    <button key={key} onClick={() => { setPreviewImage(url); setPreviewLabel(PERSYARATAN_LABEL[key] || key); }}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                      <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                        <span className="text-white text-[9px] font-medium block truncate">{PERSYARATAN_LABEL[key] || key}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSurat && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  <DocumentTextIcon className="w-3 h-3 inline mr-1" />Status Persetujuan Surat
                </h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'Surat 1', value: d.setuju_surat_1, judul: d.programKud?.surat_1_judul },
                    { label: 'Surat 2', value: d.setuju_surat_2, judul: d.programKud?.surat_2_judul },
                    { label: 'Surat 3', value: d.setuju_surat_3, judul: d.programKud?.surat_3_judul },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-border">
                      <span className="text-sm text-gray-700">{s.judul || s.label}</span>
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
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanda Tangan Digital</h4>
                <div className="bg-white rounded-lg border border-border p-3 inline-block">
                  <img src={d.tanda_tangan_digital} alt="TTD" className="h-12 object-contain" />
                </div>
              </div>
            )}

            {d.catatan_verifikasi && (
              <div className="bg-gray-50 rounded-xl p-3 border border-border">
                <span className="text-xs font-medium text-gray-500">Catatan Verifikasi:</span>
                <p className="text-sm text-gray-700 mt-1">{d.catatan_verifikasi}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'kartu' && (
          <KartuAnggotaKud data={kartuAnggota} />
        )}

        {tab === 'verifikasi' && onVerifikasi && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {d.status === 'pending'
                ? 'Verifikasi pendaftaran program ini:'
                : 'Pendaftaran ini sudah diverifikasi.'}
            </p>
            {d.status === 'pending' && (
              <>
                <textarea
                  placeholder="Catatan verifikasi (opsional)"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm resize-none bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all"
                  rows={3}
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="ghost" onClick={onClose}>Batal</Button>
                  <Button variant="success" loading={submitting} onClick={() => handleVerifikasi('verified')}>
                    <CheckCircleIcon className="w-4 h-4" /> Setujui
                  </Button>
                  <Button variant="danger" loading={submitting} onClick={() => handleVerifikasi('rejected')}>
                    <XCircleIcon className="w-4 h-4" /> Tolak
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}>
          <div className="relative max-w-xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">{previewLabel}</span>
              <button onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all">
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
            <img src={previewImage} alt="" className="w-full h-auto rounded-2xl shadow-2xl mt-6" />
          </div>
        </div>
      )}
    </>
  );
}
