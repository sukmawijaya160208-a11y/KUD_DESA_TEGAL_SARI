<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Kartu Admin</title>
<style>
    @page { size: 176mm 56mm landscape; margin: 0; }
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 7pt; color: #1e293b; width: 176mm; height: 56mm; line-height: 1.2; }
    table { border-collapse: collapse; }
    .color-panel { width: 16mm; }
    .content-area { width: 72mm; padding: 1.5mm 2.5mm; vertical-align: top; }
    .card-logo { width: 18px; height: 18px; }
    .card-title { font-size: 10pt; font-weight: 800; letter-spacing: 0.5px; }
    .card-subtitle { font-size: 6pt; color: #64748b; }
    .admin-name { font-size: 10pt; font-weight: 800; color: #0f172a; }
    .info-label { font-size: 6pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
    .info-value { font-size: 7.5pt; font-weight: 600; color: #1e293b; }
    .qr-img { width: 28px; height: 28px; }
    .foto-admin { width: 24px; height: 28px; object-fit: cover; }
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
    .role-badge { display: inline-block; padding: 0.5mm 2mm; background: #dbeafe; color: #1e40af; font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
</style>
</head>
<body>
<table style="width:176mm;height:56mm;table-layout:fixed;">
<tr>
<td style="width:88mm;height:56mm;vertical-align:top;padding:0;">
    <table style="width:88mm;height:56mm;">
    <tr>
        <td class="color-panel" style="width:16mm;background:{{ $setting_kud->kartu_warna_primary ?? '#059669' }};" valign="top">
            <table style="width:16mm;height:56mm;">
            <tr><td style="text-align:center;color:#ffffff;writing-mode:vertical-rl;font-size:6pt;font-weight:700;letter-spacing:2px;">
                KARTU ADMIN
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
                <span class="card-title" style="font-size:9pt;font-weight:800;color:{{ $setting_kud->kartu_warna_primary ?? '#059669' }};letter-spacing:1px;">
                    KARTU ADMIN
                </span>
                <span class="role-badge" style="display:inline-block;padding:0.5mm 2mm;background:#dbeafe;color:#1e40af;font-size:6pt;font-weight:700;text-transform:uppercase;margin-left:1.5mm;">
                    {{ $user->role ?? 'STAFF' }}
                </span>
            </div>

            <div class="divider" style="border-top:0.5pt solid #cbd5e1;margin:1mm 0;"></div>

            <table style="width:100%;">
            <tr>
                <td style="vertical-align:top;width:42mm;">
                    <div class="admin-name" style="font-size:10pt;font-weight:800;color:#0f172a;">{{ $user->name }}</div>

                    <div style="margin-top:1.5mm;">
                        <div class="info-label" style="font-size:6pt;color:#64748b;text-transform:uppercase;">Email</div>
                        <div class="info-value" style="font-size:7.5pt;font-weight:600;">{{ $user->email ?? '-' }}</div>
                    </div>

                    <div style="margin-top:1mm;">
                        <div class="info-label" style="font-size:6pt;color:#64748b;text-transform:uppercase;">Telepon</div>
                        <div class="info-value" style="font-size:7.5pt;font-weight:600;">{{ $user->phone ?? '-' }}</div>
                    </div>
                </td>
                <td style="vertical-align:middle;text-align:right;width:24mm;">
                    @if($user->foto_profil)
                        <img src="{{ $user->foto_profil }}" class="foto-admin" style="width:24px;height:28px;object-fit:cover;border:0.5pt solid #cbd5e1;" />
                    @else
                        <span style="display:inline-block;width:24px;height:28px;background:#e2e8f0;border:0.5pt solid #cbd5e1;"></span>
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
                    <div style="font-size:6pt;font-weight:700;color:#1e293b;margin-bottom:0.5mm;">Hak Akses:</div>
                    <div style="font-size:6pt;color:#475569;margin-top:0.5mm;">
                        @if($user->role === 'admin')
                            Manajemen data anggota, pengaturan KUD, laporan, verifikasi, dan seluruh fitur sistem.
                        @elseif($user->role === 'verifikator')
                            Verifikasi data pekebun, pendaftaran program, dan konfirmasi data lahan.
                        @else
                            Akses terbatas sesuai tugas yang diberikan.
                        @endif
                    </div>

                    <div style="margin-top:1.5mm;">
                        <div style="font-size:6pt;font-weight:700;color:#1e293b;">Tugas:</div>
                        <p style="font-size:5.5pt;color:#475569;margin-top:0.5mm;line-height:1.35;">
                            @if($user->role === 'admin')
                                Mengelola operasional KUD, data anggota, dan pengaturan sistem.
                            @elseif($user->role === 'verifikator')
                                Memverifikasi kebenaran data dan dokumen pekebun.
                            @else
                                Menjalankan tugas operasional sesuai arahan.
                            @endif
                        </p>
                    </div>
                </td>
                <td style="vertical-align:top;width:50%;padding-left:1.5mm;">
                    @if($setting_kud->kartu_aturan && count($setting_kud->kartu_aturan) > 0)
                        <div style="font-size:6pt;font-weight:700;color:#1e293b;margin-bottom:0.5mm;">Aturan:</div>
                        <ol style="margin:0;padding-left:3mm;">
                        @foreach($setting_kud->kartu_aturan as $aturan)
                            <li class="aturan-item" style="font-size:5.5pt;color:#475569;">{{ $aturan }}</li>
                        @endforeach
                        </ol>
                    @endif

                    @if($setting_kud->kartu_slogan)
                        <div class="slogan" style="font-size:6.5pt;font-style:italic;color:#475569;margin-top:1.5mm;">
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
                        {{ $setting_kud->kartu_kota_terbit ?? '' }}, {{ now()->isoFormat('DD MMMM YYYY') }}
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
                    <div style="font-size:6pt;font-weight:700;color:#1e293b;margin-bottom:1mm;">Sekretariat:</div>
                    <p style="font-size:5.5pt;color:#475569;line-height:1.35;">
                        {{ $setting_kud->alamat ?? '-' }}<br/>
                        Telp: {{ $setting_kud->telepon ?? '-' }}
                    </p>
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
