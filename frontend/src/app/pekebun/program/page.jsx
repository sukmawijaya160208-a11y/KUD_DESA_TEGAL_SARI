'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import ProgramDetail from '@/components/ProgramDetail';
import { formatDate, formatDateShort } from '@/lib/date';
import {
  ClipboardDocumentListIcon, CheckCircleIcon, CalendarDaysIcon, UsersIcon,
  ChevronRightIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const PERSYARATAN_LABEL = {
  foto_ktp: 'Foto KTP', foto_kk: 'Foto KK', akte: 'Akte',
  foto_pekebun: 'Foto Pekebun', foto_surat_tanah: 'Foto Surat Tanah',
  keterangan_beda_nama: 'Keterangan Beda Nama',
};

export default function PekebunProgramPage() {
  const router = useRouter();
  const toast = useToast();
  const [tersedia, setTersedia] = useState([]);
  const [programSaya, setProgramSaya] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const openDetail = (p) => setDetailProgram(p);
  const closeDetail = () => setDetailProgram(null);

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
                      <Button size="sm" onClick={() => router.push(`/pekebun/program/daftar/${p.id}`)}>
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

      <ProgramDetail
        program={detailProgram}
        open={!!detailProgram}
        onClose={closeDetail}
        role="pekebun"
        onDaftar={(p) => { closeDetail(); router.push(`/pekebun/program/daftar/${p.id}`); }}
        sudahDaftar={detailProgram ? programSaya.some((s) => s.program_kud_id === detailProgram.id) : false}
        penuh={detailProgram ? detailProgram.kuota && (detailProgram.pendaftaran_program_count || 0) >= detailProgram.kuota : false}
      />
    </div>
  );
}
