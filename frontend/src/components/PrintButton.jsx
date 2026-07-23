'use client';

import { useState, useRef } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const PRINT_STYLES = `
  @page { size: landscape; margin: 15mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    padding: 20px;
  }
  .letterhead {
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 2px solid #059669;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .letterhead .kud-name { font-size: 22px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; }
  .letterhead .kud-sub { font-size: 11px; color: #475569; margin-top: 2px; }
  .letterhead .kud-identity { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .letterhead .head-date { font-size: 10px; color: #94a3b8; text-align: right; white-space: nowrap; }
  .doc-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
  .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .print-table thead th {
    background: #059669; color: white; padding: 10px 12px; text-align: left;
    font-weight: 700; font-size: 10px; text-transform: uppercase; white-space: nowrap;
  }
  .print-table tbody td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  .print-table tbody tr:nth-child(even) { background: #f8fafc; }
  .doc-grid { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .doc-grid img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
  .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; }
  .badge-verified { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
  .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
  .badge-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  .text-right { text-align: right; }
  .font-bold { font-weight: 700; }
  .text-muted { color: #94a3b8; }
  .print-footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
  @media print { body { padding: 0; } }
`;

export default function PrintButton({ title, fetchAll, renderContent, onLoad }) {
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  const buildHtml = (content) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${title}</title><style>${PRINT_STYLES}</style></head>
    <body>
      <div class="letterhead">
        <div>
          <div class="kud-name">KUD Desa Sari Subur</div>
          <div class="kud-sub">Sistem Informasi Koperasi Unit Desa</div>
          <div class="kud-identity">Kec. Megang Sakti, Kabupaten Musi Rawas, Sumatera Selatan</div>
        </div>
        <div class="head-date">
          ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div class="doc-title">${title}</div>
      ${content || '<div style="text-align:center;padding:40px;color:#94a3b8">Tidak ada data untuk ditampilkan</div>'}
      <div class="print-footer">
        Dokumen ini dicetak dari Sistem Informasi KUD Desa Sari Subur<br>
        <span style="font-size:8px;color:#cbd5e1">&copy; ${new Date().getFullYear()} - KUD Desa Sari Subur</span>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print()},500)};window.onafterprint=function(){setTimeout(function(){window.close()},300)};<\/script>
    </body>
    </html>
  `;

  const handlePrint = async () => {
    setLoading(true);
    try {
      const allData = await fetchAll();
      const content = typeof renderContent === 'function' ? renderContent(allData) : renderContent;

      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;pointer-events:none';
      document.body.appendChild(iframe);
      iframeRef.current = iframe;

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(buildHtml(content));
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(buildHtml(content));
            win.document.close();
          } else {
            alert('Izinkan popup untuk mencetak dokumen, atau gunakan Ctrl+P');
          }
        }
      }, 800);

      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 120000);

      if (onLoad) onLoad();
    } catch (err) {
      console.error('Print gagal:', err);
      alert('Gagal mencetak: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePrint} disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60 transition-all shadow-sm shadow-emerald-200 cursor-pointer">
      <PrinterIcon className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
      {loading ? 'Memproses...' : 'Cetak'}
    </button>
  );
}
