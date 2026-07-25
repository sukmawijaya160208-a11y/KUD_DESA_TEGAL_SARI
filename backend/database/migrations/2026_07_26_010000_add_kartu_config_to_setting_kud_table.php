<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('setting_kud', function (Blueprint $table) {
            $table->text('kartu_config')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('setting_kud', function (Blueprint $table) {
            $table->dropColumn('kartu_config');
        });
    }
};
