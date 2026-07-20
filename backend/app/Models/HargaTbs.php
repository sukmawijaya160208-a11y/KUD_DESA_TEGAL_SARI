<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HargaTbs extends Model
{
    protected $table = 'harga_tbs';

    protected $fillable = [
        'kelas', 'harga_per_kg', 'dari_tanggal', 'sampai_tanggal', 'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'dari_tanggal' => 'date',
            'sampai_tanggal' => 'date',
        ];
    }

    public function scopeAktif($query)
    {
        $today = now()->format('Y-m-d');

        return $query->where('dari_tanggal', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('sampai_tanggal')
                    ->orWhere('sampai_tanggal', '>=', $today);
            });
    }

    public function scopeAkanDatang($query)
    {
        return $query->where('dari_tanggal', '>', now()->format('Y-m-d'));
    }

    public function scopeKadaluarsa($query)
    {
        return $query->where('sampai_tanggal', '<', now()->format('Y-m-d'));
    }
}
