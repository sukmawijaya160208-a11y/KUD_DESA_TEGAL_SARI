<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('setting_kud', function (Blueprint $table) {
            $table->text('kartu_aturan')->nullable();
            $table->string('kartu_slogan')->nullable();
            $table->string('kartu_ketua_nama')->nullable();
            $table->string('kartu_ketua_jabatan')->nullable();
            $table->string('kartu_ttd')->nullable();
            $table->string('kartu_stempel')->nullable();
            $table->string('kartu_kota_terbit')->nullable();
            $table->string('kartu_belakang_warna')->default('#028143');
            $table->string('kartu_judul_depan')->nullable();
            $table->string('kartu_subjudul_depan')->nullable();
            $table->string('kartu_label_anggota')->nullable();
            $table->string('kartu_format_no_anggota')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('setting_kud', function (Blueprint $table) {
            $table->dropColumn([
                'kartu_aturan', 'kartu_slogan', 'kartu_ketua_nama',
                'kartu_ketua_jabatan', 'kartu_ttd', 'kartu_stempel',
                'kartu_kota_terbit', 'kartu_belakang_warna',
                'kartu_judul_depan', 'kartu_subjudul_depan',
                'kartu_label_anggota', 'kartu_format_no_anggota',
            ]);
        });
    }
};
