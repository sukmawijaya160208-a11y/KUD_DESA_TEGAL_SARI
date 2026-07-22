'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import DatePicker from '@/components/ui/DatePicker';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { UserIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/date';

async function compressImage(file, maxSizeMB = 2, maxWidth = 1920) {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {displayUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <a href={displayUrl} target="_blank" rel="noopener noreferrer"><img src={displayUrl} alt={label} className="w-full h-32 object-cover rounded-xl border border-border mb-2 hover:opacity-90 transition-opacity cursor-pointer" /></a>
      )}
      {fileInfo && (
        <div className="text-xs text-gray-500 mb-2 space-y-0.5">
          <span className="block">Ukuran: {formatSize(wasCompressed ? fileInfo.compressedSize : fileInfo.originalSize)}</span>
          {wasCompressed && (
            <span className="text-green-600">Terkompres dari {formatSize(fileInfo.originalSize)} ke {formatSize(fileInfo.compressedSize)}</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-200 transition-all">
          {uploading ? 'Uploading...' : displayUrl ? 'Ganti File' : 'Pilih File'}
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading} />
        </label>
        {displayUrl && <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Lihat Fullsize</a>}
        {displayUrl && onDelete && (
          <>
            <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline">Hapus</button>
            <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Hapus Dokumen" maxWidth="max-w-sm">
              <p className="text-sm text-gray-600 mb-4">Yakin ingin menghapus {label.toLowerCase()}?</p>
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

  const load = useCallback(() => api.pekebun.profil().then((d) => { setProfil(d); setForm({ ...d }); }).catch((err) => toast.error(err.message)).finally(() => setLoading(false)), [toast]);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        <Button onClick={() => setEditing(!editing)}>{editing ? 'Batal' : 'Edit Profil'}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Data Diri" className="lg:col-span-2">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Nama" value={form.nama || ''} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
              <Input label="NIK" value={form.nik || ''} onChange={(e) => setForm({ ...form, nik: e.target.value })} required />
              <Input label="No. KK" value={form.no_kk || ''} onChange={(e) => setForm({ ...form, no_kk: e.target.value })} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Tempat Lahir" value={form.tempat_lahir || ''} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} required />
                <DatePicker label="Tanggal Lahir" value={form.tanggal_lahir ? form.tanggal_lahir.split('T')[0] : ''} onChange={(v) => setForm({ ...form, tanggal_lahir: v })} />
              </div>
              <Input label="No. WhatsApp" value={form.no_whatsapp || ''} onChange={(e) => setForm({ ...form, no_whatsapp: e.target.value })} />
              <Textarea label="Alamat" value={form.alamat || ''} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={2} />
              <Button type="submit" loading={saving}>Simpan Perubahan</Button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  {profil?.foto_pekebun ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <a href={profil.foto_pekebun} target="_blank" rel="noopener noreferrer"><img src={profil.foto_pekebun} alt="" className="w-full h-full object-cover" /></a>
                  ) : (
                    <UserIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{profil?.nama || 'Profil Belum Lengkap'}</h2>
                  {profil && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${profil.status === 'verified' ? 'bg-green-100 text-green-700' : profil.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{profil.status}</span>}
                </div>
              </div>
              {profil ? [
                ['NIK', profil.nik], ['No. KK', profil.no_kk], ['Tempat Lahir', profil.tempat_lahir],
                ['Tanggal Lahir', profil.tanggal_lahir ? formatDate(profil.tanggal_lahir) : '-'],
                ['No. WhatsApp', profil.no_whatsapp], ['Alamat', profil.alamat],
              ].map(([label, value]) => (
                <div key={label} className="flex border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500 w-32">{label}</span>
                  <span className="text-sm text-gray-800 font-medium">{value || '-'}</span>
                </div>
              )) : <p className="text-sm text-gray-500">Lengkapi data profil Anda.</p>}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Upload Dokumen">
            <UploadField label="Foto Pekebun" current={form.foto_pekebun || ''} folder="foto-pekebun" onUpload={uploadHandler('foto-pekebun')} onDelete={() => handleDelete('foto_pekebun')} />
            <UploadField label="Upload KTP" current={form.upload_ktp || ''} folder="ktp" onUpload={uploadHandler('ktp')} onDelete={() => handleDelete('upload_ktp')} />
            <UploadField label="Upload KK" current={form.upload_kk || ''} folder="kk" onUpload={uploadHandler('kk')} onDelete={() => handleDelete('upload_kk')} />
          </Card>
        </div>
      </div>
    </div>
  );
}
