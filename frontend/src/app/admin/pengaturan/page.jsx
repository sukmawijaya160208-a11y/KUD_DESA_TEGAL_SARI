'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import { Cog6ToothIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function AdminPengaturanPage() {
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    api.admin.pengaturan.get().then(setSettings).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [toast]);

  const updateSetting = async (key, value) => {
    setSaving(key);
    try { await api.admin.pengaturan.update({ key, value }); setSettings({ ...settings, [key]: value }); toast.success(`${key} berhasil disimpan`); } catch (err) { toast.error(err.message); }
    setSaving(null);
  };

  const deleteSetting = async (key) => {
    try { await api.admin.pengaturan.delete(key); const s = { ...settings }; delete s[key]; setSettings(s); toast.success(`Pengaturan ${key} berhasil dihapus`); } catch (err) { toast.error(err.message); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoUploading(true);
    try {
      const res = await api.upload('/upload/logo', file);
      await updateSetting('logo_kud', res.url);
      toast.success('Logo berhasil diupload');
    } catch (err) { toast.error('Upload gagal: ' + err.message); }
    setLogoUploading(false);
  };

  const handleAddSetting = async () => {
    if (!newKey.trim()) return;
    await updateSetting(newKey.trim(), newVal.trim());
    setNewKey(''); setNewVal('');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat...</div>;

  const predefinedFields = [
    { key: 'nama_kud', label: 'Nama KUD', desc: 'Nama resmi Koperasi Unit Desa' },
    { key: 'nama_ketua', label: 'Nama Ketua', desc: 'Nama ketua KUD saat ini' },
    { key: 'tahun_anggaran', label: 'Tahun Anggaran', desc: 'Tahun anggaran berjalan' },
    { key: 'alamat_kud', label: 'Alamat KUD', desc: 'Alamat kantor KUD' },
    { key: 'telepon_kud', label: 'Telepon KUD', desc: 'Nomor telepon kantor' },
    { key: 'email_kud', label: 'Email KUD', desc: 'Alamat email resmi' },
  ];

  const customKeys = Object.keys(settings).filter((k) => !predefinedFields.find((f) => f.key === k) && k !== 'logo_kud');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Cog6ToothIcon className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Konfigurasi umum dan identitas KUD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Informasi KUD">
            <div className="space-y-4">
              {predefinedFields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">{f.label}</label>
                  <p className="text-xs text-gray-400 mb-1.5">{f.desc}</p>
                  <div className="flex gap-2">
                    <input value={settings[f.key] || ''} onChange={(e) => setSettings({...settings, [f.key]: e.target.value})}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                    <Button size="sm" loading={saving === f.key} onClick={() => updateSetting(f.key, settings[f.key])}>Simpan</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {customKeys.length > 0 && (
            <Card title="Pengaturan Tambahan">
              <div className="space-y-3">
                {customKeys.map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-foreground/70 mb-1">{k}</label>
                      <div className="flex gap-2">
                        <input value={settings[k] || ''} onChange={(e) => setSettings({...settings, [k]: e.target.value})}
                          className="flex-1 px-4 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                        <Button size="sm" loading={saving === k} onClick={() => updateSetting(k, settings[k])}>Simpan</Button>
                        <button onClick={() => deleteSetting(k)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Tambah Pengaturan Baru">
            <div className="flex flex-wrap gap-2">
              <input placeholder="Nama key (contoh: visi_kud)" value={newKey} onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
              <input placeholder="Nilai" value={newVal} onChange={(e) => setNewVal(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
              <Button onClick={handleAddSetting}><PlusIcon className="w-4 h-4" /> Tambah</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Logo KUD">
            <div className="flex flex-col items-center gap-4">
              {settings.logo_kud ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={settings.logo_kud} alt="Logo KUD" className="w-32 h-32 object-contain rounded-xl border border-border" />
              ) : (
                <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center text-gray-400 text-sm">Belum ada logo</div>
              )}
              <label className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-dark transition-all">
                {logoUploading ? 'Uploading...' : 'Upload Logo'}
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
