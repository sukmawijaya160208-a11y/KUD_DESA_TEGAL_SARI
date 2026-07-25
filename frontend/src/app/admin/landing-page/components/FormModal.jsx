'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { PlusIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SECTION_FIELDS = {
  langkah: [
    { key: 'title', label: 'Judul Langkah', type: 'text', required: true },
    { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
    { key: 'order', label: 'Urutan', type: 'number' },
  ],
  sertifikasi: [
    { key: 'title', label: 'Jenis Pencapaian', type: 'text', required: true },
    { key: 'description', label: 'Deskripsi', type: 'textarea' },
    { key: 'meta_data.lembaga', label: 'Lembaga Penerbit', type: 'text' },
    { key: 'meta_data.nomor', label: 'Nomor & Tanggal', type: 'text' },
    { key: 'media_url', label: 'Dokumen/Gambar', type: 'media' },
  ],
  dokumentasi: [
    { key: 'title', label: 'Nama Kegiatan', type: 'text', required: true },
    { key: 'description', label: 'Deskripsi', type: 'textarea' },
    { key: 'media_url', label: 'Foto', type: 'media' },
  ],
  video: [
    { key: 'title', label: 'Nama Kegiatan', type: 'text', required: true },
    { key: 'youtube_url', label: 'Link URL / YouTube ID', type: 'text', required: true, placeholder: 'Tempel link YouTube atau ID video' },
    { key: 'description', label: 'Deskripsi', type: 'textarea' },
  ],
  keuntungan: [
    { key: 'title', label: 'Nama Keuntungan', type: 'text', required: true },
    { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
    { key: 'meta_data.icon', label: 'Ikon (emoji)', type: 'text', placeholder: '🌿' },
  ],
  fitur: [
    { key: 'title', label: 'Nama Fitur', type: 'text', required: true },
    { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
    { key: 'media_url', label: 'Gambar/Ikon', type: 'media' },
  ],
  angka: [
    { key: 'title', label: 'Label', type: 'text', required: true },
    { key: 'meta_data.nilai', label: 'Nilai/Angka', type: 'text', required: true },
    { key: 'meta_data.satuan', label: 'Satuan', type: 'text', placeholder: '+ | Hektar | %' },
  ],
  mitra: [
    { key: 'title', label: 'Nama Mitra', type: 'text', required: true },
    { key: 'media_url', label: 'Logo Mitra', type: 'media' },
  ],
  testimoni: [
    { key: 'title', label: 'Nama', type: 'text', required: true },
    { key: 'description', label: 'Teks Testimoni', type: 'textarea', required: true },
    { key: 'meta_data.alamat', label: 'Alamat/Asal', type: 'text' },
    { key: 'meta_data.rating', label: 'Rating Bintang (1-5)', type: 'number' },
    { key: 'media_url', label: 'Foto', type: 'media' },
  ],
  faq: [
    { key: 'title', label: 'Pertanyaan', type: 'text', required: true },
    { key: 'description', label: 'Jawaban', type: 'textarea', required: true },
    { key: 'order', label: 'Urutan', type: 'number' },
  ],
  layanan: [
    { key: 'title', label: 'Nama Layanan', type: 'text', required: true },
    { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
    { key: 'meta_data.kontak', label: 'Kontak/Detail', type: 'text' },
    { key: 'meta_data.icon', label: 'Ikon', type: 'text' },
  ],
};

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => {
    if (!o[k]) o[k] = {};
    return o[k];
  }, obj);
  target[last] = value;
}

function extractYouTubeId(input) {
  if (!input) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = input.match(regExp);
  return (match && match[2].length === 11) ? match[2] : input.trim();
}

export default function FormModal({ open, onClose, editing, sectionType, onSaved }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fields = SECTION_FIELDS[sectionType] || [];

  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const resetForm = useCallback(() => {
    const init = {};
    fields.forEach((f) => {
      if (f.type === 'media') init.media_url = '';
      else if (f.key.startsWith('meta_data.')) setNestedValue(init, f.key, '');
      else if (f.key === 'youtube_url') {
        init.youtube_url = '';
        init.meta_data = init.meta_data || {};
        init.meta_data.youtube_id = '';
      }
      else init[f.key] = '';
    });
    init.meta_data = init.meta_data || {};
    init.is_active = true;
    setForm(init);
  }, [fields]);

  useEffect(() => {
    setErrorMessage('');
    if (editing) {
      const init = {};
      fields.forEach((f) => {
        if (f.key === 'youtube_url') {
          init.youtube_url = editing.meta_data?.youtube_id || '';
          init.meta_data = { ...(editing.meta_data || {}) };
          init.meta_data.youtube_id = editing.meta_data?.youtube_id || '';
        } else if (f.key.startsWith('meta_data.')) {
          setNestedValue(init, f.key, getNestedValue(editing, f.key));
        } else {
          init[f.key] = editing[f.key] || '';
        }
      });
      if (!init.meta_data) init.meta_data = { ...(editing.meta_data || {}) };
      init.is_active = editing.is_active !== undefined ? editing.is_active : true;
      setForm(init);
    } else {
      resetForm();
    }
  }, [editing, fields, resetForm]);

  const handleField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, meta_data: { ...(prev.meta_data || {}) } };
      if (key.startsWith('meta_data.')) setNestedValue(next, key, value);
      else next[key] = value;
      return next;
    });
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.admin.landing.uploadMedia(file);
      handleField('media_url', res.url);
      toast.success('Upload berhasil');
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = { section_type: sectionType };

      fields.forEach((f) => {
        if (f.key === 'youtube_url') {
          payload.title = form.title || '';
          const rawUrl = form.youtube_url || '';
          const cleanId = extractYouTubeId(rawUrl);
          payload.meta_data = { ...(form.meta_data || {}), youtube_id: cleanId };
          payload.media_url = cleanId;
        } else if (f.key.startsWith('meta_data.')) {
          if (!payload.meta_data) payload.meta_data = {};
          setNestedValue(payload, f.key, getNestedValue(form, f.key));
        } else if (f.key !== 'title') {
          const val = form[f.key];
          if (val !== undefined && val !== '') payload[f.key] = val;
        } else {
          payload.title = form.title || '';
        }
      });

      if (sectionType === 'langkah' || sectionType === 'faq') {
        payload.order = parseInt(form.order) || 0;
      }

      payload.is_active = form.is_active !== false;

      if (editing) {
        await api.admin.landing.update(editing.id, payload);
        toast.success('Data berhasil diperbarui');
      } else {
        await api.admin.landing.create(payload);
        toast.success('Data berhasil ditambahkan');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        const errors = err.data.errors;
        const firstField = Object.keys(errors)[0];
        setErrorMessage(errors[firstField]?.[0] || 'Data tidak valid');
      } else {
        setErrorMessage(err.message || 'Terjadi kesalahan');
      }
    }
    setSubmitting(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Data' : 'Tambah Data Baru'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {fields.map((f) => (
          <div key={f.key}>
            {f.type === 'textarea' ? (
              <Textarea
                label={f.label}
                value={getNestedValue(form, f.key)}
                onChange={(e) => handleField(f.key, e.target.value)}
                required={f.required}
                rows={3}
              />
            ) : f.type === 'media' ? (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">{f.label}</label>
                {form.media_url ? (
                  <div className="relative inline-block">
                    <img src={form.media_url} alt="" className="h-24 rounded-xl border border-border object-cover" />
                    <button type="button" onClick={() => handleField('media_url', '')}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-all">
                    <span className="text-sm text-gray-400">
                      {uploading ? 'Mengupload...' : 'Klik untuk upload'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleMediaUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            ) : (
              <div>
                <Input
                  label={f.label}
                  type={f.type || 'text'}
                  value={getNestedValue(form, f.key)}
                  onChange={(e) => handleField(f.key, e.target.value)}
                  required={f.required}
                  placeholder={f.placeholder}
                />
                {f.key === 'youtube_url' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bisa masukkan link langsung (https://youtu.be/xxx) atau ID aja
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* IS ACTIVE TOGGLE */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-foreground/80">Status Aktif</span>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
            className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${
              form.is_active ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              form.is_active ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div />
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button type="submit" loading={submitting}>
              {editing ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              {editing ? 'Simpan Perubahan' : 'Simpan Data'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
