'use client';

import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import KartuAnggotaKud from '@/components/KartuAnggotaKud';
import SignaturePad from '@/components/SignaturePad';
import { CreditCardIcon } from '@heroicons/react/24/outline';

const ITEM_TYPE = 'FIELD';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Work Sans', label: 'Work Sans' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
];

const TEMPLATE_PRESETS = {
  classic: {
    front: {
      fields: [
        { key: 'logo_kud', show: true, width: 52 },
        { key: 'nama_kud', show: true, fontSize: 10, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'foto_pekebun', show: true, width: 50, height: 66 },
        { key: 'judul', show: true, fontSize: 11, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' },
        { key: 'subjudul', show: true, fontSize: 7, color: '#059669', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'nama_anggota', show: true, fontSize: 13, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' },
        { key: 'nomor_anggota', show: true, fontSize: 9, color: '#059669', fontFamily: 'monospace', fontWeight: 'bold' },
        { key: 'nik', show: true, fontSize: 8, color: '#475569' },
        { key: 'ttl', show: true, fontSize: 8, color: '#475569' },
        { key: 'jenis_kelamin', show: true, fontSize: 8, color: '#475569' },
        { key: 'no_wa', show: true, fontSize: 8, color: '#475569' },
        { key: 'no_kk', show: true, fontSize: 8, color: '#475569' },
        { key: 'alamat', show: true, fontSize: 8, color: '#475569' },
        { key: 'berlaku', show: true, fontSize: 7, color: '#94a3b8' },
        { key: 'qr_code', show: true },
        { key: 'watermark', show: true, opacity: 0.04 },
      ],
      background: { type: 'gradient', color1: '#059669', color2: '#047857', angle: 135 },
    },
    back: {
      fields: [
        { key: 'header_website', show: true, fontSize: 6, color: '#ffffff', fontWeight: 'bold' },
        { key: 'aturan_list', show: true, fontSize: 7, color: '#475569' },
        { key: 'sekretariat', show: true, fontSize: 7, color: '#475569' },
        { key: 'slogan', show: true, fontSize: 16, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' },
        { key: 'kota_tanggal', show: true, fontSize: 7, color: '#64748b' },
        { key: 'jabatan_ketua', show: true, fontSize: 8, color: '#475569', fontWeight: 'semibold' },
        { key: 'ttd_stempel', show: true },
        { key: 'nama_ketua', show: true, fontSize: 8, color: '#0f172a', fontWeight: 'black' },
      ],
      background: { type: 'gradient', color1: '#028143', color2: '#059669', angle: 135 },
    },
  },
  modern: {
    front: {
      fields: [
        { key: 'logo_kud', show: true, width: 44 },
        { key: 'nama_kud', show: true, fontSize: 9, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'foto_pekebun', show: true, width: 46, height: 60 },
        { key: 'judul', show: true, fontSize: 10, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'subjudul', show: true, fontSize: 7, color: '#0f766e', fontFamily: 'Inter', fontWeight: 'semibold' },
        { key: 'nama_anggota', show: true, fontSize: 12, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'nomor_anggota', show: true, fontSize: 8, color: '#0f766e', fontFamily: 'monospace', fontWeight: 'bold' },
        { key: 'nik', show: true, fontSize: 7, color: '#64748b' },
        { key: 'ttl', show: true, fontSize: 7, color: '#64748b' },
        { key: 'jenis_kelamin', show: true, fontSize: 7, color: '#64748b' },
        { key: 'no_wa', show: true, fontSize: 7, color: '#64748b' },
        { key: 'no_kk', show: true, fontSize: 7, color: '#64748b' },
        { key: 'alamat', show: true, fontSize: 7, color: '#64748b' },
        { key: 'berlaku', show: true, fontSize: 7, color: '#94a3b8' },
        { key: 'qr_code', show: true },
        { key: 'watermark', show: true, opacity: 0.03 },
      ],
      background: { type: 'gradient', color1: '#0f766e', color2: '#0d9488', angle: 135 },
    },
    back: {
      fields: [
        { key: 'header_website', show: true, fontSize: 6, color: '#ffffff', fontWeight: 'bold' },
        { key: 'aturan_list', show: true, fontSize: 7, color: '#475569' },
        { key: 'sekretariat', show: true, fontSize: 7, color: '#475569' },
        { key: 'slogan', show: true, fontSize: 14, color: '#0f766e', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'kota_tanggal', show: true, fontSize: 7, color: '#94a3b8' },
        { key: 'jabatan_ketua', show: true, fontSize: 7, color: '#64748b', fontWeight: 'semibold' },
        { key: 'ttd_stempel', show: true },
        { key: 'nama_ketua', show: true, fontSize: 8, color: '#0f172a', fontWeight: 'bold' },
      ],
      background: { type: 'gradient', color1: '#0f766e', color2: '#0d9488', angle: 135 },
    },
  },
  compact: {
    front: {
      fields: [
        { key: 'logo_kud', show: true, width: 40 },
        { key: 'nama_kud', show: true, fontSize: 8, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'foto_pekebun', show: true, width: 40, height: 52 },
        { key: 'judul', show: true, fontSize: 9, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'subjudul', show: true, fontSize: 6, color: '#0369a1', fontFamily: 'Inter', fontWeight: 'semibold' },
        { key: 'nama_anggota', show: true, fontSize: 11, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'nomor_anggota', show: true, fontSize: 7, color: '#0369a1', fontFamily: 'monospace', fontWeight: 'bold' },
        { key: 'nik', show: true, fontSize: 7, color: '#64748b' },
        { key: 'ttl', show: true, fontSize: 7, color: '#64748b' },
        { key: 'jenis_kelamin', show: true, fontSize: 7, color: '#64748b' },
        { key: 'no_wa', show: true, fontSize: 7, color: '#64748b' },
        { key: 'no_kk', show: true, fontSize: 7, color: '#64748b' },
        { key: 'alamat', show: true, fontSize: 7, color: '#64748b' },
        { key: 'berlaku', show: true, fontSize: 6, color: '#94a3b8' },
        { key: 'qr_code', show: true },
        { key: 'watermark', show: true, opacity: 0.03 },
      ],
      background: { type: 'gradient', color1: '#0369a1', color2: '#0284c7', angle: 135 },
    },
    back: {
      fields: [
        { key: 'header_website', show: true, fontSize: 6, color: '#ffffff', fontWeight: 'bold' },
        { key: 'aturan_list', show: true, fontSize: 6, color: '#475569' },
        { key: 'sekretariat', show: true, fontSize: 6, color: '#475569' },
        { key: 'slogan', show: true, fontSize: 13, color: '#0369a1', fontFamily: 'Inter', fontWeight: 'bold' },
        { key: 'kota_tanggal', show: true, fontSize: 6, color: '#94a3b8' },
        { key: 'jabatan_ketua', show: true, fontSize: 7, color: '#64748b', fontWeight: 'semibold' },
        { key: 'ttd_stempel', show: true },
        { key: 'nama_ketua', show: true, fontSize: 7, color: '#0f172a', fontWeight: 'bold' },
      ],
      background: { type: 'gradient', color1: '#0369a1', color2: '#0284c7', angle: 135 },
    },
  },
};

function DraggableField({ field, index, side, onToggle, onUpdate, onMoveField }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { index, side },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [index, side]);

  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    hover: (item) => {
      if (item.index !== index || item.side !== side) {
        onMoveField(item.side, item.index, index);
        item.index = index;
        item.side = side;
      }
    },
  }), [index, side, onMoveField]);

  const setRef = useCallback((node) => {
    dragRef(dropRef(node));
  }, [dragRef, dropRef]);

  const labelKey = field.key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const hasFontSize = !['logo_kud', 'foto_pekebun', 'qr_code', 'watermark', 'ttd_stempel'].includes(field.key);
  const hasColor = !['logo_kud', 'foto_pekebun', 'qr_code', 'watermark', 'ttd_stempel'].includes(field.key);
  const hasFontFamily = ['nama_kud', 'judul', 'subjudul', 'nama_anggota', 'slogan', 'nama_ketua'].includes(field.key);
  const hasFontWeight = hasFontSize;

  return (
    <div ref={setRef} className={`border border-border rounded-xl overflow-hidden bg-white transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <svg className="w-3.5 h-3.5 text-gray-300 cursor-grab shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${field.show !== false ? 'bg-primary border-primary' : 'border-gray-300'}`}
          onClick={() => onToggle(side, field.key)}>
          {field.show !== false && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`text-xs font-medium flex-1 ${field.show === false ? 'text-gray-300 line-through' : 'text-foreground'}`}>{labelKey}</span>
      </div>
      {field.show !== false && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2 bg-slate-50/50">
          {hasFontSize && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 w-20">Ukuran</label>
              <input type="range" min="5" max="24" value={field.fontSize || 10}
                onChange={(e) => onUpdate(side, field.key, { ...field, fontSize: parseInt(e.target.value) })}
                className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
              <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{field.fontSize || 10}px</span>
            </div>
          )}
          {hasColor && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 w-20">Warna</label>
              <input type="color" value={field.color || '#000000'}
                onChange={(e) => onUpdate(side, field.key, { ...field, color: e.target.value })}
                className="w-7 h-7 rounded border border-border cursor-pointer" />
              <input value={field.color || '#000000'}
                onChange={(e) => onUpdate(side, field.key, { ...field, color: e.target.value })}
                className="flex-1 px-2 py-1 text-[10px] font-mono rounded-lg border border-border bg-white" />
            </div>
          )}
          {hasFontFamily && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 w-20">Font</label>
              <select value={field.fontFamily || 'Inter'}
                onChange={(e) => onUpdate(side, field.key, { ...field, fontFamily: e.target.value })}
                className="flex-1 px-2 py-1 text-[10px] rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          )}
          {hasFontWeight && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 w-20">Tebal</label>
              <div className="flex gap-1">
                {['normal', 'semibold', 'bold', 'black'].map((w) => (
                  <button key={w} type="button"
                    onClick={() => onUpdate(side, field.key, { ...field, fontWeight: w })}
                    className={`px-2 py-1 text-[10px] rounded-lg border transition-colors cursor-pointer ${(field.fontWeight || 'normal') === w ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-border'}`}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {['logo_kud', 'foto_pekebun'].includes(field.key) && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 w-20">Lebar</label>
              <input type="range" min="30" max="80" value={field.width || 52}
                onChange={(e) => onUpdate(side, field.key, { ...field, width: parseInt(e.target.value) })}
                className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
              <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{field.width || 52}px</span>
            </div>
          )}
          {field.key === 'watermark' && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 w-20">Opacity</label>
              <input type="range" min="0.01" max="0.15" step="0.01" value={field.opacity ?? 0.04}
                onChange={(e) => onUpdate(side, field.key, { ...field, opacity: parseFloat(e.target.value) })}
                className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
              <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{((field.opacity ?? 0.04) * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SideEditor({ side, label, fields, background, onToggle, onUpdate, onMoveField, onBackgroundChange }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border"
        style={{ background: `linear-gradient(135deg, ${side === 'front' ? 'rgba(5, 150, 105, 0.05)' : 'rgba(2, 129, 67, 0.05)'}, transparent)` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: side === 'front' ? 'rgba(5,150,105,0.1)' : 'rgba(2,129,67,0.1)' }}>
          <CreditCardIcon className={`w-5 h-5 ${side === 'front' ? 'text-emerald-600' : 'text-emerald-700'}`} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{label}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Drag fields to reorder • {fields.length} field</p>
        </div>
      </div>
      <div className="p-4 space-y-1.5 max-h-[400px] overflow-y-auto">
        {fields.map((field, i) => (
          <DraggableField key={field.key} field={field} index={i} side={side}
            onToggle={onToggle} onUpdate={onUpdate} onMoveField={onMoveField} />
        ))}
      </div>
      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Background</label>
          <div className="flex gap-2 mb-2">
            {['color', 'gradient'].map((t) => (
              <button key={t} type="button" onClick={() => onBackgroundChange(side, 'type', t)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${(background.type || 'gradient') === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-border'}`}>
                {t === 'color' ? 'Solid' : 'Gradien'}
              </button>
            ))}
          </div>
          {background.type === 'color' ? (
            <div className="flex gap-2 items-center">
              <input type="color" value={background.color1 || '#059669'}
                onChange={(e) => onBackgroundChange(side, 'color1', e.target.value)}
                className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
              <input value={background.color1 || '#059669'}
                onChange={(e) => onBackgroundChange(side, 'color1', e.target.value)}
                className="flex-1 px-2 py-1 text-[10px] font-mono rounded-lg border border-border bg-white" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Warna 1</label>
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={background.color1 || '#059669'}
                    onChange={(e) => onBackgroundChange(side, 'color1', e.target.value)}
                    className="w-7 h-7 rounded-lg border border-border cursor-pointer" />
                  <input value={background.color1 || '#059669'}
                    onChange={(e) => onBackgroundChange(side, 'color1', e.target.value)}
                    className="flex-1 px-1.5 py-1 text-[9px] font-mono rounded-lg border border-border bg-white" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Warna 2</label>
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={background.color2 || '#047857'}
                    onChange={(e) => onBackgroundChange(side, 'color2', e.target.value)}
                    className="w-7 h-7 rounded-lg border border-border cursor-pointer" />
                  <input value={background.color2 || '#047857'}
                    onChange={(e) => onBackgroundChange(side, 'color2', e.target.value)}
                    className="flex-1 px-1.5 py-1 text-[9px] font-mono rounded-lg border border-border bg-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildKartuConfig(editorConfig, settingKud) {
  const buildSide = (side) => {
    const sideConfig = editorConfig[side] || {};
    const result = { fields: {}, background: sideConfig.background };
    (sideConfig.fields || []).forEach((f) => {
      result.fields[f.key] = { show: f.show };
      if (f.fontSize !== undefined) result.fields[f.key].fontSize = f.fontSize;
      if (f.color !== undefined) result.fields[f.key].color = f.color;
      if (f.fontFamily !== undefined) result.fields[f.key].fontFamily = f.fontFamily;
      if (f.fontWeight !== undefined) result.fields[f.key].fontWeight = f.fontWeight;
      if (f.width !== undefined) result.fields[f.key].width = f.width;
      if (f.height !== undefined) result.fields[f.key].height = f.height;
      if (f.opacity !== undefined) result.fields[f.key].opacity = f.opacity;
    });
    return result;
  };

  return {
    template: editorConfig.template,
    front: buildSide('front'),
    back: buildSide('back'),
    ttd: settingKud?.kartu_ttd || '',
    stempel: settingKud?.kartu_stempel || '',
    ketua_nama: settingKud?.kartu_ketua_nama || settingKud?.nama_ketua || '',
    ketua_jabatan: settingKud?.kartu_ketua_jabatan || 'Ketua KUD Sari Subur',
    aturan: settingKud?.kartu_aturan || [],
    slogan: settingKud?.kartu_slogan || 'SAWIT ADALAH KITA',
    website: settingKud?.website || 'kud-sari-subur.my.id',
    kota_terbit: settingKud?.kartu_kota_terbit || 'Megang Sakti',
  };
}

function CardDesignEditorInner({ settingKud, settings, onSave }) {
  const toast = useToast();

  const initialConfig = (() => {
    const existing = settingKud?.kartu_config;
    if (existing?.front?.fields) {
      const fields = existing.front.fields;
      const fieldList = TEMPLATE_PRESETS.classic.front.fields.map((tmpl) => {
        const existingField = fields[tmpl.key];
        return existingField ? { ...tmpl, ...existingField } : tmpl;
      });
      const backFieldList = TEMPLATE_PRESETS.classic.back.fields.map((tmpl) => {
        const existingField = existing.back?.fields?.[tmpl.key];
        return existingField ? { ...tmpl, ...existingField } : tmpl;
      });
      return {
        template: existing.template || 'classic',
        front: { fields: fieldList, background: existing.front?.background || TEMPLATE_PRESETS.classic.front.background },
        back: { fields: backFieldList, background: existing.back?.background || TEMPLATE_PRESETS.classic.back.background },
      };
    }
    return JSON.parse(JSON.stringify(TEMPLATE_PRESETS.classic));
  })();

  const [editorConfig, setEditorConfig] = useState(initialConfig);
  const [activeSide, setActiveSide] = useState('front');
  const [saving, setSaving] = useState(false);
  const [stempelUploading, setStempelUploading] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState(null);

  const getSide = (side) => editorConfig[side];
  const getFields = (side) => getSide(side)?.fields || [];

  const updateSide = (side, updater) => {
    setEditorConfig((prev) => ({
      ...prev,
      [side]: typeof updater === 'function' ? updater(prev[side]) : updater,
    }));
  };

  const handleToggle = (side, key) => {
    updateSide(side, (s) => ({
      ...s,
      fields: s.fields.map((f) => f.key === key ? { ...f, show: !f.show } : f),
    }));
  };

  const handleUpdate = (side, key, newField) => {
    updateSide(side, (s) => ({
      ...s,
      fields: s.fields.map((f) => f.key === key ? newField : f),
    }));
  };

  const handleMoveField = (side, fromIndex, toIndex) => {
    updateSide(side, (s) => {
      const fields = [...s.fields];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      return { ...s, fields };
    });
  };

  const handleBackgroundChange = (side, key, value) => {
    updateSide(side, (s) => ({
      ...s,
      background: { ...s.background, [key]: value },
    }));
  };

  const applyTemplate = (templateKey) => {
    const preset = TEMPLATE_PRESETS[templateKey];
    if (!preset) return;
    setEditorConfig(JSON.parse(JSON.stringify(preset)));
    setConfirmTemplate(null);
    toast.success(`Template ${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} diterapkan`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const kartuConfig = buildKartuConfig(editorConfig, settingKud);
      await api.admin.settingKud.update({ kartu_config: kartuConfig });
      if (onSave) onSave();
      toast.success('Desain kartu berhasil disimpan');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan desain kartu');
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

  const currentConfig = buildKartuConfig(editorConfig, settingKud);

  const previewData = {
    pekebun: {
      nama: 'BUDI SANTOSO',
      nik: '1601234567890001',
      alamat: 'Jl. Sawit Raya No. 45, Dusun Tegal Sari, Desa Tegal Sari, Kec. Megang Sakti, Kab. Musi Rawas, Sumatera Selatan',
      tempat_lahir: 'Musi Rawas',
      tanggal_lahir: '1990-01-15',
      jenis_kelamin: 'L',
      no_whatsapp: '08123456789',
      no_kk: '1234567890123456',
      foto_pekebun: settingKud?.logo || '',
      user: {},
    },
    setting_kud: settingKud || {},
    pengaturan: settings || {},
    kartu_config: currentConfig,
    nomor_anggota: 'KUD-00001/2026',
    tanggal_terbit: '2026-07-25',
    masa_berlaku: '2031-07-25',
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3 space-y-5">
        {/* Template selector */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CreditCardIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Template Kartu</h3>
              <p className="text-xs text-gray-400 mt-0.5">Pilih template lalu edit setiap field</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-2">
              {[
                { key: 'classic', label: '🥇 Classic', desc: 'Emas hijau formal' },
                { key: 'modern', label: '✨ Modern', desc: 'Minimalis teal' },
                { key: 'compact', label: '📱 Compact', desc: 'Biru padat info' },
              ].map((t) => (
                <button key={t.key} type="button" onClick={() => { if (editorConfig.template !== t.key) setConfirmTemplate(t.key); }}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${editorConfig.template === t.key ? 'border-emerald-400 bg-emerald-50/50' : 'border-border hover:border-emerald-200'}`}>
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side tabs */}
        <div className="flex gap-2">
          <button type="button" onClick={() => setActiveSide('front')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeSide === 'front' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-border hover:bg-slate-50'}`}>
            Sisi Depan
          </button>
          <button type="button" onClick={() => setActiveSide('back')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeSide === 'back' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-border hover:bg-slate-50'}`}>
            Sisi Belakang
          </button>
        </div>

        {/* Side editor */}
        <SideEditor
          side={activeSide}
          label={activeSide === 'front' ? 'Tampilan Depan Kartu' : 'Tampilan Belakang Kartu'}
          fields={getFields(activeSide)}
          background={getSide(activeSide).background}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onMoveField={handleMoveField}
          onBackgroundChange={handleBackgroundChange}
        />

        {/* TTD & Stempel */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border"
            style={{ background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05), transparent)' }}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Tanda Tangan & Stempel</h3>
              <p className="text-xs text-gray-400 mt-0.5">Upload/edit TTD dan stempel untuk kartu</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-border">
              <label className="block text-sm font-medium text-foreground/80 mb-2">Tanda Tangan Digital</label>
              <SignaturePad
                value={settingKud?.kartu_ttd || ''}
                onChange={async (dataUrl) => {
                  await api.admin.settingKud.update({ kartu_ttd: dataUrl });
                  if (onSave) onSave();
                }}
                height={130}
              />
            </div>
            <div className="p-4 bg-white rounded-xl border border-border">
              <label className="block text-sm font-medium text-foreground/80 mb-2">Stempel KUD</label>
              {settingKud?.kartu_stempel ? (
                <img src={settingKud.kartu_stempel} alt="Stempel" className="h-16 object-contain mb-3 rounded-lg border border-border p-2 bg-white" />
              ) : (
                <div className="h-16 flex items-center justify-center bg-muted rounded-lg border border-dashed border-border mb-3 text-xs text-gray-400">Belum upload</div>
              )}
              <label className={`px-4 py-2 ${stempelUploading ? 'bg-gray-400' : 'bg-primary'} text-white rounded-xl text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors inline-block`}>
                {stempelUploading ? 'Uploading...' : 'Upload Stempel'}
                <input type="file" className="hidden" accept="image/*" onChange={handleStempelUpload} disabled={stempelUploading} />
              </label>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Simpan Desain Kartu
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden sticky top-6">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CreditCardIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Pratinjau Kartu</h3>
              <p className="text-xs text-gray-400 mt-0.5">85.6 x 53.98 mm — real-time</p>
            </div>
          </div>
          <div className="p-3 flex justify-center">
            <KartuAnggotaKud
              data={previewData}
              width={380}
              showActions={false}
            />
          </div>
        </div>
      </div>

      {confirmTemplate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Ganti Template?</h3>
            <p className="text-sm text-gray-500 mb-5">Mengganti template akan mengatur ulang semua field. Perubahan yang belum disimpan akan hilang.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmTemplate(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">Batal</button>
              <button type="button" onClick={() => applyTemplate(confirmTemplate)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Ya, Terapkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CardDesignEditor(props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CardDesignEditorInner {...props} />
    </DndProvider>
  );
}
