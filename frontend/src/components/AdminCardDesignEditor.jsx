'use client';

import { useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import KartuAdmin from '@/components/KartuAdmin';
import { PencilIcon, ArrowPathIcon, EyeIcon, SwatchIcon } from '@heroicons/react/24/outline';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Work Sans', label: 'Work Sans' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
];

const TEMPLATE_OPTIONS = [
  { value: 'classic', label: 'Classic', colors: ['#6366f1', '#4f46e5'] },
  { value: 'modern', label: 'Modern', colors: ['#0d9488', '#0f766e'] },
  { value: 'dark', label: 'Dark', colors: ['#334155', '#1e293b'] },
];

const FRONT_FIELD_META = {
  logo_kud: { label: 'Logo KUD', type: 'image' },
  nama_kud: { label: 'Nama KUD', type: 'text', hasText: true },
  foto_admin: { label: 'Foto Admin', type: 'image' },
  judul: { label: 'Judul Kartu', type: 'text', hasText: true },
  subjudul: { label: 'Subjudul', type: 'text', hasText: true },
  nama_admin: { label: 'Nama Admin', type: 'text' },
  jabatan: { label: 'Jabatan', type: 'text' },
  nip: { label: 'NIP/NIK', type: 'text' },
  qr_code: { label: 'QR Code', type: 'toggle' },
  watermark: { label: 'Watermark', type: 'opacity' },
};

const BACK_FIELD_META = {
  header_website: { label: 'Header Website', type: 'text', hasText: true },
  aturan_list: { label: 'Aturan', type: 'toggle' },
  sekretariat: { label: 'Sekretariat', type: 'toggle' },
  slogan: { label: 'Slogan', type: 'text', hasText: true },
  kota_tanggal: { label: 'Kota & Tanggal', type: 'toggle' },
  jabatan_ketua: { label: 'Jabatan Ketua', type: 'toggle' },
  ttd_stempel: { label: 'TTD & Stempel', type: 'toggle' },
  nama_ketua: { label: 'Nama Ketua', type: 'toggle' },
};

export default function AdminCardDesignEditor({ settingKud, settings, onSave }) {
  const toast = useToast();
  const [tab, setTab] = useState('tampilan');
  const [saving, setSaving] = useState(false);
  const [uploadingTtd, setUploadingTtd] = useState(false);
  const [uploadingStempel, setUploadingStempel] = useState(false);

  const existingConfig = settingKud?.admin_card_config || {};

  const [template, setTemplate] = useState(existingConfig.template || 'classic');
  const [aturan, setAturan] = useState(existingConfig.aturan || settingKud?.kartu_aturan || [
    'Pemegang kartu ini adalah Admin Resmi KUD Sari Subur.',
    'Wajib menjaga kerahasiaan data anggota dan sistem KUD.',
    'Kartu ini milik KUD, jika ditemukan harap dikembalikan ke sekretariat.',
    'Dilarang menggunakan kartu ini untuk kepentingan di luar tugas.',
  ]);
  const [slogan, setSlogan] = useState(existingConfig.slogan || settingKud?.kartu_slogan || 'MELAYANI DENGAN HATI');
  const [website, setWebsite] = useState(existingConfig.website || settingKud?.website || 'kud-sari-subur.my.id');
  const [kotaTerbit, setKotaTerbit] = useState(existingConfig.kota_terbit || settingKud?.kartu_kota_terbit || 'Megang Sakti');
  const [ketuaNama, setKetuaNama] = useState(existingConfig.ketua_nama || settingKud?.kartu_ketua_nama || settingKud?.nama_ketua || '-');
  const [ketuaJabatan, setKetuaJabatan] = useState(existingConfig.ketua_jabatan || settingKud?.kartu_ketua_jabatan || 'Ketua KUD Sari Subur');
  const [stempelUrl, setStempelUrl] = useState(existingConfig.stempel || settingKud?.kartu_stempel || '');
  const [ttdUrl, setTtdUrl] = useState(existingConfig.ttd || settingKud?.kartu_ttd || '');

  const initField = (side, key, defaults) => {
    const existing = existingConfig[side]?.fields?.[key];
    return { ...defaults, ...existing };
  };

  const [frontFields, setFrontFields] = useState(() => ({
    logo_kud: initField('front', 'logo_kud', { show: true, width: 48 }),
    nama_kud: initField('front', 'nama_kud', { show: true, fontSize: 9, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold', text: '' }),
    foto_admin: initField('front', 'foto_admin', { show: true, width: 46, height: 60 }),
    judul: initField('front', 'judul', { show: true, fontSize: 10, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black', text: '' }),
    subjudul: initField('front', 'subjudul', { show: true, fontSize: 6, color: '#6366f1', fontFamily: 'Inter', fontWeight: 'bold', text: '' }),
    nama_admin: initField('front', 'nama_admin', { show: true, fontSize: 12, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' }),
    jabatan: initField('front', 'jabatan', { show: true, fontSize: 8, color: '#475569', fontFamily: 'Inter', fontWeight: 'semibold' }),
    nip: initField('front', 'nip', { show: true, fontSize: 8, color: '#475569' }),
    qr_code: initField('front', 'qr_code', { show: true }),
    watermark: initField('front', 'watermark', { show: true, opacity: 0.04 }),
  }));

  const [frontBgColor, setFrontBgColor] = useState(existingConfig.front?.background?.color1 || DEFAULT_FRONT_BG);
  const [frontBgColor2, setFrontBgColor2] = useState(existingConfig.front?.background?.color2 || DEFAULT_FRONT_BG2);

  const [backFields, setBackFields] = useState(() => ({
    header_website: initField('back', 'header_website', { show: true, fontSize: 6, color: '#ffffff', fontWeight: 'bold', text: '' }),
    aturan_list: initField('back', 'aturan_list', { show: true, fontSize: 7, color: '#475569' }),
    sekretariat: initField('back', 'sekretariat', { show: true, fontSize: 7, color: '#475569' }),
    slogan: initField('back', 'slogan', { show: true, fontSize: 14, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' }),
    kota_tanggal: initField('back', 'kota_tanggal', { show: true, fontSize: 7, color: '#64748b' }),
    jabatan_ketua: initField('back', 'jabatan_ketua', { show: true, fontSize: 8, color: '#475569', fontWeight: 'semibold' }),
    ttd_stempel: initField('back', 'ttd_stempel', { show: true }),
    nama_ketua: initField('back', 'nama_ketua', { show: true, fontSize: 8, color: '#0f172a', fontWeight: 'black' }),
  }));

  const [backBgColor, setBackBgColor] = useState(existingConfig.back?.background?.color1 || DEFAULT_BACK_BG);
  const [backBgColor2, setBackBgColor2] = useState(existingConfig.back?.background?.color2 || DEFAULT_BACK_BG2);

  const updateFrontField = (key, prop, value) => {
    setFrontFields((prev) => ({ ...prev, [key]: { ...prev[key], [prop]: value } }));
  };

  const updateBackField = (key, prop, value) => {
    setBackFields((prev) => ({ ...prev, [key]: { ...prev[key], [prop]: value } }));
  };

  const buildConfig = useCallback(() => ({
    template,
    aturan,
    slogan,
    website,
    kota_terbit: kotaTerbit,
    ketua_nama: ketuaNama,
    ketua_jabatan: ketuaJabatan,
    ttd: ttdUrl,
    stempel: stempelUrl,
    front: {
      fields: frontFields,
      background: { type: 'gradient', color1: frontBgColor, color2: frontBgColor2, angle: 135 },
    },
    back: {
      fields: backFields,
      background: { type: 'gradient', color1: backBgColor, color2: backBgColor2, angle: 135 },
    },
  }), [template, aturan, slogan, website, kotaTerbit, ketuaNama, ketuaJabatan, ttdUrl, stempelUrl, frontFields, frontBgColor, frontBgColor2, backFields, backBgColor, backBgColor2]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.settingKud.update({ admin_card_config: buildConfig() });
      toast.success('Konfigurasi Kartu Admin berhasil disimpan');
      if (onSave) onSave();
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    }
    setSaving(false);
  };

  const handleStempelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingStempel(true);
    try {
      const res = await api.upload('/upload/kartu-stempel', file);
      setStempelUrl(res.url);
      toast.success('Stempel berhasil diupload');
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploadingStempel(false);
  };

  const handleTtdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingTtd(true);
    try {
      const res = await api.upload('/upload/kartu-ttd', file);
      setTtdUrl(res.url);
      toast.success('TTD berhasil diupload');
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploadingTtd(false);
  };

  const previewData = useMemo(() => ({
    admin: {
      name: settings?.nama_admin || 'Admin KUD',
      jabatan: settings?.jabatan_admin || 'Administrator',
      nip: '-',
      foto_profil: settings?.foto_admin_kartu || '',
    },
    setting_kud: { ...settingKud, kartu_ttd: ttdUrl || settingKud?.kartu_ttd, kartu_stempel: stempelUrl || settingKud?.kartu_stempel },
    pengaturan: settings,
    admin_card_config: buildConfig(),
    nomor_induk: 'ADM-001',
    tanggal_terbit: new Date().toISOString().split('T')[0],
    masa_berlaku: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
  }), [settings, settingKud, buildConfig, ttdUrl, stempelUrl]);

  const FieldEditor = ({ side, fieldKey, meta, field }) => {
    if (!field) return null;
    return (
      <div className="p-3 bg-white rounded-xl border border-border hover:border-primary/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-foreground">{meta.label}</label>
          <button
            onClick={() => side === 'front' ? updateFrontField(fieldKey, 'show', !field.show) : updateBackField(fieldKey, 'show', !field.show)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${field.show !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
            {field.show !== false ? 'Tampil' : 'Sembunyi'}
          </button>
        </div>
        {field.show !== false && (
          <div className="space-y-2">
            {meta.hasText && (
              <input
                value={field.text || ''}
                onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'text', e.target.value) : updateBackField(fieldKey, 'text', e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Teks default" />
            )}
            {field.fontSize !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-10">Ukuran</span>
                <input type="number" min="6" max="24"
                  value={field.fontSize || 10}
                  onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'fontSize', parseInt(e.target.value) || 10) : updateBackField(fieldKey, 'fontSize', parseInt(e.target.value) || 10)}
                  className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-white text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
            {field.color !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-10">Warna</span>
                <input type="color"
                  value={field.color || '#000000'}
                  onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'color', e.target.value) : updateBackField(fieldKey, 'color', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                <span className="text-[9px] text-gray-400 font-mono">{field.color || '#000000'}</span>
              </div>
            )}
            {field.fontFamily && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-10">Font</span>
                <select value={field.fontFamily || 'Inter'}
                  onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'fontFamily', e.target.value) : updateBackField(fieldKey, 'fontFamily', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {FONT_OPTIONS.map((fo) => <option key={fo.value} value={fo.value}>{fo.label}</option>)}
                </select>
              </div>
            )}
            {field.fontWeight && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-10">Tebal</span>
                <select value={field.fontWeight || 'normal'}
                  onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'fontWeight', e.target.value) : updateBackField(fieldKey, 'fontWeight', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="normal">Normal</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="black">Black</option>
                </select>
              </div>
            )}
            {field.opacity !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-10">Opacity</span>
                <input type="range" min="0" max="20"
                  value={Math.round((field.opacity || 0.04) * 100)}
                  onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'opacity', parseInt(e.target.value) / 100) : updateBackField(fieldKey, 'opacity', parseInt(e.target.value) / 100)}
                  className="flex-1" />
                <span className="text-[9px] text-gray-400 w-8 text-right">{Math.round((field.opacity || 0.04) * 100)}%</span>
              </div>
            )}
            {(meta.type === 'image' && field.width !== undefined) && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-10">Lebar</span>
                <input type="number" min="20" max="100"
                  value={field.width || 48}
                  onChange={(e) => side === 'front' ? updateFrontField(fieldKey, 'width', parseInt(e.target.value) || 48) : updateBackField(fieldKey, 'width', parseInt(e.target.value) || 48)}
                  className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-white text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Template Selector */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <SwatchIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Desain Kartu Admin</h3>
            <p className="text-xs text-gray-400 mt-0.5">Sesuaikan tampilan kartu identitas admin — ukuran 90mm × 55mm</p>
          </div>
        </div>
        <div className="p-5">
          {/* Sub Tabs */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
            {[
              { id: 'tampilan', label: 'Tampilan', icon: SwatchIcon },
              { id: 'depan', label: 'Sisi Depan', icon: EyeIcon },
              { id: 'belakang', label: 'Sisi Belakang', icon: EyeIcon },
              { id: 'data', label: 'Data & Upload', icon: PencilIcon },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-border hover:bg-slate-50'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab: Tampilan */}
          {tab === 'tampilan' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Template Warna</label>
                  <div className="flex gap-2">
                    {TEMPLATE_OPTIONS.map((tpl) => (
                      <button key={tpl.value} onClick={() => setTemplate(tpl.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                          template === tpl.value ? 'border-indigo-500 bg-indigo-50' : 'border-border hover:border-indigo-200'
                        }`}>
                        <div className="flex gap-1">
                          {tpl.colors.map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold">{tpl.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Warna Depan (gradient)</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={frontBgColor} onChange={(e) => setFrontBgColor(e.target.value)} className="w-10 h-10 rounded-xl border border-border cursor-pointer" />
                    <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                    <input type="color" value={frontBgColor2} onChange={(e) => setFrontBgColor2(e.target.value)} className="w-10 h-10 rounded-xl border border-border cursor-pointer" />
                    <span className="text-[10px] text-gray-400 ml-1">{frontBgColor} → {frontBgColor2}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Warna Belakang (gradient)</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={backBgColor} onChange={(e) => setBackBgColor(e.target.value)} className="w-10 h-10 rounded-xl border border-border cursor-pointer" />
                    <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                    <input type="color" value={backBgColor2} onChange={(e) => setBackBgColor2(e.target.value)} className="w-10 h-10 rounded-xl border border-border cursor-pointer" />
                    <span className="text-[10px] text-gray-400 ml-1">{backBgColor} → {backBgColor2}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/30 rounded-xl border border-indigo-100 p-4">
                  <h4 className="text-xs font-semibold text-indigo-700 mb-1">Preview Template</h4>
                  <div className="flex gap-2 mt-2">
                    {TEMPLATE_OPTIONS.map((tpl) => (
                      <div key={tpl.value} className={`flex-1 p-3 rounded-xl border-2 ${template === tpl.value ? 'border-indigo-500' : 'border-border'}`}>
                        <div className="h-8 rounded-lg mb-1" style={{
                          background: `linear-gradient(135deg, ${tpl.colors[0]}, ${tpl.colors[1]})`
                        }} />
                        <p className="text-[9px] font-semibold text-center">{tpl.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Template menentukan warna default untuk left panel dan header</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Sisi Depan */}
          {tab === 'depan' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(FRONT_FIELD_META).map(([key, meta]) => (
                <FieldEditor key={key} side="front" fieldKey={key} meta={meta} field={frontFields[key]} />
              ))}
            </div>
          )}

          {/* Tab: Sisi Belakang */}
          {tab === 'belakang' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(BACK_FIELD_META).map(([key, meta]) => (
                <FieldEditor key={key} side="back" fieldKey={key} meta={meta} field={backFields[key]} />
              ))}
            </div>
          )}

          {/* Tab: Data & Upload */}
          {tab === 'data' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">4 Poin Aturan Kartu</label>
                  {aturan.map((item, i) => (
                    <div key={i} className="mb-2">
                      <input value={item}
                        onChange={(e) => { const a = [...aturan]; a[i] = e.target.value; setAturan(a); }}
                        className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={`Aturan ${i + 1}`} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Slogan</label>
                    <input value={slogan} onChange={(e) => setSlogan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Website</label>
                    <input value={website} onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Kota Terbit</label>
                    <input value={kotaTerbit} onChange={(e) => setKotaTerbit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Nama Ketua</label>
                    <input value={ketuaNama} onChange={(e) => setKetuaNama(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Jabatan Ketua</label>
                  <input value={ketuaJabatan} onChange={(e) => setKetuaJabatan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-50/30 rounded-xl border border-indigo-100">
                  <h4 className="text-xs font-semibold text-indigo-700 mb-3">Upload Tanda Tangan & Stempel</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">TTD Ketua</label>
                      <div className="flex items-center gap-3">
                        {ttdUrl ? <img src={ttdUrl} alt="TTD" className="h-10 object-contain border border-border rounded-lg p-1 bg-white" /> : <div className="h-10 w-24 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">Belum ada</div>}
                        <label className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-semibold cursor-pointer hover:bg-indigo-700 transition-all">
                          {uploadingTtd ? '...' : 'Upload'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleTtdUpload} disabled={uploadingTtd} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Stempel</label>
                      <div className="flex items-center gap-3">
                        {stempelUrl ? <img src={stempelUrl} alt="Stempel" className="h-12 object-contain border border-border rounded-lg p-1 bg-white" /> : <div className="h-12 w-24 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">Belum ada</div>}
                        <label className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-semibold cursor-pointer hover:bg-indigo-700 transition-all">
                          {uploadingStempel ? '...' : 'Upload'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleStempelUpload} disabled={uploadingStempel} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-5 pt-4 border-t border-border">
            <Button onClick={handleSave} loading={saving} className="px-6">
              Simpan Konfigurasi Kartu Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <EyeIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Preview Kartu Admin</h3>
            <p className="text-xs text-gray-400 mt-0.5">Hasil desain akan terlihat seperti ini</p>
          </div>
        </div>
        <div className="p-5 flex justify-center">
          <div className="w-full max-w-lg">
            <KartuAdmin data={previewData} width={9999} showActions={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_FRONT_BG = '#6366f1';
const DEFAULT_FRONT_BG2 = '#4f46e5';
const DEFAULT_BACK_BG = '#4338ca';
const DEFAULT_BACK_BG2 = '#6366f1';
