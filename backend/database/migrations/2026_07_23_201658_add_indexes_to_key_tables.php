<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftaran_program', function (Blueprint $table) {
            $table->index(['pekebun_id', 'program_kud_id'], 'idx_pendaftaran_pekebun_program');
            $table->index('status', 'idx_pendaftaran_status');
        });

        Schema::table('pekebun', function (Blueprint $table) {
            $table->index('status', 'idx_pekebun_status');
        });

        Schema::table('program_kud', function (Blueprint $table) {
            $table->index('aktif', 'idx_program_aktif');
        });

        Schema::table('tbs_sync', function (Blueprint $table) {
            $table->index('tanggal', 'idx_tbs_tanggal');
        });
    }

    public function down(): void
    {
        Schema::table('pendaftaran_program', function (Blueprint $table) {
            $table->dropIndex('idx_pendaftaran_pekebun_program');
            $table->dropIndex('idx_pendaftaran_status');
        });

        Schema::table('pekebun', function (Blueprint $table) {
            $table->dropIndex('idx_pekebun_status');
        });

        Schema::table('program_kud', function (Blueprint $table) {
            $table->dropIndex('idx_program_aktif');
        });

        Schema::table('tbs_sync', function (Blueprint $table) {
            $table->dropIndex('idx_tbs_tanggal');
        });
    }
};
