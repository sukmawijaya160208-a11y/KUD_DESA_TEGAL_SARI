<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('setting_kud', function (Blueprint $table) {
            $table->text('admin_card_config')->nullable()->after('kartu_config');
        });
    }

    public function down()
    {
        Schema::table('setting_kud', function (Blueprint $table) {
            $table->dropColumn('admin_card_config');
        });
    }
};
