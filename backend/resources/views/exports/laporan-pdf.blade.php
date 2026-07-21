<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{{ $title }}</title>
<style>
    @page { margin: 20mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 10px; line-height: 1.4; }
    .kop { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #1e40af; margin-bottom: 16px; }
    .kop h1 { font-size: 18px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
    .kop p { font-size: 9px; color: #64748b; margin-top: 2px; }
    .kop .date { font-size: 9px; color: #94a3b8; margin-top: 4px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 12px; font-weight: 700; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; color: #1e40af; }
    table { width: 100%; border-collapse: collapse; font-size: 9px; }
    thead th { background: #1e40af; color: white; padding: 6px 8px; text-align: left; font-weight: 700; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
    tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 8px; font-weight: 700; }
    .badge-verified { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef9c3; color: #854d0e; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .footer { text-align: center; font-size: 8px; color: #94a3b8; margin-top: 20px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="kop">
    <h1>KUD Desa Sari Subur</h1>
    <p>Kec. Megang Sakti, Kabupaten Musi Rawas, Sumatera Selatan</p>
    <div class="date">{{ $date }}</div>
</div>
<div class="title" style="font-size:14px;font-weight:700;margin-bottom:14px">{{ $title }}</div>

@if(!empty($data['pekebun_per_status']))
<div class="section">
    <div class="section-title">Pekebun per Status</div>
    <table>
        <thead>
            <tr>
                <th>Status</th>
                <th class="text-center" style="width:80px">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['pekebun_per_status'] as $s)
            <tr>
                <td><span class="badge badge-{{ $s->status ?? $s['status'] }}">{{ $s->status ?? $s['status'] }}</span></td>
                <td class="text-center">{{ $s->total ?? $s['total'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

@if(!empty($data['pendaftaran_per_program']))
<div class="section">
    <div class="section-title">Pendaftaran per Program</div>
    <table>
        <thead>
            <tr>
                <th>Program</th>
                <th class="text-center" style="width:100px">Total Pendaftar</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['pendaftaran_per_program'] as $p)
            <tr>
                <td><strong>{{ $p->programKud->nama ?? $p['program_kud_nama'] ?? '-' }}</strong></td>
                <td class="text-center">{{ $p->total ?? $p['total'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

@if(!empty($data['tbs_per_bulan']))
<div class="section">
    <div class="section-title">Total TBS per Bulan</div>
    <table>
        <thead>
            <tr>
                <th>Bulan</th>
                <th class="text-right" style="width:100px">Total TBS</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['tbs_per_bulan'] as $t)
            <tr>
                <td>{{ $t->bulan ?? $t['bulan'] }}</td>
                <td class="text-right">{{ number_format($t->total ?? $t['total'], 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

@if(empty($data['pekebun_per_status']) && empty($data['pendaftaran_per_program']) && empty($data['tbs_per_bulan']))
<div style="text-align:center;padding:30px 0;color:#94a3b8;font-size:11px">
    Tidak ada data laporan untuk ditampilkan.
</div>
@endif

<div class="footer">
    Dicetak dari Sistem Informasi KUD Desa Sari Subur &mdash; {{ date('Y') }}
</div>
</body>
</html>
