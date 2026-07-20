<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftaran_program', function (Blueprint $table) {
            $table->text('data')->nullable()->after('lahan_id');
        });
    }

    public function down(): void
    {
        Schema::table('pendaftaran_program', function (Blueprint $table) {
            $table->dropColumn('data');
        });
    }
};
