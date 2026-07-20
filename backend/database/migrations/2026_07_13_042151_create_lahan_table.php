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
        Schema::create('lahan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pekebun_id')->constrained('pekebun')->onDelete('cascade');
            $table->string('alamat_lahan');
            $table->enum('jenis_surat', ['SHM', 'SPPH', 'SKT']);
            $table->string('nomor_surat');
            $table->decimal('luas_lahan_m2', 12, 2);
            $table->string('upload_surat_tanah')->nullable();
            $table->string('upload_surat_keterangan')->nullable();
            $table->string('titik_koordinat')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lahan');
    }
};
