'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, PrinterIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const formatDate = () => new Date().toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

export default function ExportDropdown({ title, fetchAll, filename, pdfUrl, csvUrl, renderPrintContent }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePrint = async () => {
    setLoading('print');
    try {
      let content = '';
      if (typeof renderPrintContent === 'function') {
        const allData = await fetchAll();
        content = renderPrintContent(allData);
      }

      const win = window.open('', '_blank');
      if (!win) { alert('Izinkan popup untuk mencetak'); setLoading(null); return; }

      win.document.write(`
        <!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
        <style>
          @page { size: landscape; margin: 15mm 20mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif; color: #1e293b; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .letterhead { padding-bottom: 12px; margin-bottom: 16px; border-bottom: 2px solid #1e40af; }
          .letterhead .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
          .letterhead .kud-name { font-size: 22px; font-weight: 800; color: #1e40af; text-transform: uppercase; }
          .letterhead .kud-sub { font-size: 11px; color: #475569; margin-top: 2px; }
          .letterhead .kud-identity { font-size: 10px; color: #94a3b8; margin-top: 2px; }
          .letterhead .head-date { font-size: 10px; color: #94a3b8; text-align: right; white-space: nowrap; }
          .doc-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table thead th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
          .print-table tbody td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #334155; }
          .print-table tbody tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; }
          .badge-verified, .badge-terima, .badge-aktif { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
          .badge-rejected, .badge-tolak, .badge-nonaktif { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
          .doc-grid { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
          .doc-grid img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
          .text-center { text-align: center; }
          .font-bold { font-weight: 700; }
          .text-muted { color: #94a3b8; }
          .print-footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
          .empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 12px; }
          @media print { body { margin: 0; padding: 0; } }
          @media screen { body { padding: 20px; max-width: 210mm; margin: 0 auto; } }
        </style></head><body>
        <div class="letterhead"><div class="top-row">
          <div><div class="kud-name">KUD Desa Sari Subur</div>
          <div class="kud-sub">Sistem Informasi Koperasi Unit Desa</div>
          <div class="kud-identity">Kec. Megang Sakti, Kabupaten Musi Rawas, Sumatera Selatan</div></div>
          <div class="head-date">${formatDate()}</div>
        </div></div>
        <div class="doc-title">${title}</div>
        ${content || '<div class="empty-state">Tidak ada data</div>'}
        <div class="print-footer">Dokumen ini dicetak dari Sistem Informasi KUD Desa Sari Subur<br>&copy; ${new Date().getFullYear()} &mdash; KUD Desa Sari Subur</div>
        <script>window.onload=function(){setTimeout(function(){window.print()},500)};window.onafterprint=function(){setTimeout(function(){window.close()},300)};<\/script>
        </body></html>
      `);
      win.document.close();
    } catch (err) {
      console.error('Print gagal:', err);
      alert('Gagal mencetak: ' + err.message);
    }
    setLoading(null);
    setOpen(false);
  };

  const handleDownload = async (url, format) => {
    setLoading(format);
    try {
      const res = await fetch(url, { headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') } });
      if (!res.ok) throw new Error('Gagal mengunduh');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename ? `${filename}-${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'csv'}` : `export-${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error(`Download ${format} gagal:`, err);
      alert(`Gagal mengunduh ${format.toUpperCase()}: ` + err.message);
    }
    setLoading(null);
    setOpen(false);
  };

  const btnBase = 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer';
  const iconClass = 'w-4 h-4';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className={`${btnBase} bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-200`}>
        <ArrowDownTrayIcon className={`${iconClass} ${loading ? 'animate-pulse' : ''}`} />
        {loading ? 'Memproses...' : 'Export'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-border">Export Data</div>

          <button onClick={handlePrint} disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 cursor-pointer">
            <PrinterIcon className="w-4 h-4 text-gray-500" />
            <span>Cetak</span>
          </button>

          {pdfUrl && (
            <button onClick={() => handleDownload(pdfUrl, 'pdf')} disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 cursor-pointer">
              <DocumentTextIcon className="w-4 h-4 text-red-500" />
              <span>Download PDF</span>
            </button>
          )}

          {csvUrl && (
            <button onClick={() => handleDownload(csvUrl, 'csv')} disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 cursor-pointer">
              <TableCellsIcon className="w-4 h-4 text-green-600" />
              <span>Download CSV</span>
            </button>
          )}

          <div className="border-t border-border px-4 py-2.5 text-[10px] text-gray-400 text-center">
            KUD Desa Sari Subur &mdash; Sistem Informasi
          </div>
        </div>
      )}
    </div>
  );
}

