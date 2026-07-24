'use client';

import { useRef } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const CARD_STYLES = `
  @page { size: 85.6mm 53.98mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .card {
    width: 85.6mm;
    height: 53.98mm;
    position: relative;
    overflow: hidden;
    display: flex;
  }
  .card-left {
    width: 48%;
    padding: 4mm 3mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2mm;
  }
  .card-left .logo {
    width: 16mm;
    height: 16mm;
    object-fit: contain;
    border-radius: 2mm;
  }
  .card-left .kud-name {
    font-size: 7pt;
    font-weight: 800;
    text-align: center;
    line-height: 1.2;
    text-transform: uppercase;
  }
  .card-left .kud-alamat {
    font-size: 5pt;
    text-align: center;
    line-height: 1.3;
    opacity: 0.8;
  }
  .card-right {
    width: 52%;
    padding: 3mm 3mm 3mm 2mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .card-right .title {
    font-size: 5.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1.5mm;
    opacity: 0.7;
  }
  .card-right .member-name {
    font-size: 9pt;
    font-weight: 800;
    margin-bottom: 0.5mm;
  }
  .card-right .member-detail {
    font-size: 6pt;
    line-height: 1.5;
    opacity: 0.8;
  }
  .card-right .member-detail span {
    display: inline-block;
    min-width: 25mm;
  }
  .card-right .member-photo {
    width: 12mm;
    height: 15mm;
    object-fit: cover;
    border-radius: 1mm;
    position: absolute;
    top: 3mm;
    right: 3mm;
    border: 0.5px solid rgba(0,0,0,0.1);
  }
  .card-right .divider {
    height: 0.5px;
    background: rgba(0,0,0,0.15);
    margin: 1.5mm 0;
  }
  .card-right .nomor-anggota {
    font-size: 6.5pt;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .card-right .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
  }
  .card-right .footer .valid {
    font-size: 5pt;
    opacity: 0.6;
  }
  .card-right .footer .signature {
    text-align: right;
    font-size: 4.5pt;
  }
  .card-right .footer .signature img {
    height: 6mm;
    object-fit: contain;
    display: block;
    margin-left: auto;
  }
  .card-right .footer .signature .title {
    font-size: 4.5pt;
    margin-top: 0.5mm;
  }
  .card-bg {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    pointer-events: none;
  }
  @media screen {
    body { padding: 20px; display: flex; justify-content: center; }
    .card { border-radius: 3mm; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
  }
`;

export default function KartuAnggotaKud({ data, onClose, width = 300 }) {
  const iframeRef = useRef(null);

  if (!data) return null;

  const { pekebun, setting_kud, pengaturan, nomor_anggota, tanggal_terbit, masa_berlaku } = data;
  const kud = setting_kud || {};
  const primary = kud.kartu_warna_primary || '#059669';
  const secondary = kud.kartu_warna_secondary || '#047857';
  const logo = kud.logo || pengaturan?.logo_kud || '';
  const namaKud = kud.nama_kud || pengaturan?.nama_kud || 'KUD Desa Sari Subur';
  const alamatKud = kud.alamat || pengaturan?.alamat_kud || '';
  const namaKetua = kud.nama_ketua || pengaturan?.nama_ketua || '';
  const ttdEnabled = kud.tanda_tangan_kartu !== false;

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(buildHtml());
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(buildHtml());
          win.document.close();
        } else {
          alert('Izinkan popup untuk mencetak');
        }
      }
    }, 800);

    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 120000);
  };

  const buildHtml = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Kartu Anggota - ${pekebun?.nama || ''}</title>
      <style>${CARD_STYLES}</style>
    </head>
    <body>
      <div class="card" style="background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%); color: white;">
        <div class="card-left">
          ${logo ? `<img src="${logo}" alt="Logo" class="logo" />` : `<div style="width:16mm;height:16mm;border-radius:2mm;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:14pt;font-weight:800;">KUD</div>`}
          <div class="kud-name">${namaKud}</div>
          <div class="kud-alamat">${alamatKud}</div>
        </div>
        <div class="card-right" style="background: white; color: #1e293b; border-radius: 0 2.5mm 2.5mm 0; position: relative;">
          <div class="title">Kartu Anggota</div>
          ${pekebun?.foto_pekebun ? `<img src="${pekebun.foto_pekebun}" alt="" class="member-photo" />` : `<div class="member-photo" style="background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:700;color:#94a3b8;">${pekebun?.nama?.charAt(0) || '?'}</div>`}
          <div class="member-name">${pekebun?.nama || '-'}</div>
          <div class="member-detail">
            ${pekebun?.nik ? `<div><span>NIK</span>: ${pekebun.nik}</div>` : ''}
            ${pekebun?.tempat_lahir ? `<div><span>Tempat/Tgl Lahir</span>: ${pekebun.tempat_lahir}${pekebun?.tanggal_lahir ? ', ' + new Date(pekebun.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</div>` : ''}
          </div>
          <div class="divider"></div>
          <div class="nomor-anggota">No. Anggota: ${nomor_anggota || '-'}</div>
          <div class="footer">
            <div class="valid">
              Terbit: ${tanggal_terbit ? new Date(tanggal_terbit).toLocaleDateString('id-ID') : '-'}<br>
              Berlaku: ${masa_berlaku ? new Date(masa_berlaku).toLocaleDateString('id-ID') : '-'}
            </div>
            ${ttdEnabled ? `
            <div class="signature">
              ${kud.ketua_ttd || '' ? `<img src="${kud.ketua_ttd}" alt="TTD" />` : '<div style="height:6mm;"></div>'}
              <div class="title">${namaKetua ? `${namaKetua}<br>Ketua` : 'Ketua KUD'}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

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
          <div
            className="rounded-xl overflow-hidden shadow-lg"
            style={{
              width: width + 'px',
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              color: 'white',
            }}
          >
            <div className="flex" style={{ minHeight: '180px' }}>
              <div className="w-[44%] p-3 flex flex-col items-center justify-center gap-1.5">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">KUD</div>
                )}
                <div className="text-[7px] font-extrabold text-center leading-tight uppercase">{namaKud}</div>
                <div className="text-[5px] text-center leading-tight opacity-80">{alamatKud}</div>
              </div>
              <div className="w-[56%] bg-white rounded-r-xl p-3 relative" style={{ color: '#1e293b' }}>
                <div className="text-[5.5px] font-bold uppercase tracking-wider opacity-60 mb-1">Kartu Anggota</div>
                {pekebun?.foto_pekebun ? (
                  <img src={pekebun.foto_pekebun} alt="" className="w-9 h-11 object-cover rounded absolute top-2 right-2 border border-gray-100" />
                ) : (
                  <div className="w-9 h-11 rounded absolute top-2 right-2 bg-gray-100 flex items-center justify-center text-[7px] font-bold text-gray-400 border border-gray-100">
                    {pekebun?.nama?.charAt(0) || '?'}
                  </div>
                )}
                <div className="text-[9px] font-extrabold mb-0.5">{pekebun?.nama || '-'}</div>
                <div className="text-[6px] leading-relaxed opacity-80">
                  {pekebun?.nik ? <div><span className="inline-block w-[72px]">NIK</span>: {pekebun.nik}</div> : ''}
                  {pekebun?.tempat_lahir ? <div><span className="inline-block w-[72px]">Tgl Lahir</span>: {pekebun.tempat_lahir}{pekebun?.tanggal_lahir ? ', ' + new Date(pekebun.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div> : ''}
                </div>
                <div className="h-px bg-gray-200 my-1.5"></div>
                <div className="text-[6.5px] font-bold tracking-wide">No: {nomor_anggota || '-'}</div>
                <div className="flex justify-between items-end mt-auto pt-0.5">
                  <div className="text-[5px] opacity-60">
                    Terbit: {tanggal_terbit ? new Date(tanggal_terbit).toLocaleDateString('id-ID') : '-'}<br />
                    Berlaku: {masa_berlaku ? new Date(masa_berlaku).toLocaleDateString('id-ID') : '-'}
                  </div>
                  {ttdEnabled && (
                    <div className="text-right">
                      <div className="text-[4.5px] mt-0.5 font-medium text-gray-500">Ketua KUD</div>
                      <div className="text-[4.5px] mt-0.5">{namaKetua || ''}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
