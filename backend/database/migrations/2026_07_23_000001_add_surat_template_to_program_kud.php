<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_kud', function (Blueprint $table) {
            $table->boolean('aktifkan_surat')->default(false);
            $table->text('surat_1_judul')->nullable();
            $table->text('surat_1_isi')->nullable();
            $table->text('surat_2_judul')->nullable();
            $table->text('surat_2_isi')->nullable();
            $table->text('surat_3_judul')->nullable();
            $table->text('surat_3_isi')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('program_kud', function (Blueprint $table) {
            $table->dropColumn([
                'aktifkan_surat',
                'surat_1_judul', 'surat_1_isi',
                'surat_2_judul', 'surat_2_isi',
                'surat_3_judul', 'surat_3_isi',
            ]);
        });
    }
};
