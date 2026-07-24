'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import DocumentViewer from '@/components/DocumentViewer';
import SignaturePad from '@/components/SignaturePad';
import { formatDate } from '@/lib/date';
import {
  ClipboardDocumentListIcon, CalendarDaysIcon, UsersIcon,
  ArrowLeftIcon, DocumentIcon,
  ShieldCheckIcon, XMarkIcon, CheckCircleIcon,
  ExclamationCircleIcon, MapPinIcon, FolderOpenIcon,
  PencilSquareIcon, PhotoIcon, EyeIcon,
  CloudArrowUpIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const BERKAS_MAPPING = {
  foto_ktp: { label: 'Foto KTP', field: 'upload_ktp', icon: 'id' },
  foto_kk: { label: 'Foto KK', field: 'upload_kk', icon: 'id' },
  akte: { label: 'Akte', field: null, icon: 'doc' },
  foto_pekebun: { label: 'Foto Pekebun', field: 'foto_pekebun', icon: 'photo' },
  foto_surat_tanah: { label: 'Foto Surat Tanah', field: 'upload_surat_tanah', icon: 'photo' },
  keterangan_beda_nama: { label: 'Keterangan Beda Nama', field: 'upload_surat_keterangan', icon: 'doc' },
};

const STEPS = [
  { num: 1, label: 'Pilih Lahan', icon: MapPinIcon },
  { num: 2, label: 'Upload Berkas', icon: FolderOpenIcon },
  { num: 3, label: 'Konfirmasi', icon: PencilSquareIcon },
];

const FIELD_ICONS = { id: DocumentIcon, photo: PhotoIcon, doc: DocumentIcon };

function getNilaiBerkas(jenis, pekebun, lahanSaya, selectedLahan) {
  const map = BERKAS_MAPPING[jenis];
  if (!map || !map.field) return null;
  if (jenis === 'foto_surat_tanah' || jenis === 'keterangan_beda_nama') {
    const l = lahanSaya?.find((x) => x.id.toString() === selectedLahan);
    if (!l) return null;
    const val = l[map.field];
    if (!val || val === '-') return null;
    return val;
  }
  if (!pekebun) return null;
  const val = pekebun[map.field];
  if (!val || val === '-') return null;
  return val;
}

function getSumberBerkas(jenis, lahanSaya, selectedLahan) {
  const map = BERKAS_MAPPING[jenis];
  if (!map) return '';
  if (jenis === 'foto_pekebun') return 'Profil Pekebun';
  if (!map.field) return '';
  if (jenis === 'foto_surat_tanah' || jenis === 'keterangan_beda_nama') {
    if (!selectedLahan) return '';
    const l = lahanSaya?.find((x) => x.id.toString() === selectedLahan);
    return l ? `Lahan: ${l.alamat_lahan?.substring(0, 40)}` : '';
  }
  return 'Profil Pekebun';
}

export default function DaftarProgramPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [program, setProgram] = useState(null);
  const [pekebun, setPekebun] = useState(null);
  const [lahanSaya, setLahanSaya] = useState([]);
  const [selectedLahan, setSelectedLahan] = useState('');
  const [dokumens, setDokumens] = useState({});
  const [uploading, setUploading] = useState({});
  const [surat1, setSurat1] = useState(false);
  const [surat2, setSurat2] = useState(false);
  const [surat3, setSurat3] = useState(false);
  const [ttd, setTtd] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [pengaturan, setPengaturan] = useState(null);
  const [sudahDaftar, setSudahDaftar] = useState(false);
  const [step, setStep] = useState(1);

  // --- helpers (display only — reads profile/lahan for status) ---
  const getNilaiBerkasDisplay = (jenis) => getNilaiBerkas(jenis, pekebun, lahanSaya, selectedLahan);
  const getSumberBerkasDisplay = (jenis) => getSumberBerkas(jenis, lahanSaya, selectedLahan);

  // semua lengkap (manual + profil) — untuk banner hijau & enable button
  const semuaLengkap = useMemo(() => {
    if (!program?.persyaratan?.length) return true;
    return program.persyaratan.every((p) => dokumens[p] || !!getNilaiBerkasDisplay(p));
  }, [program, dokumens, pekebun, lahanSaya, selectedLahan]);

  const allChecked = useMemo(() => {
    if (program?.aktifkan_surat) {
      return surat1 && surat2 && surat3 && !!ttd;
    }
    return true;
  }, [program, surat1, surat2, surat3, ttd]);

  const canSubmit = !sudahDaftar && semuaLengkap && allChecked && (!!selectedLahan || lahanSaya.length === 0);

  // --- initial data fetch ---
  useEffect(() => {
    Promise.all([
      api.pekebun.programTersediaById(id).catch(() => null),
      api.pekebun.profil().catch(() => null),
      api.pekebun.lahan.list().catch(() => []),
      api.pengaturan.get().catch(() => null),
      api.pekebun.programSaya().catch(() => ({ data: [] })),
    ])
      .then(([prog, profil, lahan, peng, progSaya]) => {
        if (!prog) {
          toast.error('Program tidak ditemukan');
          router.push('/pekebun/program');
          return;
        }
        if (typeof prog.foto === 'string') try { prog.foto = JSON.parse(prog.foto); } catch { prog.foto = []; }
        if (typeof prog.persyaratan === 'string') try { prog.persyaratan = JSON.parse(prog.persyaratan); } catch { prog.persyaratan = []; }
        setProgram(prog);
        setPekebun(profil);
        setLahanSaya(lahan || []);
        setPengaturan(peng);
        if (lahan?.length === 1) setSelectedLahan(lahan[0].id.toString());
        const already = (progSaya?.data || progSaya || []).some(
          (s) => s.program_kud_id === parseInt(id) && ['pending', 'verified'].includes(s.status)
        );
        setSudahDaftar(already);
      })
      .catch((e) => {
        toast.error(e.message);
        router.push('/pekebun/program');
      })
      .finally(() => setLoading(false));
  }, [id, router, toast]);

  const handleFileUpload = async (jenis, file) => {
    setUploading((prev) => ({ ...prev, [jenis]: true }));
    try {
      const res = await api.uploadDokumenProgram(file, jenis);
      setDokumens((prev) => ({ ...prev, [jenis]: res.url }));
    } catch (err) {
      toast.error(`Upload ${BERKAS_MAPPING[jenis]?.label || jenis} gagal: ${err.message}`);
    }
    setUploading((prev) => ({ ...prev, [jenis]: false }));
  };

  // ===== HANDLE SUBMIT — INLINE COLLECTION + PRE-SUBMIT GUARD =====
  const handleSubmit = async () => {
    if (sudahDaftar) {
      toast.error('Anda sudah mendaftar program ini sebelumnya');
      router.push('/pekebun/program');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Mulai dari manual upload
      const collected = { ...dokumens };

      // 2. Isi sisanya INLINE dari pekebun/lahanSaya (no stale closure)
      if (program?.persyaratan) {
        program.persyaratan.forEach((jenis) => {
          if (collected[jenis]) return;
          const m = BERKAS_MAPPING[jenis];
          if (!m?.field) return;
          if (jenis === 'foto_surat_tanah' || jenis === 'keterangan_beda_nama') {
            const l = lahanSaya.find((x) => x.id.toString() === selectedLahan);
            if (l?.[m.field] && l[m.field] !== '-') collected[jenis] = l[m.field];
          } else if (pekebun?.[m.field] && pekebun[m.field] !== '-') {
            collected[jenis] = pekebun[m.field];
          }
        });
      }

      // 3. DEBUG LOG (F12 Console)
      console.log('=== SUBMIT DEBUG ===');
      console.log('persyaratan:', program?.persyaratan);
      console.log('collected:', collected);
      console.log('pekebun fields:', pekebun ? { upload_ktp: pekebun.upload_ktp, upload_kk: pekebun.upload_kk, foto_pekebun: pekebun.foto_pekebun } : 'null');
      console.log('selectedLahan:', selectedLahan);
      if (selectedLahan) {
        const lahan = lahanSaya.find((x) => x.id.toString() === selectedLahan);
        console.log('lahan:', lahan ? { upload_surat_tanah: lahan.upload_surat_tanah, upload_surat_keterangan: lahan.upload_surat_keterangan } : 'not found');
      }

      // 4. PRE-SUBMIT VALIDASI — zero trust
      const missing = program?.persyaratan?.filter((p) => !collected[p]) || [];
      if (missing.length > 0) {
        const labels = missing.map((p) => BERKAS_MAPPING[p]?.label || p);
        toast.error(`Lengkapi dokumen: ${labels.join(', ')}`);
        setSubmitting(false);
        return;
      }

      // 5. Kirim
      await api.pekebun.daftarProgram({
        program_kud_id: parseInt(id),
        lahan_id: selectedLahan ? parseInt(selectedLahan) : null,
        data: { dokumen: collected },
        ...(program?.aktifkan_surat && {
          setuju_surat_1: surat1,
          setuju_surat_2: surat2,
          setuju_surat_3: surat3,
          tanda_tangan_digital: ttd,
        }),
      });

      setSubmitting(false);
      toast.success('Berhasil mendaftar program!');
      router.push('/pekebun/program');
    } catch (err) {
      setSubmitting(false);
      toast.error(err.message);
    }
  };

  const logoKudUrl = useMemo(() => {
    if (pengaturan?.logo_kud) {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      return pengaturan.logo_kud.startsWith('http') ? pengaturan.logo_kud : `${base}${pengaturan.logo_kud}`;
    }
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    return `${base}/images/logo.jpeg`;
  }, [pengaturan]);

  const qrLogoUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    return `${base}/qr-logo/qr-code.jpg`;
  }, []);

  function detectDesa(alamat) {
    if (!alamat) return null;
    const a = alamat.toLowerCase();
    if (a.includes('tegal sari') || a.includes('tegalsari')) return 'tegal sari';
    if (a.includes('marga puspita')) return 'marga puspita';
    if (a.includes('campur sari') || a.includes('campursari')) return 'campur sari';
    return null;
  }

  const kadesInfo = useMemo(() => {
    const desa = detectDesa(pekebun?.alamat);
    const map = {
      'tegal sari': { nama: 'SISWOYO', title: 'Kepala Desa Tegalsari Kecamatan Megang Sakti' },
      'marga puspita': { nama: 'SUMODIONO', title: 'Kepala Desa Marga Puspita Kecamatan Megang Sakti' },
      'campur sari': { nama: 'MUKHSIN', title: 'Kepala Desa Campur Sari Kecamatan Megang Sakti' },
    };
    return desa ? map[desa] : { nama: '', title: '' };
  }, [pekebun]);

  const docData = useMemo(() => {
    if (!pekebun) return {};
    const lahan = lahanSaya.find((l) => l.id.toString() === selectedLahan);
    return {
      nama_pekebun: pekebun.nama || '',
      nik: pekebun.nik || '',
      jenis_kelamin: pekebun.jenis_kelamin || '',
      no_kk: pekebun.no_kk || '',
      tempat_lahir: pekebun.tempat_lahir || '',
      tanggal_lahir: pekebun.tanggal_lahir ? formatDate(pekebun.tanggal_lahir) : '',
      no_whatsapp: pekebun.no_whatsapp || '',
      alamat: pekebun.alamat || '',
      alamat_lengkap: pekebun.alamat ? `${pekebun.alamat} KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS PROVINSI SUMATERA SELATAN` : '',
      alamat_lahan: lahan?.alamat_lahan || '',
      jenis_surat_lahan: lahan?.jenis_surat || '',
      nomor_surat_lahan: lahan?.nomor_surat || '',
      luas_lahan: lahan ? `${Number(lahan.luas_lahan_m2).toLocaleString()} M²` : '',
      nama_program: program?.nama || '',
      kades_nama: kadesInfo.nama,
      kades_title: kadesInfo.title,
      ketua_kud_nama: 'Dedek Sulaiman, S.Pd.',
      ketua_kud_jabatan: 'Ketua Koperasi Unit Desa Sari Subur',
      ketua_kud_alamat: 'Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas',
      tanggal_surat: program?.tanggal_mulai || '',
      tempat_surat: 'Megang Sakti',
      logo_kud: logoKudUrl,
      qr_logo: qrLogoUrl,
      kop_kud: `KOPERASI UNIT DESA (KUD) "SARI SUBUR"`,
    };
  }, [pekebun, lahanSaya, selectedLahan, program, kadesInfo, logoKudUrl, qrLogoUrl]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!program) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.push('/pekebun/program')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors cursor-pointer">
        <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Program
      </button>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
            <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{program.nama}</h1>
            <p className="text-sm text-gray-500">{program.jenis}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {program.kuota && (
              <span className="flex items-center gap-1">
                <UsersIcon className="w-4 h-4" />
                {program.pendaftaran_program_count || 0}/{program.kuota}
              </span>
            )}
            {program.tanggal_mulai && (
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4" />
                {formatDate(program.tanggal_mulai)}
              </span>
            )}
          </div>
        </div>
      </div>

      {sudahDaftar && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 mb-6">
          <CheckCircleIcon className="w-5 h-5 inline-block mr-1.5 -mt-0.5" />
          Anda sudah mendaftar program ini. <button onClick={() => router.push('/pekebun/program')} className="underline font-medium cursor-pointer">Lihat status pendaftaran →</button>
        </div>
      )}

      {!sudahDaftar && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    step === s.num ? 'bg-primary/10 text-primary' :
                    step > s.num ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s.num ? 'bg-primary text-white' :
                      step > s.num ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s.num ? <CheckCircleIcon className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="text-xs font-medium max-sm:hidden">{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                      step > s.num ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===== STEP 1: PILIH LAHAN ===== */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
                Pilih Lahan
              </h2>
              {lahanSaya.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl p-4">
                  Anda belum memiliki data lahan. <a href="/pekebun/lahan" className="text-primary underline font-medium">Daftarkan lahan Anda</a> terlebih dahulu.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lahanSaya.map((l) => (
                    <label key={l.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedLahan === l.id.toString() ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 bg-white'
                    }`}>
                      <div className="flex items-start gap-3">
                        <input type="radio" name="lahan" value={l.id} checked={selectedLahan === l.id.toString()}
                          onChange={(e) => setSelectedLahan(e.target.value)} className="accent-primary mt-0.5 cursor-pointer" />
                        <div>
                          <p className="font-medium text-sm text-foreground">{l.alamat_lahan}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{l.jenis_surat} — {Number(l.luas_lahan_m2 || 0).toLocaleString()} M²</p>
                          {l.nomor_surat && <p className="text-[11px] text-gray-400 mt-0.5">No. {l.nomor_surat}</p>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-6 pt-4 border-t border-border">
                <Button onClick={() => setStep(2)} disabled={!selectedLahan && lahanSaya.length > 0}>
                  Lanjut ke Upload Berkas →
                </Button>
              </div>
            </div>
          )}

          {/* ===== STEP 2: UPLOAD BERKAS — OPSI A VERTICAL CARD ===== */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <FolderOpenIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Upload Berkas</h2>
                  <p className="text-xs text-gray-500">
                    Berkas dari profil/lahan terdeteksi otomatis. Upload manual untuk yang belum.
                  </p>
                </div>
              </div>

              {/* Progress bar + count */}
              {program.persyaratan?.length > 0 && (() => {
                const ok = program.persyaratan.filter((p) => dokumens[p] || getNilaiBerkasDisplay(p)).length;
                const total = program.persyaratan.length;
                return (
                  <div className="mt-5 mb-5">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{ok}/{total}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-400 to-green-500"
                        style={{ width: `${(ok / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })()}

              {program.persyaratan?.length > 0 ? (
                <div className="space-y-4">
                  {program.persyaratan.map((jenis) => {
                    const map = BERKAS_MAPPING[jenis];
                    const url = dokumens[jenis] || getNilaiBerkasDisplay(jenis) || '';
                    const adaManual = !!dokumens[jenis];
                    const adaProfil = !!getNilaiBerkasDisplay(jenis);
                    const tersedia = adaManual || adaProfil;
                    const sumber = adaManual
                      ? { label: 'Upload Manual', color: 'text-amber-600 bg-amber-50 border-amber-200' }
                      : adaProfil
                        ? { label: getSumberBerkasDisplay(jenis), color: 'text-green-600 bg-green-50 border-green-200' }
                        : null;

                    return (
                      <div key={jenis} className={`rounded-xl border-2 overflow-hidden transition-all ${
                        tersedia ? 'border-green-200 bg-white' : 'border-red-200 bg-red-50/30'
                      }`}>
                        {/* THUMBNAIL */}
                        <div
                          onClick={() => url && (setPreviewImage(url), setPreviewLabel(map?.label || jenis))}
                          className={`relative h-36 flex items-center justify-center cursor-pointer overflow-hidden ${
                            url ? 'bg-gray-100' : 'bg-gray-50'
                          }`}
                        >
                          {url ? (
                            <img src={url} alt="" className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="text-center">
                              <PhotoIcon className="w-10 h-10 text-gray-300 mx-auto mb-1" />
                              <p className="text-xs text-gray-400">Belum ada foto</p>
                            </div>
                          )}
                          {/* Status badge overlay */}
                          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                            tersedia ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {tersedia ? '✓ Lengkap' : '✗ Belum'}
                          </div>
                        </div>

                        {/* INFO + ACTIONS */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-foreground">{map?.label || jenis}</p>
                                {sumber && (
                                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${sumber.color}`}>
                                    {sumber.label.length > 30 ? sumber.label.substring(0, 28) + '..' : sumber.label}
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs mt-1 ${tersedia ? 'text-green-600' : 'text-red-500'}`}>
                                {tersedia ? 'Siap digunakan' : `Upload ${map?.label?.toLowerCase() || jenis} Anda`}
                              </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {url && (
                                <button onClick={() => { setPreviewImage(url); setPreviewLabel(map?.label || jenis); }}
                                  className="px-2.5 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-1">
                                  <EyeIcon className="w-3 h-3" /> Lihat
                                </button>
                              )}
                              <label className="relative cursor-pointer">
                                <span className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1 ${
                                  uploading[jenis]
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : tersedia
                                      ? 'text-amber-600 border border-amber-300 hover:bg-amber-50'
                                      : 'text-white bg-primary hover:bg-primary/90 shadow-sm'
                                }`}>
                                  {uploading[jenis] ? (
                                    <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Uploading</>
                                  ) : tersedia ? (
                                    <><ArrowPathIcon className="w-3 h-3" /> Ganti</>
                                  ) : (
                                    <><CloudArrowUpIcon className="w-3.5 h-3.5" /> Upload</>
                                  )}
                                </span>
                                <input type="file" accept="image/*,application/pdf" className="hidden"
                                  disabled={uploading[jenis]} onChange={(e) => e.target.files[0] && handleFileUpload(jenis, e.target.files[0])} />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl text-sm text-gray-500 text-center border border-dashed border-gray-200">
                  <FolderOpenIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Tidak ada persyaratan khusus untuk program ini.
                </div>
              )}

              {/* Banner sukses */}
              {semuaLengkap && program.persyaratan?.length > 0 && (
                <div className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Semua berkas lengkap!</p>
                      <p className="text-xs text-green-600">Lanjutkan ke konfirmasi untuk mendaftar program.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-foreground cursor-pointer">&larr; Kembali ke Lahan</button>
                <Button onClick={() => setStep(3)} disabled={!semuaLengkap}>
                  {program.aktifkan_surat ? 'Lanjut ke Surat & Tanda Tangan →' : 'Lanjut ke Konfirmasi →'}
                </Button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: KONFIRMASI ===== */}
          {step === 3 && (
            <>
              {!program.aktifkan_surat && (
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <PencilSquareIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="font-bold text-foreground">Ringkasan & Konfirmasi</h2>
                  </div>

                  {/* PROGRAM SECTION */}
                  <div className="rounded-xl border border-border bg-gradient-to-br from-gray-50 to-white p-4 mb-4">
                    <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ClipboardDocumentListIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-sm">Program</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div><span className="text-gray-400">Nama</span></div>
                      <div className="text-foreground font-medium">{program.nama}</div>
                      <div><span className="text-gray-400">Jenis</span></div>
                      <div className="text-foreground">{program.jenis}</div>
                      {program.kuota && (
                        <>
                          <div><span className="text-gray-400">Kuota</span></div>
                          <div className="text-foreground">{program.pendaftaran_program_count || 0} / {program.kuota} pendaftar</div>
                        </>
                      )}
                      {program.tanggal_mulai && (
                        <>
                          <div><span className="text-gray-400">Periode</span></div>
                          <div className="text-foreground">{formatDate(program.tanggal_mulai)}{program.tanggal_selesai ? ` - ${formatDate(program.tanggal_selesai)}` : ''}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* LAHAN SECTION */}
                  {selectedLahan && (() => {
                    const l = lahanSaya.find((x) => x.id.toString() === selectedLahan);
                    if (!l) return null;
                    return (
                      <div className="rounded-xl border border-border bg-gradient-to-br from-gray-50 to-white p-4 mb-4">
                        <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground text-sm">Lahan Terpilih</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div><span className="text-gray-400">Alamat</span></div>
                          <div className="text-foreground">{l.alamat_lahan}</div>
                          <div><span className="text-gray-400">Luas</span></div>
                          <div className="text-foreground">{Number(l.luas_lahan_m2).toLocaleString()} M²</div>
                          <div><span className="text-gray-400">Jenis Surat</span></div>
                          <div className="text-foreground">{l.jenis_surat} {l.nomor_surat && <>(No. {l.nomor_surat})</>}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* BERKAS SECTION */}
                  <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 mb-5">
                    <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-green-200">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                        <FolderOpenIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        Berkas ({program.persyaratan?.filter((p) => dokumens[p] || getNilaiBerkasDisplay(p)).length || 0}/{program.persyaratan?.length || 0})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {program.persyaratan?.map((jenis) => {
                        const map = BERKAS_MAPPING[jenis];
                        const adaManual = !!dokumens[jenis];
                        const adaProfil = !!getNilaiBerkasDisplay(jenis);
                        const tersedia = adaManual || adaProfil;
                        const url = adaManual ? dokumens[jenis] : getNilaiBerkasDisplay(jenis);
                        const sumberLabel = adaManual ? 'Manual' : (getSumberBerkasDisplay(jenis) || 'Profil');

                        return (
                          <div key={jenis} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2.5">
                              {tersedia
                                ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                : <ExclamationCircleIcon className="w-4 h-4 text-red-400 shrink-0" />}
                              <span className={`text-sm ${tersedia ? 'text-gray-700' : 'text-red-500'}`}>
                                {map?.label || jenis}
                              </span>
                              {tersedia && (
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                  {sumberLabel}
                                </span>
                              )}
                            </div>
                            {url && (
                              <button onClick={() => { setPreviewImage(url); setPreviewLabel(map?.label || jenis); }}
                                className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                                <EyeIcon className="w-3.5 h-3.5" /> Lihat
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button className="w-full h-12 text-base" size="lg" onClick={handleSubmit} loading={submitting} disabled={!canSubmit}>
                    <ShieldCheckIcon className="w-5 h-5" />
                    {submitting ? 'Mendaftarkan...' : sudahDaftar ? 'Sudah Mendaftar' : 'Daftar Sekarang'}
                  </Button>
                  <div className="flex justify-center mt-4">
                    <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-foreground cursor-pointer">&larr; Kembali ke Upload Berkas</button>
                  </div>
                </div>
              )}

              {/* ===== SURAT & TTD ===== */}
              {program.aktifkan_surat && (
                <>
                  <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <DocumentIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h2 className="font-bold text-foreground">Surat Pernyataan</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">Baca dan setujui setiap surat pernyataan di bawah ini</p>

                    {[1, 2, 3].map((i) => {
                      const judul = program[`surat_${i}_judul`];
                      const isi = program[`surat_${i}_isi`];
                      const checked = i === 1 ? surat1 : i === 2 ? surat2 : surat3;
                      const setChecked = i === 1 ? setSurat1 : i === 2 ? setSurat2 : setSurat3;

                      return (
                        <div key={i} className="mb-6 last:mb-0 rounded-xl border border-border overflow-hidden">
                          <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-border flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <DocumentIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground text-sm">{judul || `Surat Pernyataan ${i}`}</h3>
                              <p className="text-[10px] text-gray-400">Lampiran {String(i).padStart(2, '0')}</p>
                            </div>
                          </div>
                          <div className="p-4">
                            <DocumentViewer
                                suratIndex={i}
                                judul={judul}
                                isi={isi}
                                data={docData}
                                program={program || {}}
                                signature={ttd}
                                showSignature={!!ttd}
                              />
                            <label className="flex items-start gap-3 mt-4 p-3 bg-white rounded-lg border border-border cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setChecked(e.target.checked)}
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700">
                                Saya telah membaca, memahami, dan menyetujui seluruh isi dari <strong>{judul || `Surat Pernyataan ${i}`}</strong>
                              </span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <PencilSquareIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="font-bold text-foreground">Tanda Tangan Digital</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Gambar tanda tangan Anda. Tanda tangan akan muncul di ketiga surat pernyataan.</p>
                    <SignaturePad value={ttd} onChange={setTtd} height={200} />
                  </div>

                  <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <h2 className="font-bold text-foreground">Konfirmasi Akhir</h2>
                    </div>

                    <div className="rounded-xl border border-border bg-gradient-to-br from-gray-50 to-white p-4 mb-4">
                      <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border">
                        <ClipboardDocumentListIcon className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground text-sm">Program</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div><span className="text-gray-400">Nama</span></div>
                        <div className="text-foreground font-medium">{program.nama}</div>
                        <div><span className="text-gray-400">Jenis</span></div>
                        <div className="text-foreground">{program.jenis}</div>
                      </div>
                    </div>

                    {selectedLahan && (() => {
                      const l = lahanSaya.find((x) => x.id.toString() === selectedLahan);
                      if (!l) return null;
                      return (
                        <div className="rounded-xl border border-border bg-gradient-to-br from-gray-50 to-white p-4 mb-4">
                          <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground text-sm">Lahan</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><span className="text-gray-400">Alamat</span></div>
                            <div className="text-foreground">{l.alamat_lahan}</div>
                            <div><span className="text-gray-400">Luas</span></div>
                            <div className="text-foreground">{Number(l.luas_lahan_m2).toLocaleString()} M²</div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 mb-4">
                      <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-green-200">
                        <FolderOpenIcon className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-foreground text-sm">
                          Berkas ({program.persyaratan?.filter((p) => dokumens[p] || getNilaiBerkasDisplay(p)).length || 0}/{program.persyaratan?.length || 0})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {program.persyaratan?.map((jenis) => {
                          const map = BERKAS_MAPPING[jenis];
                          const adaManual = !!dokumens[jenis];
                          const adaProfil = !!getNilaiBerkasDisplay(jenis);
                          const tersedia = adaManual || adaProfil;
                          const url = adaManual ? dokumens[jenis] : getNilaiBerkasDisplay(jenis);
                          const sumberLabel = adaManual ? 'Manual' : (getSumberBerkasDisplay(jenis) || 'Profil');

                          return (
                            <div key={jenis} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                {tersedia
                                  ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                                  : <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-400" />}
                                <span className={`text-sm ${tersedia ? 'text-gray-700' : 'text-red-500'}`}>
                                  {map?.label || jenis}
                                </span>
                                {tersedia && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                    {sumberLabel}
                                  </span>
                                )}
                              </div>
                              {url && (
                                <button onClick={() => { setPreviewImage(url); setPreviewLabel(map?.label || jenis); }}
                                  className="text-xs text-primary hover:underline cursor-pointer">Lihat</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 px-1">
                      <span className="flex items-center gap-1.5">
                        <DocumentIcon className="w-4 h-4 text-emerald-500" />
                        Surat: <strong className="text-foreground">{ [surat1, surat2, surat3].filter(Boolean).length }/3</strong>
                        {[surat1, surat2, surat3].every(Boolean) && <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PencilSquareIcon className="w-4 h-4 text-purple-500" />
                        TTD: <strong className="text-foreground">{ttd ? '✓ Siap' : '✗ Belum'}</strong>
                      </span>
                    </div>

                    {(!surat1 || !surat2 || !surat3) && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 mb-4 flex items-center gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                        Semua surat pernyataan harus disetujui dan ditandatangani sebelum mendaftar
                      </div>
                    )}

                    <Button className="w-full h-12 text-base" size="lg" onClick={handleSubmit} loading={submitting} disabled={!canSubmit}>
                      <ShieldCheckIcon className="w-5 h-5" />
                      {submitting ? 'Mendaftarkan...' : sudahDaftar ? 'Sudah Mendaftar' : 'Daftar Sekarang'}
                    </Button>

                    <div className="flex justify-center mt-4">
                      <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-foreground cursor-pointer">&larr; Kembali ke Upload Berkas</button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

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
            <img src={previewImage} alt="" className="w-full h-auto rounded-2xl shadow-2xl mt-6" />
          </div>
        </div>
      )}
    </div>
  );
}
