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
    isLuxury: false,
  },
  modern: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0d9488'}, ${cfg?.color2 || '#0f766e'})`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#0d9488'}, ${cfg?.color2 || '#0f766e'})`,
    leftPanelPct: 32,
    corner: 'rounded-lg',
    isLuxury: false,
  },
  dark: {
    frontLeftBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#334155'}, ${cfg?.color2 || '#1e293b'}, #0f172a)`,
    backHeaderBg: (cfg) => `linear-gradient(${cfg?.angle || 135}deg, ${cfg?.color1 || '#334155'}, ${cfg?.color2 || '#1e293b'})`,
    leftPanelPct: 35,
    corner: 'rounded-xl',
    isLuxury: false,
  },
  luxury: {
    frontLeftBg: () => '#121212',
    backHeaderBg: () => '#121212',
    leftPanelPct: 38,
    corner: 'rounded-xl',
    isLuxury: true,
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
      const cardHtml = buildCardHtml();
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:480px;background:#ffffff;z-index:-9999;padding:8px';
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

  const buildCardHtml = () => {
    if (templateStyle.isLuxury) {
      return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:12px;font-family:Inter,'Segoe UI',Roboto,system-ui,sans-serif;">
    <div style="width:480px;background:#121212;border:1px solid #d4af37;border-radius:6px;overflow:hidden;position:relative;min-height:170px;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
      <div style="position:absolute;top:0;left:0;background:linear-gradient(135deg,#d4af37 0%,#f3e5ab 40%,#aa7c11 100%);border-radius:0 0 40px 0;padding:10px 28px 10px 14px;">
        <div style="color:#121212;font-weight:900;font-size:${fc('nama_admin', 'fontSize') || 12}px;text-transform:uppercase;letter-spacing:0.5px;line-height:1.2;">${nama || 'Admin KUD'}</div>
        <div style="color:#121212;font-size:${fc('jabatan', 'fontSize') || 8}px;font-weight:600;text-transform:uppercase;letter-spacing:1px;opacity:0.8;">${jabatan || 'Administrator'}</div>
      </div>
      <div style="position:absolute;bottom:12px;left:14px;display:flex;flex-direction:column;gap:3px;">
        <div style="display:flex;align-items:center;gap:5px;"><span style="font-size:10px;color:#d4af37;">📞</span><span style="font-size:8px;color:#e5e5e5;letter-spacing:0.3px;">${s?.telepon || '+62 851-6988-3337'}</span></div>
        <div style="display:flex;align-items:center;gap:5px;"><span style="font-size:10px;color:#d4af37;">✉️</span><span style="font-size:8px;color:#e5e5e5;letter-spacing:0.3px;">${s?.email || 'admin@kud-sari-subur.my.id'}</span></div>
        <div style="display:flex;align-items:center;gap:5px;"><span style="font-size:10px;color:#d4af37;">📍</span><span style="font-size:8px;color:#e5e5e5;letter-spacing:0.3px;">${s?.alamat || 'DESA TEGAL SARI, MUSI RAWAS'}</span></div>
      </div>
      <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:72px;height:72px;padding:4px;border-radius:6px;background:#ffffff;border:2px solid #d4af37;display:flex;align-items:center;justify-content:center;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(nomor_induk || nama)}" alt="QR" style="width:64px;height:64px;" />
        </div>
        <span style="font-size:7px;color:#d4af37;font-family:monospace;letter-spacing:0.5px;">ID: ${nomor_induk || 'ADM-001'}</span>
      </div>
      ${logo ? `<div style="position:absolute;bottom:8px;right:12px;opacity:0.08;"><img src="${logo}" style="width:40px;height:40px;object-fit:contain;" /></div>` : ''}
    </div>
    <div style="width:480px;background:#121212;border:1px solid #d4af37;border-radius:6px;overflow:hidden;min-height:170px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:14px 16px;position:relative;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
      <div style="position:absolute;top:0;left:10%;right:10%;height:3px;border-radius:0 0 3px 3px;background:linear-gradient(90deg,transparent,#d4af37,transparent);"></div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        ${logo ? `<img src="${logo}" style="width:40px;height:40px;object-fit:contain;margin-bottom:6px;" />` : ''}
        <div style="font-size:16px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#d4af37;">${s?.nama_kud || 'KUD SARI SUBUR'}</div>
        <div style="font-size:8px;color:#9ca3af;letter-spacing:1px;margin-top:2px;text-transform:uppercase;">Koperasi Modern & Terpercaya</div>
      </div>
      <div style="width:100%;background:linear-gradient(135deg,#d4af37 0%,#f3e5ab 40%,#aa7c11 100%);border-radius:6px;padding:5px 0;text-align:center;">
        <span style="color:#121212;font-weight:900;font-size:8px;letter-spacing:2px;text-transform:uppercase;">${website || 'www.kud-sari-subur.my.id'}</span>
      </div>
    </div>
  </div>`;
    }

    const leftBg = templateStyle.frontLeftBg(fBg);
    const backBg = templateStyle.backHeaderBg(bBg);

    const logoHtml = logo ? `<img src="${logo}" alt="" style="width:${fc('logo_kud', 'width') || 48}px;height:${fc('logo_kud', 'width') || 48}px;object-fit:contain;border-radius:4px;border:1px solid rgba(255,255,255,0.3);" />`
      : '<div style="width:48px;height:48px;border-radius:4px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:800;color:rgba(255,255,255,0.5);">KUD</div>';
    const fotoHtml = foto ? `<img src="${foto}" alt="" style="width:${fc('foto_admin', 'width') || 46}px;height:${fc('foto_admin', 'height') || 60}px;object-fit:cover;border-radius:3px;border:2px solid rgba(255,255,255,0.5);" />`
      : `<div style="width:46px;height:60px;border-radius:3px;border:2px solid rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:700;color:rgba(255,255,255,0.4);">${initial}</div>`;
    const ttdHtml = ttdUrl ? `<img src="${ttdUrl}" alt="TTD" style="height:26px;width:auto;object-fit:contain;" />` : '';
    const stempelHtml = stempelUrl ? `<img src="${stempelUrl}" alt="Stempel" style="height:44px;width:auto;object-fit:contain;margin-right:4px;mix-blend-mode:multiply;" />` : '';
    const aturanHtml = aturan.map((a) => `<li>${a}</li>`).join('');

    return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:12px;font-family:Inter,'Segoe UI',Roboto,system-ui,sans-serif;">
    <div style="width:480px;overflow:hidden;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
      <div style="display:flex;">
        <div style="width:${leftPanelPct}%;padding:12px 8px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;background:${leftBg};">
          ${f('logo_kud').show !== false ? logoHtml : ''}
          ${f('nama_kud').show !== false ? `<div style="font-size:${fc('nama_kud', 'fontSize') || 9}px;font-weight:${fc('nama_kud', 'fontWeight') || 'bold'};color:${fc('nama_kud', 'color') || '#ffffff'};text-align:center;text-transform:uppercase;">${fc('nama_kud', 'text') || s?.nama_kud || 'KUD Sari Subur'}</div>` : ''}
          ${f('foto_admin').show !== false ? fotoHtml : ''}
        </div>
        <div style="width:${100 - leftPanelPct}%;background:#ffffff;padding:12px;display:flex;flex-direction:column;position:relative;">
          ${f('watermark').show !== false && logo ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:${fc('watermark', 'opacity') || 0.04};pointer-events:none;"><img src="${logo}" style="width:112px;height:112px;object-fit:contain;" /></div>` : ''}
          ${f('judul').show !== false ? `<div style="font-size:${fc('judul', 'fontSize') || 10}px;font-weight:${fc('judul', 'fontWeight') || '900'};color:${fc('judul', 'color') || '#0f172a'};text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;padding-bottom:2px;margin-bottom:2px;">${fc('judul', 'text') || 'KARTU IDENTITAS ADMIN'}</div>` : ''}
          ${f('subjudul').show !== false ? `<div style="font-size:${fc('subjudul', 'fontSize') || 6}px;font-weight:${fc('subjudul', 'fontWeight') || 'bold'};color:${fc('subjudul', 'color') || '#6366f1'};text-transform:uppercase;margin-bottom:3px;">${fc('subjudul', 'text') || 'KOPERASI UNIT DESA SARI SUBUR'}</div>` : ''}
          ${f('nama_admin').show !== false ? `<div style="font-size:${fc('nama_admin', 'fontSize') || 12}px;font-weight:${fc('nama_admin', 'fontWeight') || '900'};color:${fc('nama_admin', 'color') || '#0f172a'};text-transform:uppercase;line-height:1.2;">${nama}</div>` : ''}
          ${f('jabatan').show !== false ? `<div style="font-size:${fc('jabatan', 'fontSize') || 8}px;font-weight:${fc('jabatan', 'fontWeight') || '600'};color:${fc('jabatan', 'color') || '#475569'};background:#f1f5f9;padding:1px 4px;border-radius:2px;display:inline-block;margin:2px 0;">${jabatan}</div>` : ''}
          ${f('nip').show !== false && nip !== '-' ? `<div style="font-size:${fc('nip', 'fontSize') || 8}px;color:${fc('nip', 'color') || '#475569'};">NIP: ${nip}</div>` : ''}
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:4px;border-top:1px solid #f1f5f9;">
            <div><div style="font-size:7px;color:#94a3b8;">Berlaku</div><div style="font-size:8px;font-weight:bold;color:#0f172a;">${terbit} - ${berlakuTxt}</div></div>
            ${f('qr_code').show !== false ? `<div style="width:48px;height:48px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(nomor_induk || nama)}" alt="QR" style="width:100%;height:100%;" /></div>` : ''}
          </div>
        </div>
      </div>
    </div>
    <div style="width:480px;overflow:hidden;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
      ${b('header_website').show !== false ? `<div style="font-size:${bc('header_website', 'fontSize') || 6}px;font-weight:${bc('header_website', 'fontWeight') || 'bold'};color:${bc('header_website', 'color') || '#ffffff'};text-align:center;padding:3px 12px;background:${backBg};">${b('header_website').text || website}</div>` : ''}
      <div style="background:#ffffff;padding:12px;display:flex;flex-direction:column;min-height:170px;">
        <div style="flex:1;">
          ${b('aturan_list').show !== false ? `<div style="font-size:${bc('aturan_list', 'fontSize') || 7}px;color:${bc('aturan_list', 'color') || '#475569'};"><div style="font-size:7px;font-weight:bold;color:#0f172a;margin-bottom:1px;">Aturan:</div><ul style="list-style:none;padding:0;margin:0;">${aturanHtml}</ul></div>` : ''}
          ${b('sekretariat').show !== false ? `<div style="font-size:${bc('sekretariat', 'fontSize') || 7}px;color:${bc('sekretariat', 'color') || '#475569'};margin-top:3px;padding-top:3px;border-top:1px solid #e2e8f0;"><span style="font-weight:bold;color:#0f172a;">Sekretariat KUD:</span> ${s?.alamat || '-'}</div>` : ''}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:4px;">
          ${b('slogan').show !== false ? `<div style="font-size:${bc('slogan', 'fontSize') || 14}px;font-weight:${bc('slogan', 'fontWeight') || '900'};font-style:italic;color:${bc('slogan', 'color') || '#0f172a'};text-transform:uppercase;">${slogan}</div>` : ''}
          <div style="text-align:right;font-size:${bc('kota_tanggal', 'fontSize') || 7}px;color:${bc('kota_tanggal', 'color') || '#64748b'};">
            ${b('kota_tanggal').show !== false ? `<div>${kotaTerbit}, ${terbit}</div>` : ''}
            ${b('jabatan_ketua').show !== false ? `<div style="font-weight:600;font-size:${bc('jabatan_ketua', 'fontSize') || 8}px;color:${bc('jabatan_ketua', 'color') || '#475569'};">${ketuaJabatan}</div>` : ''}
            ${b('ttd_stempel').show !== false ? `<div style="display:flex;align-items:center;justify-content:flex-end;gap:2px;min-height:48px;">${stempelHtml}${ttdHtml}</div>` : ''}
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

  const goldColor = '#d4af37';
  const goldLight = '#f3e5ab';
  const goldDark = '#aa7c11';

  const frontCard = () => {
    if (templateStyle.isLuxury) {
      return (
        <div className="overflow-hidden rounded-xl" style={{
          width: '100%', maxWidth: cardW + 'px',
          background: '#121212',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
          border: '1px solid #d4af37',
          position: 'relative',
          minHeight: 170,
        }}>
          {/* Gold Badge */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            background: `linear-gradient(135deg, ${goldColor} 0%, ${goldLight} 40%, ${goldDark} 100%)`,
            borderRadius: '0 0 40px 0',
            padding: '10px 28px 10px 14px',
          }}>
            <div style={{ color: '#121212', fontWeight: 900, fontSize: (fc('nama_admin', 'fontSize') || 12) + 'px', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>
              {nama || 'Admin KUD'}
            </div>
            <div style={{ color: '#121212', fontSize: (fc('jabatan', 'fontSize') || 8) + 'px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
              {jabatan || 'Administrator'}
            </div>
          </div>

          {/* Contact Info */}
          <div style={{
            position: 'absolute', bottom: 12, left: 14,
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {[
              { icon: '📞', label: s?.telepon || '+62 851-6988-3337' },
              { icon: '✉️', label: s?.email || 'admin@kud-sari-subur.my.id' },
              { icon: '📍', label: s?.alamat || 'DESA TEGAL SARI, MUSI RAWAS' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 10, color: goldColor }}>{item.icon}</span>
                <span style={{ fontSize: 8, color: '#e5e5e5', letterSpacing: '0.3px' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* QR Code */}
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 72, height: 72, padding: 4, borderRadius: 8,
              background: '#ffffff', border: `2px solid ${goldColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QRCodeSvg value={nomor_induk || nama} size={64} />
            </div>
            <span style={{ fontSize: 7, color: goldColor, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              ID: {nomor_induk || 'ADM-001'}
            </span>
          </div>

          {/* Logo watermark bottom-right */}
          {logo && (
            <div style={{ position: 'absolute', bottom: 8, right: 12, opacity: 0.08 }}>
              <img src={logo} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
          )}
        </div>
      );
    }

    return (
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
  };

  const backCard = () => {
    if (templateStyle.isLuxury) {
      return (
        <div className="overflow-hidden rounded-xl" style={{
          width: '100%', maxWidth: cardW + 'px',
          background: '#121212',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
          border: '1px solid #d4af37',
          minHeight: 170,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          position: 'relative',
        }}>
          {/* Gold accent top bar */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%',
            height: 3, borderRadius: '0 0 3px 3px',
            background: `linear-gradient(90deg, transparent, ${goldColor}, transparent)`,
          }} />

          {/* Logo & Tagline */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {logo && (
              <img src={logo} alt="KUD Logo" style={{ width: 40, height: 40, objectFit: 'contain', marginBottom: 6 }} />
            )}
            <div style={{
              fontSize: 16, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase',
              color: goldColor, fontFamily: 'Inter, sans-serif',
            }}>
              {s?.nama_kud || 'KUD SARI SUBUR'}
            </div>
            <div style={{
              fontSize: 8, color: '#9ca3af', letterSpacing: '1px', marginTop: 2,
              textTransform: 'uppercase',
            }}>
              Koperasi Modern & Terpercaya
            </div>
          </div>

          {/* Gold footer bar */}
          <div style={{
            width: '100%',
            background: `linear-gradient(135deg, ${goldColor} 0%, ${goldLight} 40%, ${goldDark} 100%)`,
            borderRadius: 6,
            padding: '5px 0',
            textAlign: 'center',
          }}>
            <span style={{
              color: '#121212', fontWeight: 900, fontSize: 8,
              letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              {website || 'www.kud-sari-subur.my.id'}
            </span>
          </div>
        </div>
      );
    }

    return (
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
  };

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
