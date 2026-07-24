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
    ];

    protected $casts = [
        'tanda_tangan_kartu' => 'boolean',
    ];
}
