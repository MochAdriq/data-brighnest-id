<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('surveys', 'og_image_path')) {
            Schema::table('surveys', function (Blueprint $table) {
                $table->string('og_image_path')->nullable()->after('image');
            });
        }

        if (!Schema::hasColumn('surveys', 'og_generated_at')) {
            Schema::table('surveys', function (Blueprint $table) {
                $table->timestamp('og_generated_at')->nullable()->after('og_image_path');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('surveys', 'og_generated_at')) {
            Schema::table('surveys', function (Blueprint $table) {
                $table->dropColumn('og_generated_at');
            });
        }

        if (Schema::hasColumn('surveys', 'og_image_path')) {
            Schema::table('surveys', function (Blueprint $table) {
                $table->dropColumn('og_image_path');
            });
        }
    }
};
