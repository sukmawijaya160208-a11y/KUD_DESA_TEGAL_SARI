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
  ArrowLeftIcon, DocumentIcon, ShieldCheckIcon, XMarkIcon,
  CheckCircleIcon, ExclamationCircleIcon, MapPinIcon,
  PencilSquareIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckIcon, EyeIcon,
} from '@heroicons/react/24/outline';

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 px-4">
      {steps.map((s, i) => {
        const num = i + 1;
        const isActive = current === num;
        const isCompleted = current > num;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0 ${
                isCompleted ? 'bg-emerald-500 text-white' :
                isActive ? 'bg-blue-800 text-white ring-4 ring-blue-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : num}
              </div>
              <span className={`text-[11px] font-medium mt-1.5 whitespace-nowrap hidden sm:block ${
                isActive ? 'text-blue-800' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
              }`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 mt-[-1.5rem] ${
                isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DaftarProgramPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [program, setProgram] = useState(null);
  const [pekebun, setPekebun] = useState(null);
  const [lahanSaya, setLahanSaya] = useState([]);
  const [selectedLahan, setSelectedLahan] = useState('');
  const [surat1, setSurat1] = useState(false);
  const [surat2, setSurat2] = useState(false);
  const [surat3, setSurat3] = useState(false);
  const [ttd, setTtd] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pengaturan, setPengaturan] = useState(null);
  const [sudahDaftar, setSudahDaftar] = useState(false);
  const [step, setStep] = useState(1);
  const [previewSurat, setPreviewSurat] = useState(null);

  const steps = ['Pilih Lahan', 'Surat & TTD', 'Konfirmasi'];

  const canGoNext = useMemo(() => {
    if (step === 1) return !!selectedLahan || lahanSaya.length === 0;
    if (step === 2) return surat1 && surat2 && surat3 && !!ttd;
    return true;
  }, [step, selectedLahan, lahanSaya.length, surat1, surat2, surat3, ttd]);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.pekebun.daftarProgram({
        program_kud_id: parseInt(id),
        lahan_id: selectedLahan ? parseInt(selectedLahan) : null,
        setuju_surat_1: surat1,
        setuju_surat_2: surat2,
        setuju_surat_3: surat3,
        tanda_tangan_digital: ttd,
      });
      toast.success('Berhasil mendaftar program!');
      router.push('/pekebun/program');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
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

  const goNext = () => { if (canGoNext && step < 3) setStep((s) => s + 1); };
  const goBack = () => { if (step > 1) setStep((s) => s - 1); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!program) return null;

  return (
    <div className="max-w-3xl mx-auto pb-32 md:pb-0">
      {step === 1 && (
        <button onClick={() => router.push('/pekebun/program')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors cursor-pointer">
          <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Program
        </button>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center shrink-0">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{program.nama}</h1>
            <p className="text-sm text-gray-500">{program.jenis}</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
            {program.kuota && (
              <span className="flex items-center gap-1">
                <UsersIcon className="w-4 h-4" />
                {program.pendaftaran_program_count || 0}/{program.kuota}
              </span>
            )}
            {program.tanggal_mulai && (
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4" />
                {formatDate(program.tanggal_mulai, 'dd MMM')}
                {program.tanggal_selesai && ` - ${formatDate(program.tanggal_selesai, 'dd MMM')}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {sudahDaftar && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 mb-6 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 shrink-0" />
          Anda sudah mendaftar program ini.
          <button onClick={() => router.push('/pekebun/program')} className="underline font-medium ml-auto cursor-pointer shrink-0">
            Lihat status →
          </button>
        </div>
      )}

      {!sudahDaftar && (
        <>
          <StepIndicator current={step} steps={steps} />

          {/* ===== STEP 1: PILIH LAHAN ===== */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-800" />
                Pilih Lahan
              </h2>
              {lahanSaya.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-5">
                  <ExclamationCircleIcon className="w-5 h-5 inline-block mr-1.5 -mt-0.5" />
                  Anda belum memiliki data lahan.{' '}
                  <a href="/pekebun/lahan" className="text-blue-800 underline font-medium">
                    Daftarkan lahan Anda
                  </a>{' '}
                  terlebih dahulu.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lahanSaya.map((l) => (
                    <label key={l.id}
                      className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedLahan === l.id.toString()
                          ? 'border-blue-800 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input type="radio" name="lahan" value={l.id}
                          checked={selectedLahan === l.id.toString()}
                          onChange={(e) => setSelectedLahan(e.target.value)}
                          className="accent-blue-800 mt-0.5 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900">{l.alamat_lahan}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {l.jenis_surat} — {Number(l.luas_lahan_m2 || 0).toLocaleString()} M²
                          </p>
                          {l.nomor_surat && (
                            <p className="text-[11px] text-gray-400 mt-0.5">No. {l.nomor_surat}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 2: SURAT & TTD ===== */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-blue-800" />
                Surat Pernyataan & Tanda Tangan
              </h2>

              {[1, 2, 3].map((i) => {
                const judul = program[`surat_${i}_judul`];
                const isi = program[`surat_${i}_isi`];
                const checked = i === 1 ? surat1 : i === 2 ? surat2 : surat3;
                const setChecked = i === 1 ? setSurat1 : i === 2 ? setSurat2 : setSurat3;

                return (
                  <div key={i} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        checked ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        {checked
                          ? <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                          : <DocumentIcon className="w-4 h-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{judul || `Surat Pernyataan ${i}`}</h3>
                        <p className="text-[10px] text-gray-400">Lampiran {String(i).padStart(2, '0')}</p>
                      </div>
                      {checked && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Disetujui
                        </span>
                      )}
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
                      <label className="flex items-start gap-3 mt-4 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" checked={checked}
                          onChange={(e) => setChecked(e.target.checked)}
                          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-800 focus:ring-blue-300 cursor-pointer shrink-0"
                        />
                        <span className="text-sm text-gray-700">
                          Saya telah membaca, memahami, dan menyetujui seluruh isi dari{' '}
                          <strong>{judul || `Surat Pernyataan ${i}`}</strong>
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    ttd ? 'bg-emerald-100' : 'bg-purple-100'
                  }`}>
                    {ttd
                      ? <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      : <PencilSquareIcon className="w-4 h-4 text-purple-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">Tanda Tangan Digital</h3>
                    <p className="text-[10px] text-gray-400">Akan muncul di ketiga surat pernyataan</p>
                  </div>
                  {ttd && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Ditandatangani
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {!ttd && (
                    <p className="text-sm text-gray-500 mb-4">
                      Gambar tanda tangan Anda di atas kanvas di bawah ini.
                    </p>
                  )}
                  <SignaturePad value={ttd} onChange={setTtd} height={180} />
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: KONFIRMASI ===== */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-800" />
                Konfirmasi Pendaftaran
              </h2>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 text-blue-800" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Program</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span className="text-gray-400">Nama</span>
                  <span className="text-gray-900 font-medium">{program.nama}</span>
                  <span className="text-gray-400">Jenis</span>
                  <span className="text-gray-900">{program.jenis}</span>
                  {program.kuota && (
                    <>
                      <span className="text-gray-400">Kuota</span>
                      <span className="text-gray-900">{program.pendaftaran_program_count || 0} / {program.kuota}</span>
                    </>
                  )}
                  {program.tanggal_mulai && (
                    <>
                      <span className="text-gray-400">Periode</span>
                      <span className="text-gray-900">
                        {formatDate(program.tanggal_mulai, 'dd MMM yyyy')}
                        {program.tanggal_selesai && ` - ${formatDate(program.tanggal_selesai, 'dd MMM yyyy')}`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {selectedLahan && (() => {
                const l = lahanSaya.find((x) => x.id.toString() === selectedLahan);
                if (!l) return null;
                return (
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-blue-800" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">Lahan Terpilih</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <span className="text-gray-400">Alamat</span>
                      <span className="text-gray-900">{l.alamat_lahan}</span>
                      <span className="text-gray-400">Luas</span>
                      <span className="text-gray-900">{Number(l.luas_lahan_m2).toLocaleString()} M²</span>
                      <span className="text-gray-400">Jenis Surat</span>
                      <span className="text-gray-900">{l.jenis_surat}</span>
                      {l.nomor_surat && (
                        <>
                          <span className="text-gray-400">No. Surat</span>
                          <span className="text-gray-900">{l.nomor_surat}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <DocumentIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Surat & Tanda Tangan</h3>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => {
                    const judul = program[`surat_${i}_judul`] || `Surat Pernyataan ${i}`;
                    return (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{judul}</span>
                        </div>
                        <button onClick={() => setPreviewSurat(i)}
                          className="text-xs font-medium text-blue-800 hover:text-blue-600 underline cursor-pointer flex items-center gap-1 shrink-0 ml-3">
                          <EyeIcon className="w-3.5 h-3.5" /> Lihat
                        </button>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-100 pt-3 mt-3 flex items-center gap-2.5">
                    {ttd
                      ? <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      : <ExclamationCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    }
                    <span className={`text-sm ${ttd ? 'text-gray-700' : 'text-red-500'}`}>
                      Tanda Tangan Digital
                    </span>
                    {ttd && (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        ✓ Sudah ditandatangani
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Pastikan data Anda sudah benar</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Setelah mendaftar, pendaftaran akan diproses oleh verifikator. Anda dapat
                    memantau status pendaftaran di halaman program saya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== BOTTOM BAR ===== */}
          <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-white/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-t-0 border-gray-200 p-4 md:p-0 md:mt-6 z-40">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
              {step > 1 ? (
                <button onClick={goBack}
                  className="h-11 px-5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5">
                  <ChevronLeftIcon className="w-4 h-4" /> Kembali
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button onClick={goNext} disabled={!canGoNext}
                  className={`h-11 px-6 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    canGoNext
                      ? 'bg-blue-800 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  Lanjut <ChevronRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <Button onClick={handleSubmit} loading={submitting}
                  className="h-11 px-6 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
                  <ShieldCheckIcon className="w-4 h-4" />
                  {submitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== PREVIEW SURAT MODAL ===== */}
      {previewSurat !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewSurat(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10 rounded-t-2xl">
              <h3 className="font-semibold text-gray-900 text-sm">
                {program[`surat_${previewSurat}_judul`] || `Surat Pernyataan ${previewSurat}`}
              </h3>
              <button onClick={() => setPreviewSurat(null)}
                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <XMarkIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <DocumentViewer
                suratIndex={previewSurat}
                judul={program[`surat_${previewSurat}_judul`]}
                isi={program[`surat_${previewSurat}_isi`]}
                data={docData}
                program={program || {}}
                signature={ttd}
                showSignature={!!ttd}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
