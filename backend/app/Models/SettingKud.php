<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettingKud extends Model
{
    protected $table = 'setting_kud';

    protected $fillable = [
        'nama_kud', 'alamat', 'telepon', 'email', 'logo',
        'nama_ketua', 'nama_sekretaris', 'nama_bendahara',
        'tahun_anggaran', 'website',
        'kartu_warna_primary', 'kartu_warna_secondary',
        'kartu_background', 'tanda_tangan_kartu',
        'kartu_aturan', 'kartu_slogan', 'kartu_ketua_nama',
        'kartu_ketua_jabatan', 'kartu_ttd', 'kartu_stempel',
        'kartu_kota_terbit',         'kartu_belakang_warna',
        'kartu_judul_depan', 'kartu_subjudul_depan',
        'kartu_label_anggota', 'kartu_format_no_anggota',
        'sertifikat_config',
    ];

    protected $casts = [
        'tanda_tangan_kartu' => 'boolean',
        'kartu_aturan' => 'array',
        'sertifikat_config' => 'array',
    ];
}
