<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Data Lahan Pekebun</title>
<style>
    @page { margin: 20mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 10px; line-height: 1.4; }
    .kop { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #1e40af; margin-bottom: 14px; }
    .kop h1 { font-size: 18px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
    .kop p { font-size: 9px; color: #64748b; margin-top: 2px; }
    .kop .date { font-size: 9px; color: #94a3b8; margin-top: 4px; }
    .title { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 9px; }
    thead th { background: #1e40af; color: white; padding: 7px 6px; text-align: left; font-weight: 700; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
    tbody td { padding: 5px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .footer { text-align: center; font-size: 8px; color: #94a3b8; margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="kop">
    <h1>KUD Desa Sari Subur</h1>
    <p>Kec. Megang Sakti, Kabupaten Musi Rawas, Sumatera Selatan</p>
    <div class="date">{{ $date }}</div>
</div>
<div class="title">{{ $title }}</div>
<table>
    <thead>
        <tr>
            <th style="width:24px">No</th>
            <th>Pekebun</th>
            <th>NIK</th>
            <th>Alamat Lahan</th>
            <th>Jenis Surat</th>
            <th>Luas (M2)</th>
            <th>Koordinat</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $i => $l)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><strong>{{ $l->pekebun->nama ?? '-' }}</strong></td>
            <td>{{ $l->pekebun->nik ?? '-' }}</td>
            <td>{{ $l->alamat_lahan ?? '-' }}</td>
            <td>{{ $l->jenis_surat ?? '-' }}</td>
            <td class="text-right">{{ number_format($l->luas_lahan_m2, 0) }}</td>
            <td>{{ $l->latitude && $l->longitude ? $l->latitude . ', ' . $l->longitude : '-' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<div class="footer">
    Dicetak dari Sistem Informasi KUD Desa Sari Subur &mdash; {{ date('Y') }}
</div>
</body>
</html>
