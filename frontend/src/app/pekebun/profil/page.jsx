'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { UserIcon } from '@heroicons/react/24/outline';

function UploadField({ label, current, folder, onUpload }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState('');
  const displayUrl = localUrl || current || '';
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const endpoint = `/upload/${folder}`;
      const res = await api.upload(endpoint, file);
      setLocalUrl(res.url);
      onUpload(res.url);
      toast.success(`${label} berhasil diupload`);
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {displayUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <a href={displayUrl} target="_blank"><img src={displayUrl} alt={label} className="w-full h-32 object-cover rounded-xl border border-border mb-2 hover:opacity-90 transition-opacity cursor-pointer" /></a>
      )}
      <div className="flex items-center gap-3">
        <label className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-200 transition-all">
          {uploading ? 'Uploading...' : displayUrl ? 'Ganti File' : 'Pilih File'}
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading} />
        </label>
        {displayUrl && <a href={displayUrl} target="_blank" className="text-xs text-primary hover:underline">Lihat Fullsize</a>}
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

  const uploadHandler = (folder) => async (url) => {
    const field = folder === 'foto-pekebun' ? 'foto_pekebun' : folder === 'ktp' ? 'upload_ktp' : 'upload_kk';
    const updated = { ...form, [field]: url };
    setForm(updated);
    try {
      await api.pekebun.updateProfil(updated);
      toast.success(`${field} berhasil disimpan`);
      load();
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    }
  };

  if (loading) return <div className="p-6"><CardSkeleton count={3} /></div>;

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
                <Input label="Tanggal Lahir" type="date" value={form.tanggal_lahir ? form.tanggal_lahir.split('T')[0] : ''} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} required />
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
                    <a href={profil.foto_pekebun} target="_blank"><img src={profil.foto_pekebun} alt="" className="w-full h-full object-cover" /></a>
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
                ['Tanggal Lahir', profil.tanggal_lahir ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID') : '-'],
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
            <UploadField label="Foto Pekebun" current={form.foto_pekebun || ''} folder="foto-pekebun" onUpload={uploadHandler('foto-pekebun')} />
            <UploadField label="Upload KTP" current={form.upload_ktp || ''} folder="ktp" onUpload={uploadHandler('ktp')} />
            <UploadField label="Upload KK" current={form.upload_kk || ''} folder="kk" onUpload={uploadHandler('kk')} />
          </Card>
        </div>
      </div>
    </div>
  );
}
