<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('harga_tbs', function (Blueprint $table) {
            $table->id();
            $table->decimal('harga_per_kg', 12, 2);
            $table->date('tanggal_berlaku');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harga_tbs');
    }
};
