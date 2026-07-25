<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_contents', function (Blueprint $table) {
            $table->id();
            $table->string('section_type');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('media_url')->nullable();
            $table->json('meta_data')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('section_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_contents');
    }
};
