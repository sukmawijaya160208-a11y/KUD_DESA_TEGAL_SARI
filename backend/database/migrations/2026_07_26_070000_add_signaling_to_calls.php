<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->text('offer_sdp')->nullable()->after('duration');
            $table->text('answer_sdp')->nullable()->after('offer_sdp');
            $table->longText('ice_caller')->nullable()->after('answer_sdp');
            $table->longText('ice_receiver')->nullable()->after('ice_caller');
        });
    }

    public function down(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->dropColumn(['offer_sdp', 'answer_sdp', 'ice_caller', 'ice_receiver']);
        });
    }
};
