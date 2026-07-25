'use client';

import { useRef, useState, useMemo, useCallback } from 'react';

const DEFAULT_CONFIG = {
  template: 'classic-gold',
  fields: {
    border_deco: { show: true },
    watermark: { show: true, opacity: 0.04 },
    logo_kud: { show: true, width: 70 },
    nama_kud: { show: true, fontSize: 16, color: '#064e3b', fontFamily: 'Inter', fontWeight: 'bold' },
    badan_hukum: { show: true, fontSize: 8, color: '#92400e' },
    garis_header: { show: true },
    judul: { show: true, fontSize: 20, color: '#92400e', fontFamily: 'Playfair Display', fontWeight: 'bold' },
    no_registrasi: { show: true, fontSize: 8, color: '#64748b' },
    pembukaan: { show: true, fontSize: 10, color: '#475569', text: 'Pengurus Koperasi Unit Desa (KUD) Sari Subur dengan ini menerangkan dan mengesahkan bahwa:' },
    nama_pekebun: { show: true, fontSize: 20, color: '#0f172a', fontFamily: 'Playfair Display', fontWeight: 'bold' },
    grid_data: { show: true, fontSize: 10, color: '#334155' },
    legal_text: { show: true, fontSize: 9, color: '#475569', text: 'Dinyatakan secara sah terdaftar sebagai Anggota Aktif KUD Sari Subur. Pemegang sertifikat ini berhak atas seluruh fasilitas kemitraan kelapa sawit, pelayanan unit usaha koperasi, serta pembagian Sisa Hasil Usaha (SHU) sesuai AD/ART yang berlaku.' },
    tanggal_terbit: { show: true, fontSize: 9, color: '#64748b' },
    ttd_ketua: { show: true, width: 130, height: 50 },
    stempel: { show: true, width: 80 },
    nama_ketua: { show: true, fontSize: 11, color: '#0f172a', fontWeight: 'bold' },
    jabatan_ketua: { show: true, fontSize: 9, color: '#64748b' },
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
    borderOuter: '12px solid #b8860b',
    borderInner: '3px solid #d4a853',
    bodyFont: 'Georgia, "Times New Roman", serif',
  },
  'modern-clean': {
    borderOuter: '1px solid #e2e8f0',
    borderInner: 'none',
    bodyFont: 'Inter, sans-serif',
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
  const pengaturan = data?.pengaturan || {};
  const nomorAnggota = data?.nomor_anggota || '-';
  const tanggalTerbit = data?.tanggal_terbit ? formatDateLocal(data.tanggal_terbit) : '-';
  const tglLahir = pekebun.tanggal_lahir ? formatDateLocal(pekebun.tanggal_lahir) : '-';

  let bgStyle = {};
  if (bg.type === 'color') {
    bgStyle = { backgroundColor: bg.color1 || '#ffffff' };
  } else if (bg.type === 'gradient') {
    bgStyle = { background: `linear-gradient(${bg.angle || 135}deg, ${bg.color1 || '#ffffff'} 0%, ${bg.color2 || '#f5e6c8'} 100%)` };
  }

  const scale = width / 800;
  const s = (v) => Math.round(v * scale * 10) / 10;

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16 / 9',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: tpl.bodyFont,
      ...bgStyle,
      border: isClassic ? 'none' : tpl.borderOuter,
      borderRadius: isClassic ? '8px' : '4px',
      boxSizing: 'border-box',
    }}>
      {/* Classic gold double frame */}
      {isClassic && (
        <div style={{
          position: 'absolute', inset: 0,
          border: '12px solid #b8860b',
          borderRadius: '8px',
          pointerEvents: 'none', zIndex: 10,
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute', inset: '4px',
            border: '2px solid rgba(180, 83, 9, 0.4)',
            borderRadius: '4px',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* Corner ornaments */}
      {isClassic && f.border_deco?.show !== false && (
        <>
          <div style={{ position: 'absolute', top: '18px', left: '18px', width: '24px', height: '24px', borderTop: '3px solid #b8860b', borderLeft: '3px solid #b8860b', zIndex: 11 }} />
          <div style={{ position: 'absolute', top: '18px', right: '18px', width: '24px', height: '24px', borderTop: '3px solid #b8860b', borderRight: '3px solid #b8860b', zIndex: 11 }} />
          <div style={{ position: 'absolute', bottom: '18px', left: '18px', width: '24px', height: '24px', borderBottom: '3px solid #b8860b', borderLeft: '3px solid #b8860b', zIndex: 11 }} />
          <div style={{ position: 'absolute', bottom: '18px', right: '18px', width: '24px', height: '24px', borderBottom: '3px solid #b8860b', borderRight: '3px solid #b8860b', zIndex: 11 }} />
        </>
      )}

      {/* Watermark */}
      {f.watermark?.show !== false && kud?.logo && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: f.watermark.opacity ?? 0.04,
          pointerEvents: 'none', zIndex: 1,
        }}>
          <img src={kud.logo} alt="" style={{ width: '50%', height: '50%', objectFit: 'contain' }} />
        </div>
      )}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 5,
        height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: isClassic ? '28px 36px 20px 36px' : '24px 32px 18px 32px',
        boxSizing: 'border-box',
      }}>
        {/* ===== HEADER ===== */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s(10), flexShrink: 0 }}>
          {f.logo_kud?.show !== false && kud?.logo && (
            <img src={kud.logo} alt="Logo"
              style={{ width: s(f.logo_kud.width || 70), height: s(f.logo_kud.width || 70), objectFit: 'contain', flexShrink: 0 }} />
          )}
          <div style={{ textAlign: 'center' }}>
            {f.nama_kud?.show !== false && (
              <div style={{
                fontFamily: f.nama_kud?.fontFamily || 'Inter',
                fontSize: s(f.nama_kud.fontSize || 16),
                fontWeight: f.nama_kud.fontWeight || 'bold',
                color: f.nama_kud.color || '#064e3b',
                letterSpacing: s(3),
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}>
                {kud.nama_kud || 'KUD Sari Subur'}
              </div>
            )}
            {f.badan_hukum?.show !== false && (
              <div style={{
                fontSize: s(f.badan_hukum.fontSize || 8),
                color: f.badan_hukum.color || '#92400e',
                fontWeight: 600,
                marginTop: s(2),
              }}>
                No. Badan Hukum: {pengaturan?.no_badan_hukum || 'AHU-0001234.AH.01.26.TAHUN 2026'}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        {f.garis_header?.show !== false && (
          <div style={{
            height: '2px',
            background: `linear-gradient(to right, transparent, ${isClassic ? '#b8860b' : '#14b8a6'}, transparent)`,
            margin: `${s(6)}px ${s(20)}px ${s(4)}px ${s(20)}px`,
            flexShrink: 0,
          }} />
        )}

        {/* ===== JUDUL ===== */}
        <div style={{ textAlign: 'center', flexShrink: 0, marginTop: s(2) }}>
          {f.judul?.show !== false && (
            <div style={{
              fontFamily: f.judul?.fontFamily || (isClassic ? 'Playfair Display' : 'Inter'),
              fontSize: s(f.judul.fontSize || 20),
              fontWeight: f.judul.fontWeight || 'bold',
              color: f.judul.color || '#92400e',
              letterSpacing: s(3),
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}>
              SERTIFIKAT KEANGGOTAAN
            </div>
          )}
          {f.no_registrasi?.show !== false && (
            <div style={{
              fontSize: s(f.no_registrasi.fontSize || 8),
              color: f.no_registrasi.color || '#64748b',
              fontFamily: 'monospace',
              marginTop: s(2),
            }}>
              Nomor Registrasi: {nomorAnggota}
            </div>
          )}
        </div>

        {/* ===== BODY ===== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: s(3), padding: `0 ${s(10)}px` }}>
          {/* Pembukaan */}
          {f.pembukaan?.show !== false && (
            <div style={{
              textAlign: 'center',
              fontSize: s(f.pembukaan.fontSize || 10),
              color: f.pembukaan.color || '#475569',
              fontStyle: 'italic',
              lineHeight: 1.5,
              maxWidth: '90%',
              margin: '0 auto',
            }}>
              {f.pembukaan.text || 'Pengurus Koperasi Unit Desa (KUD) Sari Subur dengan ini menerangkan dan mengesahkan bahwa:'}
            </div>
          )}

          {/* Nama */}
          {f.nama_pekebun?.show !== false && (
            <div style={{
              textAlign: 'center',
              fontFamily: f.nama_pekebun?.fontFamily || (isClassic ? 'Playfair Display' : 'Inter'),
              fontSize: s(f.nama_pekebun.fontSize || 20),
              fontWeight: f.nama_pekebun.fontWeight || 'bold',
              color: f.nama_pekebun.color || '#0f172a',
              letterSpacing: s(1),
              textTransform: 'uppercase',
              lineHeight: 1.2,
              padding: `${s(4)}px ${s(20)}px`,
              borderBottom: isClassic ? `2px solid ${f.judul?.color || '#92400e'}33` : 'none',
              display: 'inline-block',
              margin: '0 auto',
            }}>
              {pekebun.nama || 'NAMA PEKEBUN'}
            </div>
          )}

          {/* Grid data */}
          {f.grid_data?.show !== false && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${s(2)}px ${s(16)}px`,
              maxWidth: '80%',
              margin: `${s(4)}px auto 0`,
              fontSize: s(f.grid_data.fontSize || 10),
              color: f.grid_data.color || '#334155',
            }}>
              <div><span style={{ opacity: 0.6, fontWeight: 500 }}>NIK</span><br/><span style={{ fontWeight: 700 }}>{pekebun.nik || '-'}</span></div>
              <div><span style={{ opacity: 0.6, fontWeight: 500 }}>No. Anggota</span><br/><span style={{ fontWeight: 700 }}>{nomorAnggota}</span></div>
              <div><span style={{ opacity: 0.6, fontWeight: 500 }}>Tempat/Tgl Lahir</span><br/><span style={{ fontWeight: 700 }}>{pekebun.tempat_lahir || '-'}, {tglLahir}</span></div>
              <div><span style={{ opacity: 0.6, fontWeight: 500 }}>Status Keanggotaan</span><br/><span style={{ fontWeight: 700, color: isClassic ? '#15803d' : '#059669' }}>Pekebun Kelapa Sawit Aktif</span></div>
            </div>
          )}

          {/* Legal text */}
          {f.legal_text?.show !== false && (
            <div style={{
              textAlign: 'center',
              fontSize: s(f.legal_text.fontSize || 9),
              color: f.legal_text.color || '#475569',
              fontStyle: 'italic',
              lineHeight: 1.5,
              maxWidth: '85%',
              margin: `${s(4)}px auto 0`,
              padding: `${s(4)}px ${s(8)}px`,
              borderTop: `1px solid ${isClassic ? '#d4a853' : '#e2e8f0'}`,
            }}>
              {f.legal_text.text || 'Dinyatakan secara sah terdaftar sebagai Anggota Aktif KUD Sari Subur. Pemegang sertifikat ini berhak atas seluruh fasilitas kemitraan kelapa sawit, pelayanan unit usaha koperasi, serta pembagian Sisa Hasil Usaha (SHU) sesuai AD/ART yang berlaku.'}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          flexShrink: 0, marginTop: s(4),
          borderTop: `1px solid ${isClassic ? '#d4a853' : '#e2e8f0'}`,
          paddingTop: s(4),
        }}>
          {/* Left: Date */}
          <div>
            {f.tanggal_terbit?.show !== false && (
              <div style={{
                fontSize: s(f.tanggal_terbit.fontSize || 9),
                color: f.tanggal_terbit.color || '#64748b',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}>
                <div>Diterbitkan di: <span style={{ fontWeight: 600, color: '#334155' }}>{kud.kartu_kota_terbit || 'Kota'}</span></div>
                <div>Pada Tanggal: <span style={{ fontWeight: 600, color: '#334155' }}>{tanggalTerbit}</span></div>
              </div>
            )}
          </div>

          {/* Right: Signature + Stamp */}
          <div style={{ textAlign: 'center', minWidth: s(180) }}>
            <div style={{ fontSize: s(9), fontWeight: 700, color: '#334155', marginBottom: s(2) }}>
              Pengurus KUD Sari Subur
            </div>
            <div style={{ fontSize: s(8), color: '#64748b', marginBottom: s(4), fontStyle: 'italic' }}>
              Ketua Umum
            </div>

            {/* TTD + Stempel WRAPPER — FIX SIZE */}
            <div style={{
              position: 'relative',
              minHeight: s(70),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: s(2),
            }}>
              {f.stempel?.show !== false && kud?.kartu_stempel && (
                <img
                  src={kud.kartu_stempel}
                  alt="Stempel"
                  style={{
                    position: 'absolute',
                    left: '10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: s(f.stempel.width || 80),
                    height: s(f.stempel.width || 80),
                    objectFit: 'contain',
                    opacity: 0.8,
                    mixBlendMode: 'multiply',
                    zIndex: 1,
                  }}
                />
              )}
              {f.ttd_ketua?.show !== false && kud?.kartu_ttd && (
                <img
                  src={kud.kartu_ttd}
                  alt="TTD"
                  style={{
                    height: s(56),
                    width: 'auto',
                    objectFit: 'contain',
                    position: 'relative',
                    zIndex: 2,
                    mixBlendMode: 'multiply',
                  }}
                />
              )}
            </div>

            {f.nama_ketua?.show !== false && (
              <div style={{
                fontSize: s(f.nama_ketua.fontSize || 11),
                fontWeight: f.nama_ketua.fontWeight || 'bold',
                color: f.nama_ketua.color || '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: s(1),
              }}>
                {kud.kartu_ketua_nama || kud.nama_ketua || 'NAMA KETUA'}
              </div>
            )}
            {f.jabatan_ketua?.show !== false && (
              <div style={{
                fontSize: s(f.jabatan_ketua.fontSize || 9),
                color: f.jabatan_ketua.color || '#64748b',
              }}>
                {kud.kartu_ketua_jabatan || 'Ketua KUD Sari Subur'}
              </div>
            )}
          </div>
        </div>
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
        scale: 2, useCORS: true, allowTaint: false,
        backgroundColor: isClassic ? '#fffaed' : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `sertifikat-${data?.pekebun?.nama?.toLowerCase().replace(/\s+/g, '-') || 'anggota'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error(e); }
    setDownloading(false);
  }, [downloading, data, isClassic]);

  const handlePrint = useCallback(() => {
    if (!containerRef.current) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    const certHtml = containerRef.current.innerHTML;
    printWin.document.write(`
      <html><head>
        <title>Sertifikat Keanggotaan</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: landscape; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .cert-wrapper { width: 100%; max-width: 1000px; }
        </style>
      </head><body>
        <div class="cert-wrapper">${certHtml}</div>
        <script>window.onload=function(){window.print();window.close();};<\/script>
      </body></html>
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
          <button onClick={handleDownloadPNG} disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
            {downloading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download PNG
          </button>
          <button onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-foreground rounded-xl text-xs font-semibold border border-border hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
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
