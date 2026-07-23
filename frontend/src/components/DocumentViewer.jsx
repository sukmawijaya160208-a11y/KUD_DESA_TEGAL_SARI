'use client';

import { useMemo } from 'react';

function replacePlaceholders(text, data) {
  if (!text) return '';
  const map = {
    '{{nama_pekebun}}': data?.nama_pekebun || '_________________________',
    '{{nik}}': data?.nik || '_________________________',
    '{{no_kk}}': data?.no_kk || '_________________________',
    '{{tempat_lahir}}': data?.tempat_lahir || '_________________________',
    '{{tanggal_lahir}}': data?.tanggal_lahir || '_________________________',
    '{{no_whatsapp}}': data?.no_whatsapp || '_________________________',
    '{{alamat}}': data?.alamat || '_________________________',
    '{{alamat_lahan}}': data?.alamat_lahan || '_________________________',
    '{{jenis_surat_lahan}}': data?.jenis_surat_lahan || '_________________________',
    '{{nomor_surat_lahan}}': data?.nomor_surat_lahan || '_________________________',
    '{{luas_lahan}}': data?.luas_lahan || '_________________________',
    '{{nama_program}}': data?.nama_program || '_________________________',
  };
  return Object.entries(map).reduce((t, [k, v]) => t.replaceAll(k, v), text);
}

export default function DocumentViewer({ judul, isi, data, signature, showSignature = true }) {
  const rendered = useMemo(() => replacePlaceholders(isi, data), [isi, data]);

  if (!isi) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="max-w-[210mm] mx-auto py-8 px-6 sm:px-10">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            {judul || 'SURAT PERNYATAAN'}
          </h2>
          <div className="w-20 h-0.5 bg-gray-300 mx-auto mt-2" />
        </div>

        <div className="text-sm text-gray-800 leading-relaxed space-y-2 text-justify">
          {rendered.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            return <p key={i}>{trimmed}</p>;
          })}
        </div>

        {showSignature && signature && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-600 mb-1">{data?.alamat || '________'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-sm text-gray-600 mb-4">Yang bertanda tangan,</p>
              <img
                src={signature}
                alt="Tanda Tangan"
                className="h-16 object-contain mb-1"
              />
              <div className="w-48 h-0.5 bg-gray-300 mb-1" />
              <p className="text-sm font-semibold text-gray-800">{data?.nama_pekebun || '_________________________'}</p>
            </div>
          </div>
        )}

        {showSignature && !signature && (
          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-gray-400 text-sm italic">
            Tanda tangan digital akan muncul setelah ditandatangani
          </div>
        )}
      </div>
    </div>
  );
}
