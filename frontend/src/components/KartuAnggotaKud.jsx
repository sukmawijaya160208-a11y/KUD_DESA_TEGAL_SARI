'use client';

import { useRef, useMemo } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const QR_PATTERN = Array.from({ length: 25 }, (_, i) => ({
  x: 3 + ((i * 7 + 5) % 34),
  y: 3 + ((i * 11 + 3) % 34),
}));

const CARD_STYLES = `
  @page { size: 85.6mm 53.98mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .card { display: flex; width: 85.6mm; height: 53.98mm; overflow: hidden; }

  .card-left { width: 35%; padding: 3.5mm 2.5mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .card-left-grad { background: linear-gradient(to bottom, #064e3b, #065f46, #0f172a); }
  .card-left .logo { width: 14mm; height: 14mm; object-fit: contain; border-radius: 2mm; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 0 6px rgba(255,255,255,0.12); }
  .card-left .logo-fallback { width: 14mm; height: 14mm; border-radius: 2mm; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 12pt; font-weight: 800; color: rgba(255,255,255,0.5); }
  .card-left .kud-name { font-size: 6.5pt; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; color: #a7f3d0; line-height: 1.2; }
  .card-left .kud-alamat { font-size: 4.5pt; text-align: center; color: rgba(167, 243, 208, 0.65); line-height: 1.3; }
  .card-left .qr { width: 11mm; height: 11mm; background: white; padding: 0.8mm; border-radius: 1.5mm; }

  .card-right { width: 65%; background: white; padding: 3mm 3.5mm; display: flex; flex-direction: column; }
  .card-right .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1mm; }
  .card-right .badge { font-size: 4.5pt; font-weight: 700; padding: 0.5mm 1.5mm; border-radius: 1.5mm; text-transform: uppercase; background: #d1fae5; color: #065f46; }
  .card-right .member-photo { width: 11mm; height: 14mm; object-fit: cover; border-radius: 1.5mm; border: 1.5px solid #059669; }
  .card-right .member-photo-fb { width: 11mm; height: 14mm; border-radius: 1.5mm; border: 1.5px solid #059669; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 7pt; font-weight: 700; color: #94a3b8; }
  .card-right .member-name { font-size: 8pt; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 0.5px solid #f1f5f9; padding-bottom: 0.5mm; margin-bottom: 0.8mm; }
  .card-right .data-row { display: flex; font-size: 5.5pt; line-height: 1.6; }
  .card-right .data-row .lbl { width: 20mm; color: #64748b; font-weight: 600; flex-shrink: 0; }
  .card-right .data-row .val { color: #0f172a; font-weight: 500; }
  .card-right .no-badge { background: #0f172a; color: #34d399; font-family: monospace; font-weight: 700; font-size: 5.5pt; padding: 0.3mm 1.5mm; border-radius: 1mm; display: inline-block; }
  .card-right .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 0.5mm; }
  .card-right .footer .left { font-size: 4.5pt; color: #94a3b8; }
  .card-right .footer .signature { text-align: right; font-size: 4.5pt; }
  .card-right .footer .signature .ttd-area { height: 5.5mm; display: flex; align-items: center; justify-content: flex-end; }
  .card-right .footer .signature .ttd-area img { height: 5.5mm; object-fit: contain; display: block; margin-left: auto; }
  .card-right .footer .signature .nama-terang { font-weight: 700; font-size: 4.5pt; color: #0f172a; text-transform: uppercase; }

  @media screen {
    body { padding: 20px; display: flex; justify-content: center; background: #f8fafc; }
    .card { border-radius: 3mm; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
    .card-left { border-radius: 3mm 0 0 3mm; }
    .card-right { border-radius: 0 3mm 3mm 0; }
  }
`;

function formatTgl(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTglShort(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function QrSvg() {
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="40" height="40" fill="white" rx="3" />
      <rect x="2" y="2" width="12" height="12" fill="#0f172a" rx="2" />
      <rect x="4" y="4" width="8" height="8" fill="white" rx="1" />
      <rect x="26" y="2" width="12" height="12" fill="#0f172a" rx="2" />
      <rect x="28" y="4" width="8" height="8" fill="white" rx="1" />
      <rect x="2" y="26" width="12" height="12" fill="#0f172a" rx="2" />
      <rect x="4" y="28" width="8" height="8" fill="white" rx="1" />
      {QR_PATTERN.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width="2" height="2" fill="#0f172a" rx="0.3" />
      ))}
    </svg>
  );
}

function qrSvgString() {
  const dots = QR_PATTERN.map((p) => `<rect x="${p.x}" y="${p.y}" width="2" height="2" fill="#0f172a" rx="0.3"/>`).join('');
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="white" rx="3"/><rect x="2" y="2" width="12" height="12" fill="#0f172a" rx="2"/><rect x="4" y="4" width="8" height="8" fill="white" rx="1"/><rect x="26" y="2" width="12" height="12" fill="#0f172a" rx="2"/><rect x="28" y="4" width="8" height="8" fill="white" rx="1"/><rect x="2" y="26" width="12" height="12" fill="#0f172a" rx="2"/><rect x="4" y="28" width="8" height="8" fill="white" rx="1"/>${dots}</svg>`;
}

export default function KartuAnggotaKud({ data, onClose, width = 300 }) {
  const iframeRef = useRef(null);

  if (!data) return null;

  const { pekebun, setting_kud, pengaturan, nomor_anggota, tanggal_terbit, masa_berlaku } = data;
  const kud = setting_kud || {};
  const logo = kud.logo || pengaturan?.logo_kud || '';
  const namaKud = kud.nama_kud || pengaturan?.nama_kud || 'KUD SARI SUBUR';
  const alamatKud = kud.alamat || pengaturan?.alamat_kud || 'Desa Tegalsari, Kec. Megang Sakti, Kab. Musi Rawas';
  const namaKetua = kud.nama_ketua || pengaturan?.nama_ketua || '';
  const ttdEnabled = kud.tanda_tangan_kartu !== false;
  const ttd = kud.ketua_ttd || '';
  const foto = pekebun?.foto_pekebun || '';
  const nama = pekebun?.nama || '-';
  const nik = pekebun?.nik || '-';
  const initial = nama.charAt(0) || '?';
  const tempatLahir = pekebun?.tempat_lahir || '';
  const tglLahir = pekebun?.tanggal_lahir || '';
  const ttl = tempatLahir ? `${tempatLahir}${tglLahir ? ', ' + formatTgl(tglLahir) : ''}` : (tglLahir ? formatTgl(tglLahir) : '-');
  const terbit = formatTgl(tanggal_terbit);
  const berlaku = formatTgl(masa_berlaku);
  const kotaTgl = `Megang Sakti, ${terbit}`;

  const handlePrint = () => {
    const html = buildHtml();
    const tryPrint = (doc) => {
      try { doc.focus(); doc.print(); } catch { fallbackPrint(); }
    };
    const fallbackPrint = () => {
      try {
        const win = window.open('', '_blank');
        if (win) { win.document.write(html); win.document.close(); }
        else { window.print(); }
      } catch { window.print(); }
    };

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => tryPrint(iframe.contentWindow), 800);
    setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 120000);
  };

  const buildHtml = () => {
    const qr = qrSvgString();
    const leftLogo = logo
      ? `<img src="${logo}" alt="Logo" class="logo" />`
      : `<div class="logo-fallback">KUD</div>`;
    const photoHtml = foto
      ? `<img src="${foto}" alt="" class="member-photo" />`
      : `<div class="member-photo-fb">${initial}</div>`;
    const signHtml = ttdEnabled ? `
      <div class="signature">
        <div>${kotaTgl}</div>
        <div style="font-weight:600;margin-top:0.3mm">Ketua KUD Sari Subur</div>
        <div class="ttd-area">${ttd ? `<img src="${ttd}" alt="TTD" />` : ''}</div>
        <div class="nama-terang">${namaKetua}</div>
      </div>` : '';
    const nikRow = nik !== '-' ? `<div class="data-row"><span class="lbl">NIK</span><span class="val">${nik}</span></div>` : '';
    const ttlRow = ttl !== '-' ? `<div class="data-row"><span class="lbl">TTL</span><span class="val">${ttl}</span></div>` : '';
    const noAnggota = nomor_anggota ? `<span class="no-badge">${nomor_anggota}</span>` : '<span class="val">-</span>';

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kartu Anggota - ${nama}</title><style>${CARD_STYLES}</style></head><body>
      <div class="card">
        <div class="card-left card-left-grad">
          ${leftLogo}
          <div style="text-align:center">
            <div class="kud-name">${namaKud}</div>
            <div class="kud-alamat" style="margin-top:0.5mm">${alamatKud}</div>
          </div>
          <div class="qr">${qr}</div>
        </div>
        <div class="card-right">
          <div class="header-row">
            <span class="badge">Kartu Anggota Resmi</span>
            ${photoHtml}
          </div>
          <div class="member-name">${nama}</div>
          ${nikRow}
          ${ttlRow}
          <div class="data-row"><span class="lbl">No. Anggota</span>${noAnggota}</div>
          <div class="data-row" style="margin-top:0.3mm"><span class="lbl">Berlaku</span><span class="val">${terbit} s/d ${berlaku}</span></div>
          <div class="footer">
            <div class="left">Terbit: ${terbit}</div>
            ${signHtml}
          </div>
        </div>
      </div>
    </body></html>`;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-border">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Kartu Anggota KUD</h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all cursor-pointer">
              <PrinterIcon className="w-4 h-4" />
              Cetak Kartu
            </button>
            {onClose && (
              <button onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                <span className="w-5 h-5 flex items-center justify-center">&times;</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex rounded-xl overflow-hidden shadow-lg" style={{ width: '100%', maxWidth: width + 'px' }}>
            {/* PANEL KIRI 35% — gradien emerald */}
            <div className="w-[35%] bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 flex flex-col items-center justify-between min-h-[190px]">
              {logo ? (
                <img src={logo} alt="Logo" className="w-14 h-14 object-contain rounded-xl border border-white/20 shadow-lg shadow-black/10" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">KUD</div>
              )}
              <div className="text-center">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 leading-tight">{namaKud}</div>
                <div className="text-[8px] text-emerald-200/70 leading-tight mt-0.5">{alamatKud}</div>
              </div>
              <div className="w-11 h-11 bg-white p-1 rounded-lg shadow-inner">
                <QrSvg />
              </div>
            </div>

            {/* PANEL KANAN 65% — putih */}
            <div className="w-[65%] bg-white p-4 flex flex-col justify-between relative">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Kartu Anggota Resmi</span>
                {foto ? (
                  <img src={foto} alt="" className="w-12 h-[60px] object-cover rounded-xl border-2 border-emerald-600 shrink-0 shadow-sm" />
                ) : (
                  <div className="w-12 h-[60px] rounded-xl border-2 border-emerald-600 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">{initial}</div>
                )}
              </div>

              <div className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1 mb-1.5">{nama}</div>

              <div className="space-y-0.5 text-[11px]">
                {nik !== '-' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium w-[68px] shrink-0">NIK</span>
                    <span className="text-slate-900">{nik}</span>
                  </div>
                )}
                {ttl !== '-' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium w-[68px] shrink-0">TTL</span>
                    <span className="text-slate-900">{ttl}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium w-[68px] shrink-0">No. Anggota</span>
                  <span className="bg-slate-900 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded text-[10px]">{nomor_anggota || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium w-[68px] shrink-0">Berlaku</span>
                  <span className="text-slate-900">{terbit} s/d {berlaku}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-auto pt-1.5 border-t border-slate-50">
                <div className="text-[9px] text-slate-400">Terbit: {terbit}</div>
                {ttdEnabled && (
                  <div className="text-right">
                    <div className="text-[9px] text-slate-500">{kotaTgl}</div>
                    <div className="text-[9px] font-semibold text-slate-600">Ketua KUD Sari Subur</div>
                    {ttd ? (
                      <div className="flex justify-end my-0.5">
                        <img src={ttd} alt="TTD" className="h-7 object-contain" />
                      </div>
                    ) : (
                      <div className="h-7" />
                    )}
                    <div className="text-[9px] font-bold text-slate-900 uppercase">{namaKetua}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
