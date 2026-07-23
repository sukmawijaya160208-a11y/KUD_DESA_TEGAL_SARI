<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftaran_program', function (Blueprint $table) {
            $table->boolean('setuju_surat_1')->default(false);
            $table->boolean('setuju_surat_2')->default(false);
            $table->boolean('setuju_surat_3')->default(false);
            $table->text('tanda_tangan_digital')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pendaftaran_program', function (Blueprint $table) {
            $table->dropColumn([
                'setuju_surat_1',
                'setuju_surat_2',
                'setuju_surat_3',
                'tanda_tangan_digital',
            ]);
        });
    }
};
