'use client';

import { useRef, useState, useMemo, useCallback } from 'react';

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

const TEMPLATES = {
  'classic-gold': {
    borderOuter: '3px double #b8860b',
    borderInner: '1px solid #d4a853',
    bodyFont: 'Georgia, "Times New Roman", serif',
    cornerOrnament: true,
  },
  'modern-clean': {
    borderOuter: '1px solid #e2e8f0',
    borderInner: 'none',
    bodyFont: 'Inter, sans-serif',
    cornerOrnament: false,
  },
};

function formatDateLocal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function SertifikatContent({ data, config, width }) {
  const cfg = config || DEFAULT_CONFIG;
  const isClassic = cfg.template === 'classic-gold';
  const tpl = TEMPLATES[cfg.template] || TEMPLATES['classic-gold'];
  const f = cfg.fields || DEFAULT_CONFIG.fields;
  const bg = cfg.background || DEFAULT_CONFIG.background;

  const pekebun = data?.pekebun || {};
  const kud = data?.setting_kud || {};
  const nomorAnggota = data?.nomor_anggota || '-';
  const tanggalTerbit = data?.tanggal_terbit ? formatDateLocal(data.tanggal_terbit) : '-';
  const tglLahir = pekebun.tanggal_lahir ? formatDateLocal(pekebun.tanggal_lahir) : '-';

  let bgStyle = {};
  if (bg.type === 'color') {
    bgStyle = { backgroundColor: bg.color1 || '#ffffff' };
  } else if (bg.type === 'gradient') {
    bgStyle = { background: `linear-gradient(${bg.angle || 135}deg, ${bg.color1 || '#ffffff'} 0%, ${bg.color2 || '#f5e6c8'} 100%)` };
  } else if (bg.type === 'image' && bg.value) {
    bgStyle = { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }

  const scale = width / 800;
  const s = (v) => v * scale;

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16 / 9',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: tpl.bodyFont,
      ...bgStyle,
      border: tpl.borderOuter,
      borderRadius: isClassic ? '6px' : '4px',
      boxSizing: 'border-box',
    }}>
      {/* Inner border for classic */}
      {isClassic && (
        <div style={{
          position: 'absolute',
          inset: '8px',
          border: tpl.borderInner,
          borderRadius: '3px',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      )}

      {/* Corner ornaments for classic */}
      {isClassic && f.border_deco?.show !== false && (
        <>
          <div style={{ position: 'absolute', top: '14px', left: '14px', fontSize: '18px', color: '#b8860b', lineHeight: 1, zIndex: 2 }}>╔</div>
          <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '18px', color: '#b8860b', lineHeight: 1, zIndex: 2 }}>╗</div>
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', fontSize: '18px', color: '#b8860b', lineHeight: 1, zIndex: 2 }}>╚</div>
          <div style={{ position: 'absolute', bottom: '14px', right: '14px', fontSize: '18px', color: '#b8860b', lineHeight: 1, zIndex: 2 }}>╝</div>
        </>
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: isClassic ? '20px 30px 16px 30px' : '24px 32px 18px 32px',
        boxSizing: 'border-box',
      }}>
        {/* TOP: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexShrink: 0 }}>
          {f.logo_kud?.show !== false && (kud?.logo) && (
            <img src={kud.logo} alt="Logo KUD"
              style={{
                width: s(f.logo_kud.width || 75),
                height: s(f.logo_kud.width || 75),
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, textAlign: 'center' }}>
            {f.judul?.show !== false && (
              <div style={{
                fontFamily: f.judul.fontFamily || (isClassic ? 'Playfair Display' : 'Inter'),
                fontSize: s(f.judul.fontSize || 26),
                fontWeight: f.judul.fontWeight || 'bold',
                color: f.judul.color || (isClassic ? '#b8860b' : '#0f766e'),
                letterSpacing: isClassic ? '3px' : '2px',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}>
                SERTIFIKAT KEANGGOTAAN
              </div>
            )}
            {f.subjudul?.show !== false && (
              <div style={{
                fontFamily: f.subjudul.fontFamily || tpl.bodyFont,
                fontSize: s(f.subjudul.fontSize || 13),
                color: f.subjudul.color || (isClassic ? '#8b6914' : '#14b8a6'),
                letterSpacing: isClassic ? '5px' : '3px',
                textTransform: 'uppercase',
                marginTop: s(4),
              }}>
                {kud.nama_kud || 'KUD Desa Sari Subur'}
              </div>
            )}
          </div>
        </div>

        {/* Decorative divider */}
        {f.garis_dekorasi?.show !== false && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: `${s(isClassic ? 8 : 10)}px 0 ${s(isClassic ? 6 : 8)}px 0`,
            flexShrink: 0,
          }}>
            <div style={{ flex: 1, height: isClassic ? '1px' : '1px', background: isClassic ? '#d4a853' : '#e2e8f0' }} />
            <span style={{
              fontSize: s(isClassic ? 12 : 10),
              color: isClassic ? '#b8860b' : '#cbd5e1',
              lineHeight: 1,
            }}>{isClassic ? '✦' : '◆'}</span>
            <div style={{ flex: 1, height: isClassic ? '1px' : '1px', background: isClassic ? '#d4a853' : '#e2e8f0' }} />
          </div>
        )}

        {/* BODY */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {f.pembukaan?.show !== false && (
            <div style={{
              textAlign: 'center',
              fontSize: s(f.pembukaan.fontSize || 11),
              color: f.pembukaan.color || '#4a5568',
              fontStyle: isClassic ? 'italic' : 'normal',
              marginBottom: s(4),
            }}>
              Dengan ini menyatakan bahwa:
            </div>
          )}

          {f.nama_pekebun?.show !== false && (
            <div style={{
              textAlign: 'center',
              fontFamily: f.nama_pekebun.fontFamily || (isClassic ? 'Playfair Display' : 'Inter'),
              fontSize: s(f.nama_pekebun.fontSize || 24),
              fontWeight: f.nama_pekebun.fontWeight || 'bold',
              color: f.nama_pekebun.color || '#1a202c',
              letterSpacing: isClassic ? '2px' : '1px',
              textTransform: 'uppercase',
              marginBottom: s(6),
              padding: `${s(4)}px ${s(16)}px`,
              borderBottom: isClassic ? `2px solid ${f.judul?.color || '#b8860b'}33` : 'none',
              display: 'inline-block',
              lineHeight: 1.3,
            }}>
              {pekebun.nama || 'NAMA PEKEBUN'}
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(2),
            paddingLeft: isClassic ? s(20) : s(16),
            marginBottom: s(4),
          }}>
            {f.no_anggota?.show !== false && (
              <div style={{
                fontSize: s(f.no_anggota.fontSize || 11),
                color: f.no_anggota.color || '#4a5568',
                display: 'flex',
                gap: s(8),
              }}>
                <span style={{ minWidth: s(110), opacity: 0.7 }}>Nomor Anggota</span>
                <span style={{ fontWeight: 600 }}>: {nomorAnggota}</span>
              </div>
            )}
            {f.data_lengkap?.show !== false && (
              <>
                <div style={{
                  fontSize: s(f.data_lengkap.fontSize || 11),
                  color: f.data_lengkap.color || '#718096',
                  display: 'flex',
                  gap: s(8),
                }}>
                  <span style={{ minWidth: s(110), opacity: 0.7 }}>Tempat, Tgl Lahir</span>
                  <span>: {pekebun.tempat_lahir || '-'}, {tglLahir}</span>
                </div>
              </>
            )}
          </div>

          {f.status_teks?.show !== false && (
            <div style={{
              textAlign: 'center',
              fontSize: s(f.status_teks.fontSize || 11),
              color: f.status_teks.color || '#4a5568',
              fontStyle: isClassic ? 'italic' : 'normal',
              padding: `0 ${s(20)}px`,
              marginBottom: s(4),
            }}>
              Adalah anggota aktif KUD Desa Sari Subur
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0, marginTop: s(4) }}>
          {/* Left: Date & City */}
          <div style={{ textAlign: 'left' }}>
            {f.kota_terbit?.show !== false && (
              <div style={{
                fontSize: s(f.kota_terbit.fontSize || 11),
                color: f.kota_terbit.color || '#718096',
                fontStyle: isClassic ? 'italic' : 'normal',
              }}>
                {kud.kartu_kota_terbit || 'Kota'}, {tanggalTerbit}
              </div>
            )}
          </div>

          {/* Right: Signature */}
          <div style={{ textAlign: 'center', minWidth: s(160) }}>
            {f.ttd_ketua?.show !== false && kud?.kartu_ttd && (
              <img
                src={kud.kartu_ttd}
                alt="TTD"
                style={{
                  width: s(f.ttd_ketua.width || 120),
                  height: s(f.ttd_ketua.height || 42),
                  objectFit: 'contain',
                  marginBottom: s(2),
                }}
              />
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: s(8),
              marginTop: s(2),
            }}>
              {f.stempel?.show !== false && kud?.kartu_stempel && (
                <img
                  src={kud.kartu_stempel}
                  alt="Stempel"
                  style={{
                    width: s(f.stempel.width || 80),
                    height: s(f.stempel.width || 80),
                    objectFit: 'contain',
                    opacity: 0.85,
                    marginRight: s(8),
                  }}
                />
              )}
              <div>
                {f.nama_ketua?.show !== false && (
                  <div style={{
                    fontFamily: f.nama_ketua.fontFamily || tpl.bodyFont,
                    fontSize: s(f.nama_ketua.fontSize || 12),
                    fontWeight: f.nama_ketua.fontWeight || 'bold',
                    color: f.nama_ketua.color || '#1a202c',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {kud.kartu_ketua_nama || kud.nama_ketua || 'NAMA KETUA'}
                  </div>
                )}
                {f.jabatan_ketua?.show !== false && (
                  <div style={{
                    fontSize: s(f.jabatan_ketua.fontSize || 10),
                    color: f.jabatan_ketua.color || '#718096',
                    fontStyle: isClassic ? 'italic' : 'normal',
                  }}>
                    {kud.kartu_ketua_jabatan || 'Ketua KUD'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line for modern */}
        {!isClassic && f.garis_dekorasi?.show !== false && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: s(6),
            flexShrink: 0,
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            {kud?.logo && (
              <img src={kud.logo} alt="" style={{ width: s(24), height: s(24), objectFit: 'contain', opacity: 0.4 }} />
            )}
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SertifikatKeanggotaan({ data, config: configProp, width = 600, showActions = true }) {
  const containerRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const config = useMemo(() => {
    if (configProp) return configProp;
    if (data?.setting_kud?.sertifikat_config) return data.setting_kud.sertifikat_config;
    return DEFAULT_CONFIG;
  }, [configProp, data]);

  const isClassic = config?.template === 'classic-gold';

  const handleDownloadPNG = useCallback(async () => {
    if (!containerRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: isClassic ? '#fffaed' : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `sertifikat-${data?.pekebun?.nama?.toLowerCase().replace(/\s+/g, '-') || 'anggota'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
    setDownloading(false);
  }, [downloading, data, isClassic]);

  const handlePrint = useCallback(() => {
    if (!containerRef.current) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    const certHtml = containerRef.current.innerHTML;
    printWin.document.write(`
      <html>
      <head>
        <title>Sertifikat Keanggotaan</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: landscape; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .cert-wrapper { width: 100%; max-width: 1000px; }
        </style>
      </head>
      <body>
        <div class="cert-wrapper">${certHtml}</div>
        <script>
          window.onload = function() { window.print(); window.close(); };
        <\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  }, []);

  if (!config || !data) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} style={{ width: `${width}px`, maxWidth: '100%' }}>
        <SertifikatContent data={data} config={config} width={width} />
      </div>

      {showActions && (
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-foreground rounded-xl text-xs font-semibold border border-border hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak
          </button>
        </div>
      )}
    </div>
  );
}
