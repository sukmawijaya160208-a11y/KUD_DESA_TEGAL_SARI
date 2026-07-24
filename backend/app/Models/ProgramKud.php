<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramKud extends Model
{
    protected $table = 'program_kud';

    protected $fillable = [
        'nama', 'jenis', 'deskripsi', 'aktif',
        'foto', 'persyaratan', 'manfaat', 'tanggal_mulai', 'tanggal_selesai', 'kuota',
        'aktifkan_surat',
        'surat_1_judul', 'surat_1_isi',
        'surat_2_judul', 'surat_2_isi',
        'surat_3_judul', 'surat_3_isi',
        'tanda_tangan_kades_tegal_sari',
        'tanda_tangan_kades_marga_puspita',
        'tanda_tangan_kades_campur_sari',
        'tanda_tangan_ketua_kud',
    ];

    protected $casts = [
        'foto' => 'array',
        'persyaratan' => 'array',
        'manfaat' => 'array',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'aktif' => 'boolean',
        'aktifkan_surat' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::retrieved(function (ProgramKud $model) {
            if ($model->foto === null) {
                $model->foto = [];
            }
            if ($model->persyaratan === null) {
                $model->persyaratan = [];
            }
            if ($model->manfaat === null) {
                $model->manfaat = [];
            }
        });
    }

    public function pendaftaranProgram()
    {
        return $this->hasMany(PendaftaranProgram::class);
    }
}
