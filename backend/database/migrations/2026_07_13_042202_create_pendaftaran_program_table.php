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
        Schema::create('pendaftaran_program', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pekebun_id')->constrained('pekebun')->onDelete('cascade');
            $table->foreignId('program_kud_id')->constrained('program_kud')->onDelete('cascade');
            $table->foreignId('lahan_id')->nullable()->constrained('lahan')->onDelete('set null');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('catatan_verifikasi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_program');
    }
};
