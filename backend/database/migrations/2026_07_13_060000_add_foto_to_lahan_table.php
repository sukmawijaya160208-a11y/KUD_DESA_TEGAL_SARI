<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lahan', function (Blueprint $table) {
            $table->string('foto_petani')->nullable()->after('upload_surat_keterangan');
            $table->text('foto_kebun')->nullable()->after('foto_petani');
        });
    }

    public function down(): void
    {
        Schema::table('lahan', function (Blueprint $table) {
            $table->dropColumn(['foto_petani', 'foto_kebun']);
        });
    }
};
