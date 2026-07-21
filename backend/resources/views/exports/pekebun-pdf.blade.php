<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Data Pekebun</title>
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
    .badge { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 8px; font-weight: 700; }
    .badge-verified { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef9c3; color: #854d0e; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .text-center { text-align: center; }
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
            <th>Nama</th>
            <th>NIK</th>
            <th>Kontak</th>
            <th>Alamat</th>
            <th style="width:50px">Status</th>
            <th style="width:30px;text-align:center">Lahan</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $i => $p)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><strong>{{ $p->nama }}</strong></td>
            <td>{{ $p->nik }}</td>
            <td>{{ $p->no_whatsapp ?? '-' }}</td>
            <td>{{ $p->alamat ?? '-' }}</td>
            <td><span class="badge badge-{{ $p->status }}">{{ $p->status }}</span></td>
            <td class="text-center">{{ $p->lahan->count() }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<div class="footer">
    Dicetak dari Sistem Informasi KUD Desa Sari Subur &mdash; {{ date('Y') }}
</div>
</body>
</html>
