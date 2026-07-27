<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Kartu Anggota</title>
<style>
    @page { size: 176mm 56mm landscape; margin: 0; }
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 7pt; color: #1e293b; width: 176mm; height: 56mm; line-height: 1.2; }
    table { border-collapse: collapse; }
    .front-card { width: 88mm; height: 56mm; }
    .back-card { width: 88mm; height: 56mm; }
    .color-panel { width: 16mm; }
    .content-area { width: 72mm; padding: 1.5mm 2.5mm; vertical-align: top; }
    .card-logo { width: 18px; height: 18px; }
    .card-title { font-size: 10pt; font-weight: 800; letter-spacing: 0.5px; }
    .card-subtitle { font-size: 6pt; color: #64748b; }
    .member-name { font-size: 10pt; font-weight: 800; color: #0f172a; }
    .info-label { font-size: 6pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
    .info-value { font-size: 7.5pt; font-weight: 600; color: #1e293b; }
    .qr-img { width: 28px; height: 28px; }
    .validity { font-size: 5.5pt; color: #64748b; }
    .back-header { height: 7mm; padding: 1.5mm 2.5mm; }
    .back-header-text { font-size: 7pt; font-weight: 700; color: #ffffff; }
    .back-body { padding: 1.5mm 2.5mm; vertical-align: top; }
    .back-body p { font-size: 6pt; line-height: 1.35; color: #334155; }
    .aturan-item { font-size: 5.5pt; color: #475569; padding-left: 3px; }
    .slogan { font-size: 6.5pt; font-style: italic; color: #475569; }
    .ttd-img { width: 35px; height: 25px; }
    .stempel-img { width: 30px; height: 30px; }
    .ketua-name { font-size: 7pt; font-weight: 700; }
    .ketua-title { font-size: 6pt; color: #64748b; }
    .divider { border-top: 0.5pt solid #cbd5e1; margin: 1.5mm 0; }
    .foto-pekebun { width: 22px; height: 28px; object-fit: cover; }
</style>
</head>
<body>
<table style="width:176mm;height:56mm;table-layout:fixed;">
<tr>
<td style="width:88mm;height:56mm;vertical-align:top;padding:0;">
    <table class="front-card" style="width:88mm;height:56mm;">
    <tr>
        <td class="color-panel" style="width:16mm;background:{{ $setting_kud->kartu_warna_primary ?? '#059669' }};" valign="top">
            <table style="width:16mm;height:56mm;">
            <tr><td style="text-align:center;color:#ffffff;writing-mode:vertical-rl;font-size:6pt;font-weight:700;letter-spacing:2px;">
                {{ strtoupper($setting_kud->kartu_judul_depan ?? 'KARTU ANGGOTA') }}
            </td></tr>
            </table>
        </td>
        <td class="content-area" style="width:72mm;padding:1.5mm 2.5mm;vertical-align:top;">
            <table style="width:100%;">
            <tr>
                <td style="width:20px;vertical-align:middle;">
                    @if($setting_kud->logo)
                        <img src="{{ $setting_kud->logo }}" class="card-logo" style="width:18px;height:18px;" />
                    @else
                        <span style="display:inline-block;width:18px;height:18px;background:#cbd5e1;"></span>
                    @endif
                </td>
                <td style="vertical-align:middle;padding-left:2mm;">
                    <div class="card-title" style="font-size:10pt;font-weight:800;">{{ $setting_kud->nama_kud ?? 'KUD' }}</div>
                    <div class="card-subtitle" style="font-size:6pt;color:#64748b;">{{ $setting_kud->kartu_subjudul_depan ?? '' }}</div>
                </td>
            </tr>
            </table>

            <div style="margin-top:1.5mm;">
                <div class="card-title" style="font-size:9pt;font-weight:800;color:{{ $setting_kud->kartu_warna_primary ?? '#059669' }};letter-spacing:1px;">
                    {{ $setting_kud->kartu_label_anggota ?? 'KARTU ANGGOTA' }}
                </div>
            </div>

            <div class="divider" style="border-top:0.5pt solid #cbd5e1;margin:1mm 0;"></div>

            <table style="width:100%;">
            <tr>
                <td style="vertical-align:top;width:42mm;">
                    <div class="member-name" style="font-size:10pt;font-weight:800;color:#0f172a;">{{ $pekebun->nama }}</div>

                    <div style="margin-top:1.5mm;">
                        <div class="info-label" style="font-size:6pt;color:#64748b;text-transform:uppercase;">NIK</div>
                        <div class="info-value" style="font-size:7.5pt;font-weight:600;">{{ $pekebun->nik ?? '-' }}</div>
                    </div>

                    <div style="margin-top:1mm;">
                        <div class="info-label" style="font-size:6pt;color:#64748b;text-transform:uppercase;">No. Anggota</div>
                        <div class="info-value" style="font-size:7.5pt;font-weight:600;">{{ $nomor_anggota }}</div>
                    </div>

                    <div style="margin-top:1mm;">
                        <div class="validity" style="font-size:5.5pt;color:#64748b;">
                            Berlaku s.d: {{ \Carbon\Carbon::parse($masa_berlaku)->isoFormat('DD MMMM YYYY') }}
                        </div>
                    </div>
                </td>
                <td style="vertical-align:middle;text-align:right;width:24mm;">
                    @if($pekebun->foto_pekebun)
                        <img src="{{ $pekebun->foto_pekebun }}" class="foto-pekebun" style="width:22px;height:28px;object-fit:cover;border:0.5pt solid #cbd5e1;" />
                    @else
                        <span style="display:inline-block;width:22px;height:28px;background:#e2e8f0;border:0.5pt solid #cbd5e1;"></span>
                    @endif
                    <div style="margin-top:1mm;">
                        <img src="{{ public_path('images/qr-link-kud.jpg') }}" class="qr-img" style="width:28px;height:28px;" onerror="this.style.display='none'" />
                    </div>
                </td>
            </tr>
            </table>
        </td>
    </tr>
    </table>
</td>
<td style="width:88mm;height:56mm;vertical-align:top;padding:0;">
    <table style="width:88mm;height:56mm;">
    <tr>
        <td class="back-header" style="height:7mm;background:{{ $setting_kud->kartu_belakang_warna ?? '#028143' }};padding:1.5mm 2.5mm;">
            <table style="width:100%;">
            <tr>
                <td style="text-align:left;">
                    <span class="back-header-text" style="font-size:7pt;font-weight:700;color:#ffffff;">{{ $setting_kud->nama_kud ?? 'KUD' }}</span>
                </td>
                <td style="text-align:right;">
                    <span style="font-size:5.5pt;color:rgba(255,255,255,0.85);">{{ $setting_kud->website ?? '' }}</span>
                </td>
            </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td class="back-body" style="padding:1.5mm 2.5mm;vertical-align:top;">
            <table style="width:100%;">
            <tr>
                <td style="vertical-align:top;width:50%;padding-right:1.5mm;">
                    @if($setting_kud->kartu_aturan && count($setting_kud->kartu_aturan) > 0)
                        <div style="font-size:6pt;font-weight:700;color:#1e293b;margin-bottom:0.5mm;">Aturan:</div>
                        <ol style="margin:0;padding-left:3mm;">
                        @foreach($setting_kud->kartu_aturan as $aturan)
                            <li class="aturan-item" style="font-size:5.5pt;color:#475569;">{{ $aturan }}</li>
                        @endforeach
                        </ol>
                    @endif
                </td>
                <td style="vertical-align:top;width:50%;padding-left:1.5mm;">
                    <div style="font-size:6pt;font-weight:700;color:#1e293b;">Sekretariat:</div>
                    <p style="font-size:5.5pt;color:#475569;margin-top:0.5mm;line-height:1.35;">
                        {{ $setting_kud->alamat ?? '-' }}<br/>
                        Telp: {{ $setting_kud->telepon ?? '-' }} | Email: {{ $setting_kud->email ?? '-' }}
                    </p>

                    @if($setting_kud->kartu_slogan)
                        <div class="slogan" style="font-size:6.5pt;font-style:italic;color:#475569;margin-top:1mm;">
                            &ldquo;{{ $setting_kud->kartu_slogan }}&rdquo;
                        </div>
                    @endif
                </td>
            </tr>
            </table>

            <div class="divider" style="border-top:0.5pt solid #cbd5e1;margin:1mm 0;"></div>

            <table style="width:100%;">
            <tr>
                <td style="width:50%;vertical-align:bottom;text-align:center;">
                    <div style="font-size:6pt;color:#475569;">
                        {{ $setting_kud->kartu_kota_terbit ?? '' }}, {{ \Carbon\Carbon::parse($tanggal_terbit)->isoFormat('DD MMMM YYYY') }}
                    </div>
                    <div style="margin-top:3mm;">
                        <div class="ketua-title" style="font-size:6pt;color:#64748b;">{{ $setting_kud->kartu_ketua_jabatan ?? 'Ketua' }}</div>
                        <div style="margin-top:0.5mm;">
                            @if($setting_kud->kartu_ttd)
                                <img src="{{ $setting_kud->kartu_ttd }}" class="ttd-img" style="width:35px;height:20px;" />
                            @else
                                <div style="height:15px;"></div>
                            @endif
                        </div>
                        <div class="ketua-name" style="font-size:7pt;font-weight:700;margin-top:0.5mm;">
                            {{ $setting_kud->kartu_ketua_nama ?? $setting_kud->nama_ketua ?? '-' }}
                        </div>
                        <div class="ketua-title" style="font-size:6pt;color:#64748b;">{{ $setting_kud->kartu_ketua_jabatan ?? 'Ketua' }}</div>
                    </div>
                </td>
                <td style="width:50%;text-align:center;vertical-align:bottom;">
                    @if($setting_kud->kartu_stempel)
                        <img src="{{ $setting_kud->kartu_stempel }}" class="stempel-img" style="width:30px;height:30px;" />
                    @endif
                </td>
            </tr>
            </table>
        </td>
    </tr>
    </table>
</td>
</tr>
</table>
</body>
</html>
