<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pekebun', function (Blueprint $table) {
            $table->enum('jenis_kelamin', ['LAKI-LAKI', 'PEREMPUAN'])->nullable()->after('nik');
        });

        Schema::table('program_kud', function (Blueprint $table) {
            $table->text('tanda_tangan_kades_tegal_sari')->nullable()->after('surat_3_isi');
            $table->text('tanda_tangan_kades_marga_puspita')->nullable()->after('tanda_tangan_kades_tegal_sari');
            $table->text('tanda_tangan_kades_campur_sari')->nullable()->after('tanda_tangan_kades_marga_puspita');
            $table->text('tanda_tangan_ketua_kud')->nullable()->after('tanda_tangan_kades_campur_sari');
        });
    }

    public function down(): void
    {
        Schema::table('pekebun', function (Blueprint $table) {
            $table->dropColumn('jenis_kelamin');
        });

        Schema::table('program_kud', function (Blueprint $table) {
            $table->dropColumn([
                'tanda_tangan_kades_tegal_sari',
                'tanda_tangan_kades_marga_puspita',
                'tanda_tangan_kades_campur_sari',
                'tanda_tangan_ketua_kud',
            ]);
        });
    }
};
