<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('harga_tbs', function (Blueprint $table) {
            $table->string('kelas', 1)->after('id');
            $table->renameColumn('tanggal_berlaku', 'dari_tanggal');
            $table->date('sampai_tanggal')->nullable()->after('dari_tanggal');
        });
    }

    public function down(): void
    {
        Schema::table('harga_tbs', function (Blueprint $table) {
            $table->dropColumn('kelas');
            $table->renameColumn('dari_tanggal', 'tanggal_berlaku');
            $table->dropColumn('sampai_tanggal');
        });
    }
};
