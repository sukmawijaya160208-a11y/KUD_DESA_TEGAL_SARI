'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import { Cog6ToothIcon, TrashIcon, PlusIcon, CreditCardIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const TABS = [
  { id: 'info', label: 'Informasi KUD', icon: BuildingOfficeIcon },
  { id: 'kartu', label: 'Desain Kartu', icon: CreditCardIcon },
  { id: 'custom', label: 'Pengaturan Lain', icon: Cog6ToothIcon },
];

export default function AdminPengaturanPage() {
  const toast = useToast();
  const [tab, setTab] = useState('info');
  const [settings, setSettings] = useState({});
  const [settingKud, setSettingKud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [savingKud, setSavingKud] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoKartuUploading, setLogoKartuUploading] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    Promise.all([
      api.admin.pengaturan.get(),
      api.admin.settingKud.get(),
    ]).then(([s, sk]) => {
      setSettings(s);
      setSettingKud(sk);
    }).catch((e) => toast.error(e.message))
    .finally(() => setLoading(false));
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

  const handleKudChange = (field, value) => {
    setSettingKud({ ...settingKud, [field]: value });
  };

  const handleSaveKud = async () => {
    setSavingKud(true);
    try {
      const res = await api.admin.settingKud.update(settingKud);
      setSettingKud(res);
      toast.success('Setting KUD berhasil disimpan');
    } catch (err) { toast.error(err.message); }
    setSavingKud(false);
  };

  const handleLogoKudUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoKartuUploading(true);
    try {
      const res = await api.upload('/upload/logo', file);
      handleKudChange('logo', res.url);
      toast.success('Logo kartu berhasil diupload');
    } catch (err) { toast.error('Upload gagal: ' + err.message); }
    setLogoKartuUploading(false);
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

  const kud = settingKud || {};
  const previewColors = {
    primary: kud.kartu_warna_primary || '#059669',
    secondary: kud.kartu_warna_secondary || '#047857',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Cog6ToothIcon className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Konfigurasi umum dan identitas KUD</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-gray-500 hover:text-foreground'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
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
          </div>
          <div className="space-y-4">
            <Card title="Logo KUD">
              <div className="flex flex-col items-center gap-4">
                {settings.logo_kud ? (
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
      )}

      {tab === 'kartu' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card title="Data KUD untuk Kartu">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Nama KUD di Kartu</label>
                  <input value={kud.nama_kud || ''} onChange={(e) => handleKudChange('nama_kud', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Alamat KUD</label>
                  <textarea value={kud.alamat || ''} onChange={(e) => handleKudChange('alamat', e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Telepon</label>
                    <input value={kud.telepon || ''} onChange={(e) => handleKudChange('telepon', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
                    <input value={kud.email || ''} onChange={(e) => handleKudChange('email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Website</label>
                    <input value={kud.website || ''} onChange={(e) => handleKudChange('website', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Tahun Anggaran</label>
                    <input value={kud.tahun_anggaran || ''} onChange={(e) => handleKudChange('tahun_anggaran', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div><hr className="border-border my-2" /></div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Nama Ketua KUD</label>
                  <input value={kud.nama_ketua || ''} onChange={(e) => handleKudChange('nama_ketua', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Sekretaris</label>
                    <input value={kud.nama_sekretaris || ''} onChange={(e) => handleKudChange('nama_sekretaris', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Bendahara</label>
                    <input value={kud.nama_bendahara || ''} onChange={(e) => handleKudChange('nama_bendahara', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Desain Kartu">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Warna Utama</label>
                    <div className="flex gap-2">
                      <input type="color" value={kud.kartu_warna_primary || '#059669'} onChange={(e) => handleKudChange('kartu_warna_primary', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <input value={kud.kartu_warna_primary || '#059669'} onChange={(e) => handleKudChange('kartu_warna_primary', e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Warna Sekunder</label>
                    <div className="flex gap-2">
                      <input type="color" value={kud.kartu_warna_secondary || '#047857'} onChange={(e) => handleKudChange('kartu_warna_secondary', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <input value={kud.kartu_warna_secondary || '#047857'} onChange={(e) => handleKudChange('kartu_warna_secondary', e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all font-mono" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Logo di Kartu</label>
                  <div className="flex items-center gap-4">
                    {kud.logo ? (
                      <img src={kud.logo} alt="Logo Kartu" className="w-16 h-16 object-contain rounded-xl border border-border" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-gray-400 text-xs">Belum ada</div>
                    )}
                    <label className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-dark transition-all">
                      {logoKartuUploading ? 'Upload...' : 'Upload Logo'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoKudUpload} disabled={logoKartuUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ttd-kartu" checked={kud.tanda_tangan_kartu !== false} onChange={(e) => handleKudChange('tanda_tangan_kartu', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="ttd-kartu" className="text-sm text-foreground/80">Tampilkan tanda tangan Ketua di kartu</label>
                </div>

                <Button onClick={handleSaveKud} loading={savingKud} className="w-full">
                  Simpan Setting KUD & Desain Kartu
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Preview Kartu Anggota">
              <p className="text-xs text-gray-400 mb-3">Simpan setting terlebih dahulu untuk melihat perubahan</p>
              <div className="flex justify-center">
                <div
                  className="rounded-xl overflow-hidden shadow-lg"
                  style={{
                    width: '300px',
                    background: `linear-gradient(135deg, ${previewColors.primary} 0%, ${previewColors.secondary} 100%)`,
                    color: 'white',
                  }}
                >
                  <div className="flex" style={{ minHeight: '180px' }}>
                    <div className="w-[44%] p-3 flex flex-col items-center justify-center gap-1.5">
                      {kud.logo || settings.logo_kud ? (
                        <img src={kud.logo || settings.logo_kud} alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">KUD</div>
                      )}
                      <div className="text-[7px] font-extrabold text-center leading-tight uppercase">{kud.nama_kud || settings.nama_kud || 'KUD Desa Sari Subur'}</div>
                      <div className="text-[5px] text-center leading-tight opacity-80">{kud.alamat || settings.alamat_kud || ''}</div>
                    </div>
                    <div className="w-[56%] bg-white rounded-r-xl p-3 relative" style={{ color: '#1e293b' }}>
                      <div className="text-[5.5px] font-bold uppercase tracking-wider opacity-60 mb-1">Kartu Anggota</div>
                      <div className="w-9 h-11 rounded absolute top-2 right-2 bg-gray-100 flex items-center justify-center text-[7px] font-bold text-gray-400">?</div>
                      <div className="text-[9px] font-extrabold mb-0.5">Nama Anggota</div>
                      <div className="text-[6px] leading-relaxed opacity-80">
                        <div><span className="inline-block w-[72px]">NIK</span>: 1234567890</div>
                        <div><span className="inline-block w-[72px]">Tgl Lahir</span>: 01 Jan 1990</div>
                      </div>
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="text-[6.5px] font-bold tracking-wide">No: KUD-00001/2026</div>
                      <div className="flex justify-between items-end mt-auto pt-0.5">
                        <div className="text-[5px] opacity-60">Terbit: 24 Jul 2026<br />Berlaku: 24 Jul 2031</div>
                        {kud.tanda_tangan_kartu !== false && (
                          <div className="text-right">
                            <div className="text-[4.5px] mt-0.5 font-medium text-gray-500">{kud.nama_ketua || 'Ketua KUD'}</div>
                            <div className="text-[4.5px] mt-0.5">Ketua KUD</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
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
        </div>
      )}
    </div>
  );
}
