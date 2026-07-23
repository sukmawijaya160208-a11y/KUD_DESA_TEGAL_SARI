'use client';

import { useMemo } from 'react';

const KADES_MAP = {
  'tegal sari': { nama: 'SISWOYO', title: 'Kepala Desa Tegalsari Kecamatan Megang Sakti' },
  'marga puspita': { nama: 'SUMODIONO', title: 'Kepala Desa Marga Puspita Kecamatan Megang Sakti' },
  'campur sari': { nama: 'MUKHSIN', title: 'Kepala Desa Campur Sari Kecamatan Megang Sakti' },
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
    '{{kop_kud}}': data?.kop_kud || '',
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

function PekebunDataTable({ data, fields }) {
  const rows = fields.map((f) => ({
    label: f.label,
    value: data?.[f.key] || '_________________________',
  }));

  return (
    <table className="w-full text-sm text-gray-800 border-collapse">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="py-1 pr-4 whitespace-nowrap align-top w-1">{r.label}</td>
            <td className="py-1 px-2 align-top w-1">:</td>
            <td className="py-1 align-top font-medium">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SignatureBlock({ label, nama, image, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-600 mb-8">{label}</p>
      {image ? (
        <img src={image} alt="Tanda Tangan" className="h-16 object-contain mx-auto mb-1" />
      ) : (
        <div className="h-16" />
      )}
      <div className="w-48 h-0.5 bg-gray-300 mx-auto mb-1" />
      <p className="text-sm font-semibold text-gray-800">{nama || '_________________________'}</p>
    </div>
  );
}

function KopSuratKud() {
  return (
    <div className="text-center mb-2 leading-tight">
      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
        KOPERASI UNIT DESA (KUD) "SARI SUBUR"
      </p>
      <p className="text-xs font-semibold text-gray-800 uppercase">
        DESA TEGALSARI KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
      </p>
      <p className="text-[10px] text-gray-600 mt-0.5">
        Sekretariat : Desa Tegalsari Dusun I Kec. Megang Sakti Kab. Musi Rawas Provinsi Sumatera Selatan, 31657
      </p>
      <p className="text-[10px] text-gray-600">
        HP. 0822-2728-3416 – Email : kudsarisubur@gmail.com – https://kudsarisubur.blogspot.com
      </p>
      <div className="border-t-2 border-b border-gray-800 mt-1.5 mb-3" />
    </div>
  );
}

function SuratHeader({ logoUrl, qrUrl }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="w-20 h-20">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo KUD" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-400">Logo</div>
        )}
      </div>
      <div className="flex-1 mx-4">
        <KopSuratKud />
      </div>
      <div className="w-20 h-20 flex flex-col items-center">
        {qrUrl ? (
          <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-400">QR</div>
        )}
      </div>
    </div>
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

  const pekebunFields = [
    { label: 'Nama', key: 'nama_pekebun' },
    { label: 'NIK', key: 'nik' },
    { label: 'Jenis Kelamin', key: 'jenis_kelamin' },
    { label: 'Alamat', key: 'alamat' },
    { label: 'No. Hp', key: 'no_whatsapp' },
  ];

  const pekebunFieldsSurat3 = [
    { label: 'Nama', key: 'nama_pekebun' },
    { label: 'NIK', key: 'nik' },
    { label: 'Jenis Kelamin', key: 'jenis_kelamin' },
    { label: 'Alamat', key: 'alamat' },
  ];

  const tanggalSurat = formatSuratDate(data?.tanggal_surat || program?.tanggal_mulai);

  if (!isi) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="max-w-[210mm] mx-auto py-8 px-6 sm:px-10">

        {suratIndex === 3 && (
          <SuratHeader
            logoUrl={data?.logo_kud}
            qrUrl={data?.qr_logo}
          />
        )}

        {suratIndex === 3 && (
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {judul || 'SURAT KETERANGAN KEANGGOTAAN KOPERASI'}
            </h2>
            <div className="w-20 h-0.5 bg-gray-300 mx-auto mt-2" />
          </div>
        )}

        {suratIndex !== 3 && (
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {judul || 'SURAT PERNYATAAN'}
              {suratIndex === 2 && <span className="block text-sm font-normal mt-0.5">PERKEBUNAN KELAPA SAWIT TA.2026</span>}
            </h2>
            <div className="w-20 h-0.5 bg-gray-300 mx-auto mt-2" />
          </div>
        )}

        {suratIndex === 3 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Yang bertanda tangan di bawah ini :</p>
            <table className="w-full text-sm text-gray-800 border-collapse">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap align-top w-1">Nama</td>
                  <td className="py-1 px-2 align-top w-1">:</td>
                  <td className="py-1 align-top font-medium">{data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap align-top w-1">Jabatan</td>
                  <td className="py-1 px-2 align-top w-1">:</td>
                  <td className="py-1 align-top font-medium">{data?.ketua_kud_jabatan || 'Ketua Koperasi Unit Desa Sari Subur'}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap align-top w-1">Alamat</td>
                  <td className="py-1 px-2 align-top w-1">:</td>
                  <td className="py-1 align-top">{data?.ketua_kud_alamat || 'Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {suratIndex !== 3 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Yang bertanda tangan di bawah ini :</p>
            <PekebunDataTable data={data} fields={pekebunFields} />
          </div>
        )}

        {suratIndex === 3 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Menerangkan dengan sebenarnya, bahwa :</p>
            <PekebunDataTable data={data} fields={pekebunFieldsSurat3} />
          </div>
        )}

        <div className="text-sm text-gray-800 leading-relaxed space-y-2 text-justify mb-6">
          {rendered.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            return <p key={i}>{trimmed}</p>;
          })}
        </div>

        <div className="text-sm text-gray-700 mb-10">
          <p className="text-center">{data?.tempat_surat || 'Megang Sakti'}, {tanggalSurat}</p>
        </div>

        {suratIndex === 1 && (
          <div className="flex justify-center mb-6">
            <SignatureBlock
              label="Yang Membuat Pernyataan,"
              nama={data?.nama_pekebun}
              image={signature}
            />
          </div>
        )}

        {suratIndex === 2 && (
          <>
            <div className="flex justify-center mb-6">
              <SignatureBlock
                label="Saya yang membuat Pernyataan,"
                nama={data?.nama_pekebun}
                image={signature}
              />
            </div>
            {showSignature && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800 text-center mb-6 uppercase">Mengetahui</p>
                <div className="flex justify-center">
                  <SignatureBlock
                    label={kades?.title || 'Kepala Desa'}
                    nama={kades?.nama || data?.kades_nama || '_________________________'}
                    image={program?.tanda_tangan_kades_tegal_sari || program?.tanda_tangan_kades_marga_puspita || program?.tanda_tangan_kades_campur_sari}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {suratIndex === 3 && (
          <div className="flex justify-center mb-6">
            <SignatureBlock
              label={`Ketua Koperasi Unit Desa Sari Subur,`}
              nama={data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'}
              image={program?.tanda_tangan_ketua_kud}
            />
          </div>
        )}

      </div>
    </div>
  );
}
