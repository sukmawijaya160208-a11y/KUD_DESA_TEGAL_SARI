'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import DatePicker from '@/components/ui/DatePicker';
import Modal from '@/components/ui/Modal';
import PrintButton from '@/components/PrintButton';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { UserIcon, PencilIcon, CameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import KartuAnggotaKud from '@/components/KartuAnggotaKud';
import { formatDate } from '@/lib/date';

async function compressImage(file, maxSizeMB = 2, maxWidth = 1920) {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const cleanup = () => { try { URL.revokeObjectURL(url); } catch {} };
    img.onload = () => {
      cleanup();
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
        resolve(compressed.size < file.size ? compressed : file);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = () => { cleanup(); resolve(file); };
    img.onabort = () => { cleanup(); resolve(file); };
    img.src = url;
  });
}

function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2) + ' MB';
}

function UploadField({ label, current, folder, onUpload, onDelete }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const displayUrl = localUrl || current || '';

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const originalSize = file.size;
      const compressed = await compressImage(file);
      const compressedSize = compressed.size;
      const endpoint = `/upload/${folder}`;
      const res = await api.upload(endpoint, compressed);
      setLocalUrl(res.url);
      setFileInfo({ name: file.name, originalSize, compressedSize });
      onUpload(res.url);
      toast.success(`${label} berhasil diupload`);
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploading(false);
  };

  const handleDeleteConfirm = async () => {
    setConfirmDelete(false);
    if (onDelete) {
      await onDelete();
      setLocalUrl('');
      setFileInfo(null);
    }
  };

  const wasCompressed = fileInfo && fileInfo.compressedSize < fileInfo.originalSize;

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>
      {displayUrl && (
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-32 rounded-xl overflow-hidden border border-border mb-2 group">
          <img src={displayUrl} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </a>
      )}
      {fileInfo && (
        <div className="text-xs text-muted-foreground mb-2 space-y-0.5">
          <span>Ukuran: {formatSize(wasCompressed ? fileInfo.compressedSize : fileInfo.originalSize)}</span>
          {wasCompressed && (
            <span className="text-green-600 block">Terkompres dari {formatSize(fileInfo.originalSize)}</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="px-4 py-2 bg-muted rounded-xl text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-all border border-dashed border-border">
          {uploading ? 'Uploading...' : displayUrl ? 'Ganti File' : 'Pilih File'}
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading} />
        </label>
        {displayUrl && <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Lihat Fullsize</a>}
        {displayUrl && onDelete && (
          <>
            <button onClick={() => setConfirmDelete(true)} className="text-xs text-destructive hover:text-destructive-hover font-medium hover:underline">Hapus</button>
            <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Hapus Dokumen" maxWidth="max-w-sm">
              <p className="text-sm text-muted-foreground mb-4">Yakin ingin menghapus {label.toLowerCase()}?</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Batal</Button>
                <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>Hapus</Button>
              </div>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
}

export default function PekebunProfilPage() {
  const toast = useToast();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [kartuData, setKartuData] = useState(null);

  const load = useCallback(() => {
    api.pekebun.profil().then((d) => { setProfil(d); setForm({ ...d }); }).catch((err) => toast.error(err.message)).finally(() => setLoading(false));
    api.pekebun.kartuAnggota().then(setKartuData).catch(() => {});
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const uploadHandler = (folder) => (url) => {
    if (folder === 'foto-pekebun') {
      setForm((prev) => ({ ...prev, foto_pekebun: url }));
    } else {
      setForm((prev) => ({ ...prev, [`upload_${folder}`]: url }));
    }
  };

  const handleDelete = async (field) => {
    try {
      await api.pekebun.updateProfil({ [field]: null });
      setForm((prev) => ({ ...prev, [field]: '' }));
      toast.success('Dokumen berhasil dihapus');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.pekebun.updateProfil(form);
      setEditing(false);
      toast.success('Profil berhasil diperbarui');
      load();
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6"><CardSkeleton /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Informasi data diri dan dokumen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton
            title="Profil Pekebun"
            fetchAll={() => api.pekebun.profil().then((d) => [d])}
            renderContent={(items) => {
              const p = items[0];
              if (!p) return '<div class="empty-state">Belum ada data profil</div>';
              return `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:16px">
                  ${[
                    ['Nama', p.nama],
                    ['NIK', p.nik],
                    ['No. KK', p.no_kk || '-'],
                    ['Tempat Lahir', p.tempat_lahir || '-'],
                    ['Tanggal Lahir', p.tanggal_lahir ? formatDate(p.tanggal_lahir) : '-'],
                    ['WhatsApp', p.no_whatsapp || '-'],
                    ['Alamat', p.alamat || '-'],
                    ['Status', p.status],
                  ].map(([l, v]) => `
                    <div style="border-bottom:1px solid #f1f5f9;padding:4px 0">
                      <span style="font-size:10px;color:#94a3b8">${l}</span>
                      <div style="font-size:13px;font-weight:600;color:#0f172a">${v}</div>
                    </div>
                  `).join('')}
                </div>
                ${p.foto_pekebun ? `<div style="margin-top:12px"><span style="font-size:10px;color:#94a3b8">Foto Pekebun</span><br><img src="${p.foto_pekebun}" style="width:120px;height:120px;object-fit:cover;border-radius:12px;margin-top:4px;border:1px solid #e2e8f0" /></div>` : ''}
              `;
            }}
          />
          <Button onClick={() => setEditing(!editing)}>
            <PencilIcon className="w-4 h-4" /> {editing ? 'Batal' : 'Edit Profil'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-primary/10 shadow-sm">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Nama" value={form.nama || ''} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                  <Input label="NIK" value={form.nik || ''} onChange={(e) => setForm({ ...form, nik: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select label="Jenis Kelamin" value={form.jenis_kelamin || ''} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}>
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="LAKI-LAKI">Laki-Laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </Select>
                  <Input label="No. KK" value={form.no_kk || ''} onChange={(e) => setForm({ ...form, no_kk: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="No. WhatsApp" value={form.no_whatsapp || ''} onChange={(e) => setForm({ ...form, no_whatsapp: e.target.value })} />
                  <Input label="Tempat Lahir" value={form.tempat_lahir || ''} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DatePicker label="Tanggal Lahir" value={form.tanggal_lahir ? form.tanggal_lahir.split('T')[0] : ''} onChange={(v) => setForm({ ...form, tanggal_lahir: v })} />
                </div>
                <Textarea label="Alamat" value={form.alamat || ''} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={2} />
                <Button type="submit" loading={saving}>Simpan Perubahan</Button>
              </form>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                    {profil?.foto_pekebun ? (
                      <a href={profil.foto_pekebun} target="_blank" rel="noopener noreferrer">
                        <img src={profil.foto_pekebun} alt="" className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <UserIcon className="w-8 h-8 text-primary/60" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{profil?.nama || 'Profil Belum Lengkap'}</h2>
                    {profil && (
                      <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                        profil.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                        profil.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {profil.status === 'verified' ? 'Terverifikasi' : profil.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                      </span>
                    )}
                  </div>
                </div>
                {profil ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                    {[
                      ['NIK', profil.nik],
                      ['Jenis Kelamin', profil.jenis_kelamin || '-'],
                      ['No. KK', profil.no_kk || '-'],
                      ['Tempat Lahir', profil.tempat_lahir || '-'],
                      ['Tanggal Lahir', profil.tanggal_lahir ? formatDate(profil.tanggal_lahir) : '-'],
                      ['No. WhatsApp', profil.no_whatsapp || '-'],
                      ['Alamat', profil.alamat || '-'],
                    ].map(([label, value]) => (
                      <div key={label} className="py-2 border-b border-gray-50 flex items-start gap-2">
                        <span className="text-xs text-muted-foreground min-w-[100px]">{label}</span>
                        <span className="text-sm font-medium text-foreground">{value || '-'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-muted-foreground">Lengkapi data profil Anda</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Upload Dokumen" className="border border-primary/10 shadow-sm">
            <UploadField label="Foto Pekebun" current={form.foto_pekebun || ''} folder="foto-pekebun" onUpload={uploadHandler('foto-pekebun')} onDelete={() => handleDelete('foto_pekebun')} />
            <UploadField label="Upload KTP" current={form.upload_ktp || ''} folder="ktp" onUpload={uploadHandler('ktp')} onDelete={() => handleDelete('upload_ktp')} />
            <UploadField label="Upload KK" current={form.upload_kk || ''} folder="kk" onUpload={uploadHandler('kk')} onDelete={() => handleDelete('upload_kk')} />
          </Card>

          {kartuData && <KartuAnggotaKud data={kartuData} />}
        </div>
      </div>
    </div>
  );
}
