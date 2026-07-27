<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Sertifikat Anggota</title>
<style>
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; width: 297mm; height: 210mm; line-height: 1.3; }
    table { border-collapse: collapse; }
    .certificate-wrapper { width: 100%; height: 100%; padding: 6mm; }
    .outer-border { width: 100%; height: 100%; border: 2pt solid #1e293b; }
    .inner-border { width: 100%; height: 100%; border: 1pt solid #475569; padding: 8mm 12mm; }
    .inner-frame { width: 100%; height: 100%; position: relative; }
    .corner-decoration { position: relative; }
    .corner-tl { position: absolute; top: -8mm; left: -12mm; width: 15mm; height: 15mm; border-top: 3pt solid #059669; border-left: 3pt solid #059669; }
    .corner-tr { position: absolute; top: -8mm; right: -12mm; width: 15mm; height: 15mm; border-top: 3pt solid #059669; border-right: 3pt solid #059669; }
    .corner-bl { position: absolute; bottom: -8mm; left: -12mm; width: 15mm; height: 15mm; border-bottom: 3pt solid #059669; border-left: 3pt solid #059669; }
    .corner-br { position: absolute; bottom: -8mm; right: -12mm; width: 15mm; height: 15mm; border-bottom: 3pt solid #059669; border-right: 3pt solid #059669; }
    .header-logo { width: 55px; height: 55px; }
    .cert-title { font-size: 26pt; font-weight: 800; color: #059669; letter-spacing: 3px; text-transform: uppercase; }
    .cert-subtitle { font-size: 13pt; color: #1e293b; font-weight: 600; }
    .cert-divider { width: 80mm; height: 0; border-top: 1.5pt solid #059669; margin: 3mm auto; }
    .cert-nomor { font-size: 9pt; color: #64748b; letter-spacing: 0.5px; }
    .cert-label { font-size: 11pt; color: #475569; }
    .cert-name { font-size: 28pt; font-weight: 800; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; }
    .cert-role-text { font-size: 11pt; color: #475569; }
    .cert-footer-label { font-size: 9pt; color: #64748b; }
    .cert-ketua-name { font-size: 11pt; font-weight: 700; color: #0f172a; }
    .cert-ketua-title { font-size: 9pt; color: #64748b; }
    .ttd-img { width: 55px; height: 35px; }
    .qr-img { width: 45px; height: 45px; }
    .cert-ornament { width: 100%; height: 3pt; background: linear-gradient(to right, transparent, #059669, transparent); }
</style>
</head>
<body>
<div class="certificate-wrapper" style="width:100%;height:100%;padding:6mm;">
    <table class="outer-border" style="width:100%;height:100%;border:2pt solid #1e293b;">
    <tr><td style="text-align:center;vertical-align:middle;">
        <table class="inner-border" style="width:100%;height:100%;border:1pt solid #475569;padding:8mm 12mm;">
        <tr><td style="padding:8mm 12mm;vertical-align:top;">

            <table style="width:100%;">
            <tr>
                <td style="text-align:center;padding-bottom:3mm;">
                    <table style="margin:0 auto;">
                    <tr>
                        <td style="text-align:center;">
                            @if($setting_kud->logo)
                                <img src="{{ $setting_kud->logo }}" class="header-logo" style="width:55px;height:55px;" />
                            @else
                                <span style="display:inline-block;width:55px;height:55px;background:#e2e8f0;border-radius:50%;"></span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center;padding-top:2mm;">
                            <div class="cert-title" style="font-size:26pt;font-weight:800;color:#059669;letter-spacing:3px;text-transform:uppercase;">
                                SERTIFIKAT ANGGOTA
                            </div>
                            <div class="cert-subtitle" style="font-size:13pt;color:#1e293b;font-weight:600;margin-top:1mm;">
                                {{ $setting_kud->nama_kud ?? 'KUD Desa Sari Subur' }}
                            </div>
                            <div class="cert-divider" style="width:80mm;border-top:1.5pt solid #059669;margin:2.5mm auto;"></div>
                            <div class="cert-nomor" style="font-size:9pt;color:#64748b;letter-spacing:0.5px;">
                                No. {{ $nomor_anggota }}
                            </div>
                        </td>
                    </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align:center;padding:3mm 0;">
                    <div class="cert-label" style="font-size:11pt;color:#475569;margin-bottom:2mm;">Diberikan Kepada</div>
                    <div style="width:60mm;border-top:1pt solid #cbd5e1;margin:1.5mm auto;"></div>
                    <div class="cert-name" style="font-size:28pt;font-weight:800;color:#0f172a;letter-spacing:1px;text-transform:uppercase;margin:2.5mm 0;">
                        {{ $pekebun->nama }}
                    </div>
                    <div style="width:60mm;border-top:1pt solid #cbd5e1;margin:1.5mm auto;"></div>
                    <div class="cert-role-text" style="font-size:11pt;color:#475569;margin-top:2mm;">
                        Sebagai Anggota Aktif {{ $setting_kud->nama_kud ?? 'KUD Desa Sari Subur' }}
                    </div>

                    @if($pekebun->nik)
                    <div style="font-size:9pt;color:#64748b;margin-top:1.5mm;">
                        NIK: {{ $pekebun->nik }}
                    </div>
                    @endif

                    <div style="font-size:9pt;color:#64748b;margin-top:1mm;">
                        Berlaku sejak: {{ $tanggal_terbit ?? now()->format('d F Y') }}
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding-top:4mm;">
                    <table style="width:100%;">
                    <tr>
                        <td style="width:50%;text-align:center;vertical-align:bottom;">
                            <div style="display:inline-block;text-align:center;">
                                <div class="cert-footer-label" style="font-size:9pt;color:#64748b;">
                                    {{ $setting_kud->kartu_kota_terbit ?? '' }}, {{ \Carbon\Carbon::parse($tanggal_terbit ?? now())->isoFormat('DD MMMM YYYY') }}
                                </div>
                                <div style="margin-top:1mm;">
                                    <div class="cert-ketua-title" style="font-size:9pt;color:#64748b;">{{ $setting_kud->kartu_ketua_jabatan ?? 'Ketua' }}</div>
                                    <div style="margin-top:1.5mm;">
                                        @if($setting_kud->kartu_ttd)
                                            <img src="{{ $setting_kud->kartu_ttd }}" class="ttd-img" style="width:55px;height:35px;" />
                                        @else
                                            <div style="height:25px;"></div>
                                        @endif
                                    </div>
                                    <div style="border-top:1pt solid #1e293b;width:50mm;margin:1mm auto 0.5mm;"></div>
                                    <div class="cert-ketua-name" style="font-size:11pt;font-weight:700;color:#0f172a;">
                                        {{ $setting_kud->kartu_ketua_nama ?? $setting_kud->nama_ketua ?? '-' }}
                                    </div>
                                    <div class="cert-ketua-title" style="font-size:9pt;color:#64748b;">{{ $setting_kud->kartu_ketua_jabatan ?? 'Ketua' }}</div>
                                </div>
                            </div>
                        </td>
                        <td style="width:50%;text-align:center;vertical-align:bottom;">
                            <div style="display:inline-block;text-align:center;">
                                <div style="font-size:8pt;color:#94a3b8;margin-bottom:1mm;">Verifikasi Keanggotaan</div>
                                <img src="{{ public_path('images/qr-link-kud.jpg') }}" class="qr-img" style="width:45px;height:45px;" onerror="this.style.display='none'" />
                                <div style="font-size:7pt;color:#94a3b8;margin-top:0.5mm;">Scan untuk verifikasi data</div>

                                @if($setting_kud->kartu_stempel)
                                    <div style="margin-top:2mm;">
                                        <img src="{{ $setting_kud->kartu_stempel }}" class="stempel-img" style="width:40px;height:40px;" />
                                    </div>
                                @endif
                            </div>
                        </td>
                    </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align:center;padding-top:3mm;">
                    <div style="border-top:1pt solid #e2e8f0;padding-top:1.5mm;">
                        <span style="font-size:7pt;color:#94a3b8;">
                            {{ $setting_kud->alamat ?? '' }} | Telp: {{ $setting_kud->telepon ?? '' }} | Email: {{ $setting_kud->email ?? '' }} | {{ $setting_kud->website ?? '' }}
                        </span>
                    </div>
                </td>
            </tr>
            </table>

        </td></tr>
        </table>
    </td></tr>
    </table>
</div>
</body>
</html>
