'use client';

import { useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DocumentViewer from './DocumentViewer';

export default function SuratPrintModal({ open, onClose, suratIndex, judul, isi, data, program, signature }) {
  const contentRef = useRef(null);

  if (!open) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Surat</title>
          <style>
            @page { margin: 15mm; size: A4; }
            body { font-family: 'Times New Roman', Times, serif; margin: 0; padding: 0; }
            img { max-width: 100%; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
          <script>
            window.onload = function() { window.print(); window.close(); };
          <\/script>
        </head>
        <body>
          ${contentRef.current?.innerHTML || ''}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="relative w-full max-w-[210mm] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 rounded-t-2xl">
          <h3 className="text-sm font-bold text-gray-900">Preview Surat</h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors cursor-pointer">
              Cetak
            </button>
            <button onClick={onClose} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition-colors">
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div ref={contentRef}>
          <DocumentViewer
            suratIndex={suratIndex}
            judul={judul}
            isi={isi}
            data={data}
            program={program || {}}
            signature={signature}
            showSignature={!!signature}
          />
        </div>
      </div>
    </div>
  );
}
