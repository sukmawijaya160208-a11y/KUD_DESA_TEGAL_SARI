'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProgramDetail from '@/components/ProgramDetail';
import { formatDate, formatDateShort } from '@/lib/date';
import {
  ClipboardDocumentListIcon, CheckCircleIcon, CalendarDaysIcon, UsersIcon,
  XMarkIcon, ChevronRightIcon, ArrowLeftIcon,
  PhotoIcon, DocumentIcon
} from '@heroicons/react/24/outline';

const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP', foto_kk: 'Foto KK', akte: 'Akte',
  foto_pekebun: 'Foto Pekebun', foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

const PERSYARATAN_ICON = {
  foto_ktp: PhotoIcon, foto_kk: PhotoIcon, akte: DocumentIcon,
  foto_pekebun: PhotoIcon, foto_surat_tanah: PhotoIcon,
  keterangan_beda_nama: DocumentIcon,
};

export default function PekebunProgramPage() {
  const toast = useToast();
  const [tersedia, setTersedia] = useState([]);
  const [programSaya, setProgramSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daftarModal, setDaftarModal] = useState(null);
  const [step, setStep] = useState(1);
  const [lahanSaya, setLahanSaya] = useState([]);
  const [selectedLahan, setSelectedLahan] = useState('');
  const [dokumens, setDokumens] = useState({});
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [detailProgram, setDetailProgram] = useState(null);

  const load = () => {
    Promise.all([api.pekebun.programTersedia(), api.pekebun.programSaya()])
      .then(([t, s]) => {
        setTersedia((t.data || t || []).map(formatProgram));
        setProgramSaya((s.data || s || []).map(formatReg));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  const formatProgram = (p) => {
    if (typeof p.foto === 'string') try { p.foto = JSON.parse(p.foto); } catch { p.foto = []; }
    if (typeof p.persyaratan === 'string') try { p.persyaratan = JSON.parse(p.persyaratan); } catch { p.persyaratan = []; }
    return p;
  };

  const formatReg = (s) => {
    if (typeof s.data === 'string') try { s.data = JSON.parse(s.data); } catch { s.data = {}; }
    if (s.program_kud) s.program_kud = formatProgram(s.program_kud);
    return s;
  };

  useEffect(() => { load(); }, [toast]);

  const openDaftar = async (p) => {
    setDaftarModal(p);
    setStep(1);
    setSelectedLahan('');
    setDokumens({});
    try {
      const lahan = await api.pekebun.lahan.list();
      setLahanSaya(lahan);
    } catch {}
  };

  const closeDaftar = () => {
    setDaftarModal(null);
    setStep(1);
  };

  const openDetail = (p) => setDetailProgram(p);
  const closeDetail = () => setDetailProgram(null);

  const handleFileUpload = async (jenis, file) => {
    setUploading((prev) => ({ ...prev, [jenis]: true }));
    try {
      const res = await api.uploadDokumenProgram(file, jenis);
      setDokumens((prev) => ({ ...prev, [jenis]: res.url }));
    } catch (err) {
      toast.error(`Upload ${PERSYARATAN_LABEL[jenis] || jenis} gagal: ${err.message}`);
    }
    setUploading((prev) => ({ ...prev, [jenis]: false }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.pekebun.daftarProgram({
        program_kud_id: daftarModal.id,
        lahan_id: selectedLahan || null,
        data: { dokumen: dokumens },
      });
      toast.success('Berhasil mendaftar program!');
      closeDaftar();
      load();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const canSubmit = useMemo(() => {
    if (!daftarModal?.persyaratan) return false;
    return daftarModal.persyaratan.every((p) => dokumens[p]);
  }, [daftarModal, dokumens]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Program KUD</h1>
          <p className="text-sm text-gray-500 mt-0.5">Daftar program dan lihat status pendaftaran Anda</p>
        </div>
      </div>

      <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
        Program Tersedia
      </h2>

      {tersedia.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
            <ClipboardDocumentListIcon className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400">Belum ada program tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {tersedia.map((p) => {
            const sudahDaftar = programSaya.some((s) => s.program_kud_id === p.id);
            const penuh = p.kuota && (p.pendaftaran_program_count || 0) >= p.kuota;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                {p.foto?.[0] ? (
                  <div className="h-36 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.foto[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="text-white font-bold drop-shadow-sm">{p.nama}</h3>
                      <span className="text-white/60 text-xs">{p.jenis}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-br from-primary/80 to-primary flex items-center px-4">
                    <div>
                      <h3 className="text-white font-bold">{p.nama}</h3>
                      <span className="text-white/60 text-xs">{p.jenis}</span>
                    </div>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    {p.tanggal_mulai && (
                      <span className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        {formatDate(p.tanggal_mulai, 'dd MMM')}
                        {p.tanggal_selesai && ` - ${formatDateShort(p.tanggal_selesai)}`}
                      </span>
                    )}
                    {p.kuota && (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {p.pendaftaran_program_count || 0}/{p.kuota}
                      </span>
                    )}
                  </div>

                  {p.persyaratan?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.persyaratan.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium">{PERSYARATAN_LABEL[s] || s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => openDetail(p)}
                      className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:text-foreground bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                      Detail
                    </button>
                    {sudahDaftar ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                        <CheckCircleIcon className="w-4 h-4" /> Sudah Daftar
                      </span>
                    ) : penuh ? (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold">Kuota Penuh</span>
                    ) : (
                      <Button size="sm" onClick={() => openDaftar(p)}>
                        Daftar <ChevronRightIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {programSaya.length > 0 && (
        <>
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-green-500 rounded-full inline-block"></span>
            Program Saya
          </h2>
          <div className="space-y-3">
            {programSaya.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">{s.program_kud?.nama}</h3>
                        <p className="text-xs text-gray-500">{s.program_kud?.jenis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        s.status === 'verified' ? 'bg-green-100 text-green-700' :
                        s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{s.status}</span>
                      <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="text-gray-400 hover:text-foreground transition-colors cursor-pointer p-1">
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${expandedId === s.id ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {expandedId === s.id && s.data?.dokumen && Object.keys(s.data.dokumen).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Dokumen Terupload</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {Object.entries(s.data.dokumen).map(([key, url]) => (
                          <button key={key} onClick={() => { setPreviewImage(url); setPreviewLabel(PERSYARATAN_LABEL[key] || key); }}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                              <span className="text-white text-[9px] font-medium block truncate">{PERSYARATAN_LABEL[key] || key}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.catatan_verifikasi && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-border">
                      <span className="font-medium">Catatan:</span> {s.catatan_verifikasi}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={!!daftarModal} onClose={closeDaftar} title={daftarModal?.nama || 'Daftar Program'} maxWidth="max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step >= i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>{i}</div>
              <span className={`text-[10px] font-medium ${step >= i ? 'text-primary' : 'text-gray-400'}`}>
                {i === 1 ? 'Pilih Lahan' : i === 2 ? 'Upload Dokumen' : 'Konfirmasi'}
              </span>
              {i < 3 && <div className={`flex-1 h-0.5 ${step > i ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Pilih lahan yang akan didaftarkan ke program ini:</p>
            {lahanSaya.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl p-3">
                Anda belum memiliki data lahan. <a href="/pekebun/lahan" className="text-primary underline">Daftarkan lahan Anda</a> terlebih dahulu.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lahanSaya.map((l) => (
                  <label key={l.id} className={`block p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedLahan === l.id.toString() ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="lahan" value={l.id} checked={selectedLahan === l.id.toString()}
                        onChange={(e) => setSelectedLahan(e.target.value)} className="accent-primary" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{l.alamat_lahan}</p>
                        <p className="text-xs text-gray-500">{l.jenis_surat} — {Number(l.luas_lahan_m2 || 0).toLocaleString()} M²</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!selectedLahan && lahanSaya.length > 0}>
                Lanjut <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Upload dokumen persyaratan yang diminta:</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {daftarModal?.persyaratan?.map((jenis) => {
                const Icon = PERSYARATAN_ICON[jenis] || DocumentIcon;
                const uploaded = !!dokumens[jenis];
                return (
                  <div key={jenis} className={`p-3 rounded-xl border-2 transition-all ${uploaded ? 'border-green-300 bg-green-50/50' : 'border-border bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${uploaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{PERSYARATAN_LABEL[jenis] || jenis}</p>
                          {uploaded && <p className="text-xs text-green-600 mt-0.5">✓ Terupload</p>}
                        </div>
                      </div>
                      {uploaded ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setPreviewImage(dokumens[jenis]); setPreviewLabel(PERSYARATAN_LABEL[jenis] || jenis); }}
                            className="text-xs text-primary hover:underline cursor-pointer">Lihat</button>
                          <button onClick={() => setDokumens((prev) => { const n = { ...prev }; delete n[jenis]; return n; })}
                            className="text-xs text-destructive hover:underline cursor-pointer">Hapus</button>
                        </div>
                      ) : (
                        <label className="relative cursor-pointer">
                          <span className="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors">
                            {uploading[jenis] ? 'Mengunggah...' : 'Pilih File'}
                          </span>
                          <input type="file" accept="image/*,application/pdf" className="hidden"
                            disabled={uploading[jenis]} onChange={(e) => e.target.files[0] && handleFileUpload(jenis, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeftIcon className="w-4 h-4" /> Kembali
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canSubmit}>
                Lanjut <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Semua dokumen telah siap!</p>
              <p className="text-sm text-green-600 mt-1">{daftarModal?.persyaratan?.length} persyaratan terpenuhi</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Ringkasan Pendaftaran</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="text-gray-400">Program:</span> {daftarModal?.nama}</p>
                <p><span className="text-gray-400">Jenis:</span> {daftarModal?.jenis}</p>
                {selectedLahan && (() => {
                  const l = lahanSaya.find((x) => x.id.toString() === selectedLahan);
                  return l ? <p><span className="text-gray-400">Lahan:</span> {l.alamat_lahan}</p> : null;
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeftIcon className="w-4 h-4" /> Kembali
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                <CheckCircleIcon className="w-4 h-4" /> Konfirmasi & Daftar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}>
          <div className="relative max-w-xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">{previewLabel}</span>
              <button onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all">
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="" className="w-full h-auto rounded-2xl shadow-2xl mt-6" />
          </div>
        </div>
      )}

      <ProgramDetail
        program={detailProgram}
        open={!!detailProgram}
        onClose={closeDetail}
        role="pekebun"
        onDaftar={(p) => { closeDetail(); openDaftar(p); }}
        sudahDaftar={detailProgram ? programSaya.some((s) => s.program_kud_id === detailProgram.id) : false}
        penuh={detailProgram ? detailProgram.kuota && (detailProgram.pendaftaran_program_count || 0) >= detailProgram.kuota : false}
      />
    </div>
  );
}
