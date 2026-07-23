'use client';

import { useMemo } from 'react';

const KADES_MAP = {
  'tegal sari': { nama: 'SISWOYO', title: 'KEPALA Desa Tegalsari Kecamatan Megang Sakti' },
  'marga puspita': { nama: 'SUMODIONO', title: 'KEPALA Desa Marga Puspita Kecamatan Megang Sakti' },
  'campur sari': { nama: 'MUKHSIN', title: 'KEPALA Desa Campur Sari Kecamatan Megang Sakti' },
};

const DESA_LIST = [
  { key: 'tegal sari', match: ['tegal sari', 'tegalsari'] },
  { key: 'marga puspita', match: ['marga puspita'] },
  { key: 'campur sari', match: ['campur sari', 'campursari'] },
];

function detectDesa(alamat) {
  if (!alamat) return null;
  const a = alamat.toLowerCase();
  for (const d of DESA_LIST) {
    if (d.match.some((m) => a.includes(m))) return d.key;
  }
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
    <div className="grid grid-cols-[120px_auto_1fr] gap-x-1 py-0.5">
      <span className="text-sm text-gray-800 text-left">{label}</span>
      <span className="text-sm text-gray-800">:</span>
      <span className="text-sm font-semibold text-gray-900 text-left">{value || '_________________________'}</span>
    </div>
  );
}

const DEFAULT_BODY = {
  1: `Dengan ini menyatakan, bahwa saya bersedia untuk mengikuti Kegiatan Pelatihan Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit (SDMPKS) Tahun (Sesuaikan dengan tahun pelaksanaan) yang didanai oleh Badan Pengelola Dana Perkebunan (BPDP) dengan mematuhi segala peraturan yang telah ditetapkan.

Demikian surat pernyataan ini dibuat dengan sebenar-benarnya untuk dapat digunakan sebagaimana mestinya. Apabila di kemudian hari ditemukan bahwa pernyataan ini tidak benar, saya bersedia menerima konsekuensi sesuai dengan peraturan yang berlaku.`,
  2: `Dengan ini menyatakan bahwa saya benar-benar memiliki lahan perkebunan kelapa sawit kurang dari 25 (dua puluh lima) Hektar.

Demikian surat pernyataan ini dibuat dengan sesungguhnya dan dapat digunakan seperlunya.`,
  3: `Benar nama tersebut di atas adalah petani sawit dan tergabung dalam Koperasi Unit Desa Sari Subur Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas dengan jabatan sebagai Anggota.

Demikian surat pernyataan ini dibuat dengan sesungguhnya dan dapat digunakan seperlunya.`,
};

const DEFAULT_JUDUL = {
  1: 'SURAT PERNYATAAN',
  2: 'SURAT PERNYATAAN KEPEMILIKAN LAHAN',
  3: 'SURAT KETERANGAN KEANGGOTAAN KOPERASI',
};

export default function DocumentViewer({
  judul,
  isi,
  data,
  signature,
  showSignature = true,
  suratIndex = 1,
  program = {},
}) {
  const body = isi || DEFAULT_BODY[suratIndex] || '';
  const title = judul || DEFAULT_JUDUL[suratIndex] || '';
  const rendered = useMemo(() => replacePlaceholders(body, data), [body, data]);
  const desa = useMemo(() => detectDesa(data?.alamat), [data?.alamat]);
  const kades = desa ? KADES_MAP[desa] : null;
  const tanggalSurat = formatSuratDate(data?.tanggal_surat || program?.tanggal_mulai);
  const logoKudUrl = data?.logo_kud;
  const qrUrl = data?.qr_logo;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="max-w-full sm:max-w-[210mm] mx-auto py-5 px-4 sm:px-8">

        {/* ===== SURAT 3 HEADER ===== */}
        {suratIndex === 3 && (
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-[60px] sm:w-[75px] h-[60px] sm:h-[75px] shrink-0">
              {logoKudUrl ? (
                <img src={logoKudUrl} alt="Logo KUD" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-[7px] text-gray-300 border border-dashed border-gray-200">Logo</div>
              )}
            </div>
            <div className="flex-1 min-w-0 mx-1 sm:mx-3">
              <div className="text-center leading-tight">
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                  KOPERASI UNIT DESA (KUD) &ldquo; S A R I &nbsp; S U B U R &rdquo;
                </p>
                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 uppercase mt-0.5">
                  DESA TEGALSARI KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
                </p>
                <p className="text-[7px] sm:text-[8px] text-gray-600 mt-0.5 leading-tight">
                  Sekretariat : Desa Tegalsari Dusun I Kec. Megang Sakti Kab. Musi Rawas Provinsi Sumatera Selatan, 31657
                </p>
                <p className="text-[7px] sm:text-[8px] text-gray-600 leading-tight">
                  HP. 0822-2728-3416 – Email : kudsarisubur@gmail.com – https://kudsarisubur.blogspot.com/
                </p>
              </div>
            </div>
            <div className="w-[60px] sm:w-[75px] h-[60px] sm:h-[75px] shrink-0 flex flex-col items-center">
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
            <div className="border-t-2 border-b border-gray-800 mb-3" />
            <div className="text-center mb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {title}
              </h2>
              <div className="w-16 h-[1.5px] bg-gray-400 mx-auto mt-1" />
            </div>
          </>
        )}

        {/* ===== SURAT 1 & 2 TITLE ===== */}
        {suratIndex !== 3 && (
          <div className="text-center mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              {title}
            </h2>
            {suratIndex === 2 && (
              <p className="text-[11px] font-semibold text-gray-700 mt-0.5 tracking-wide">
                PERKEBUNAN KELAPA SAWIT TA.2026
              </p>
            )}
            <div className="w-16 h-[1.5px] bg-gray-400 mx-auto mt-1" />
          </div>
        )}

        {/* ===== SURAT 3: KETUA KUD FIXED DATA ===== */}
        {suratIndex === 3 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-800 mb-1">Yang bertanda tangan di bawah ini :</p>
            <div>
              <InfoRow label="Nama" value={data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'} />
              <InfoRow label="Jabatan" value={data?.ketua_kud_jabatan || 'Ketua Koperasi Unit Desa Sari Subur'} />
              <InfoRow label="Alamat" value={data?.ketua_kud_alamat || 'Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas'} />
            </div>
          </div>
        )}

        {/* ===== SURAT 3: AUTO POPULATE PEKEBUN ===== */}
        {suratIndex === 3 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-800 mb-1">Menerangkan dengan sebenarnya, bahwa :</p>
            <div>
              <InfoRow label="Nama" value={data?.nama_pekebun} />
              <InfoRow label="NIK" value={data?.nik} />
              <InfoRow label="Jenis Kelamin" value={data?.jenis_kelamin} />
              <InfoRow label="Alamat" value={data?.alamat_lengkap || data?.alamat} />
            </div>
          </div>
        )}

        {/* ===== SURAT 1 & 2: AUTO POPULATE PEKEBUN ===== */}
        {suratIndex !== 3 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-800 mb-1">Yang bertanda tangan di bawah ini :</p>
            <div>
              <InfoRow label="Nama" value={data?.nama_pekebun} />
              <InfoRow label="NIK" value={data?.nik} />
              <InfoRow label="Jenis Kelamin" value={data?.jenis_kelamin} />
              <InfoRow label="Alamat" value={suratIndex === 2 ? (data?.alamat_lengkap || data?.alamat) : data?.alamat} />
              {suratIndex === 1 && <InfoRow label="Nomor Hp/Telepon" value={data?.no_whatsapp} />}
            </div>
          </div>
        )}

        {/* ===== SURAT 2: ALAMAT SUB ===== */}
        {suratIndex === 2 && (
          <p className="text-sm font-semibold text-gray-800 -mt-1 mb-3 tracking-wide indent-[120px]">
            KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
          </p>
        )}

        {/* ===== BODY TEXT ===== */}
        <div className="text-sm text-gray-800 leading-relaxed space-y-2 text-justify mb-4">
          {rendered.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            return <p key={i} className="text-justify">{trimmed}</p>;
          })}
        </div>

        {/* ===== DATE ===== */}
        <div className="text-sm text-gray-700 mb-8 text-center">
          <p className="font-medium">{data?.tempat_surat || 'Megang Sakti'}, {tanggalSurat}</p>
        </div>

        {/* ===== SURAT 1: PEKEBUN SIGNATURE (center) ===== */}
        {suratIndex === 1 && (
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">Yang Membuat Pernyataan,</p>
              {signature ? (
                <img src={signature} alt="Tanda Tangan" className="h-14 object-contain mx-auto mb-1" />
              ) : (
                <div className="h-14" />
              )}
              <div className="w-48 h-[1.5px] bg-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{data?.nama_pekebun || '_________________________'}</p>
            </div>
          </div>
        )}

        {/* ===== SURAT 2: PEKEBUN SIGNATURE (left) + MENGETAHUI (right) ===== */}
        {suratIndex === 2 && (
          <>
            <div className="flex justify-start mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-6">Saya yang membuat Pernyataan,</p>
                {signature ? (
                  <img src={signature} alt="Tanda Tangan" className="h-14 object-contain mx-auto mb-1" />
                ) : (
                  <div className="h-14" />
                )}
                <div className="w-48 h-[1.5px] bg-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{data?.nama_pekebun || '_________________________'}</p>
              </div>
            </div>

            {showSignature && (
              <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="text-sm font-bold text-gray-800 text-center mb-5 uppercase tracking-wide">Mengetahui</p>
                <div className="flex justify-end">
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
                    <div className="w-48 h-[1.5px] bg-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900 tracking-wide">{kades?.nama || data?.kades_nama || '_________________________'}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== SURAT 3: KETUA KUD SIGNATURE (right) ===== */}
        {suratIndex === 3 && (
          <div className="flex justify-end mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">Ketua Koperasi Unit Desa Sari Subur,</p>
              {(() => {
                const ttdKetua = program?.tanda_tangan_ketua_kud;
                return ttdKetua ? (
                  <img src={ttdKetua} alt="Tanda Tangan Ketua KUD" className="h-14 object-contain mx-auto mb-1" />
                ) : (
                  <div className="h-14" />
                );
              })()}
              <div className="w-48 h-[1.5px] bg-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
