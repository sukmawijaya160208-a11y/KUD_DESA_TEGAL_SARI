'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import SertifikatKeanggotaan from '@/components/SertifikatKeanggotaan';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const FIELD_LABELS = {
  border_deco: 'Border Dekorasi',
  logo_kud: 'Logo KUD',
  judul: 'Judul Sertifikat',
  subjudul: 'Subjudul (Nama KUD)',
  garis_dekorasi: 'Garis Dekorasi',
  pembukaan: 'Teks Pembukaan',
  nama_pekebun: 'Nama Pekebun',
  no_anggota: 'Nomor Anggota',
  data_lengkap: 'Data Lengkap (TTL)',
  status_teks: 'Status Teks',
  tanggal_terbit: 'Tanggal Terbit',
  ttd_ketua: 'TTD Ketua',
  nama_ketua: 'Nama Ketua',
  jabatan_ketua: 'Jabatan Ketua',
  stempel: 'Stempel KUD',
  kota_terbit: 'Kota Terbit',
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', category: 'Sans-Serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-Serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-Serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-Serif' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Sans-Serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans-Serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-Serif' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Sans-Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Lora', label: 'Lora', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Mono' },
];

const DEFAULT_CONFIG = {
  template: 'classic-gold',
  fields: {
    border_deco: { show: true },
    logo_kud: { show: true, width: 75 },
    judul: { show: true, fontSize: 26, color: '#b8860b', fontFamily: 'Playfair Display', fontWeight: 'bold' },
    subjudul: { show: true, fontSize: 13, color: '#8b6914' },
    garis_dekorasi: { show: true },
    pembukaan: { show: true, fontSize: 11, color: '#4a5568' },
    nama_pekebun: { show: true, fontSize: 24, color: '#1a202c', fontFamily: 'Playfair Display', fontWeight: 'bold' },
    no_anggota: { show: true, fontSize: 11, color: '#4a5568' },
    data_lengkap: { show: true, fontSize: 11, color: '#718096' },
    status_teks: { show: true, fontSize: 11, color: '#4a5568' },
    tanggal_terbit: { show: true, fontSize: 11, color: '#718096' },
    ttd_ketua: { show: true, width: 120, height: 42 },
    nama_ketua: { show: true, fontSize: 12, color: '#1a202c', fontWeight: 'bold' },
    jabatan_ketua: { show: true, fontSize: 10, color: '#718096' },
    stempel: { show: true, width: 80 },
    kota_terbit: { show: true, fontSize: 11, color: '#718096' },
  },
  background: {
    type: 'gradient',
    color1: '#fffaed',
    color2: '#f5e6c8',
    angle: 135,
  },
};

const TEMPLATE_PRESETS = {
  'classic-gold': DEFAULT_CONFIG,
  'modern-clean': {
    template: 'modern-clean',
    fields: {
      border_deco: { show: true },
      logo_kud: { show: true, width: 60 },
      judul: { show: true, fontSize: 24, color: '#0f766e', fontFamily: 'Inter', fontWeight: 'bold' },
      subjudul: { show: true, fontSize: 12, color: '#14b8a6' },
      garis_dekorasi: { show: true },
      pembukaan: { show: true, fontSize: 11, color: '#475569' },
      nama_pekebun: { show: true, fontSize: 22, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'bold' },
      no_anggota: { show: true, fontSize: 11, color: '#475569' },
      data_lengkap: { show: true, fontSize: 11, color: '#94a3b8' },
      status_teks: { show: true, fontSize: 11, color: '#475569' },
      tanggal_terbit: { show: true, fontSize: 11, color: '#94a3b8' },
      ttd_ketua: { show: true, width: 110, height: 40 },
      nama_ketua: { show: true, fontSize: 12, color: '#0f172a', fontWeight: 'bold' },
      jabatan_ketua: { show: true, fontSize: 10, color: '#94a3b8' },
      stempel: { show: true, width: 75 },
      kota_terbit: { show: true, fontSize: 11, color: '#94a3b8' },
    },
    background: {
      type: 'gradient',
      color1: '#ffffff',
      color2: '#f8fafc',
      angle: 135,
    },
  },
};

function FieldCard({ fieldKey, field, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const label = FIELD_LABELS[fieldKey] || fieldKey;
  const isNameField = fieldKey === 'nama_pekebun';
  const isTitleField = fieldKey === 'judul';

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${field.show !== false ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}
          onClick={(e) => { e.stopPropagation(); onChange({ ...field, show: field.show === false ? true : false }); }}>
          {field.show !== false && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`text-xs font-medium flex-1 ${field.show === false ? 'text-gray-300 line-through' : 'text-foreground'}`}>{label}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border space-y-2 bg-slate-50/50">
          {/* Font Size (for text fields) */}
          {field.fontSize !== undefined && (
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">Ukuran Font: {field.fontSize}px</label>
              <input type="range" min="8" max="36" value={field.fontSize || 14}
                onChange={(e) => onChange({ ...field, fontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-[9px] text-gray-400 mt-0.5"><span>8px</span><span>36px</span></div>
            </div>
          )}

          {/* Font Family (for name + title) */}
          {(isNameField || isTitleField) && (
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">Font Family</label>
              <select value={field.fontFamily || 'Inter'}
                onChange={(e) => onChange({ ...field, fontFamily: e.target.value })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Font Weight */}
          {field.fontWeight !== undefined && (
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">Ketebalan</label>
              <div className="flex gap-1">
                <button type="button"
                  onClick={() => onChange({ ...field, fontWeight: 'normal' })}
                  className={`px-2 py-1 text-[10px] rounded-lg border transition-colors cursor-pointer ${field.fontWeight === 'normal' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-border hover:border-primary/30'}`}>Normal</button>
                <button type="button"
                  onClick={() => onChange({ ...field, fontWeight: 'bold' })}
                  className={`px-2 py-1 text-[10px] rounded-lg border transition-colors cursor-pointer ${field.fontWeight === 'bold' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-border hover:border-primary/30'}`}>Tebal</button>
              </div>
            </div>
          )}

          {/* Color picker */}
          {field.color !== undefined && (
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">Warna</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={field.color || '#000000'}
                  onChange={(e) => onChange({ ...field, color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                <input value={field.color || '#000000'}
                  onChange={(e) => onChange({ ...field, color: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-[10px] font-mono rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          )}

          {/* Width (images) */}
          {field.width !== undefined && (
            <div>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">Lebar: {field.width}px</label>
              <input type="range" min="40" max="160" value={field.width || 80}
                onChange={(e) => onChange({ ...field, width: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SertifikatDesignEditor({ settingKud, onSave }) {
  const toast = useToast();
  const [config, setConfig] = useState(() => settingKud?.sertifikat_config || DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState(null);
  const [stempelUploading, setStempelUploading] = useState(false);

  const updateField = (fieldKey, newField) => {
    setConfig((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: newField,
      },
    }));
  };

  const applyTemplate = (templateKey) => {
    const preset = TEMPLATE_PRESETS[templateKey];
    if (!preset) return;
    setConfig(JSON.parse(JSON.stringify(preset)));
    setConfirmTemplate(null);
    toast.success(`Template ${templateKey === 'classic-gold' ? 'Classic Gold' : 'Modern Clean'} diterapkan`);
  };

  const updateBackground = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.admin.settingKud.update({ sertifikat_config: config });
      if (onSave) onSave();
      toast.success('Desain sertifikat berhasil disimpan');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan desain sertifikat');
    }
    setSaving(false);
  };

  const handleStempelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStempelUploading(true);
    try {
      await api.upload('/upload/kartu-stempel', file);
      if (onSave) onSave();
      toast.success('Stempel berhasil diupload');
    } catch (err) {
      toast.error(err.message || 'Upload gagal');
    }
    setStempelUploading(false);
  };

    const previewData = {
    pekebun: {
      nama: 'BUDI SANTOSO',
      tempat_lahir: 'Musi Rawas',
      tanggal_lahir: '1990-01-15',
    },
    setting_kud: settingKud || {},
    nomor_anggota: 'KUD-00001/2026',
    tanggal_terbit: '2026-07-25',
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* LEFT: Editor */}
      <div className="xl:col-span-3 space-y-5">
        {/* Template Selector */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-500/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Template Sertifikat</h3>
              <p className="text-xs text-gray-400 mt-0.5">Pilih template lalu edit setiap field</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-2">
              {[
                { key: 'classic-gold', label: '🥇 Classic Gold', desc: 'Formal, border emas' },
                { key: 'modern-clean', label: '✨ Modern Clean', desc: 'Minimalis, hijau KUD' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    if (config.template !== t.key) setConfirmTemplate(t.key);
                  }}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${config.template === t.key ? 'border-amber-400 bg-amber-50/50' : 'border-border hover:border-amber-200'}`}
                >
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Field List */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Field Sertifikat</h3>
              <p className="text-xs text-gray-400 mt-0.5">Atur tampilan setiap elemen sertifikat</p>
            </div>
          </div>
          <div className="p-4 space-y-1.5 max-h-[500px] overflow-y-auto">
            {Object.keys(FIELD_LABELS).map((key) => (
              <FieldCard key={key} fieldKey={key} field={config.fields[key] || { show: true }} onChange={(v) => updateField(key, v)} />
            ))}
          </div>
        </div>

        {/* Background Settings */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-sky-500/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Background</h3>
              <p className="text-xs text-gray-400 mt-0.5">Atur latar belakang sertifikat</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Tipe Background</label>
              <div className="flex gap-2">
                {['color', 'gradient'].map((t) => (
                  <button key={t} type="button"
                    onClick={() => updateBackground('type', t)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${config.background.type === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-border hover:border-primary/30'}`}>
                    {t === 'color' ? 'Warna Solid' : 'Gradien'}
                  </button>
                ))}
              </div>
            </div>
            {config.background.type === 'color' ? (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Warna</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config.background.color1 || '#ffffff'}
                    onChange={(e) => { updateBackground('color1', e.target.value); }}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                  <input value={config.background.color1 || '#ffffff'}
                    onChange={(e) => updateBackground('color1', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs font-mono rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 block mb-1">Warna 1</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={config.background.color1 || '#fffaed'}
                        onChange={(e) => updateBackground('color1', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                      <input value={config.background.color1 || '#fffaed'}
                        onChange={(e) => updateBackground('color1', e.target.value)}
                        className="flex-1 px-2 py-1 text-[10px] font-mono rounded-lg border border-border bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 block mb-1">Warna 2</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={config.background.color2 || '#f5e6c8'}
                        onChange={(e) => updateBackground('color2', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                      <input value={config.background.color2 || '#f5e6c8'}
                        onChange={(e) => updateBackground('color2', e.target.value)}
                        className="flex-1 px-2 py-1 text-[10px] font-mono rounded-lg border border-border bg-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 block mb-1">Sudut Gradien: {config.background.angle || 135}°</label>
                  <input type="range" min="0" max="360" value={config.background.angle || 135}
                    onChange={(e) => updateBackground('angle', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stempel Upload */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-rose-500/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Upload Stempel</h3>
              <p className="text-xs text-gray-400 mt-0.5">Stempel KUD untuk sertifikat</p>
            </div>
          </div>
          <div className="p-4">
            {settingKud?.kartu_stempel ? (
              <img src={settingKud.kartu_stempel} alt="Stempel" className="h-16 object-contain mb-3 rounded-lg border border-border p-2 bg-white" />
            ) : (
              <div className="h-16 flex items-center justify-center bg-muted rounded-lg border border-dashed border-border mb-3 text-xs text-gray-400">Belum upload stempel</div>
            )}
            <label className={`px-4 py-2 ${stempelUploading ? 'bg-gray-400' : 'bg-primary'} text-white rounded-xl text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors inline-block`}>
              {stempelUploading ? 'Uploading...' : 'Upload Stempel'}
              <input type="file" className="hidden" accept="image/*" onChange={handleStempelUpload} disabled={stempelUploading} />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Simpan Desain Sertifikat
          </Button>
        </div>
      </div>

      {/* RIGHT: Preview */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden sticky top-6">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-500/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Pratinjau Sertifikat</h3>
              <p className="text-xs text-gray-400 mt-0.5">16:9 Landscape — real-time preview</p>
            </div>
          </div>
          <div className="p-3 flex justify-center">
            <SertifikatKeanggotaan
              data={previewData}
              config={config}
              width={400}
              showActions={false}
            />
          </div>
        </div>
      </div>

      {/* Confirm Template Modal */}
      {confirmTemplate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Ganti Template?</h3>
            <p className="text-sm text-gray-500 mb-5">Mengganti template akan mengatur ulang semua field ke pengaturan default template tersebut. Perubahan yang belum disimpan akan hilang.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmTemplate(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">Batal</button>
              <button type="button" onClick={() => applyTemplate(confirmTemplate)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Ya, Terapkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
