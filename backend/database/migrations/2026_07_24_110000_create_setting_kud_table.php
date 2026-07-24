<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('setting_kud', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kud')->nullable();
            $table->text('alamat')->nullable();
            $table->string('telepon')->nullable();
            $table->string('email')->nullable();
            $table->string('logo')->nullable();
            $table->string('nama_ketua')->nullable();
            $table->string('nama_sekretaris')->nullable();
            $table->string('nama_bendahara')->nullable();
            $table->string('tahun_anggaran')->nullable();
            $table->string('website')->nullable();
            $table->string('kartu_warna_primary')->default('#059669');
            $table->string('kartu_warna_secondary')->default('#047857');
            $table->string('kartu_background')->nullable();
            $table->boolean('tanda_tangan_kartu')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('setting_kud');
    }
};
