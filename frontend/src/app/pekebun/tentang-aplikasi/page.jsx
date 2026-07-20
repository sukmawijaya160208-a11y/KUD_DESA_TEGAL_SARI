'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

import {
  InformationCircleIcon,
  PhoneIcon, BanknotesIcon, EnvelopeIcon, GlobeAltIcon,
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

export default function PekebunTentangAplikasiPage() {
  const toast = useToast();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tentangAplikasi.get()
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

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
                {data.teks ? data.teks.split('\n')[0] : 'Membangun ekosistem digital untuk KUD Desa Sari Subur.'}
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
            <span>KUD Desa Sari Subur</span>
          </div>
        </div>
      </section>
    </div>
  );
}
