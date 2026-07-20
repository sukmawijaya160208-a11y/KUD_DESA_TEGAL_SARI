<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerifikasiLog extends Model
{
    protected $table = 'verifikasi_log';

    protected $fillable = [
        'verifiable_type', 'verifiable_id', 'user_id', 'tindakan', 'catatan',
    ];

    public function verifiable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
