'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';
import DocumentViewer from '@/components/DocumentViewer';
import SignaturePad from '@/components/SignaturePad';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  XMarkIcon, PhotoIcon, CheckCircleIcon,
  DocumentTextIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const JENIS_OPTIONS = ['PSR', 'Intensifikasi', 'Ekstensifikasi', 'Pelatihan SDMPKS', 'Beasiswa SDMPKS', 'Kemitraan'];

const ALL_PERSYARATAN = [
  { value: 'foto_ktp', label: 'Foto KTP' },
  { value: 'foto_kk', label: 'Foto KK' },
  { value: 'akte', label: 'Akte' },
  { value: 'foto_pekebun', label: 'Foto Pekebun' },
  { value: 'foto_surat_tanah', label: 'Foto Surat Tanah' },
  { value: 'keterangan_beda_nama', label: 'Keterangan Beda Nama' },
];

const DEFAULT_SURAT_TEMPLATES = {
  1: {
    judul: 'SURAT PERNYATAAN',
    isi: `Dengan ini menyatakan, bahwa saya bersedia untuk mengikuti Kegiatan Pelatihan Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit (SDMPKS) Tahun (Sesuaikan dengan tahun pelaksanaan) yang didanai oleh Badan Pengelola Dana Perkebunan (BPDP) dengan mematuhi segala peraturan yang telah ditetapkan.

Demikian surat pernyataan ini dibuat dengan sebenar-benarnya untuk dapat digunakan sebagaimana mestinya. Apabila di kemudian hari ditemukan bahwa pernyataan ini tidak benar, saya bersedia menerima konsekuensi sesuai dengan peraturan yang berlaku.`,
  },
  2: {
    judul: 'SURAT PERNYATAAN KEPEMILIKAN LAHAN',
    isi: `Dengan ini menyatakan bahwa saya benar-benar memiliki lahan perkebunan kelapa sawit kurang dari 25 (dua puluh lima) Hektar.

Demikian surat pernyataan ini dibuat dengan sesungguhnya dan dapat digunakan seperlunya.`,
  },
  3: {
    judul: 'SURAT KETERANGAN KEANGGOTAAN KOPERASI',
    isi: `Benar nama tersebut di atas adalah petani sawit dan tergabung dalam Koperasi Unit Desa Sari Subur Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas dengan jabatan sebagai Anggota.

Demikian surat pernyataan ini dibuat dengan sesungguhnya dan dapat digunakan seperlunya.`,
  },
};

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
        </div>
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function EditProgramModal({ open, onClose, editing, onSaved }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    nama: '', jenis: 'PSR', deskripsi: '',
    foto: [], persyaratan: [], manfaat: [],
    tanggal_mulai: '', tanggal_selesai: '', kuota: '',
    aktifkan_surat: false,
    surat_1_judul: '', surat_1_isi: '',
    surat_2_judul: '', surat_2_isi: '',
    surat_3_judul: '', surat_3_isi: '',
    tanda_tangan_kades_tegal_sari: '', tanda_tangan_kades_marga_puspita: '',
    tanda_tangan_kades_campur_sari: '', tanda_tangan_ketua_kud: '',
  });

  const [manfaatInput, setManfaatInput] = useState('');

  const resetForm = useCallback(() => {
    setForm({
      nama: '', jenis: 'PSR', deskripsi: '', foto: [], persyaratan: [], manfaat: [],
      tanggal_mulai: '', tanggal_selesai: '', kuota: '',
      aktifkan_surat: false,
      surat_1_judul: '', surat_1_isi: '',
      surat_2_judul: '', surat_2_isi: '',
      surat_3_judul: '', surat_3_isi: '',
      tanda_tangan_kades_tegal_sari: '', tanda_tangan_kades_marga_puspita: '',
      tanda_tangan_kades_campur_sari: '', tanda_tangan_ketua_kud: '',
    });
    setManfaatInput('');
    setConfirmDelete(false);
  }, []);

  useEffect(() => {
    if (editing) {
      const aktif = editing.aktifkan_surat || false;
      const data = {
        nama: editing.nama || '',
        jenis: editing.jenis || 'PSR',
        deskripsi: editing.deskripsi || '',
        foto: editing.foto || [],
        persyaratan: editing.persyaratan || [],
        manfaat: editing.manfaat || [],
        tanggal_mulai: editing.tanggal_mulai ? editing.tanggal_mulai.slice(0, 10) : '',
        tanggal_selesai: editing.tanggal_selesai ? editing.tanggal_selesai.slice(0, 10) : '',
        kuota: editing.kuota?.toString() || '',
        aktifkan_surat: aktif,
      };
      [1, 2, 3].forEach((i) => {
        data[`surat_${i}_judul`] = editing[`surat_${i}_judul`] ?? (aktif ? DEFAULT_SURAT_TEMPLATES[i].judul : '');
        data[`surat_${i}_isi`] = editing[`surat_${i}_isi`] ?? (aktif ? DEFAULT_SURAT_TEMPLATES[i].isi : '');
      });
      ['tanda_tangan_kades_tegal_sari', 'tanda_tangan_kades_marga_puspita', 'tanda_tangan_kades_campur_sari', 'tanda_tangan_ketua_kud'].forEach((key) => {
        data[key] = editing[key] ?? '';
      });
      setForm(data);
    } else {
      resetForm();
    }
  }, [editing, resetForm]);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.uploadDokumenProgram(file, 'foto_program');
      setForm((prev) => ({ ...prev, foto: [...prev.foto, res.url] }));
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
  };

  const removeFoto = (idx) => {
    setForm((prev) => ({ ...prev, foto: prev.foto.filter((_, i) => i !== idx) }));
  };

  const togglePersyaratan = (val) => {
    setForm((prev) => ({
      ...prev,
      persyaratan: prev.persyaratan.includes(val)
        ? prev.persyaratan.filter((p) => p !== val)
        : [...prev.persyaratan, val],
    }));
  };

  const addManfaat = () => {
    const val = manfaatInput.trim();
    if (!val || form.manfaat.includes(val)) return;
    setForm((prev) => ({ ...prev, manfaat: [...prev.manfaat, val] }));
    setManfaatInput('');
  };

  const removeManfaat = (val) => {
    setForm((prev) => ({ ...prev, manfaat: prev.manfaat.filter((m) => m !== val) }));
  };

  const handleManfaatKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addManfaat(); }
  };

  const [customSyarat, setCustomSyarat] = useState('');
  const addCustomSyarat = () => {
    const val = customSyarat.trim();
    if (!val || form.persyaratan.includes(val)) return;
    setForm((prev) => ({ ...prev, persyaratan: [...prev.persyaratan, val] }));
    setCustomSyarat('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        kuota: form.kuota ? parseInt(form.kuota) : null,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null,
      };
      if (editing) {
        await api.admin.program.update(editing.id, { ...payload, aktif: editing.aktif });
        toast.success('Program berhasil diperbarui');
      } else {
        await api.admin.program.create(payload);
        toast.success('Program berhasil ditambahkan');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!editing) return;
    setDeleting(true);
    try {
      await api.admin.program.delete(editing.id);
      toast.success('Program berhasil dihapus');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
    setDeleting(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Program' : 'Tambah Program Baru'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NAMA & JENIS */}
        <FormSection title="Informasi Program" icon={DocumentTextIcon}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Program" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required placeholder="PSR - Peremajaan Sawit Rakyat" />
            <Select label="Jenis" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
              {JENIS_OPTIONS.map((j) => (<option key={j} value={j}>{j}</option>))}
            </Select>
          </div>
        </FormSection>

        {/* FOTO PROGRAM */}
        <FormSection title="Foto Program" icon={PhotoIcon}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {form.foto.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFoto(idx)}
                  className="absolute top-1 right-1 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-lg backdrop-blur-sm">
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted hover:border-primary/40 transition-all">
              <div className="flex flex-col items-center gap-1">
                <PhotoIcon className="w-6 h-6 text-gray-300" />
                <span className="text-[10px] text-gray-400">Tambah</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFotoUpload} />
            </label>
          </div>
        </FormSection>

        {/* DESKRIPSI */}
        <FormSection title="Deskripsi Program" icon={DocumentTextIcon}>
          <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} placeholder="Deskripsi lengkap program..." />
        </FormSection>

        {/* PERSYARATAN DOKUMEN */}
        <FormSection title="Persyaratan Dokumen" icon={CheckCircleIcon}>
          <div className="flex flex-wrap gap-2">
            {ALL_PERSYARATAN.map((p) => (
              <button key={p.value} type="button" onClick={() => togglePersyaratan(p.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  form.persyaratan.includes(p.value)
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                }`}>
                {form.persyaratan.includes(p.value) && <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" />}
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={customSyarat}
              onChange={(e) => setCustomSyarat(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSyarat(); } }}
              placeholder="Tambah syarat kustom..."
              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button type="button" onClick={addCustomSyarat}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">
              + Tambah
            </button>
          </div>
          {form.persyaratan.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.persyaratan.map((s, idx) => {
                const isDefault = ALL_PERSYARATAN.some((p) => p.value === s);
                if (isDefault) return null;
                return (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                    {s}
                    <button type="button" onClick={() => togglePersyaratan(s)} className="text-purple-400 hover:text-purple-700 transition-colors">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </FormSection>

        {/* MANFAAT */}
        <FormSection title="Manfaat Program" icon={PlusIcon}>
          <div className="flex gap-2 mb-2">
            <input type="text" value={manfaatInput} onChange={(e) => setManfaatInput(e.target.value)} onKeyDown={handleManfaatKeyDown} placeholder="Tambah manfaat..." className="flex-1 px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            <button type="button" onClick={addManfaat} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.manfaat.map((m, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
                {m}
                <button type="button" onClick={() => removeManfaat(m)} className="text-emerald-400 hover:text-emerald-700 transition-colors"><XMarkIcon className="w-3.5 h-3.5" /></button>
              </span>
            ))}
            {form.manfaat.length === 0 && <span className="text-sm text-gray-400 italic">Belum ada manfaat ditambahkan</span>}
          </div>
        </FormSection>

        {/* SURAT & TTD */}
        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={form.aktifkan_surat}
              onChange={(e) => {
                const aktif = e.target.checked;
                setForm((prev) => {
                  const next = { ...prev, aktifkan_surat: aktif };
                  if (aktif) {
                    [1, 2, 3].forEach((i) => {
                      if (!next[`surat_${i}_judul`]) next[`surat_${i}_judul`] = DEFAULT_SURAT_TEMPLATES[i].judul;
                      if (!next[`surat_${i}_isi`]) next[`surat_${i}_isi`] = DEFAULT_SURAT_TEMPLATES[i].isi;
                    });
                  }
                  return next;
                });
              }}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
            />
            <div>
              <span className="font-medium text-foreground">Aktifkan Surat Pernyataan</span>
              <p className="text-xs text-gray-400">Pekebun akan membaca & menandatangani 3 surat pernyataan</p>
            </div>
          </label>

          {form.aktifkan_surat && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/60">3 Surat Pernyataan</span>
                <div className="h-px flex-1 bg-gradient-to-l from-primary/20 to-transparent" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <DocumentTextIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Surat Pernyataan {i}</h4>
                      <p className="text-[11px] text-gray-400">Lampiran {String(i).padStart(2, '0')}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <Input label="Judul Surat" value={form[`surat_${i}_judul`]} onChange={(e) => setForm({ ...form, [`surat_${i}_judul`]: e.target.value })} placeholder={`Surat Pernyataan ${i}`} />
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">Isi Surat</label>
                      <textarea
                        value={form[`surat_${i}_isi`]}
                        onChange={(e) => setForm({ ...form, [`surat_${i}_isi`]: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y font-mono text-gray-700 leading-relaxed"
                        placeholder={`{{nama_pekebun}}, {{nik}}, {{alamat}}, dll.`}
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Placeholder: {`{{nama_pekebun}} {{nik}} {{no_kk}} {{tempat_lahir}} {{tanggal_lahir}} {{alamat}} {{alamat_lahan}} {{luas_lahan}} {{nama_program}} {{kades_nama}} {{tanggal_surat}}`}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100/80 border-b border-border flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-500">PREVIEW SURAT {i}</span>
                        <span className="text-[10px] text-gray-400">Data contoh untuk pratinjau</span>
                      </div>
                      <div className="p-3 max-h-48 overflow-y-auto">
                        <DocumentViewer
                          suratIndex={i}
                          judul={form[`surat_${i}_judul`]}
                          isi={form[`surat_${i}_isi`]}
                          data={{
                            nama_pekebun: 'Contoh Nama',
                            nik: '3512345678901234',
                            no_kk: '1234567890123456',
                            jenis_kelamin: 'LAKI-LAKI',
                            tempat_lahir: 'Tegal Sari',
                            tanggal_lahir: '17 Agustus 1990',
                            no_whatsapp: '08123456789',
                            alamat: 'Desa Tegal Sari, Kec. Megang Sakti',
                            alamat_lahan: 'Dusun Sawit Makmur',
                            luas_lahan: '20.000 M² (2 Ha)',
                            jenis_surat_lahan: 'SHM',
                            nomor_surat_lahan: '123/SHM/2024',
                            nama_program: form.nama || 'Program KUD',
                            kades_nama: 'SISWOYO',
                            kades_title: 'Kepala Desa Tegalsari',
                            ketua_kud_nama: 'Dedek Sulaiman, S.Pd.',
                            tanggal_surat: form.tanggal_mulai || new Date().toISOString().split('T')[0],
                            tempat_surat: 'Megang Sakti',
                            logo_kud: '',
                            kop_kud: 'KOPERASI UNIT DESA (KUD) "SARI SUBUR"',
                          }}
                          program={{}}
                          showSignature={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {form.aktifkan_surat && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                Tanda Tangan Digital (Admin)
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Upload tanda tangan untuk masing-masing pejabat. Tanda tangan akan otomatis muncul di surat pekebun. Bersifat opsional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-xl border border-border">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Kades Tegal Sari — Siswoyo</p>
                  <SignaturePad value={form.tanda_tangan_kades_tegal_sari} onChange={(v) => setForm({ ...form, tanda_tangan_kades_tegal_sari: v || '' })} height={120} />
                </div>
                <div className="p-3 bg-white rounded-xl border border-border">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Kades Marga Puspita — Sumodiono</p>
                  <SignaturePad value={form.tanda_tangan_kades_marga_puspita} onChange={(v) => setForm({ ...form, tanda_tangan_kades_marga_puspita: v || '' })} height={120} />
                </div>
                <div className="p-3 bg-white rounded-xl border border-border">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Kades Campur Sari — Muhksin</p>
                  <SignaturePad value={form.tanda_tangan_kades_campur_sari} onChange={(v) => setForm({ ...form, tanda_tangan_kades_campur_sari: v || '' })} height={120} />
                </div>
                <div className="p-3 bg-white rounded-xl border border-border">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Ketua KUD — Dedek Sulaiman, S.Pd.</p>
                  <SignaturePad value={form.tanda_tangan_ketua_kud} onChange={(v) => setForm({ ...form, tanda_tangan_ketua_kud: v || '' })} height={120} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TANGGAL & KUOTA */}
        <FormSection title="Periode & Kuota" icon={DocumentTextIcon}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePicker label="Tanggal Mulai" value={form.tanggal_mulai} onChange={(v) => setForm({ ...form, tanggal_mulai: v })} />
            <DatePicker label="Tanggal Selesai" value={form.tanggal_selesai} onChange={(v) => setForm({ ...form, tanggal_selesai: v })} />
            <Input label="Kuota Pendaftar" type="number" min="0" value={form.kuota} onChange={(e) => setForm({ ...form, kuota: e.target.value })} placeholder="Maksimal peserta" />
          </div>
        </FormSection>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {editing && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <TrashIcon className="w-4 h-4" /> Hapus Program
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button type="submit" loading={submitting}>
              {editing ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              {editing ? 'Simpan Perubahan' : 'Simpan Program'}
            </Button>
          </div>
        </div>
      </form>

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hapus Program</h3>
                <p className="text-sm text-gray-500">Yakin ingin menghapus <strong>{editing?.nama}</strong>?</p>
              </div>
            </div>
            {editing?.pendaftaran_program_count > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  Program ini memiliki <strong>{editing.pendaftaran_program_count} pendaftaran</strong> yang juga akan dihapus.
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Batal</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Ya, Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
