<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pekebun extends Model
{
    protected $table = 'pekebun';

    protected $fillable = [
        'user_id', 'nama', 'nik', 'no_kk', 'tempat_lahir', 'tanggal_lahir',
        'no_whatsapp', 'alamat', 'foto_pekebun', 'upload_ktp', 'upload_kk',
        'status', 'verified_by', 'verified_at', 'catatan_verifikasi',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifikator()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function lahan()
    {
        return $this->hasMany(Lahan::class);
    }

    public function pendaftaranProgram()
    {
        return $this->hasMany(PendaftaranProgram::class);
    }

    public function tbsSyncs()
    {
        return $this->hasMany(TbsSync::class);
    }
}
