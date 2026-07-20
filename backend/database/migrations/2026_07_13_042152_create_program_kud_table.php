<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('program_kud', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('jenis'); // PSR, Intensifikasi, Ekstensifikasi, Pelatihan SDMPKS, Beasiswa SDMPKS, Kemitraan
            $table->text('deskripsi')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_kud');
    }
};
