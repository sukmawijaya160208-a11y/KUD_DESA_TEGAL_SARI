'use client';

import { useState } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

export default function PrintButton({ title, fetchAll, renderContent, onLoad }) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const allData = await fetchAll();
      const content = typeof renderContent === 'function' ? renderContent(allData) : renderContent;

      const win = window.open('', '_blank');
      if (!win) {
        alert('Izinkan popup untuk mencetak dokumen');
        setLoading(false);
        return;
      }

      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page { size: landscape; margin: 15mm 20mm; }
            @page portrait { size: portrait; margin: 15mm 20mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
              color: #1e293b;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* ===== LETTERHEAD ===== */
            .letterhead {
              padding-bottom: 12px;
              margin-bottom: 16px;
              border-bottom: 2px solid #1e40af;
            }
            .letterhead .top-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .letterhead .kud-name {
              font-size: 22px;
              font-weight: 800;
              color: #1e40af;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .letterhead .kud-sub {
              font-size: 11px;
              color: #475569;
              margin-top: 2px;
              font-weight: 500;
            }
            .letterhead .kud-identity {
              font-size: 10px;
              color: #94a3b8;
              margin-top: 2px;
            }
            .letterhead .head-date {
              font-size: 10px;
              color: #94a3b8;
              text-align: right;
              white-space: nowrap;
            }

            /* ===== TITLE ===== */
            .doc-title {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 14px;
            }

            /* ===== CARD CONTAINER ===== */
            .print-card {
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              margin-bottom: 16px;
            }

            /* ===== TABLE ===== */
            .print-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            .print-table thead th {
              background: linear-gradient(135deg, #1e40af, #3b82f6);
              color: white;
              padding: 10px 12px;
              text-align: left;
              font-weight: 700;
              font-size: 10px;
              letter-spacing: 0.3px;
              text-transform: uppercase;
              border: none;
              white-space: nowrap;
            }
            .print-table thead th:first-child {
              border-top-left-radius: 8px;
            }
            .print-table thead th:last-child {
              border-top-right-radius: 8px;
            }
            .print-table tbody td {
              padding: 9px 12px;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: middle;
              color: #334155;
            }
            .print-table tbody tr:last-child td {
              border-bottom: none;
            }
            .print-table tbody tr:nth-child(even) {
              background: #f8fafc;
            }
            .print-table tbody tr:hover {
              background: #f1f5f9;
            }

            /* ===== IMAGES ===== */
            .doc-grid {
              display: flex;
              gap: 6px;
              flex-wrap: wrap;
              align-items: center;
            }
            .doc-grid a {
              display: inline-block;
              text-decoration: none;
            }
            .doc-grid img {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              transition: transform 0.2s;
            }
            .doc-grid img:hover {
              transform: scale(1.05);
              border-color: #3b82f6;
            }

            /* ===== BADGES ===== */
            .badge {
              display: inline-block;
              padding: 3px 12px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.2px;
              text-transform: capitalize;
            }
            .badge-verified { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
            .badge-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

            /* ===== MISC ===== */
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .text-muted { color: #94a3b8; }
            .nowrap { white-space: nowrap; }

            /* ===== PAGE BREAK ===== */
            .page-break { page-break-before: always; }

            /* ===== FOOTER ===== */
            .print-footer {
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
            }
            .print-footer .footer-line2 {
              font-size: 8px;
              color: #cbd5e1;
              margin-top: 2px;
            }

            /* ===== EMPTY STATE ===== */
            .empty-state {
              text-align: center;
              padding: 40px 20px;
              color: #94a3b8;
              font-size: 12px;
            }

            /* ===== PRINT MEDIA ===== */
            @media print {
              body { margin: 0; padding: 0; }
              .print-table tbody tr:hover { background: inherit; }
              .no-print { display: none; }
            }
            @media print and (orientation: portrait) {
              @page { size: portrait; margin: 10mm 15mm; }
              .print-table { font-size: 9px; }
              .print-table thead th { padding: 6px 8px; font-size: 8px; }
              .print-table tbody td { padding: 6px 8px; }
              .doc-grid img { width: 50px; height: 50px; }
            }
            @media screen {
              body { padding: 20px; max-width: 210mm; margin: 0 auto; }
            }
          </style>
        </head>
        <body>
          <!-- LETTERHEAD -->
          <div class="letterhead">
            <div class="top-row">
              <div>
                <div class="kud-name">KUD Desa Sari Subur</div>
                <div class="kud-sub">Sistem Informasi Koperasi Unit Desa</div>
                <div class="kud-identity">Kec. Megang Sakti, Kabupaten Musi Rawas, Sumatera Selatan</div>
              </div>
              <div class="head-date">
                ${new Date().toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}<br>
                ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div class="doc-title">${title}</div>

          <!-- CONTENT -->
          ${content || '<div class="empty-state">Tidak ada data untuk ditampilkan</div>'}

          <!-- FOOTER -->
          <div class="print-footer">
            Dokumen ini dicetak dari Sistem Informasi KUD Desa Sari Subur
            <div class="footer-line2">&copy; ${new Date().getFullYear()} - KUD Desa Sari Subur &mdash; Dokumen Resmi</div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
            window.onafterprint = function() {
              setTimeout(function() { window.close(); }, 300);
            };
          <\/script>
        </body>
        </html>
      `);
      win.document.close();
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
