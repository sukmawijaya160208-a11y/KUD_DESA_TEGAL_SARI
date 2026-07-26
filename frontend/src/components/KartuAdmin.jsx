'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function formatTgl(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function QRCodeSvg({ value, size = 50 }) {
  const [svg, setSvg] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('qrcode').then((QRCode) => {
      QRCode.toString(value || 'ADMIN', { type: 'svg', width: size, margin: 1 }, (err, str) => {
        if (!err) setSvg(str);
      });
    });
  }, [value, size]);
  if (!svg) return <div style={{ width: size, height: size }} className="bg-gray-100 rounded" />;
  return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

const DEFAULT_CONFIG = {
  template: 'classic',
  front: {
    fields: {
      logo_kud: { show: true, width: 48 },
      nama_kud: { show: true, fontSize: 9, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold', text: '' },
      foto_admin: { show: true, width: 46, height: 60 },
      judul: { show: true, fontSize: 10, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black', text: 'KARTU IDENTITAS ADMIN' },
      subjudul: { show: true, fontSize: 6, color: '#6366f1', fontFamily: 'Inter', fontWeight: 'bold', text: 'KOPERASI UNIT DESA SARI SUBUR' },
      nama_admin: { show: true, fontSize: 12, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' },
      jabatan: { show: true, fontSize: 8, color: '#475569', fontFamily: 'Inter', fontWeight: 'semibold' },
      nip: { show: true, fontSize: 8, color: '#475569' },
      qr_code: { show: true },
      watermark: { show: true, opacity: 0.04 },
    },
    background: { type: 'gradient', color1: '#6366f1', color2: '#4f46e5', angle: 135 },
  },
  back: {
    fields: {
      header_website: { show: true, fontSize: 6, color: '#ffffff', fontWeight: 'bold', text: '' },
      aturan_list: { show: true, fontSize: 7, color: '#475569', text: '' },
      sekretariat: { show: true, fontSize: 7, color: '#475569' },
      slogan: { show: true, fontSize: 14, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black', text: 'MELAYANI DENGAN HATI' },
      kota_tanggal: { show: true, fontSize: 7, color: '#64748b' },
      jabatan_ketua: { show: true, fontSize: 8, color: '#475569', fontWeight: 'semibold' },
      ttd_stempel: { show: true },
      nama_ketua: { show: true, fontSize: 8, color: '#0f172a', fontWeight: 'black' },
    },
    background: { type: 'gradient', color1: '#4338ca', color2: '#6366f1', angle: 135 },
  },
};

const TEMPLATE_STYLES = {
  classic: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#6366f1'}, ${cfg?.color2 || '#4f46e5'}, #1e1b4b)`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#4338ca'}, ${cfg?.color2 || '#6366f1'})`,
    leftPanelPct: 35,
    corner: 'rounded-xl',
  },
  modern: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0d9488'}, ${cfg?.color2 || '#0f766e'})`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0d9488'}, ${cfg?.color2 || '#0f766e'})`,
    leftPanelPct: 32,
    corner: 'rounded-lg',
  },
  dark: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#334155'}, ${cfg?.color2 || '#1e293b'}, #0f172a)`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#334155'}, ${cfg?.color2 || '#1e293b'})`,
    leftPanelPct: 35,
    corner: 'rounded-xl',
  },
};

export default function KartuAdmin({ data, width = 360, showActions = true, onClose }) {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [actualWidth, setActualWidth] = useState(width);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentBoxSize?.[0]?.inlineSize || entry.contentRect?.width;
        if (w) setActualWidth(Math.round(w));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const {
    admin = {},
    setting_kud = {},
    pengaturan = {},
    admin_card_config: rawConfig,
    nomor_induk = '',
    tanggal_terbit = '',
    masa_berlaku = '',
  } = data || {};

  const s = setting_kud;
  const nama = admin?.name || admin?.nama || '-';
  const jabatan = admin?.jabatan || '-';
  const nip = admin?.nip || admin?.nik || '-';
  const foto = admin?.foto_profil || admin?.foto || '';
  const logo = s?.logo || pengaturan?.logo_kud || '';
  const initial = nama.charAt(0) || '?';
  const terbit = formatTgl(tanggal_terbit);
  const berlakuTxt = formatTgl(masa_berlaku);

  const config = rawConfig || s?.admin_card_config || DEFAULT_CONFIG;
  const templateKey = config.template || 'classic';
  const templateStyle = TEMPLATE_STYLES[templateKey] || TEMPLATE_STYLES.classic;
  const fFields = config.front?.fields || DEFAULT_CONFIG.front.fields;
  const bFields = config.back?.fields || DEFAULT_CONFIG.back.fields;
  const fBg = config.front?.background || DEFAULT_CONFIG.front.background;
  const bBg = config.back?.background || DEFAULT_CONFIG.back.background;

  const f = (key) => fFields[key] || { show: false };
  const b = (key) => bFields[key] || { show: false };

  const ttdUrl = config.ttd || s?.kartu_ttd || '';
  const stempelUrl = config.stempel || s?.kartu_stempel || '';
  const ketuaNama = config.ketua_nama || s?.kartu_ketua_nama || s?.nama_ketua || '-';
  const ketuaJabatan = config.ketua_jabatan || s?.kartu_ketua_jabatan || 'Ketua KUD Sari Subur';
  const aturan = Array.isArray(config.aturan) && config.aturan.length > 0
    ? config.aturan
    : (Array.isArray(s?.kartu_aturan) && s.kartu_aturan.length > 0
        ? s.kartu_aturan
        : [
            'Pemegang kartu ini adalah Admin Resmi KUD Sari Subur.',
            'Wajib menjaga kerahasiaan data anggota dan sistem KUD.',
            'Kartu ini milik KUD, jika ditemukan harap dikembalikan ke sekretariat.',
            'Dilarang menggunakan kartu ini untuk kepentingan di luar tugas.',
          ]);
  const slogan = b('slogan').text || config.slogan || s?.kartu_slogan || 'MELAYANI DENGAN HATI';
  const website = config.website || s?.website || 'kud-sari-subur.my.id';
  const kotaTerbit = config.kota_terbit || s?.kartu_kota_terbit || 'Megang Sakti';
  const cardW = Math.min(actualWidth, 480);
  const leftPanelPct = templateStyle.leftPanelPct;
  const leftPanelW = Math.round(cardW * leftPanelPct / 100);

  const fc = (key, prop) => f(key)?.[prop];
  const bc = (key, prop) => b(key)?.[prop];

  const handlePrint = () => {
    const html = buildPrintHtml();
    const printWin = window.open('', '_blank');
    if (!printWin) {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;pointer-events:none';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open(); doc.write(html); doc.close();
      setTimeout(() => {
        try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch { window.print(); }
      }, 1500);
      setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 120000);
      return;
    }
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
      });
      const link = document.createElement('a');
      link.download = `KARTU_ADMIN_${nama.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
    setDownloading(false);
  };

  const usedFonts = [...new Set([
    ...Object.values(fFields).map((ff) => ff?.fontFamily),
    ...Object.values(bFields).map((bf) => bf?.fontFamily),
  ].filter(Boolean))];

  const buildPrintHtml = () => {
    const leftBg = templateStyle.frontLeftBg(fBg);
    const backBg = templateStyle.backHeaderBg(bBg);

    const logoHtml = logo ? `<img src="${logo}" alt="" style="width:${fc('logo_kud', 'width') || 48}px;height:${fc('logo_kud', 'width') || 48}px;object-fit:contain;border-radius:2mm;border:1px solid rgba(255,255,255,0.3);" />`
      : '<div style="width:48px;height:48px;border-radius:2mm;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:800;color:rgba(255,255,255,0.5);">KUD</div>';
    const fotoHtml = foto ? `<img src="${foto}" alt="" style="width:${fc('foto_admin', 'width') || 46}px;height:${fc('foto_admin', 'height') || 60}px;object-fit:cover;border-radius:1.5mm;border:2px solid rgba(255,255,255,0.5);" />`
      : `<div style="width:46px;height:60px;border-radius:1.5mm;border:2px solid rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:700;color:rgba(255,255,255,0.4);">${initial}</div>`;
    const ttdHtml = ttdUrl ? `<img src="${ttdUrl}" alt="TTD" style="height:26px;width:auto;object-fit:contain;" />` : '';
    const stempelHtml = stempelUrl ? `<img src="${stempelUrl}" alt="Stempel" style="height:44px;width:auto;object-fit:contain;margin-right:4px;mix-blend-mode:multiply;" />` : '';
    const aturanHtml = aturan.map((a) => `<li>${a}</li>`).join('');
    const fontLinks = usedFonts.map((f) => `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`).join('\n');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Kartu Admin - ${nama}</title>
<link href="${fontLinks}" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 5mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    font-family: Inter, 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif;
    display: flex; flex-direction: column; align-items: center;
    padding: 8mm 0; gap: 4mm;
  }
  .page {
    width: 90mm; height: 55mm;
    position: relative; overflow: hidden;
    flex-shrink: 0;
  }
  .front { display: flex; }
  .front-left { width: ${leftPanelPct}%; padding: 2.5mm 2mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .front-right { width: ${100 - leftPanelPct}%; background: white; padding: 2mm 2.5mm; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .back { display: flex; flex-direction: column; height: 100%; }
  .back-header { padding: 1.2mm 3mm; text-align: center; }
  .back-body { flex: 1; padding: 1.5mm 2.5mm; display: flex; flex-direction: column; justify-content: space-between; }
  .back-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.5mm; }
  .ttd-stempel-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 2px; min-height: 48px; }
  @media screen {
    body { background: #f8fafc; }
    .page { border-radius: 3mm; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
  }
  @media print {
    body { padding: 0; background: white; gap: 3mm; justify-content: center; min-height: 100vh; }
    .page { page-break-inside: avoid; box-shadow: none; border-radius: 0; border: 1px solid #ddd; }
    * { font-family: Inter, 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif !important; }
    img { print-color-adjust: exact; }
  }
</style></head><body>
  <div class="page front">
    <div class="front-left" style="background:${leftBg};">
      ${f('logo_kud').show !== false ? logoHtml : ''}
      ${f('nama_kud').show !== false ? `<div style="font-size:${fc('nama_kud', 'fontSize') || 9}pt;font-weight:${fc('nama_kud', 'fontWeight') || 'bold'};color:${fc('nama_kud', 'color') || '#ffffff'};text-align:center;text-transform:uppercase;font-family:Inter, sans-serif;">${fc('nama_kud', 'text') || s?.nama_kud || 'KUD Sari Subur'}</div>` : ''}
      ${f('foto_admin').show !== false ? fotoHtml : ''}
    </div>
    <div class="front-right">
      ${f('watermark').show !== false && logo ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:${fc('watermark', 'opacity') || 0.04};pointer-events:none;"><img src="${logo}" style="width:35mm;height:35mm;object-fit:contain;" /></div>` : ''}
      ${f('judul').show !== false ? `<div style="font-size:${fc('judul', 'fontSize') || 10}pt;font-weight:${fc('judul', 'fontWeight') || 'black'};color:${fc('judul', 'color') || '#0f172a'};text-transform:uppercase;letter-spacing:0.5px;border-bottom:0.5px solid #e2e8f0;padding-bottom:0.4mm;margin-bottom:0.3mm;font-family:Inter, sans-serif;">${fc('judul', 'text') || 'KARTU IDENTITAS ADMIN'}</div>` : ''}
      ${f('subjudul').show !== false ? `<div style="font-size:${fc('subjudul', 'fontSize') || 6}pt;font-weight:${fc('subjudul', 'fontWeight') || 'bold'};color:${fc('subjudul', 'color') || '#6366f1'};text-transform:uppercase;margin-bottom:0.8mm;font-family:Inter, sans-serif;">${fc('subjudul', 'text') || 'KOPERASI UNIT DESA SARI SUBUR'}</div>` : ''}
      ${f('nama_admin').show !== false ? `<div style="font-size:${fc('nama_admin', 'fontSize') || 12}pt;font-weight:${fc('nama_admin', 'fontWeight') || 'black'};color:${fc('nama_admin', 'color') || '#0f172a'};text-transform:uppercase;line-height:1.1;font-family:Inter, sans-serif;">${nama}</div>` : ''}
      ${f('jabatan').show !== false ? `<div style="font-size:${fc('jabatan', 'fontSize') || 8}pt;font-weight:${fc('jabatan', 'fontWeight') || 'semibold'};color:${fc('jabatan', 'color') || '#475569'};background:#f1f5f9;padding:0.2mm 1mm;border-radius:0.5mm;display:inline-block;margin:0.3mm 0;">${jabatan}</div>` : ''}
      ${f('nip').show !== false && nip !== '-' ? `<div style="font-size:${fc('nip', 'fontSize') || 8}pt;color:${fc('nip', 'color') || '#475569'};line-height:1.4;">NIP: ${nip}</div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:0.3mm;border-top:0.5px solid #f1f5f9;">
        <div style="font-size:7pt;color:#94a3b8;"><span style="font-weight:700;font-size:8pt;color:#0f172a;">${terbit} - ${berlakuTxt}</span></div>
        ${f('qr_code').show !== false ? `<div style="width:16mm;height:16mm;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(nomor_induk || 'ADMIN')}" alt="QR" style="width:100%;height:100%;image-rendering:pixelated;" /></div>` : ''}
      </div>
    </div>
  </div>
  <div class="page back">
    ${b('header_website').show !== false ? `<div class="back-header" style="font-size:${bc('header_website', 'fontSize') || 6}pt;font-weight:${bc('header_website', 'fontWeight') || 'bold'};color:${bc('header_website', 'color') || '#ffffff'};background:${backBg};">${b('header_website').text || website}</div>` : ''}
    <div class="back-body">
      <div>
        ${b('aturan_list').show !== false ? `<div style="font-size:${bc('aturan_list', 'fontSize') || 7}pt;color:${bc('aturan_list', 'color') || '#475569'};"><div style="font-size:7pt;font-weight:700;color:#0f172a;margin-bottom:0.4mm;">Aturan:</div><ul style="list-style:none;padding:0;margin:0;">${aturanHtml}</ul></div>` : ''}
        ${b('sekretariat').show !== false ? `<div style="font-size:${bc('sekretariat', 'fontSize') || 7}pt;color:${bc('sekretariat', 'color') || '#475569'};margin-top:0.4mm;padding-top:0.4mm;border-top:0.5px solid #e2e8f0;"><span style="font-weight:700;color:#0f172a;">Sekretariat:</span> ${s?.alamat || '-'}</div>` : ''}
      </div>
      <div class="back-footer">
        ${b('slogan').show !== false ? `<div style="font-size:${bc('slogan', 'fontSize') || 14}pt;font-weight:${bc('slogan', 'fontWeight') || 'black'};font-style:italic;color:${bc('slogan', 'color') || '#0f172a'};text-transform:uppercase;font-family:Inter, sans-serif;">${slogan}</div>` : ''}
        <div style="text-align:right;font-size:${bc('kota_tanggal', 'fontSize') || 7}pt;color:${bc('kota_tanggal', 'color') || '#64748b'};">
          ${b('kota_tanggal').show !== false ? `<div>${kotaTerbit}, ${terbit}</div>` : ''}
          ${b('jabatan_ketua').show !== false ? `<div style="font-weight:${bc('jabatan_ketua', 'fontWeight') || 'semibold'};color:${bc('jabatan_ketua', 'color') || '#475569'};font-size:${bc('jabatan_ketua', 'fontSize') || 8}pt;">${ketuaJabatan}</div>` : ''}
          ${b('ttd_stempel').show !== false ? `<div class="ttd-stempel-wrap">${stempelHtml}${ttdHtml}</div>` : ''}
          ${b('nama_ketua').show !== false ? `<div style="font-weight:${bc('nama_ketua', 'fontWeight') || 'black'};color:${bc('nama_ketua', 'color') || '#0f172a'};font-size:${bc('nama_ketua', 'fontSize') || 8}pt;text-transform:uppercase;">${ketuaNama}</div>` : ''}
        </div>
      </div>
    </div>
  </div>
<script>window.onload=function(){setTimeout(function(){window.print();window.close();},800);};</script>
</body></html>`;
  };

  const frontCard = () => (
    <div className={`flex overflow-hidden ${templateStyle.corner}`} style={{
      width: '100%', maxWidth: cardW + 'px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div className="flex flex-col items-center justify-between shrink-0 p-2.5" style={{
        width: leftPanelW + 'px',
        background: templateStyle.frontLeftBg(fBg),
        minHeight: 170,
      }}>
        {f('logo_kud').show !== false && (logo ? (
          <img src={logo} alt="" className="object-contain rounded-xl border border-white/20 shadow-lg" style={{ width: fc('logo_kud', 'width') || 48, height: fc('logo_kud', 'width') || 48 }} />
        ) : (
          <div className="w-[48px] h-[48px] rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">KUD</div>
        ))}
        {f('nama_kud').show !== false && (
          <div className="text-center">
            <div className="uppercase tracking-wider leading-tight" style={{
              fontSize: (fc('nama_kud', 'fontSize') || 9) + 'px',
              fontWeight: fc('nama_kud', 'fontWeight') || 'bold',
              color: fc('nama_kud', 'color') || '#ffffff',
              fontFamily: `'${fc('nama_kud', 'fontFamily') || 'Inter'}', sans-serif`,
            }}>{fc('nama_kud', 'text') || s?.nama_kud || 'KUD Sari Subur'}</div>
          </div>
        )}
        {f('foto_admin').show !== false && (foto ? (
          <img src={foto} alt="" className="object-cover rounded-lg border-2 border-white/40 shadow-md" style={{ width: fc('foto_admin', 'width') || 46, height: fc('foto_admin', 'height') || 60 }} />
        ) : (
          <div className="rounded-lg border-2 border-white/40 bg-white/10 flex items-center justify-center text-lg font-bold text-white/40" style={{ width: fc('foto_admin', 'width') || 46, height: fc('foto_admin', 'height') || 60 }}>{initial}</div>
        ))}
      </div>
      <div className="bg-white p-3 flex flex-col relative" style={{ width: (cardW - leftPanelW) + 'px' }}>
        {f('watermark').show !== false && logo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: fc('watermark', 'opacity') || 0.04 }}>
            <img src={logo} alt="" className="w-28 h-28 object-contain" />
          </div>
        )}
        {f('judul').show !== false && (
          <div className="tracking-wide uppercase border-b border-slate-200 pb-0.5" style={{
            fontSize: (fc('judul', 'fontSize') || 10) + 'px',
            fontWeight: fc('judul', 'fontWeight') || 'black',
            color: fc('judul', 'color') || '#0f172a',
            fontFamily: `'${fc('judul', 'fontFamily') || 'Inter'}', sans-serif`,
          }}>{fc('judul', 'text') || 'KARTU IDENTITAS ADMIN'}</div>
        )}
        {f('subjudul').show !== false && (
          <div className="uppercase mb-1" style={{
            fontSize: (fc('subjudul', 'fontSize') || 6) + 'px',
            fontWeight: fc('subjudul', 'fontWeight') || 'bold',
            color: fc('subjudul', 'color') || '#6366f1',
            fontFamily: `'${fc('subjudul', 'fontFamily') || 'Inter'}', sans-serif`,
          }}>{fc('subjudul', 'text') || 'KOPERASI UNIT DESA SARI SUBUR'}</div>
        )}
        {f('nama_admin').show !== false && (
          <div className="uppercase leading-tight" style={{
            fontSize: (fc('nama_admin', 'fontSize') || 12) + 'px',
            fontWeight: fc('nama_admin', 'fontWeight') || 'black',
            color: fc('nama_admin', 'color') || '#0f172a',
            fontFamily: `'${fc('nama_admin', 'fontFamily') || 'Inter'}', sans-serif`,
          }}>{nama}</div>
        )}
        {f('jabatan').show !== false && (
          <div className="inline-block mt-0.5 mb-1 px-1.5 py-0.5 rounded font-semibold text-xs" style={{
            fontSize: (fc('jabatan', 'fontSize') || 8) + 'px',
            fontWeight: fc('jabatan', 'fontWeight') || 'semibold',
            color: fc('jabatan', 'color') || '#475569',
            background: '#f1f5f9',
          }}>{jabatan}</div>
        )}
        {f('nip').show !== false && nip !== '-' && (
          <div style={{ fontSize: (fc('nip', 'fontSize') || 8) + 'px', color: fc('nip', 'color') || '#475569' }}>
            NIP: {nip}
          </div>
        )}
        <div className="flex items-end justify-between mt-auto pt-1 border-t border-slate-100">
          <div>
            <p className="text-[7px] text-slate-400 font-semibold">Berlaku</p>
            <p className="font-bold text-slate-800" style={{ fontSize: '8px' }}>{terbit} - {berlakuTxt}</p>
          </div>
          {f('qr_code').show !== false && (
            <div className="shrink-0">
              <QRCodeSvg value={nomor_induk || nama} size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const backCard = () => (
    <div className={`overflow-hidden ${templateStyle.corner}`} style={{
      width: '100%', maxWidth: cardW + 'px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {b('header_website').show !== false && (
        <div className="text-white text-center py-1 font-bold text-xs tracking-wider" style={{
          fontSize: (bc('header_website', 'fontSize') || 6) + 'px',
          fontWeight: bc('header_website', 'fontWeight') || 'bold',
          color: bc('header_website', 'color') || '#ffffff',
          background: templateStyle.backHeaderBg(bBg),
        }}>
          {b('header_website').text || website}
        </div>
      )}
      <div className="bg-white p-3 flex flex-col min-h-[170px]">
        <div className="flex-1">
          {b('aturan_list').show !== false && (
            <>
              <h4 className="text-[8px] font-bold text-slate-900 mb-0.5">Aturan:</h4>
              <ul className="space-y-0.5">
                {aturan.map((item, i) => (
                  <li key={i} className="flex items-start gap-1 leading-tight" style={{ fontSize: (bc('aturan_list', 'fontSize') || 7) + 'px', color: bc('aturan_list', 'color') || '#475569' }}>
                    <span className="mt-[3px] w-[4px] h-[4px] rounded-full shrink-0" style={{ background: fc('subjudul', 'color') || '#6366f1' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          {b('sekretariat').show !== false && (
            <div className="mt-1 pt-0.5 border-t border-slate-100" style={{ fontSize: (bc('sekretariat', 'fontSize') || 7) + 'px', color: bc('sekretariat', 'color') || '#475569' }}>
              <span className="font-bold text-slate-800">Sekretariat KUD:</span> {s?.alamat || '-'}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mt-1">
          {b('slogan').show !== false && (
            <div className="font-black italic uppercase tracking-wider leading-none" style={{
              fontSize: (bc('slogan', 'fontSize') || 14) + 'px',
              color: bc('slogan', 'color') || '#0f172a',
              fontFamily: `'${bc('slogan', 'fontFamily') || 'Inter'}', sans-serif`,
            }}>{slogan}</div>
          )}
          <div className="text-right" style={{ fontSize: (bc('kota_tanggal', 'fontSize') || 7) + 'px', color: bc('kota_tanggal', 'color') || '#64748b' }}>
            {b('kota_tanggal').show !== false && <p className="text-slate-500">{kotaTerbit}, {terbit}</p>}
            {b('jabatan_ketua').show !== false && (
              <p className="text-slate-700" style={{ fontWeight: bc('jabatan_ketua', 'fontWeight') || 'semibold', color: bc('jabatan_ketua', 'color') || '#475569', fontSize: (bc('jabatan_ketua', 'fontSize') || 8) + 'px' }}>
                {ketuaJabatan}
              </p>
            )}
            {b('ttd_stempel').show !== false && (
              <div className="flex items-center justify-end gap-0.5 my-0.5 min-h-[48px]">
                {stempelUrl && <img src={stempelUrl} alt="" className="object-contain mix-blend-multiply" style={{ height: 44, width: 'auto' }} />}
                {ttdUrl && <img src={ttdUrl} alt="" className="object-contain" style={{ height: 26, width: 'auto' }} />}
              </div>
            )}
            {b('nama_ketua').show !== false && (
              <p className="uppercase" style={{ fontWeight: bc('nama_ketua', 'fontWeight') || 'black', color: bc('nama_ketua', 'color') || '#0f172a', fontSize: (bc('nama_ketua', 'fontSize') || 8) + 'px' }}>
                {ketuaNama}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-border">
      <div className="p-4 sm:p-6">
        {showActions && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Kartu Admin KUD</h3>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadPng} disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-foreground rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-all cursor-pointer disabled:opacity-50">
                <ArrowDownTrayIcon className="w-4 h-4" />
                {downloading ? '...' : 'PNG'}
              </button>
              <button onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer" style={{ background: fc('subjudul', 'color') || '#6366f1' }}>
                <PrinterIcon className="w-4 h-4" />
                Cetak
              </button>
              {onClose && (
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center">&times;</span>
                </button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-4" ref={cardRef}>
          <div ref={containerRef} className="w-full max-w-full" style={{ maxWidth: '480px' }}>
            <div className="text-center mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">Sisi Belakang</span>
            </div>
            {backCard()}
          </div>
          <div className="w-full max-w-full" style={{ maxWidth: cardW + 'px' }}>
            <div className="text-center mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">Sisi Depan</span>
            </div>
            {frontCard()}
          </div>
        </div>
        <div className="text-center mt-3">
          <p className="text-[10px] text-gray-400">Ukuran: 90mm × 55mm &bull; Cetak: sisi depan &bull; sisi belakang (2 halaman)</p>
        </div>
      </div>
    </div>
  );
}
