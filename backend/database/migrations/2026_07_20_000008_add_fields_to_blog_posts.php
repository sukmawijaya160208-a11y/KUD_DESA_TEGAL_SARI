<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->unsignedBigInteger('views')->default(0)->after('featured');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('views');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('created_by');
            $table->boolean('allow_comments')->default(true)->after('updated_by');
        });
    }

    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['views', 'created_by', 'updated_by', 'allow_comments']);
        });
    }
};
