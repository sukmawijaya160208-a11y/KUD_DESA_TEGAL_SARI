<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendaftaranProgram extends Model
{
    protected $table = 'pendaftaran_program';

    protected $fillable = [
        'pekebun_id', 'program_kud_id', 'lahan_id',
        'status', 'verified_by', 'verified_at', 'catatan_verifikasi',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'verified_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::retrieved(function (PendaftaranProgram $model) {
            if ($model->data === null) {
                $model->data = [];
            }
        });
    }

    public function pekebun()
    {
        return $this->belongsTo(Pekebun::class);
    }

    public function programKud()
    {
        return $this->belongsTo(ProgramKud::class);
    }

    public function lahan()
    {
        return $this->belongsTo(Lahan::class);
    }

    public function verifikator()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
