'use client';

import { useRef, useState } from 'react';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function formatTgl(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}



function BarcodeSvg({ value }) {
  if (!value) return null;
  const chars = (value || 'KUD').split('');
  const barWidth = 2;
  const totalWidth = chars.length * 7 * barWidth;
  const bars = [];
  chars.forEach((ch, ci) => {
    const code = ch.charCodeAt(0).toString(2).padStart(7, '0');
    code.split('').forEach((bit, bi) => {
      if (bit === '1') {
        bars.push({ x: ci * 7 * barWidth + bi * barWidth, width: barWidth });
      }
    });
  });
  return (
    <svg viewBox={`0 0 ${totalWidth || 100} 30`} className="w-full h-full">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.width} height={30} fill="#000" />
      ))}
    </svg>
  );
}

export default function KartuAnggotaKud({ data, width = 360, showActions = true, onClose }) {
  const printRef = useRef(null);
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const {
    pekebun = {},
    setting_kud = {},
    pengaturan = {},
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
  const alamatJalan = pekebun?.alamat || '';
  const initial = nama.charAt(0) || '?';

  const namaKud = s?.nama_kud || 'KUD Sari Subur';
  const alamatKud = s?.alamat || 'Jl. Tegal Sari No. 123, Kec. Tegal Sari';
  const warnaPrimary = s?.kartu_warna_primary || '#059669';
  const warnaSecondary = s?.kartu_warna_secondary || '#047857';
  const warnaBelakang = s?.kartu_belakang_warna || '#028143';
  const ttdUrl = s?.kartu_ttd || '';
  const stempelUrl = s?.kartu_stempel || '';
  const ketuaNama = s?.kartu_ketua_nama || s?.nama_ketua || '-';
  const ketuaJabatan = s?.kartu_ketua_jabatan || 'Ketua KUD Sari Subur';
  const aturan = Array.isArray(s?.kartu_aturan) ? s.kartu_aturan : [
    'Pemegang kartu ini adalah Anggota Resmi KUD Sari Subur.',
    'Pemegang kartu tunduk dan taat kepada AD/ART KUD Sari Subur.',
    'Dilarang menggunakan kartu ini untuk kegiatan yang melanggar hukum.',
    'Kartu ini milik KUD, jika ditemukan harap dikembalikan ke sekretariat.',
  ];
  const slogan = s?.kartu_slogan || 'SAWIT ADALAH KITA';
  const website = s?.website || 'kud-sari-subur.my.id';
  const kotaTerbit = s?.kartu_kota_terbit || 'Megang Sakti';
  const judulDepan = s?.kartu_judul_depan || 'KARTU TANDA ANGGOTA';
  const subjudulDepan = s?.kartu_subjudul_depan || 'KOPERASI UNIT DESA SARI SUBUR';

  const terbit = formatTgl(tanggal_terbit);
  const berlaku = formatTgl(masa_berlaku);
  const cardW = Math.min(width, 500);
  const leftPanelW = Math.round(cardW * 0.35);
  const rightPanelW = cardW - leftPanelW;

  const handlePrint = () => {
    const html = buildPrintHtml();
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch { window.print(); }
    }, 1000);
    setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 120000);
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
      link.download = `KARTU_ANGGOTA_${nama.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
    setDownloading(false);
  };

  const buildPrintHtml = () => {
    const leftBg = `linear-gradient(135deg, ${warnaPrimary}, ${warnaSecondary}, #0f172a)`;
    const backBg = `linear-gradient(135deg, ${warnaBelakang}, ${warnaPrimary})`;

    const logoHtml = logo
      ? `<img src="${logo}" alt="Logo" class="logo" />`
      : `<div class="logo-fb">KUD</div>`;

    const fotoHtml = foto
      ? `<img src="${foto}" alt="" class="foto" />`
      : `<div class="foto-fb">${initial}</div>`;

    const ttdHtml = ttdUrl
      ? `<img src="${ttdUrl}" alt="TTD" class="ttd-img" />`
      : '';

    const stempelHtml = stempelUrl
      ? `<img src="${stempelUrl}" alt="Stempel" class="stempel-img" />`
      : '';

    const aturanHtml = aturan.map((a) => `<li>${a}</li>`).join('');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Kartu Anggota - ${nama}</title>
<style>
  @page { size: 85.6mm 53.98mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 85.6mm; height: 53.98mm; position: relative; overflow: hidden; page-break-after: always; }

  .front { display: flex; }
  .front-left { width: 35%; padding: 3mm 2mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .front-left .logo { width: 14mm; height: 14mm; object-fit: contain; border-radius: 2mm; border: 1px solid rgba(255,255,255,0.3); }
  .front-left .logo-fb { width: 14mm; height: 14mm; border-radius: 2mm; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 10pt; font-weight: 800; color: rgba(255,255,255,0.5); }
  .front-left .kud-name { font-size: 6pt; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; color: rgba(255,255,255,0.9); line-height: 1.2; margin-top: 1mm; }
  .front-left .foto { width: 13mm; height: 17mm; object-fit: cover; border-radius: 1.5mm; border: 2px solid rgba(255,255,255,0.5); }
  .front-left .foto-fb { width: 13mm; height: 17mm; border-radius: 1.5mm; border: 2px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 8pt; font-weight: 700; color: rgba(255,255,255,0.4); }

  .front-right { width: 65%; background: white; padding: 2.5mm 3mm; display: flex; flex-direction: column; position: relative; }
  .front-right .watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.04; pointer-events: none; }
  .front-right .watermark img { width: 40mm; height: 40mm; object-fit: contain; }
  .front-right .title { font-size: 7pt; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 0.5mm; margin-bottom: 0.3mm; }
  .front-right .subtitle { font-size: 5pt; font-weight: 700; color: ${warnaPrimary}; text-transform: uppercase; margin-bottom: 1mm; }
  .front-right .member-name { font-size: 8pt; font-weight: 900; color: #0f172a; text-transform: uppercase; line-height: 1.1; }
  .front-right .member-no { font-size: 5.5pt; font-family: monospace; font-weight: 700; color: ${warnaPrimary}; background: #f0fdf4; padding: 0.3mm 1mm; border-radius: 0.5mm; display: inline-block; margin: 0.5mm 0; }
  .front-right .alamat { font-size: 5pt; color: #475569; line-height: 1.4; margin-top: 0.3mm; }
  .front-right .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 0.3mm; border-top: 0.5px solid #f1f5f9; }
  .front-right .footer .berlaku { font-size: 4.5pt; color: #94a3b8; }
  .front-right .footer .berlaku .val { font-size: 5.5pt; font-weight: 700; color: #0f172a; }
  .front-right .footer .barcode { height: 6mm; width: 18mm; }

  .back { display: flex; flex-direction: column; }
  .back-header { padding: 1.5mm 3mm; text-align: center; font-size: 6pt; font-weight: 700; letter-spacing: 0.5px; color: white; }
  .back-body { flex: 1; padding: 2mm 3mm; display: flex; flex-direction: column; justify-content: space-between; }
  .back-body .aturan-title { font-size: 5.5pt; font-weight: 700; color: #0f172a; margin-bottom: 0.5mm; }
  .back-body .aturan-list { list-style: none; padding: 0; margin: 0; }
  .back-body .aturan-list li { font-size: 4.5pt; color: #475569; line-height: 1.5; padding-left: 2mm; position: relative; }
  .back-body .aturan-list li::before { content: ''; position: absolute; left: 0; top: 2.5pt; width: 1.5pt; height: 1.5pt; border-radius: 50%; background: ${warnaPrimary}; }
  .back-body .sekret { font-size: 4.5pt; color: #475569; margin-top: 0.5mm; padding-top: 0.5mm; border-top: 0.5px solid #e2e8f0; }
  .back-body .sekret .label { font-weight: 700; color: #0f172a; }
  .back-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.5mm; }
  .back-footer .slogan { font-size: 9pt; font-weight: 900; font-style: italic; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px; }
  .back-footer .ttd-area { text-align: right; font-size: 4.5pt; color: #475569; }
  .back-footer .ttd-area .sign-row { display: flex; align-items: center; justify-content: flex-end; gap: 1mm; margin: 0.5mm 0; }
  .back-footer .ttd-area .stempel-img { height: 8mm; width: auto; }
  .back-footer .ttd-area .ttd-img { height: 4mm; width: auto; }
  .back-footer .ttd-area .nama { font-weight: 700; font-size: 5pt; color: #0f172a; text-transform: uppercase; }

  @media screen { body { padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 4mm; background: #f8fafc; } .page { border-radius: 3mm; box-shadow: 0 4px 24px rgba(0,0,0,0.15); } }
</style></head><body>
  <div class="page front" style="background: white; border-radius: 3mm;">
    <div class="front-left" style="background: ${leftBg}; border-radius: 3mm 0 0 3mm;">
      ${logoHtml}
      <div class="kud-name">${namaKud}</div>
      ${fotoHtml}
    </div>
    <div class="front-right">
      <div class="watermark">${logo ? `<img src="${logo}" />` : ''}</div>
      <div class="title">${judulDepan}</div>
      <div class="subtitle">${subjudulDepan}</div>
      <div class="member-name">${nama}</div>
      <div class="member-no">${nomor_anggota || 'KUD-00000'}</div>
      <div class="alamat">${alamatJalan || '-'}</div>
      <div class="footer">
        <div class="berlaku">Berlaku: <span class="val">${terbit} - ${berlaku}</span></div>
        <div class="barcode"><svg viewBox="0 0 100 30" style="width:100%;height:100%">${Array.from({length: 30}, (_, i) => i % 2 === 0 ? `<rect x="${i*3.3}" y="0" width="2" height="30" fill="#000"/>` : '').join('')}</svg></div>
      </div>
    </div>
  </div>

  <div class="page back" style="background: white; border-radius: 3mm;">
    <div class="back-header" style="background: ${backBg};">${website}</div>
    <div class="back-body">
      <div>
        <div class="aturan-title">Kartu Tanda Anggota KUD Sari Subur:</div>
        <ul class="aturan-list">${aturanHtml}</ul>
        <div class="sekret"><span class="label">Sekretariat KUD:</span> ${s?.alamat || alamatKud}</div>
      </div>
      <div class="back-footer">
        <div class="slogan">${slogan}</div>
        <div class="ttd-area">
          <div>${kotaTerbit}, ${terbit}</div>
          <div>${ketuaJabatan}</div>
          <div class="sign-row">${stempelHtml}${ttdHtml}</div>
          <div class="nama">${ketuaNama}</div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;
  };

  const frontCard = () => (
    <div className="flex rounded-xl overflow-hidden" style={{
      width: '100%', maxWidth: cardW + 'px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div className="flex flex-col items-center justify-between shrink-0 p-3 text-white" style={{
        width: leftPanelW + 'px',
        background: `linear-gradient(135deg, ${warnaPrimary}, ${warnaSecondary}, #0f172a)`,
        minHeight: 190,
      }}>
        {logo ? (
          <img src={logo} alt="" className="w-[52px] h-[52px] object-contain rounded-xl border border-white/20 shadow-lg" />
        ) : (
          <div className="w-[52px] h-[52px] rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">KUD</div>
        )}
        <div className="text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 leading-tight">{namaKud}</div>
        </div>
        {foto ? (
          <img src={foto} alt="" className="w-[50px] h-[66px] object-cover rounded-lg border-2 border-white/40 shadow-md" />
        ) : (
          <div className="w-[50px] h-[66px] rounded-lg border-2 border-white/40 bg-white/10 flex items-center justify-center text-lg font-bold text-white/40">{initial}</div>
        )}
      </div>

      <div className="bg-white p-3.5 flex flex-col relative" style={{ width: rightPanelW + 'px' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          {logo ? <img src={logo} alt="" className="w-32 h-32 object-contain" /> : null}
        </div>

        <div className="text-[11px] font-black text-slate-900 tracking-wide uppercase border-b border-slate-200 pb-0.5">
          {judulDepan}
        </div>
        <div className="text-[7px] font-bold uppercase mb-1.5" style={{ color: warnaPrimary }}>
          {subjudulDepan}
        </div>

        <div className="text-[13px] font-black text-slate-900 uppercase leading-tight">{nama}</div>
        <div className="text-[9px] font-bold font-mono mt-0.5 mb-1 inline-block px-1.5 py-0.5 rounded" style={{
          background: `${warnaPrimary}15`, color: warnaPrimary,
        }}>
          {nomor_anggota || '-'}
        </div>

        <div className="text-[8px] text-slate-600 leading-snug space-y-0.5 font-medium">
          {alamatJalan && <p>{alamatJalan}</p>}
          {nik !== '-' && <p className="text-slate-400">NIK: {nik}</p>}
        </div>

        <div className="flex items-end justify-between mt-auto pt-1 border-t border-slate-100">
          <div>
            <p className="text-[7px] text-slate-400 font-semibold">Berlaku</p>
            <p className="text-[9px] font-bold text-slate-800">{terbit} - {berlaku}</p>
          </div>
          <div className="h-[18px] w-[52px]">
            <BarcodeSvg value={nomor_anggota} />
          </div>
        </div>
      </div>
    </div>
  );

  const backCard = () => (
    <div className="rounded-xl overflow-hidden" style={{
      width: '100%', maxWidth: cardW + 'px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div className="text-white text-center py-1.5 font-bold text-xs tracking-wider" style={{
        background: `linear-gradient(135deg, ${warnaBelakang}, ${warnaPrimary})`,
      }}>
        {website}
      </div>
      <div className="bg-white p-3.5 flex flex-col min-h-[190px]">
        <div className="flex-1">
          <h4 className="text-[9px] font-bold text-slate-900 mb-1">Kartu Tanda Anggota:</h4>
          <ul className="space-y-0.5">
            {aturan.map((item, i) => (
              <li key={i} className="text-[7px] text-slate-600 leading-tight flex items-start gap-1">
                <span className="mt-[3px] w-[4px] h-[4px] rounded-full shrink-0" style={{ background: warnaPrimary }} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-1.5 pt-1 border-t border-slate-100 text-[7px] text-slate-600">
            <span className="font-bold text-slate-800">Sekretariat KUD:</span> {s?.alamat || alamatKud}
          </div>
        </div>
        <div className="flex items-end justify-between mt-1.5">
          <div className="text-[16px] font-black italic text-slate-900 uppercase tracking-wider leading-none">
            {slogan}
          </div>
          <div className="text-right text-[7px] text-slate-600">
            <p className="text-slate-500">{kotaTerbit}, {terbit}</p>
            <p className="font-semibold text-slate-700">{ketuaJabatan}</p>
            <div className="flex items-center justify-end gap-1 my-0.5">
              {stempelUrl && <img src={stempelUrl} alt="" className="h-[26px] w-auto object-contain" />}
              {ttdUrl && <img src={ttdUrl} alt="" className="h-[14px] w-auto object-contain" />}
            </div>
            <p className="font-black text-slate-900 uppercase text-[8px]">{ketuaNama}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-border" ref={printRef}>
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
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer" style={{ background: warnaPrimary }}>
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
          <div className="w-full max-w-full" style={{ maxWidth: cardW + 'px' }}>
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
          <p className="text-[10px] text-gray-400">
            Cetak: sisi depan &bull; sisi belakang (2 halaman)
          </p>
        </div>
      </div>
    </div>
  );
}
