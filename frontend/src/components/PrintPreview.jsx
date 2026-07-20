'use client';

import { useState } from 'react';
import { EyeIcon, PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PrintPreview({ title, fetchAll, renderContent, onLoad }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const allData = await fetchAll();
      const content = typeof renderContent === 'function' ? renderContent(allData) : renderContent;
      setPreview(content);
    } catch (err) {
      alert('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!preview) return;
    const win = window.open('', '_blank');
    if (!win) { alert('Izinkan popup untuk mencetak'); return; }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: landscape; margin: 15mm 20mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
            color: #1e293b; line-height: 1.5;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          .letterhead { padding-bottom: 12px; margin-bottom: 16px; border-bottom: 2px solid #1e40af; }
          .letterhead .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
          .letterhead .kud-name { font-size: 22px; font-weight: 800; color: #1e40af; text-transform: uppercase; }
          .letterhead .kud-sub { font-size: 11px; color: #475569; margin-top: 2px; }
          .letterhead .head-date { font-size: 10px; color: #94a3b8; text-align: right; white-space: nowrap; }
          .doc-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table thead th { background: #1e40af; color: white; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 10px; text-transform: uppercase; white-space: nowrap; }
          .print-table tbody td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
          .print-table tbody tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; }
          .badge-verified { background: #dcfce7; color: #166534; }
          .badge-pending { background: #fef9c3; color: #854d0e; }
          .badge-rejected { background: #fee2e2; color: #991b1b; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: 700; }
          .print-footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
          .empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; }
          @media print { body { margin: 0; } }
          @media screen { body { padding: 20px; max-width: 210mm; margin: 0 auto; } }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="top-row">
            <div>
              <div class="kud-name">KUD Desa Sari Subur</div>
              <div class="kud-sub">Sistem Informasi Koperasi Unit Desa</div>
            </div>
            <div class="head-date">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        <div class="doc-title">${title}</div>
        ${preview || '<div class="empty-state">Tidak ada data</div>'}
        <div class="print-footer">&copy; ${new Date().getFullYear()} - KUD Desa Sari Subur</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }; window.onafterprint = function() { setTimeout(function() { window.close(); }, 300); }; <\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <>
      <button onClick={handlePreview} disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 transition-all shadow-sm shadow-blue-200 cursor-pointer">
        <EyeIcon className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        {loading ? 'Memuat...' : 'Preview'}
      </button>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Preview {title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all cursor-pointer">
                  <PrinterIcon className="w-4 h-4" />
                  Cetak
                </button>
                <button onClick={() => setPreview(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="print-table-wrapper" dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
