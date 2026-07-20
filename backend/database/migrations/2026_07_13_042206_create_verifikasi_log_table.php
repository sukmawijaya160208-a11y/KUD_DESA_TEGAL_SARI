<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('verifikasi_log', function (Blueprint $table) {
            $table->id();
            $table->morphs('verifiable');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('tindakan', ['terima', 'tolak', 'perbaiki']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verifikasi_log');
    }
};
