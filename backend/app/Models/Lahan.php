<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lahan extends Model
{
    protected $table = 'lahan';

    protected $fillable = [
        'pekebun_id', 'alamat_lahan', 'jenis_surat', 'nomor_surat',
        'luas_lahan_m2', 'upload_surat_tanah', 'upload_surat_keterangan', 'titik_koordinat',
        'foto_petani', 'foto_kebun',
    ];

    public function pekebun()
    {
        return $this->belongsTo(Pekebun::class);
    }

    public function pendaftaranProgram()
    {
        return $this->hasMany(PendaftaranProgram::class);
    }
}
