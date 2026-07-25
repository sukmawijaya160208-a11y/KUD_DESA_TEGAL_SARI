'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon, TrashIcon, PlusIcon, CreditCardIcon, BuildingOfficeIcon,
  UserIcon, ShieldCheckIcon, ServerIcon, KeyIcon,
  EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon,
  CheckCircleIcon, XMarkIcon, ArrowUpTrayIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const TABS = [
  { id: 'profil', label: 'Profil Admin', icon: UserIcon, color: 'from-blue-500 to-blue-600' },
  { id: 'info', label: 'Informasi KUD', icon: BuildingOfficeIcon, color: 'from-emerald-500 to-emerald-600' },
  { id: 'keamanan', label: 'Keamanan & Akses', icon: ShieldCheckIcon, color: 'from-purple-500 to-purple-600' },
  { id: 'sistem', label: 'Konfigurasi Sistem', icon: ServerIcon, color: 'from-amber-500 to-amber-600' },
];

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.015 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function FormSection({ title, icon: Icon, description, children }) {
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
        {Icon && <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>}
        <div>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

export default function AdminPengaturanPage() {
  const toast = useToast();
  const [tab, setTab] = useState('profil');
  const [settings, setSettings] = useState({});
  const [settingKud, setSettingKud] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [savingKud, setSavingKud] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoKartuUploading, setLogoKartuUploading] = useState(false);
  const [profilUploading, setProfilUploading] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  // Password
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving2FA, setSaving2FA] = useState(false);

  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // WhatsApp Gateway
  const [waGateway, setWaGateway] = useState({ wa_url: '', wa_api_key: '', wa_aktif: false });
  const [savingWA, setSavingWA] = useState(false);

  // Kuota default
  const [defaultKuota, setDefaultKuota] = useState('');
  const [savingKuota, setSavingKuota] = useState(false);

  // Logout all
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    Promise.all([
      api.admin.pengaturan.get(),
      api.admin.settingKud.get(),
      api.auth.me ? api.auth.me().catch(() => null) : null,
    ]).then(([s, sk, me]) => {
      setSettings(s);
      setSettingKud(sk);
      setProfile(me);
      setTwoFactorEnabled(s?.two_factor_auth === '1');
      setMaintenanceMode(s?.maintenance_mode === '1');
      setWaGateway({
        wa_url: s?.wa_gateway_url || '',
        wa_api_key: s?.wa_gateway_api_key || '',
        wa_aktif: s?.wa_gateway_aktif === '1',
      });
      setDefaultKuota(s?.default_kuota || '');
    }).catch((e) => toast.error(e.message))
    .finally(() => setLoading(false));
  }, [toast]);

  const updateSetting = async (key, value) => {
    setSaving(key);
    try {
      await api.admin.pengaturan.update({ key, value });
      setSettings({ ...settings, [key]: value });
      toast.success(`${key} berhasil disimpan`);
    } catch (err) { toast.error(err.message); }
    setSaving(null);
  };

  const deleteSetting = async (key) => {
    try {
      await api.admin.pengaturan.delete(key);
      const s = { ...settings }; delete s[key]; setSettings(s);
      toast.success(`Pengaturan ${key} berhasil dihapus`);
    } catch (err) { toast.error(err.message); }
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

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setProfilUploading(true);
    try {
      if (api.auth.uploadProfile) {
        const res = await api.auth.uploadProfile(file);
        setProfile((prev) => ({ ...prev, foto_profil: res.url }));
        toast.success('Foto profil berhasil diupload');
      } else {
        const res = await api.upload('/auth/upload-profil', file);
        toast.success('Foto profil berhasil diupload');
      }
    } catch (err) { toast.error('Upload gagal: ' + err.message); }
    setProfilUploading(false);
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : '') },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
          new_password_confirmation: passwordForm.confirm_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengubah password');
      toast.success('Password berhasil diubah');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.message); }
    setSavingPassword(false);
  };

  const handleToggle2FA = async () => {
    setSaving2FA(true);
    try {
      const newVal = !twoFactorEnabled;
      await updateSetting('two_factor_auth', newVal ? '1' : '0');
      setTwoFactorEnabled(newVal);
      toast.success(newVal ? '2FA diaktifkan' : '2FA dinonaktifkan');
    } catch (err) { toast.error(err.message); }
    setSaving2FA(false);
  };

  const handleToggleMaintenance = async () => {
    setSavingMaintenance(true);
    try {
      const newVal = !maintenanceMode;
      await updateSetting('maintenance_mode', newVal ? '1' : '0');
      setMaintenanceMode(newVal);
      toast.success(newVal ? 'Mode maintenance diaktifkan' : 'Mode maintenance dinonaktifkan');
    } catch (err) { toast.error(err.message); }
    setSavingMaintenance(false);
  };

  const handleSaveWA = async () => {
    setSavingWA(true);
    try {
      await updateSetting('wa_gateway_url', waGateway.wa_url);
      await updateSetting('wa_gateway_api_key', waGateway.wa_api_key);
      await updateSetting('wa_gateway_aktif', waGateway.wa_aktif ? '1' : '0');
      toast.success('Konfigurasi WhatsApp berhasil disimpan');
    } catch (err) { toast.error(err.message); }
    setSavingWA(false);
  };

  const handleSaveDefaultKuota = async () => {
    setSavingKuota(true);
    try {
      await updateSetting('default_kuota', defaultKuota);
      toast.success('Kuota default berhasil disimpan');
    } catch (err) { toast.error(err.message); }
    setSavingKuota(false);
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : '') },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal logout');
      toast.success('Semua perangkat berhasil logout');
      setShowLogoutConfirm(false);
    } catch (err) { toast.error(err.message); }
    setLoggingOut(false);
  };

  const kud = settingKud || {};

  const predefinedFields = [
    { key: 'nama_kud', label: 'Nama KUD', desc: 'Nama resmi Koperasi Unit Desa' },
    { key: 'nama_ketua', label: 'Nama Ketua', desc: 'Nama ketua KUD saat ini' },
    { key: 'tahun_anggaran', label: 'Tahun Anggaran', desc: 'Tahun anggaran berjalan' },
    { key: 'alamat_kud', label: 'Alamat KUD', desc: 'Alamat kantor KUD' },
    { key: 'telepon_kud', label: 'Telepon KUD', desc: 'Nomor telepon kantor' },
    { key: 'email_kud', label: 'Email KUD', desc: 'Alamat email resmi' },
    { key: 'visi_kud', label: 'Visi KUD', desc: 'Visi organisasi' },
    { key: 'misi_kud', label: 'Misi KUD', desc: 'Misi organisasi' },
    { key: 'no_badan_hukum', label: 'No. Badan Hukum', desc: 'Nomor badan hukum KUD' },
  ];

  const customKeys = Object.keys(settings).filter(
    (k) => !predefinedFields.find((f) => f.key === k) && k !== 'logo_kud' && k !== 'two_factor_auth' && k !== 'maintenance_mode' && k !== 'wa_gateway_url' && k !== 'wa_gateway_api_key' && k !== 'wa_gateway_aktif' && k !== 'default_kuota'
  );

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md shrink-0">
          <Cog6ToothIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Konfigurasi umum, keamanan, dan identitas KUD</p>
        </div>
      </motion.div>

      {/* TABS */}
      <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? `bg-gradient-to-r ${t.color} text-white shadow-md`
                  : 'bg-white text-slate-600 border border-border hover:bg-slate-50'
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </motion.div>

      {/* ===== TAB 1: PROFIL ADMIN ===== */}
      {tab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <FormSection title="Data Admin" icon={UserIcon} description="Informasi profil administrator">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Lengkap" value={profile?.name || settings.nama_admin || ''}
                  onChange={(e) => setSettings({ ...settings, nama_admin: e.target.value })} />
                <Input label="Email" type="email" value={profile?.email || settings.email_admin || ''}
                  onChange={(e) => setSettings({ ...settings, email_admin: e.target.value })} />
                <Input label="No. WhatsApp" value={settings.wa_admin || ''}
                  onChange={(e) => setSettings({ ...settings, wa_admin: e.target.value })} placeholder="08xxxxxxxxxx" />
                <Input label="Jabatan" value={settings.jabatan_admin || ''}
                  onChange={(e) => setSettings({ ...settings, jabatan_admin: e.target.value })} placeholder="Administrator KUD" />
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" loading={saving === 'nama_admin'} onClick={() => {
                  updateSetting('nama_admin', settings.nama_admin);
                  updateSetting('email_admin', settings.email_admin);
                  updateSetting('wa_admin', settings.wa_admin);
                  updateSetting('jabatan_admin', settings.jabatan_admin);
                }}>Simpan Profil</Button>
              </div>
            </FormSection>
          </div>
          <div className="space-y-5">
            <FormSection title="Foto Profil" icon={ArrowUpTrayIcon} description="Foto yang akan muncul di dashboard">
              <div className="flex flex-col items-center gap-4">
                {settings.foto_admin || profile?.foto_profil ? (
                  <img src={settings.foto_admin || profile?.foto_profil} alt="Foto Profil"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-primary/10 shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20">
                    <UserIcon className="w-10 h-10 text-primary/30" />
                  </div>
                )}
                <label className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                  {profilUploading ? 'Uploading...' : 'Upload Foto'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoUpload} disabled={profilUploading} />
                </label>
              </div>
            </FormSection>
          </div>
        </div>
      )}

      {/* ===== TAB 2: INFORMASI KUD ===== */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <FormSection title="Informasi KUD" icon={BuildingOfficeIcon} description="Data identitas resmi KUD">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedFields.map((f) => (
                  <div key={f.key}>
                    <Input label={f.label} value={settings[f.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      helperText={f.desc} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" loading={saving === 'simpan_info'} onClick={() => {
                  setSaving('simpan_info');
                  Promise.all(predefinedFields.map((f) => updateSetting(f.key, settings[f.key] || '')))
                    .finally(() => setSaving(null));
                }}>Simpan Informasi KUD</Button>
              </div>
            </FormSection>

            {/* VISI MISI */}
            <FormSection title="Visi & Misi" icon={BuildingOfficeIcon} description="Visi dan misi KUD untuk landing page">
              <Textarea label="Visi" value={settings.visi_kud || ''}
                onChange={(e) => setSettings({ ...settings, visi_kud: e.target.value })} rows={3} />
              <Textarea label="Misi" value={settings.misi_kud || ''}
                onChange={(e) => setSettings({ ...settings, misi_kud: e.target.value })} rows={4} />
              <div className="flex justify-end pt-2">
                <Button size="sm" loading={saving === 'visi_misi'} onClick={() => {
                  updateSetting('visi_kud', settings.visi_kud);
                  updateSetting('misi_kud', settings.misi_kud);
                }}>Simpan Visi Misi</Button>
              </div>
            </FormSection>
          </div>

          {/* LOGO SIDEBAR */}
          <div className="space-y-5">
            <FormSection title="Logo KUD" icon={ArrowUpTrayIcon} description="Logo resmi KUD">
              <div className="flex flex-col items-center gap-4">
                {settings.logo_kud ? (
                  <img src={settings.logo_kud} alt="Logo KUD" className="w-36 h-36 object-contain rounded-xl border border-border p-3 bg-white shadow-sm" />
                ) : (
                  <div className="w-36 h-36 bg-muted rounded-xl flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-border">Belum ada logo</div>
                )}
                <label className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors shadow-sm w-full text-center">
                  {logoUploading ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
              </div>
            </FormSection>

            <FormSection title="Data KUD untuk Kartu Anggota" icon={CreditCardIcon} description="Data yang muncul di kartu anggota">
              <div className="space-y-3">
                <Input label="Nama KUD di Kartu" value={kud.nama_kud || settings.nama_kud || ''} onChange={(e) => handleKudChange('nama_kud', e.target.value)} />
                <Textarea label="Alamat" value={kud.alamat || settings.alamat_kud || ''} onChange={(e) => handleKudChange('alamat', e.target.value)} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Telepon" value={kud.telepon || ''} onChange={(e) => handleKudChange('telepon', e.target.value)} />
                  <Input label="Email" value={kud.email || ''} onChange={(e) => handleKudChange('email', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Website" value={kud.website || ''} onChange={(e) => handleKudChange('website', e.target.value)} />
                  <Input label="Tahun Anggaran" value={kud.tahun_anggaran || ''} onChange={(e) => handleKudChange('tahun_anggaran', e.target.value)} />
                </div>
                <hr className="border-border" />
                <Input label="Nama Ketua KUD" value={kud.nama_ketua || settings.nama_ketua || ''} onChange={(e) => handleKudChange('nama_ketua', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Sekretaris" value={kud.nama_sekretaris || ''} onChange={(e) => handleKudChange('nama_sekretaris', e.target.value)} />
                  <Input label="Bendahara" value={kud.nama_bendahara || ''} onChange={(e) => handleKudChange('nama_bendahara', e.target.value)} />
                </div>
                <hr className="border-border" />
                <Input label="Logo di Kartu" value={kud.logo || ''} onChange={(e) => handleKudChange('logo', e.target.value)} placeholder="URL logo" />
                <div className="flex items-center gap-3">
                  {kud.logo ? <img src={kud.logo} alt="" className="w-12 h-12 object-contain rounded-lg border border-border" /> : null}
                  <label className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors">
                    {logoKartuUploading ? 'Upload...' : 'Upload Logo'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoKudUpload} disabled={logoKartuUploading} />
                  </label>
                </div>
                <hr className="border-border" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Warna Utama</label>
                    <div className="flex gap-2">
                      <input type="color" value={kud.kartu_warna_primary || '#059669'} onChange={(e) => handleKudChange('kartu_warna_primary', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <input value={kud.kartu_warna_primary || '#059669'} onChange={(e) => handleKudChange('kartu_warna_primary', e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-border text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Warna Sekunder</label>
                    <div className="flex gap-2">
                      <input type="color" value={kud.kartu_warna_secondary || '#047857'} onChange={(e) => handleKudChange('kartu_warna_secondary', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <input value={kud.kartu_warna_secondary || '#047857'} onChange={(e) => handleKudChange('kartu_warna_secondary', e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-border text-sm font-mono" />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={kud.tanda_tangan_kartu !== false} onChange={(e) => handleKudChange('tanda_tangan_kartu', e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-foreground/80">Tampilkan tanda tangan Ketua di kartu</span>
                </label>
                <Button onClick={handleSaveKud} loading={savingKud} className="w-full">Simpan Setting KUD & Desain Kartu</Button>
              </div>
            </FormSection>
          </div>
        </div>
      )}

      {/* ===== TAB 3: KEAMANAN & AKSES ===== */}
      {tab === 'keamanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <FormSection title="Ubah Password" icon={KeyIcon} description="Perbarui password akun admin Anda">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="relative">
                  <Input label="Password Lama" type={showPasswords.old ? 'text' : 'password'}
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    required placeholder="Masukkan password saat ini" />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPasswords.old ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input label="Password Baru" type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPasswords.new ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input label="Konfirmasi Password Baru" type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required placeholder="Ulangi password baru" />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPasswords.confirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.new_password && passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" />
                    Password baru dan konfirmasi tidak cocok
                  </p>
                )}
                <Button type="submit" loading={savingPassword} disabled={!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password}>
                  <KeyIcon className="w-4 h-4" /> Ubah Password
                </Button>
              </form>
            </FormSection>
          </div>

          <div className="space-y-5">
            <FormSection title="Two-Factor Authentication" icon={ShieldCheckIcon} description="Lapisan keamanan tambahan untuk akun Anda">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-purple-50/30 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFactorEnabled ? 'bg-purple-500/10' : 'bg-gray-100'}`}>
                    <ShieldCheckIcon className={`w-5 h-5 ${twoFactorEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Authentication (2FA)</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {twoFactorEnabled ? '2FA sedang aktif — keamanan ekstra' : 'Nonaktif — disarankan untuk diaktifkan'}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={handleToggle2FA}
                  className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              {twoFactorEnabled && (
                <p className="text-xs text-gray-400 flex items-start gap-1.5 mt-2">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Fitur 2FA memerlukan konfigurasi email atau authenticator app. Hubungi pengembang untuk setup lengkap.</span>
                </p>
              )}
            </FormSection>

            <FormSection title="Sesi Perangkat" icon={ArrowRightOnRectangleIcon} description="Kelola sesi login di semua perangkat">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-50/30 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Logout Semua Perangkat</p>
                    <p className="text-xs text-gray-400 mt-0.5">Akan mengeluarkan semua sesi login kecuali sesi saat ini</p>
                  </div>
                </div>
                <Button variant="danger" onClick={() => setShowLogoutConfirm(true)}>
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout Semua Perangkat
                </Button>
              </div>
            </FormSection>
          </div>
        </div>
      )}

      {/* ===== TAB 4: KONFIGURASI SISTEM ===== */}
      {tab === 'sistem' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <FormSection title="Mode Maintenance" icon={ServerIcon} description="Aktifkan mode maintenance untuk menonaktifkan akses publik">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-amber-50/30 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${maintenanceMode ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                    <ServerIcon className={`w-5 h-5 ${maintenanceMode ? 'text-red-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Maintenance Mode</p>
                    <p className={`text-xs mt-0.5 ${maintenanceMode ? 'text-red-500' : 'text-gray-400'}`}>
                      {maintenanceMode ? 'Situs sedang dalam mode pemeliharaan' : 'Situs berjalan normal'}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={handleToggleMaintenance}
                  className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              {maintenanceMode && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 flex items-center gap-1.5">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                    Mode maintenance aktif — semua halaman publik akan menampilkan halaman maintenance. Halaman admin tetap dapat diakses.
                  </p>
                </div>
              )}
            </FormSection>

            <FormSection title="Kuota Default Program" icon={Cog6ToothIcon} description="Nilai kuota default saat membuat program baru">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input label="Kuota Default" type="number" value={defaultKuota}
                    onChange={(e) => setDefaultKuota(e.target.value)} placeholder="100" min="0" />
                </div>
                <Button onClick={handleSaveDefaultKuota} loading={savingKuota}>Simpan</Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Nilai ini akan otomatis terisi saat admin membuat program baru</p>
            </FormSection>

            <FormSection title="WhatsApp Gateway" icon={Cog6ToothIcon} description="Integrasi gateway WhatsApp untuk notifikasi otomatis">
              <div className="space-y-3">
                <Input label="URL Gateway" value={waGateway.wa_url}
                  onChange={(e) => setWaGateway({ ...waGateway, wa_url: e.target.value })}
                  placeholder="https://panel.wa-gateway.com/api" />
                <Input label="API Key" type="password" value={waGateway.wa_api_key}
                  onChange={(e) => setWaGateway({ ...waGateway, wa_api_key: e.target.value })}
                  placeholder="Masukkan API key" />
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setWaGateway({ ...waGateway, wa_aktif: !waGateway.wa_aktif })}
                    className={`relative w-11 h-6 rounded-full transition-all ${waGateway.wa_aktif ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${waGateway.wa_aktif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <div>
                    <span className="text-sm font-medium text-foreground/80">Aktifkan Gateway</span>
                    <p className="text-xs text-gray-400">Kirim notifikasi WhatsApp otomatis ke anggota</p>
                  </div>
                </label>
                <Button onClick={handleSaveWA} loading={savingWA} className="w-full">
                  Simpan Konfigurasi WA
                </Button>
              </div>
            </FormSection>
          </div>

          <div className="space-y-5">
            <FormSection title="Pengaturan Tambahan" icon={Cog6ToothIcon} description="Key-value custom untuk pengembangan lanjutan">
              {customKeys.length > 0 && (
                <div className="space-y-3 mb-4">
                  {customKeys.map((k) => (
                    <div key={k} className="p-3 bg-gray-50 rounded-xl border border-border">
                      <label className="block text-xs font-medium text-foreground/70 mb-1">{k}</label>
                      <div className="flex gap-2">
                        <input value={settings[k] || ''} onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        <Button size="sm" loading={saving === k} onClick={() => updateSetting(k, settings[k])}>Simpan</Button>
                        <button onClick={() => deleteSetting(k)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Tambah Pengaturan Baru</label>
                <div className="flex flex-wrap gap-2">
                  <input placeholder="Nama key" value={newKey} onChange={(e) => setNewKey(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  <input placeholder="Nilai" value={newVal} onChange={(e) => setNewVal(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  <Button onClick={handleAddSetting}><PlusIcon className="w-4 h-4" /> Tambah</Button>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      )}

      {/* LOGOUT ALL CONFIRM MODAL */}
      <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Logout Semua Perangkat" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm">Yakin ingin logout dari semua perangkat? Sesi saat ini tidak akan terpengaruh.</p>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleLogoutAll} loading={loggingOut}>Ya, Logout Semua</Button>
        </div>
      </Modal>
    </motion.div>
  );
}