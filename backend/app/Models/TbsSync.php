<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TbsSync extends Model
{
    protected $table = 'tbs_sync';

    protected $fillable = [
        'pekebun_id', 'tanggal', 'jumlah_tbs', 'keterangan',
    ];

    public function pekebun()
    {
        return $this->belongsTo(Pekebun::class);
    }
}
