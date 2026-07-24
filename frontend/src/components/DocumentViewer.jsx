'use client';

import { useMemo } from 'react';

const KADES_MAP = {
  'tegal sari': { nama: 'SISWOYO', title: 'Kepala Desa Tegalsari Kecamatan Megang Sakti' },
  'marga puspita': { nama: 'SUMODIONO', title: 'Kepala Desa Marga Puspita Kecamatan Megang Sakti' },
  'campur sari': { nama: 'MUKHSIN', title: 'Kepala Desa Campur Sari Kecamatan Megang Sakti' },
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

function todayDateStr() {
  try {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '_________________________';
  }
}

const todayDate = todayDateStr();

function InfoRow({ label, value }) {
  return (
    <div className="flex my-1">
      <span className="w-36 font-medium text-slate-600 text-sm shrink-0">{label}</span>
      <span className="mr-2 text-sm text-slate-600">:</span>
      <span className="font-semibold text-slate-900 text-sm uppercase">{value || '_________________________'}</span>
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

function SingleSignerBlock({ dateLabel, jabatan, ttdUrl, namaTerang }) {
  return (
    <div className="flex flex-col items-end mt-8 text-sm text-slate-800">
      <div className="text-center w-64 space-y-1">
        <p className="text-right">Megang Sakti, {todayDate}</p>
        <p className="font-medium mt-2">{jabatan || 'Yang Membuat Pernyataan,'}</p>
        <div className="h-20 flex items-center justify-center my-2">
          {ttdUrl ? (
            <img src={ttdUrl} alt="Tanda Tangan" className="h-20 object-contain" />
          ) : (
            <div className="h-16" />
          )}
        </div>
        <p className="font-bold text-slate-900 uppercase tracking-wide">{namaTerang || '_________________________'}</p>
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
  const body = isi || DEFAULT_BODY[suratIndex] || '';
  const title = judul || DEFAULT_JUDUL[suratIndex] || '';
  const rendered = useMemo(() => replacePlaceholders(body, data), [body, data]);
  const desa = useMemo(() => detectDesa(data?.alamat), [data?.alamat]);
  const kades = desa ? KADES_MAP[desa] : null;
  const logoKudUrl = data?.logo_kud;
  const qrUrl = data?.qr_logo;

  let kadesSignature = '';
  if (desa === 'tegal sari') kadesSignature = program?.tanda_tangan_kades_tegal_sari;
  else if (desa === 'marga puspita') kadesSignature = program?.tanda_tangan_kades_marga_puspita;
  else if (desa === 'campur sari') kadesSignature = program?.tanda_tangan_kades_campur_sari;

  return (
    <div className="bg-white shadow-md border border-slate-200/80 rounded-2xl overflow-hidden print:shadow-none print:border-none">
      <style>{`
        @page { size: A4 portrait; margin: 20mm 25mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="p-6 sm:p-10 max-w-3xl mx-auto my-4 text-slate-800">

        {/* SURAT 3 HEADER */}
        {suratIndex === 3 && (
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="w-[65px] sm:w-[80px] h-[65px] sm:h-[80px] shrink-0">
              {logoKudUrl ? (
                <img src={logoKudUrl} alt="Logo KUD" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-50 rounded flex items-center justify-center text-[7px] text-slate-300 border border-dashed border-slate-200">Logo</div>
              )}
            </div>
            <div className="flex-1 min-w-0 mx-1 sm:mx-3">
              <div className="text-center leading-tight">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                  KOPERASI UNIT DESA (KUD) &ldquo; S A R I &nbsp; S U B U R &rdquo;
                </p>
                <p className="text-[9px] sm:text-[10px] font-semibold text-slate-800 uppercase mt-0.5">
                  DESA TEGALSARI KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
                </p>
                <p className="text-[7px] sm:text-[8px] text-slate-600 mt-0.5 leading-tight">
                  Sekretariat : Desa Tegalsari Dusun I Kec. Megang Sakti Kab. Musi Rawas Provinsi Sumatera Selatan, 31657
                </p>
                <p className="text-[7px] sm:text-[8px] text-slate-600 leading-tight">
                  HP. 0822-2728-3416 – Email : kudsarisubur@gmail.com – https://kudsarisubur.blogspot.com/
                </p>
              </div>
            </div>
            <div className="w-[65px] sm:w-[80px] h-[65px] sm:h-[80px] shrink-0 flex flex-col items-center">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-50 rounded flex items-center justify-center text-[7px] text-slate-300 border border-dashed border-slate-200">QR</div>
              )}
            </div>
          </div>
        )}

        {/* TITLE */}
        <div className="text-center mb-6">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 inline-block pb-0.5">
            {title}
          </h2>
          {suratIndex === 2 && (
            <p className="text-[11px] font-semibold text-slate-700 mt-1 tracking-wide">
              PERKEBUNAN KELAPA SAWIT TA.2026
            </p>
          )}
        </div>

        {/* SURAT 3: KETUA KUD DATA */}
        {suratIndex === 3 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800 mb-2">Yang bertanda tangan di bawah ini :</p>
            <InfoRow label="Nama" value={data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'} />
            <InfoRow label="Jabatan" value={data?.ketua_kud_jabatan || 'Ketua Koperasi Unit Desa Sari Subur'} />
            <InfoRow label="Alamat" value={data?.ketua_kud_alamat || 'Desa Tegalsari Kecamatan Megang Sakti Kabupaten Musi Rawas'} />
          </div>
        )}

        {/* SURAT 3: PEKEBUN DATA */}
        {suratIndex === 3 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800 mb-2">Menerangkan dengan sebenarnya, bahwa :</p>
            <InfoRow label="Nama" value={data?.nama_pekebun} />
            <InfoRow label="NIK" value={data?.nik} />
            <InfoRow label="Jenis Kelamin" value={data?.jenis_kelamin} />
            <InfoRow label="Alamat" value={data?.alamat_lengkap || data?.alamat} />
          </div>
        )}

        {/* SURAT 1 & 2: PEKEBUN DATA */}
        {suratIndex !== 3 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800 mb-2">Yang bertanda tangan di bawah ini :</p>
            <InfoRow label="Nama" value={data?.nama_pekebun} />
            <InfoRow label="NIK" value={data?.nik} />
            <InfoRow label="Jenis Kelamin" value={data?.jenis_kelamin} />
            <InfoRow label="Alamat" value={suratIndex === 2 ? (data?.alamat_lengkap || data?.alamat) : data?.alamat} />
            {suratIndex === 1 && <InfoRow label="Nomor Hp/Telepon" value={data?.no_whatsapp} />}
          </div>
        )}

        {/* SURAT 2: ALAMAT SUB */}
        {suratIndex === 2 && (
          <p className="text-sm font-semibold text-slate-800 -mt-1 mb-4 tracking-wide indent-[180px]">
            KECAMATAN MEGANG SAKTI KABUPATEN MUSI RAWAS
          </p>
        )}

        {/* BODY TEXT */}
        <div className="text-justify leading-relaxed text-sm sm:text-base text-slate-700 my-4 space-y-1">
          {rendered.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            return <p key={i} className="text-justify">{trimmed}</p>;
          })}
        </div>

        {/* SURAT 1: TTD PEKEBUN — Single Signer */}
        {suratIndex === 1 && (
          <SingleSignerBlock
            jabatan="Yang Membuat Pernyataan,"
            ttdUrl={signature}
            namaTerang={data?.nama_pekebun}
          />
        )}

        {/* SURAT 2: TTD PEKEBUN (kiri) + KADES (kanan) — GRID 2 KOLOM */}
        {suratIndex === 2 && (
          <div className="grid grid-cols-2 gap-4 mt-8 text-sm text-center text-slate-800">
            <div>
              <p className="font-medium text-slate-600 mb-4">Saya yang membuat Pernyataan,</p>
              {signature ? (
                <div className="h-20 flex items-center justify-center my-2">
                  <img src={signature} alt="Tanda Tangan" className="h-20 object-contain" />
                </div>
              ) : (
                <div className="h-20" />
              )}
              <p className="font-bold text-slate-900 uppercase tracking-wide">{data?.nama_pekebun || '_________________________'}</p>
            </div>
            {showSignature && (
              <div>
                <p className="text-right text-slate-700 mb-4">Megang Sakti, {todayDate}</p>
                <p className="font-bold text-slate-800 mb-4 uppercase tracking-wide">Mengetahui</p>
                <p className="text-slate-600 mb-4">{kades?.title || 'Kepala Desa'}</p>
                {kadesSignature ? (
                  <div className="h-20 flex items-center justify-center my-2">
                    <img src={kadesSignature} alt="Tanda Tangan Kades" className="h-20 object-contain" />
                  </div>
                ) : (
                  <div className="h-20" />
                )}
                <p className="font-bold text-slate-900 tracking-wide">{kades?.nama || data?.kades_nama || '_________________________'}</p>
              </div>
            )}
          </div>
        )}

        {/* SURAT 3: TTD KETUA KUD — Single Signer */}
        {suratIndex === 3 && (
          <SingleSignerBlock
            jabatan="Ketua Koperasi Unit Desa Sari Subur,"
            ttdUrl={program?.tanda_tangan_ketua_kud}
            namaTerang={data?.ketua_kud_nama || 'Dedek Sulaiman, S.Pd.'}
          />
        )}

      </div>
    </div>
  );
}
