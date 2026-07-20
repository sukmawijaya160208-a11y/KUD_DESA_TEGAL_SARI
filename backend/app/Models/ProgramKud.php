<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramKud extends Model
{
    protected $table = 'program_kud';

    protected $fillable = [
        'nama', 'jenis', 'deskripsi', 'aktif',
        'foto', 'persyaratan', 'tanggal_mulai', 'tanggal_selesai', 'kuota',
    ];

    protected $casts = [
        'foto' => 'array',
        'persyaratan' => 'array',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'aktif' => 'boolean',
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
        });
    }

    public function pendaftaranProgram()
    {
        return $this->hasMany(PendaftaranProgram::class);
    }
}
