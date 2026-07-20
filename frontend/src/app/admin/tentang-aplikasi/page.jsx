'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

import {
  InformationCircleIcon, PencilSquareIcon,
  PhoneIcon, BanknotesIcon, CheckCircleIcon,
  XMarkIcon, EnvelopeIcon, GlobeAltIcon,
  MapPinIcon, CameraIcon, AtSymbolIcon,
  SparklesIcon, ArrowUpRightIcon
} from '@heroicons/react/24/outline';

const INFO_FIELDS = [
  { key: 'kontak', label: 'Kontak', icon: PhoneIcon, color: 'text-emerald-500' },
  { key: 'email', label: 'Email', icon: EnvelopeIcon, color: 'text-emerald-500' },
  { key: 'instagram', label: 'Instagram', icon: CameraIcon, color: 'text-pink-500' },
  { key: 'facebook', label: 'Facebook', icon: AtSymbolIcon, color: 'text-blue-500' },
  { key: 'website', label: 'Website', icon: GlobeAltIcon, color: 'text-purple-500' },
  { key: 'alamat', label: 'Alamat', icon: MapPinIcon, color: 'text-slate-500' },
];

export default function AdminTentangAplikasiPage() {
  const toast = useToast();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.tentangAplikasi.get()
      .then((res) => { setData(res); setEdit({ ...res }); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleEditFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload('/upload/foto-pengembang', file);
      setEdit((prev) => ({ ...prev, foto_pengembang: res.url }));
      toast.success('Foto berhasil diupload');
    } catch (err) { toast.error('Upload gagal: ' + err.message); }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.tentangAplikasi.update(edit);
      setData({ ...edit });
      setShowModal(false);
      toast.success('Tentang aplikasi berhasil disimpan');
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  const upd = (key) => (e) => setEdit((prev) => ({ ...prev, [key]: e.target.value }));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const infoCards = INFO_FIELDS.filter((f) => data[f.key]);

  return (
    <div>
      {/* ===== HERO — FULL SCREEN ===== */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 overflow-hidden flex items-center">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 animate-fade-in">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="shrink-0 w-full max-w-md animate-slide-up-fade animate-delay-100">
              <div className="relative group aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.02]">
                {data.foto_pengembang ? (
                  <img src={data.foto_pengembang} alt={data.developer_name || 'Developer'}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/20">?</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left animate-slide-up-fade animate-delay-200">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                {data.developer_name || 'MUHAMMAD SUKMA WIJAYA S.KOM.SH'}
              </h1>
              <p className="mt-4 uppercase tracking-[0.2em] text-white/40 text-sm font-medium">
                {data.developer_role || 'Pengembang Aplikasi'}
              </p>
              <div className="mt-8 w-16 h-0.5 bg-white/20 rounded-full mx-auto lg:mx-0" />

              <p className="mt-8 text-white/60 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {data.teks ? data.teks.split('\n')[0] : 'Membangun ekosistem digital untuk KUD Desa Tegal Sari.'}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start text-sm animate-slide-up-fade animate-delay-300">
                {data.kontak && (
                  <a href={`tel:${data.kontak.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200">
                    <PhoneIcon className="w-4 h-4" /> {data.kontak}
                  </a>
                )}
                {data.kontak && data.instagram && <span className="text-white/20 hidden sm:inline">·</span>}
                {data.instagram && (
                  <a href={data.instagram.startsWith('http') ? data.instagram : `https://instagram.com/${data.instagram}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200">
                    <CameraIcon className="w-4 h-4" /> Instagram
                  </a>
                )}
                {(data.kontak || data.instagram) && data.email && <span className="text-white/20 hidden sm:inline">·</span>}
                {data.email && (
                  <a href={`mailto:${data.email}`}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200">
                    <EnvelopeIcon className="w-4 h-4" /> Email
                  </a>
                )}
                <button onClick={() => setShowModal(true)}
                  className="ml-0 lg:ml-4 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2">
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      {data.teks && (
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 animate-slide-up-fade animate-delay-100">
            <div className="max-w-4xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Tentang</span>
              <div className="mt-4 flex gap-6">
                <div className="w-1 min-h-[80px] bg-primary/30 rounded-full shrink-0" />
                <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {data.teks}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== INFO CARDS ===== */}
      {infoCards.length > 0 && (
        <section className="pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {infoCards.map((field, i) => {
                const Icon = field.icon;
                return (
                  <div key={field.key}
                    className="group bg-white rounded-xl border border-border/60 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up-fade"
                    style={{ animationDelay: `${0.15 + i * 0.08}s`, animationFillMode: 'backwards' }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${field.color.replace('text-', 'bg-').replace('500', '100')} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${field.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-400 mb-0.5">{field.label}</p>
                        {field.key === 'alamat' ? (
                          <p className="text-sm font-semibold text-foreground">{data[field.key]}</p>
                        ) : (
                          <a href={
                            field.key === 'kontak' ? `tel:${data[field.key].replace(/[^0-9]/g, '')}` :
                            field.key === 'email' ? `mailto:${data[field.key]}` :
                            field.key === 'website' ? (data[field.key].startsWith('http') ? data[field.key] : `https://${data[field.key]}`) :
                            data[field.key].startsWith('http') ? data[field.key] : `https://${field.key === 'instagram' ? 'instagram.com/' : 'facebook.com/'}${data[field.key]}`
                          } target="_blank"
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 truncate max-w-full">
                            {data[field.key]}
                            <ArrowUpRightIcon className="w-3.5 h-3.5 shrink-0 opacity-30 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== DONASI SECTION ===== */}
      {(data.rekening || data.bank) && (
        <section className="pb-24 lg:pb-32 mt-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 animate-slide-up-fade animate-delay-300">
            <div className="bg-[#fffdf6] rounded-2xl border border-amber-200/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-amber-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <BanknotesIcon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Dukungan Pengembangan</h3>
                    <p className="text-sm text-gray-500">Donasi Bapak/Ibu kiranya dapat bermanfaat untuk mengembangkan aplikasi ini kedepannya.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 px-6 py-5 border-b sm:border-b-0 sm:border-r border-amber-200/50">
                  <p className="text-xs font-semibold text-amber-600/60 uppercase tracking-wider mb-1">Bank</p>
                  <p className="text-lg font-extrabold text-foreground">{data.bank || 'DANA'}</p>
                </div>
                <div className="flex-1 px-6 py-5 border-b sm:border-b-0 sm:border-r border-amber-200/50">
                  <p className="text-xs font-semibold text-amber-600/60 uppercase tracking-wider mb-1">No. Rekening</p>
                  <p className="text-lg font-extrabold text-foreground tracking-wider">{data.rekening || '085169883337'}</p>
                </div>
                <div className="flex-1 px-6 py-5">
                  <p className="text-xs font-semibold text-amber-600/60 uppercase tracking-wider mb-1">A.N.</p>
                  <p className="text-lg font-extrabold text-foreground">{data.rekening_an || 'MUHAMMAD SUKMA WIJAYA'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-16 h-px bg-border/60 rounded-full mx-auto mb-8" />
          <p className="text-gray-400 text-sm italic">Wassalamu&apos;alaikum, Wr.Wb</p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400 text-xs">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>KUD Desa Tegal Sari</span>
          </div>
        </div>
      </section>

      {/* ===== EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-foreground">Edit Profil Pengembang</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-foreground transition-colors cursor-pointer">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">Foto Pengembang</label>
                <div className="flex items-start gap-6">
                  <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                    <div className="w-36 h-44 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center group-hover:border-primary transition-colors">
                      {edit.foto_pengembang ? (
                        <img src={edit.foto_pengembang} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <CameraIcon className="w-8 h-8 text-gray-300" />
                          <span className="text-xs text-gray-400">Upload</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">{uploading ? '...' : 'Ganti'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Klik foto untuk mengganti</p>
                    <p className="text-xs text-gray-400 mt-1">Format: JPG/PNG, maks 2MB</p>
                    <p className="text-xs text-gray-400">Rekomendasi: 3:4 ratio</p>
                  </div>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleEditFoto} disabled={uploading} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Developer" value={edit.developer_name || ''} onChange={upd('developer_name')} placeholder="MUHAMMAD SUKMA WIJAYA S.KOM.SH" />
                <Input label="Peran / Jabatan" value={edit.developer_role || ''} onChange={upd('developer_role')} placeholder="Pengembang Aplikasi" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nomor Kontak" value={edit.kontak || ''} onChange={upd('kontak')} placeholder="0822-2728-3416" />
                <Input label="Email" type="email" value={edit.email || ''} onChange={upd('email')} placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Instagram" value={edit.instagram || ''} onChange={upd('instagram')} placeholder="@username atau link" />
                <Input label="Facebook" value={edit.facebook || ''} onChange={upd('facebook')} placeholder="username atau link" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Website" value={edit.website || ''} onChange={upd('website')} placeholder="https://example.com" />
                <Input label="Alamat" value={edit.alamat || ''} onChange={upd('alamat')} placeholder="Alamat kantor" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Bank" value={edit.bank || ''} onChange={upd('bank')} placeholder="Allo Bank" />
                <Input label="No. Rekening" value={edit.rekening || ''} onChange={upd('rekening')} placeholder="082227283416" />
                <Input label="A.N. Rekening" value={edit.rekening_an || ''} onChange={upd('rekening_an')} placeholder="DEDEK SULAIMAN" />
              </div>
              <Textarea label="Teks Tentang Aplikasi" value={edit.teks || ''} onChange={upd('teks')} rows={8} placeholder="Tuliskan informasi tentang aplikasi..." />
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-gray-50/50">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
              <Button onClick={handleSave} loading={saving}>
                <CheckCircleIcon className="w-4 h-4" />
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
