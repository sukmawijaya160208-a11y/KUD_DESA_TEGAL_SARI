'use client';

import { useMemo } from 'react';

const KADES_MAP = {
  'tegal sari': { nama: 'SISWOYO', title: 'KEPALA Desa Tegalsari Kecamatan Megang Sakti' },
  'marga puspita': { nama: 'SUMODIONO', title: 'KEPALA Desa Marga Puspita Kecamatan Megang Sakti' },
  'campur sari': { nama: 'MUKHSIN', title: 'KEPALA Desa Campur Sari Kecamatan Megang Sakti' },
};

function detectDesa(alamat) {
  if (!alamat) return null;
  const a = alamat.toLowerCase();
  if (a.includes('tegal sari') || a.includes('tegalsari')) return 'tegal sari';
  if (a.includes('marga puspita')) return 'marga puspita';
  if (a.includes('campur sari') || a.includes('campursari')) return 'campur sari';
  return null;
}

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
    '{{alamat_lengkap}}': data?.alamat_lengkap || data?.alamat || '_________________________',
    '{{jenis_kelamin}}': data?.jenis_kelamin || '_________________________',
    '{{alamat_lahan}}': data?.alamat_lahan || '_________________________',
    '{{jenis_surat_lahan}}': data?.jenis_surat_lahan || '_________________________',
    '{{nomor_surat_lahan}}': data?.nomor_surat_lahan || '_________________________',
    '{{luas_lahan}}': data?.luas_lahan || '_________________________',
    '{{nama_program}}': data?.nama_program || '_________________________',
    '{{kades_nama}}': data?.kades_nama || '_________________________',
    '{{kades_title}}': data?.kades_title || '_________________________',
    '{{ketua_kud_nama}}': data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.',
    '{{ketua_kud_jabatan}}': data?.ketua_kud_jabatan || 'Ketua Koperasi Unit Desa Sari Subur',
    '{{ketua_kud_alamat}}': data?.ketua_kud_alamat || 'Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas',
    '{{tanggal_surat}}': data?.tanggal_surat || '_________________________',
    '{{tempat_surat}}': data?.tempat_surat || 'Megang Sakti',
  };
  return Object.entries(map).reduce((t, [k, v]) => t.replaceAll(k, v), text);
}

function formatSuratDate(dateStr) {
  if (!dateStr) return '_________________________';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td className="py-0.5 pr-3 whitespace-nowrap align-top w-1 text-sm text-gray-800">{label}</td>
      <td className="py-0.5 px-1 align-top w-1 text-sm text-gray-800">:</td>
      <td className="py-0.5 align-top text-sm font-semibold text-gray-900">{value || '_________________________'}</td>
    </tr>
  );
}

export default function DocumentViewer({
  judul,
  isi,
  data,
  signature,
  showSignature = true,
  suratIndex = 1,
  program = {},
}) {
  const rendered = useMemo(() => replacePlaceholders(isi, data), [isi, data]);
  const desa = useMemo(() => detectDesa(data?.alamat), [data?.alamat]);
  const kades = desa ? KADES_MAP[desa] : null;
  const tanggalSurat = formatSuratDate(data?.tanggal_surat || program?.tanggal_mulai);
  const logoKudUrl = data?.logo_kud;
  const qrUrl = data?.qr_logo;

  if (!isi) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="max-w-[210mm] mx-auto py-8 px-6 sm:px-10">

        {/* ===== SURAT 3 HEADER ===== */}
        {suratIndex === 3 && (
          <div className="flex items-start justify-between mb-3">
            <div className="w-[75px] h-[75px] shrink-0">
              {logoKudUrl ? (
                <img src={logoKudUrl} alt="Logo KUD" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-[7px] text-gray-300 border border-dashed border-gray-200">Logo</div>
              )}
            </div>
            <div className="flex-1 mx-3">
              <div className="text-center leading-tight">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                  KOPERASI UNIT DESA (KUD) &ldquo; S A R I &nbsp; S U B U R &rdquo;
                </p>
                <p className="text-[10px] font-semibold text-gray-800 uppercase mt-0.5">
                  DESA TEGALSARI KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
                </p>
                <p className="text-[8px] text-gray-600 mt-0.5 leading-tight">
                  Sekretariat : Desa Tegalsari Dusun I Kec. Megang Sakti Kab. Musi Rawas Provinsi Sumatera Selatan, 31657
                </p>
                <p className="text-[8px] text-gray-600 leading-tight">
                  HP. 0822-2728-3416 – Email : kudsarisubur@gmail.com – https://kudsarisubur.blogspot.com/
                </p>
              </div>
            </div>
            <div className="w-[75px] h-[75px] shrink-0 flex flex-col items-center">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-[7px] text-gray-300 border border-dashed border-gray-200">QR</div>
              )}
            </div>
          </div>
        )}

        {suratIndex === 3 && (
          <>
            <div className="border-t-2 border-b border-gray-800 mb-4" />
            <div className="text-center mb-5">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {judul || 'SURAT KETERANGAN KEANGGOTAAN KOPERASI'}
              </h2>
              <div className="w-16 h-[1.5px] bg-gray-400 mx-auto mt-1.5" />
            </div>
          </>
        )}

        {/* ===== SURAT 1 & 2 TITLE ===== */}
        {suratIndex !== 3 && (
          <div className="text-center mb-6">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              {judul || (suratIndex === 2 ? 'SURAT PERNYATAAN KEPEMILIKAN LAHAN' : 'SURAT PERNYATAAN')}
            </h2>
            {suratIndex === 2 && (
              <p className="text-[11px] font-semibold text-gray-700 mt-0.5 tracking-wide">
                PERKEBUNAN KELAPA SAWIT TA.2026
              </p>
            )}
            <div className="w-16 h-[1.5px] bg-gray-400 mx-auto mt-1.5" />
          </div>
        )}

        {/* ===== SURAT 3: KETUA KUD FIXED DATA ===== */}
        {suratIndex === 3 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Yang bertanda tangan di bawah ini :</p>
            <table className="w-full border-collapse">
              <tbody>
                <InfoRow label="Nama" value={data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'} />
                <InfoRow label="Jabatan" value={data?.ketua_kud_jabatan || 'Ketua Koperasi Unit Desa Sari Subur'} />
                <InfoRow label="Alamat" value={data?.ketua_kud_alamat || 'Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas'} />
              </tbody>
            </table>
          </div>
        )}

        {/* ===== SURAT 3: AUTO POPULATE PEKEBUN ===== */}
        {suratIndex === 3 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Menerangkan dengan sebenarnya, bahwa :</p>
            <table className="w-full border-collapse">
              <tbody>
                <InfoRow label="Nama" value={data?.nama_pekebun} />
                <InfoRow label="NIK" value={data?.nik} />
                <InfoRow label="Jenis Kelamin" value={data?.jenis_kelamin} />
                <InfoRow label="Alamat" value={data?.alamat_lengkap || data?.alamat} />
              </tbody>
            </table>
          </div>
        )}

        {/* ===== SURAT 1 & 2: AUTO POPULATE PEKEBUN ===== */}
        {suratIndex !== 3 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Yang bertanda tangan di bawah ini :</p>
            <table className="w-full border-collapse">
              <tbody>
                <InfoRow label="Nama" value={data?.nama_pekebun} />
                <InfoRow label="NIK" value={data?.nik} />
                <InfoRow label="Jenis Kelamin" value={data?.jenis_kelamin} />
                <InfoRow label="Alamat" value={suratIndex === 2 ? (data?.alamat_lengkap || data?.alamat) : data?.alamat} />
                {suratIndex === 1 && <InfoRow label="Nomor Hp/Telepon" value={data?.no_whatsapp} />}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== SURAT 2: ALAMAT SUB ===== */}
        {suratIndex === 2 && (
          <p className="text-sm font-semibold text-gray-800 mt-[-8px] mb-4 ml-[72px] tracking-wide">
            KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
          </p>
        )}

        {/* ===== BODY TEXT ===== */}
        <div className="text-sm text-gray-800 leading-relaxed space-y-2 text-justify mb-6">
          {rendered.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            return <p key={i}>{trimmed}</p>;
          })}
        </div>

        {/* ===== DATE ===== */}
        <div className="text-sm text-gray-700 mb-10 text-center">
          <p className="font-medium">{data?.tempat_surat || 'Megang Sakti'}, {tanggalSurat}</p>
        </div>

        {/* ===== SURAT 1: PEKEBUN SIGNATURE ===== */}
        {suratIndex === 1 && (
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-8">Yang Membuat Pernyataan,</p>
              {signature ? (
                <img src={signature} alt="Tanda Tangan" className="h-14 object-contain mx-auto mb-1" />
              ) : (
                <div className="h-14" />
              )}
              <div className="w-44 h-[1.5px] bg-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{data?.nama_pekebun || '_________________________'}</p>
            </div>
          </div>
        )}

        {/* ===== SURAT 2: PEKEBUN SIGNATURE + MENGETAHUI ===== */}
        {suratIndex === 2 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-8">Saya yang membuat Pernyataan,</p>
                {signature ? (
                  <img src={signature} alt="Tanda Tangan" className="h-14 object-contain mx-auto mb-1" />
                ) : (
                  <div className="h-14" />
                )}
                <div className="w-44 h-[1.5px] bg-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{data?.nama_pekebun || '_________________________'}</p>
              </div>
            </div>

            {showSignature && (
              <div className="mt-8 pt-5 border-t border-gray-300">
                <p className="text-sm font-bold text-gray-800 text-center mb-6 uppercase tracking-wide">Mengetahui</p>
                <div className="flex justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-6">{kades?.title || 'Kepala Desa'}</p>
                    {(() => {
                      let kadesSignature = '';
                      if (desa === 'tegal sari') kadesSignature = program?.tanda_tangan_kades_tegal_sari;
                      else if (desa === 'marga puspita') kadesSignature = program?.tanda_tangan_kades_marga_puspita;
                      else if (desa === 'campur sari') kadesSignature = program?.tanda_tangan_kades_campur_sari;
                      return kadesSignature ? (
                        <img src={kadesSignature} alt="Tanda Tangan Kades" className="h-14 object-contain mx-auto mb-1" />
                      ) : (
                        <div className="h-14" />
                      );
                    })()}
                    <div className="w-44 h-[1.5px] bg-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900 tracking-wide">{kades?.nama || data?.kades_nama || '_________________________'}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== SURAT 3: KETUA KUD SIGNATURE ===== */}
        {suratIndex === 3 && (
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-8">Ketua Koperasi Unit Desa Sari Subur,</p>
              {(() => {
                const ttdKetua = program?.tanda_tangan_ketua_kud;
                return ttdKetua ? (
                  <img src={ttdKetua} alt="Tanda Tangan Ketua KUD" className="h-14 object-contain mx-auto mb-1" />
                ) : (
                  <div className="h-14" />
                );
              })()}
              <div className="w-44 h-[1.5px] bg-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
