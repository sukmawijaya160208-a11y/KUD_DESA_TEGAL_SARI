'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function formatTgl(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function QRCodeSvg({ value, size = 60 }) {
  const [svg, setSvg] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('qrcode').then((QRCode) => {
      QRCode.toString(value || 'KUD', { type: 'svg', width: size, margin: 1 }, (err, str) => {
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
      logo_kud: { show: true, width: 52 },
      nama_kud: { show: true, fontSize: 10, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold', text: 'KUD Sari Subur' },
      foto_pekebun: { show: true, width: 50, height: 66 },
      judul: { show: true, fontSize: 11, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black', text: 'KARTU TANDA ANGGOTA' },
      subjudul: { show: true, fontSize: 7, color: '#059669', fontFamily: 'Inter', fontWeight: 'bold', text: 'KOPERASI UNIT DESA SARI SUBUR' },
      nama_anggota: { show: true, fontSize: 13, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black' },
      nomor_anggota: { show: true, fontSize: 9, color: '#059669', fontFamily: 'monospace', fontWeight: 'bold' },
      nik: { show: true, fontSize: 8, color: '#475569' },
      ttl: { show: true, fontSize: 8, color: '#475569' },
      jenis_kelamin: { show: true, fontSize: 8, color: '#475569' },
      no_wa: { show: true, fontSize: 8, color: '#475569' },
      no_kk: { show: true, fontSize: 8, color: '#475569' },
      alamat: { show: true, fontSize: 8, color: '#475569' },
      berlaku: { show: true, fontSize: 7, color: '#94a3b8' },
      qr_code: { show: true },
      watermark: { show: true, opacity: 0.04 },
    },
    background: { type: 'gradient', color1: '#059669', color2: '#047857', angle: 135 },
  },
  back: {
    fields: {
      header_website: { show: true, fontSize: 6, color: '#ffffff', fontWeight: 'bold', text: 'kud-sari-subur.my.id' },
      aturan_list: { show: true, fontSize: 7, color: '#475569', text: 'Kartu Tanda Anggota:' },
      sekretariat: { show: true, fontSize: 7, color: '#475569' },
      slogan: { show: true, fontSize: 16, color: '#0f172a', fontFamily: 'Inter', fontWeight: 'black', text: 'SAWIT ADALAH KITA' },
      kota_tanggal: { show: true, fontSize: 7, color: '#64748b' },
      jabatan_ketua: { show: true, fontSize: 8, color: '#475569', fontWeight: 'semibold' },
      ttd_stempel: { show: true },
      nama_ketua: { show: true, fontSize: 8, color: '#0f172a', fontWeight: 'black' },
    },
    background: { type: 'gradient', color1: '#028143', color2: '#059669', angle: 135 },
  },
};

const TEMPLATE_STYLES = {
  classic: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#059669'}, ${cfg?.color2 || '#047857'}, #0f172a)`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#059669'}, ${cfg?.color2 || '#047857'})`,
    leftPanelPct: 35,
    corner: 'rounded-xl',
  },
  modern: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0d9488'}, ${cfg?.color2 || '#0f766e'})`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0d9488'}, ${cfg?.color2 || '#0f766e'})`,
    leftPanelPct: 32,
    corner: 'rounded-lg',
  },
  compact: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0284c7'}, ${cfg?.color2 || '#0369a1'})`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0284c7'}, ${cfg?.color2 || '#0369a1'})`,
    leftPanelPct: 30,
    corner: 'rounded-md',
  },
};

export default function KartuAnggotaKud({ data, width = 360, showActions = true, onClose }) {
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
    pekebun = {},
    setting_kud = {},
    pengaturan = {},
    kartu_config: rawConfig,
    nomor_anggota = '',
    tanggal_terbit = '',
    masa_berlaku = '',
  } = data || {};

  const s = setting_kud;
  const user = pekebun?.user || {};
  const foto = pekebun?.foto_pekebun || user?.foto_profil || '';
  const logo = s?.logo || pengaturan?.logo_kud || '';
  const nama = pekebun?.nama || user?.name || '-';
  const nik = pekebun?.nik || '-';
  const ttlText = pekebun?.tempat_lahir
    ? `${pekebun.tempat_lahir}, ${formatTgl(pekebun.tanggal_lahir)}`
    : (pekebun?.tanggal_lahir ? formatTgl(pekebun.tanggal_lahir) : '-');
  const jenisKelamin = pekebun?.jenis_kelamin === 'L' ? 'Laki-laki' : pekebun?.jenis_kelamin === 'P' ? 'Perempuan' : '-';
  const noWa = pekebun?.no_whatsapp || '-';
  const noKk = pekebun?.no_kk || '-';
  const alamatJalan = pekebun?.alamat || '';
  const initial = nama.charAt(0) || '?';

  const config = rawConfig || s?.kartu_config || DEFAULT_CONFIG;
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
            'Pemegang kartu ini adalah Anggota Resmi KUD Sari Subur.',
            'Pemegang kartu tunduk dan taat kepada AD/ART KUD Sari Subur.',
            'Dilarang menggunakan kartu ini untuk kegiatan yang melanggar hukum.',
            'Kartu ini milik KUD, jika ditemukan harap dikembalikan ke sekretariat.',
          ]);
  const slogan = b('slogan').text || config.slogan || s?.kartu_slogan || 'SAWIT ADALAH KITA';
  const website = config.website || s?.website || 'kud-sari-subur.my.id';
  const kotaTerbit = config.kota_terbit || s?.kartu_kota_terbit || 'Megang Sakti';
  const terbit = formatTgl(tanggal_terbit);
  const berlaku = formatTgl(masa_berlaku);
  const cardW = Math.min(actualWidth, 540);
  const leftPanelPct = templateStyle.leftPanelPct;
  const leftPanelW = Math.round(cardW * leftPanelPct / 100);
  const rightPanelW = cardW - leftPanelW;

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
      const cardHtml = buildCardHtml();
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:540px;background:#ffffff;z-index:-9999;padding:8px';
      container.innerHTML = cardHtml;
      document.body.appendChild(container);
      await new Promise((r) => setTimeout(r, 2000));
      const canvas = await html2canvas(container, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
      });
      document.body.removeChild(container);
      const link = document.createElement('a');
      link.download = `KARTU_ANGGOTA_${nama.replace(/\s+/g, '_')}.png`;
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

  const buildCardHtml = () => {
    const leftBg = templateStyle.frontLeftBg(fBg);
    const backBg = templateStyle.backHeaderBg(bBg);

    const logoHtml = logo ? `<img src="${logo}" alt="" style="width:${fc('logo_kud', 'width') || 52}px;height:${fc('logo_kud', 'width') || 52}px;object-fit:contain;border-radius:4px;border:1px solid rgba(255,255,255,0.3);" />`
      : '<div style="width:52px;height:52px;border-radius:4px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:800;color:rgba(255,255,255,0.5);">KUD</div>';
    const fotoHtml = foto ? `<img src="${foto}" alt="" style="width:${fc('foto_pekebun', 'width') || 50}px;height:${fc('foto_pekebun', 'height') || 66}px;object-fit:cover;border-radius:3px;border:2px solid rgba(255,255,255,0.5);" />`
      : `<div style="width:50px;height:66px;border-radius:3px;border:2px solid rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:700;color:rgba(255,255,255,0.4);">${initial}</div>`;
    const ttdHtml = ttdUrl ? `<img src="${ttdUrl}" alt="TTD" style="height:30px;width:auto;object-fit:contain;" />` : '';
    const stempelHtml = stempelUrl ? `<img src="${stempelUrl}" alt="Stempel" style="height:50px;width:auto;object-fit:contain;margin-right:4px;mix-blend-mode:multiply;" />` : '';
    const aturanHtml = aturan.map((a) => `<li>${a}</li>`).join('');

    return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:12px;font-family:Inter,'Segoe UI',Roboto,system-ui,sans-serif;">
    <div style="width:540px;overflow:hidden;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
      <div style="display:flex;">
        <div style="width:${leftPanelPct}%;padding:16px 8px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;background:${leftBg};">
          ${f('logo_kud').show !== false ? logoHtml : ''}
          ${f('nama_kud').show !== false ? `<div style="font-size:${fc('nama_kud', 'fontSize') || 10}px;font-weight:${fc('nama_kud', 'fontWeight') || 'bold'};color:${fc('nama_kud', 'color') || '#ffffff'};text-align:center;text-transform:uppercase;">${fc('nama_kud', 'text') || s?.nama_kud || 'KUD Sari Subur'}</div>` : ''}
          ${f('foto_pekebun').show !== false ? fotoHtml : ''}
        </div>
        <div style="width:${100 - leftPanelPct}%;background:#ffffff;padding:12px 14px;display:flex;flex-direction:column;position:relative;">
          ${f('watermark').show !== false && logo ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:${fc('watermark', 'opacity') || 0.04};pointer-events:none;"><img src="${logo}" style="width:128px;height:128px;object-fit:contain;" /></div>` : ''}
          ${f('judul').show !== false ? `<div style="font-size:${fc('judul', 'fontSize') || 11}px;font-weight:${fc('judul', 'fontWeight') || '900'};color:${fc('judul', 'color') || '#0f172a'};text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;padding-bottom:2px;margin-bottom:2px;">${fc('judul', 'text') || s?.kartu_judul_depan || 'KARTU TANDA ANGGOTA'}</div>` : ''}
          ${f('subjudul').show !== false ? `<div style="font-size:${fc('subjudul', 'fontSize') || 7}px;font-weight:${fc('subjudul', 'fontWeight') || 'bold'};color:${fc('subjudul', 'color') || '#059669'};text-transform:uppercase;margin-bottom:4px;">${fc('subjudul', 'text') || s?.kartu_subjudul_depan || 'KOPERASI UNIT DESA SARI SUBUR'}</div>` : ''}
          ${f('nama_anggota').show !== false ? `<div style="font-size:${fc('nama_anggota', 'fontSize') || 13}px;font-weight:${fc('nama_anggota', 'fontWeight') || '900'};color:${fc('nama_anggota', 'color') || '#0f172a'};text-transform:uppercase;line-height:1.2;">${nama}</div>` : ''}
          ${f('nomor_anggota').show !== false ? `<div style="font-size:${fc('nomor_anggota', 'fontSize') || 9}px;font-weight:${fc('nomor_anggota', 'fontWeight') || 'bold'};color:${fc('nomor_anggota', 'color') || '#059669'};font-family:monospace;background:#f0fdf4;padding:1px 4px;border-radius:2px;display:inline-block;margin:2px 0;">${nomor_anggota || '-'}</div>` : ''}
          <div style="font-size:${fc('nik', 'fontSize') || 8}px;color:${fc('nik', 'color') || '#475569'};line-height:1.5;">
            ${f('nik').show !== false && nik !== '-' ? `<div>NIK: ${nik}</div>` : ''}
            ${f('ttl').show !== false ? `<div>TTL: ${ttlText}</div>` : ''}
            ${f('jenis_kelamin').show !== false ? `<div>JK: ${jenisKelamin}</div>` : ''}
            ${f('no_wa').show !== false ? `<div>WA: ${noWa}</div>` : ''}
            ${f('no_kk').show !== false ? `<div>No KK: ${noKk}</div>` : ''}
            ${f('alamat').show !== false && alamatJalan ? `<div>${alamatJalan}</div>` : ''}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:4px;border-top:1px solid #f1f5f9;">
            ${f('berlaku').show !== false ? `<div><div style="font-size:7px;color:#94a3b8;">Berlaku</div><div style="font-size:9px;font-weight:bold;color:#0f172a;">${terbit} - ${berlaku}</div></div>` : ''}
            ${f('qr_code').show !== false ? `<div style="width:55px;height:55px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(nomor_anggota || 'KUD')}" alt="QR" style="width:100%;height:100%;" /></div>` : ''}
          </div>
        </div>
      </div>
    </div>
    <div style="width:540px;overflow:hidden;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
      ${b('header_website').show !== false ? `<div style="font-size:${bc('header_website', 'fontSize') || 6}px;font-weight:${bc('header_website', 'fontWeight') || 'bold'};color:${bc('header_website', 'color') || '#ffffff'};text-align:center;padding:4px 12px;background:${backBg};">${b('header_website').text || website}</div>` : ''}
      <div style="background:#ffffff;padding:14px;display:flex;flex-direction:column;min-height:190px;">
        <div style="flex:1;">
          ${b('aturan_list').show !== false ? `<div style="font-size:${bc('aturan_list', 'fontSize') || 7}px;color:${bc('aturan_list', 'color') || '#475569'};"><div style="font-size:9px;font-weight:bold;color:#0f172a;margin-bottom:2px;">${b('aturan_list').text || 'Kartu Tanda Anggota:'}</div><ul style="list-style:none;padding:0;margin:0;">${aturanHtml}</ul></div>` : ''}
          ${b('sekretariat').show !== false ? `<div style="font-size:${bc('sekretariat', 'fontSize') || 7}px;color:${bc('sekretariat', 'color') || '#475569'};margin-top:4px;padding-top:4px;border-top:1px solid #e2e8f0;"><span style="font-weight:bold;color:#0f172a;">Sekretariat:</span> ${s?.alamat || '-'}</div>` : ''}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:4px;">
          ${b('slogan').show !== false ? `<div style="font-size:${bc('slogan', 'fontSize') || 16}px;font-weight:${bc('slogan', 'fontWeight') || '900'};font-style:italic;color:${bc('slogan', 'color') || '#0f172a'};text-transform:uppercase;">${slogan}</div>` : ''}
          <div style="text-align:right;font-size:${bc('kota_tanggal', 'fontSize') || 7}px;color:${bc('kota_tanggal', 'color') || '#64748b'};">
            ${b('kota_tanggal').show !== false ? `<div>${kotaTerbit}, ${terbit}</div>` : ''}
            ${b('jabatan_ketua').show !== false ? `<div style="font-weight:600;font-size:${bc('jabatan_ketua', 'fontSize') || 8}px;color:${bc('jabatan_ketua', 'color') || '#475569'};">${ketuaJabatan}</div>` : ''}
            ${b('ttd_stempel').show !== false ? `<div style="display:flex;align-items:center;justify-content:flex-end;gap:2px;min-height:55px;">${stempelHtml}${ttdHtml}</div>` : ''}
            ${b('nama_ketua').show !== false ? `<div style="font-weight:900;color:#0f172a;font-size:${bc('nama_ketua', 'fontSize') || 8}px;text-transform:uppercase;">${ketuaNama}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>`;
  };

  const buildPrintHtml = () => {
    const leftBg = templateStyle.frontLeftBg(fBg);
    const backBg = templateStyle.backHeaderBg(bBg);

    const logoHtml = logo ? `<img src="${logo}" alt="" style="width:${fc('logo_kud', 'width') || 52}px;height:${fc('logo_kud', 'width') || 52}px;object-fit:contain;border-radius:2mm;border:1px solid rgba(255,255,255,0.3);" />`
      : '<div style="width:52px;height:52px;border-radius:2mm;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:800;color:rgba(255,255,255,0.5);">KUD</div>';
    const fotoHtml = foto ? `<img src="${foto}" alt="" style="width:${fc('foto_pekebun', 'width') || 50}px;height:${fc('foto_pekebun', 'height') || 66}px;object-fit:cover;border-radius:1.5mm;border:2px solid rgba(255,255,255,0.5);" />`
      : `<div style="width:50px;height:66px;border-radius:1.5mm;border:2px solid rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:700;color:rgba(255,255,255,0.4);">${initial}</div>`;
    const ttdHtml = ttdUrl ? `<img src="${ttdUrl}" alt="TTD" style="height:30px;width:auto;object-fit:contain;" />` : '';
    const stempelHtml = stempelUrl ? `<img src="${stempelUrl}" alt="Stempel" style="height:50px;width:auto;object-fit:contain;margin-right:4px;mix-blend-mode:multiply;" />` : '';

    const aturanHtml = aturan.map((a) => `<li>${a}</li>`).join('');
    const fontLinks = usedFonts.map((f) => `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`).join('\n');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Kartu Anggota - ${nama}</title>
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
    width: 88mm; height: 56mm;
    position: relative; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    flex-shrink: 0;
  }
  .front { display: flex; }
  .front-left { width: ${leftPanelPct}%; padding: 3mm 2mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .front-right { width: ${100 - leftPanelPct}%; background: white; padding: 2.5mm 3mm; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .back { display: flex; flex-direction: column; height: 100%; }
  .back-header { padding: 1.5mm 3mm; text-align: center; }
  .back-body { flex: 1; padding: 2mm 3mm; display: flex; flex-direction: column; justify-content: space-between; }
  .back-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.5mm; }
  .ttd-stempel-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 2px; min-height: 55px; }
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
      ${f('nama_kud').show !== false ? `<div style="font-size:${fc('nama_kud', 'fontSize') || 10}pt;font-weight:${fc('nama_kud', 'fontWeight') || 'bold'};color:${fc('nama_kud', 'color') || '#ffffff'};text-align:center;text-transform:uppercase;font-family:Inter, sans-serif;">${fc('nama_kud', 'text') || s?.nama_kud || 'KUD Sari Subur'}</div>` : ''}
      ${f('foto_pekebun').show !== false ? fotoHtml : ''}
    </div>
    <div class="front-right">
      ${f('watermark').show !== false && logo ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:${fc('watermark', 'opacity') || 0.04};pointer-events:none;"><img src="${logo}" style="width:40mm;height:40mm;object-fit:contain;" /></div>` : ''}
      ${f('judul').show !== false ? `<div style="font-size:${fc('judul', 'fontSize') || 11}pt;font-weight:${fc('judul', 'fontWeight') || 'black'};color:${fc('judul', 'color') || '#0f172a'};text-transform:uppercase;letter-spacing:0.5px;border-bottom:0.5px solid #e2e8f0;padding-bottom:0.5mm;margin-bottom:0.3mm;font-family:Inter, sans-serif;">${fc('judul', 'text') || s?.kartu_judul_depan || 'KARTU TANDA ANGGOTA'}</div>` : ''}
      ${f('subjudul').show !== false ? `<div style="font-size:${fc('subjudul', 'fontSize') || 7}pt;font-weight:${fc('subjudul', 'fontWeight') || 'bold'};color:${fc('subjudul', 'color') || '#059669'};text-transform:uppercase;margin-bottom:1mm;font-family:Inter, sans-serif;">${fc('subjudul', 'text') || s?.kartu_subjudul_depan || 'KOPERASI UNIT DESA SARI SUBUR'}</div>` : ''}
      ${f('nama_anggota').show !== false ? `<div style="font-size:${fc('nama_anggota', 'fontSize') || 13}pt;font-weight:${fc('nama_anggota', 'fontWeight') || 'black'};color:${fc('nama_anggota', 'color') || '#0f172a'};text-transform:uppercase;line-height:1.1;font-family:Inter, sans-serif;">${nama}</div>` : ''}
      ${f('nomor_anggota').show !== false ? `<div style="font-size:${fc('nomor_anggota', 'fontSize') || 9}pt;font-weight:${fc('nomor_anggota', 'fontWeight') || 'bold'};color:${fc('nomor_anggota', 'color') || '#059669'};font-family:monospace;background:#f0fdf4;padding:0.3mm 1mm;border-radius:0.5mm;display:inline-block;margin:0.5mm 0;">${nomor_anggota || 'KUD-00000'}</div>` : ''}
      ${f('nik').show !== false && nik !== '-' ? `<div style="font-size:${fc('nik', 'fontSize') || 8}pt;color:${fc('nik', 'color') || '#475569'};line-height:1.4;">NIK: ${nik}</div>` : ''}
      ${f('ttl').show !== false ? `<div style="font-size:${fc('ttl', 'fontSize') || 8}pt;color:${fc('ttl', 'color') || '#475569'};line-height:1.4;">TTL: ${ttlText}</div>` : ''}
      ${f('jenis_kelamin').show !== false ? `<div style="font-size:${fc('jenis_kelamin', 'fontSize') || 8}pt;color:${fc('jenis_kelamin', 'color') || '#475569'};line-height:1.4;">JK: ${jenisKelamin}</div>` : ''}
      ${f('no_wa').show !== false ? `<div style="font-size:${fc('no_wa', 'fontSize') || 8}pt;color:${fc('no_wa', 'color') || '#475569'};line-height:1.4;">WA: ${noWa}</div>` : ''}
      ${f('no_kk').show !== false ? `<div style="font-size:${fc('no_kk', 'fontSize') || 8}pt;color:${fc('no_kk', 'color') || '#475569'};line-height:1.4;">No KK: ${noKk}</div>` : ''}
      ${f('alamat').show !== false && alamatJalan ? `<div style="font-size:${fc('alamat', 'fontSize') || 8}pt;color:${fc('alamat', 'color') || '#475569'};line-height:1.4;">${alamatJalan}</div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:0.3mm;border-top:0.5px solid #f1f5f9;">
        ${f('berlaku').show !== false ? `<div style="font-size:${fc('berlaku', 'fontSize') || 7}pt;color:${fc('berlaku', 'color') || '#94a3b8'};"><span style="font-weight:700;font-size:9pt;color:#0f172a;">${terbit} - ${berlaku}</span></div>` : ''}
        ${f('qr_code').show !== false ? `<div style="width:18mm;height:18mm;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(nomor_anggota || 'KUD')}" alt="QR" style="width:100%;height:100%;image-rendering:pixelated;" /></div>` : ''}
      </div>
    </div>
  </div>
  <div class="page back">
    ${b('header_website').show !== false ? `<div class="back-header" style="font-size:${bc('header_website', 'fontSize') || 6}pt;font-weight:${bc('header_website', 'fontWeight') || 'bold'};color:${bc('header_website', 'color') || '#ffffff'};background:${backBg};">${b('header_website').text || website}</div>` : ''}
    <div class="back-body">
      <div>
        ${b('aturan_list').show !== false ? `<div style="font-size:${bc('aturan_list', 'fontSize') || 7}pt;color:${bc('aturan_list', 'color') || '#475569'};"><div style="font-size:8pt;font-weight:700;color:#0f172a;margin-bottom:0.5mm;">${b('aturan_list').text || 'Kartu Tanda Anggota:'}</div><ul style="list-style:none;padding:0;margin:0;">${aturanHtml}</ul></div>` : ''}
        ${b('sekretariat').show !== false ? `<div style="font-size:${bc('sekretariat', 'fontSize') || 7}pt;color:${bc('sekretariat', 'color') || '#475569'};margin-top:0.5mm;padding-top:0.5mm;border-top:0.5px solid #e2e8f0;"><span style="font-weight:700;color:#0f172a;">${b('sekretariat').text || 'Sekretariat:'}</span> ${s?.alamat || '-'}</div>` : ''}
      </div>
      <div class="back-footer">
        ${b('slogan').show !== false ? `<div style="font-size:${bc('slogan', 'fontSize') || 16}pt;font-weight:${bc('slogan', 'fontWeight') || 'black'};font-style:italic;color:${bc('slogan', 'color') || '#0f172a'};text-transform:uppercase;font-family:Inter, sans-serif;">${slogan}</div>` : ''}
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
      <div className="flex flex-col items-center justify-between shrink-0 p-3" style={{
        width: leftPanelW + 'px',
        background: templateStyle.frontLeftBg(fBg),
        minHeight: 190,
      }}>
        {f('logo_kud').show !== false && (logo ? (
          <img src={logo} alt="" className="object-contain rounded-xl border border-white/20 shadow-lg" style={{ width: fc('logo_kud', 'width') || 52, height: fc('logo_kud', 'width') || 52 }} />
        ) : (
          <div className="w-[52px] h-[52px] rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">KUD</div>
        ))}
        {f('nama_kud').show !== false && (
          <div className="text-center">
            <div className="uppercase tracking-wider leading-tight" style={{
              fontSize: (fc('nama_kud', 'fontSize') || 10) + 'px',
              fontWeight: fc('nama_kud', 'fontWeight') || 'bold',
              color: fc('nama_kud', 'color') || '#ffffff',
              fontFamily: `'${fc('nama_kud', 'fontFamily') || 'Inter'}', sans-serif`,
            }}>{fc('nama_kud', 'text') || s?.nama_kud || 'KUD Sari Subur'}</div>
          </div>
        )}
        {f('foto_pekebun').show !== false && (foto ? (
          <img src={foto} alt="" className="object-cover rounded-lg border-2 border-white/40 shadow-md" style={{ width: fc('foto_pekebun', 'width') || 50, height: fc('foto_pekebun', 'height') || 66 }} />
        ) : (
          <div className="rounded-lg border-2 border-white/40 bg-white/10 flex items-center justify-center text-lg font-bold text-white/40" style={{ width: fc('foto_pekebun', 'width') || 50, height: fc('foto_pekebun', 'height') || 66 }}>{initial}</div>
        ))}
      </div>
      <div className="bg-white p-3.5 flex flex-col relative" style={{ width: rightPanelW + 'px' }}>
        {f('watermark').show !== false && logo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: fc('watermark', 'opacity') || 0.04 }}>
            <img src={logo} alt="" className="w-32 h-32 object-contain" />
          </div>
        )}
        {f('judul').show !== false && (
          <div className="tracking-wide uppercase border-b border-slate-200 pb-0.5" style={{
            fontSize: (fc('judul', 'fontSize') || 11) + 'px',
            fontWeight: fc('judul', 'fontWeight') || 'black',
            color: fc('judul', 'color') || '#0f172a',
            fontFamily: `'${fc('judul', 'fontFamily') || 'Inter'}', sans-serif`,
          }}>{fc('judul', 'text') || s?.kartu_judul_depan || 'KARTU TANDA ANGGOTA'}</div>
        )}
        {f('subjudul').show !== false && (
          <div className="uppercase mb-1.5" style={{
            fontSize: (fc('subjudul', 'fontSize') || 7) + 'px',
            fontWeight: fc('subjudul', 'fontWeight') || 'bold',
            color: fc('subjudul', 'color') || '#059669',
            fontFamily: `'${fc('subjudul', 'fontFamily') || 'Inter'}', sans-serif`,
          }}>{fc('subjudul', 'text') || s?.kartu_subjudul_depan || 'KOPERASI UNIT DESA SARI SUBUR'}</div>
        )}
        {f('nama_anggota').show !== false && (
          <div className="uppercase leading-tight" style={{
            fontSize: (fc('nama_anggota', 'fontSize') || 13) + 'px',
            fontWeight: fc('nama_anggota', 'fontWeight') || 'black',
            color: fc('nama_anggota', 'color') || '#0f172a',
            fontFamily: `'${fc('nama_anggota', 'fontFamily') || 'Inter'}', sans-serif`,
          }}>{nama}</div>
        )}
        {f('nomor_anggota').show !== false && (
          <div className="inline-block mt-0.5 mb-1 px-1.5 py-0.5 rounded font-mono" style={{
            fontSize: (fc('nomor_anggota', 'fontSize') || 9) + 'px',
            fontWeight: fc('nomor_anggota', 'fontWeight') || 'bold',
            color: fc('nomor_anggota', 'color') || '#059669',
            background: `${fc('nomor_anggota', 'color') || '#059669'}15`,
          }}>{nomor_anggota || '-'}</div>
        )}
        <div className="space-y-0.5 font-medium" style={{ fontSize: (fc('nik', 'fontSize') || 8) + 'px', color: fc('nik', 'color') || '#475569' }}>
          {f('nik').show !== false && nik !== '-' && <p>NIK: {nik}</p>}
          {f('ttl').show !== false && <p>TTL: {ttlText}</p>}
          {f('jenis_kelamin').show !== false && <p>JK: {jenisKelamin}</p>}
          {f('no_wa').show !== false && <p>WA: {noWa}</p>}
          {f('no_kk').show !== false && <p>No KK: {noKk}</p>}
          {f('alamat').show !== false && alamatJalan && <p className="leading-snug">{alamatJalan}</p>}
        </div>
        <div className="flex items-end justify-between mt-auto pt-1 border-t border-slate-100">
          {f('berlaku').show !== false && (
            <div>
              <p className="text-[7px] text-slate-400 font-semibold">Berlaku</p>
              <p className="font-bold text-slate-800" style={{ fontSize: (fc('berlaku', 'fontSize') || 9) + 'px', color: fc('berlaku', 'color') || '#0f172a' }}>{terbit} - {berlaku}</p>
            </div>
          )}
          {f('qr_code').show !== false && (
            <div className="shrink-0">
              <QRCodeSvg value={nomor_anggota} size={55} />
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
        <div className="text-white text-center py-1.5 font-bold text-xs tracking-wider" style={{
          fontSize: (bc('header_website', 'fontSize') || 6) + 'px',
          fontWeight: bc('header_website', 'fontWeight') || 'bold',
          color: bc('header_website', 'color') || '#ffffff',
          background: templateStyle.backHeaderBg(bBg),
        }}>
          {b('header_website').text || website}
        </div>
      )}
      <div className="bg-white p-3.5 flex flex-col min-h-[190px]">
        <div className="flex-1">
          {b('aturan_list').show !== false && (
            <>
              <h4 className="text-[9px] font-bold text-slate-900 mb-1">{b('aturan_list').text || 'Kartu Tanda Anggota:'}</h4>
              <ul className="space-y-0.5">
                {aturan.map((item, i) => (
                  <li key={i} className="flex items-start gap-1 leading-tight" style={{ fontSize: (bc('aturan_list', 'fontSize') || 7) + 'px', color: bc('aturan_list', 'color') || '#475569' }}>
                    <span className="mt-[3px] w-[4px] h-[4px] rounded-full shrink-0" style={{ background: fc('subjudul', 'color') || '#059669' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          {b('sekretariat').show !== false && (
            <div className="mt-1.5 pt-1 border-t border-slate-100" style={{ fontSize: (bc('sekretariat', 'fontSize') || 7) + 'px', color: bc('sekretariat', 'color') || '#475569' }}>
              <span className="font-bold text-slate-800">{b('sekretariat').text || 'Sekretariat KUD:'}</span> {s?.alamat || '-'}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mt-1.5">
          {b('slogan').show !== false && (
            <div className="font-black italic uppercase tracking-wider leading-none" style={{
              fontSize: (bc('slogan', 'fontSize') || 16) + 'px',
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
              <div className="flex items-center justify-end gap-0.5 my-0.5 min-h-[55px]">
                {stempelUrl && <img src={stempelUrl} alt="" className="object-contain mix-blend-multiply" style={{ height: 50, width: 'auto' }} />}
                {ttdUrl && <img src={ttdUrl} alt="" className="object-contain" style={{ height: 30, width: 'auto' }} />}
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
            <h3 className="text-lg font-bold text-foreground">Kartu Anggota KUD</h3>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadPng} disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-foreground rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-all cursor-pointer disabled:opacity-50">
                <ArrowDownTrayIcon className="w-4 h-4" />
                {downloading ? '...' : 'PNG'}
              </button>
              <button onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer" style={{ background: fc('subjudul', 'color') || '#059669' }}>
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
          <div ref={containerRef} className="w-full max-w-full" style={{ maxWidth: '540px' }}>
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
          <p className="text-[10px] text-gray-400">Cetak: sisi depan &bull; sisi belakang (2 halaman)</p>
        </div>
      </div>
    </div>
  );
}
