<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_kud', function (Blueprint $table) {
            $table->text('foto')->nullable()->after('deskripsi');
            $table->text('persyaratan')->nullable()->after('foto');
            $table->date('tanggal_mulai')->nullable()->after('persyaratan');
            $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
            $table->integer('kuota')->nullable()->after('tanggal_selesai');
        });
    }

    public function down(): void
    {
        Schema::table('program_kud', function (Blueprint $table) {
            $table->dropColumn(['foto', 'persyaratan', 'tanggal_mulai', 'tanggal_selesai', 'kuota']);
        });
    }
};
