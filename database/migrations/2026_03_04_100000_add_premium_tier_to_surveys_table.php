<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('surveys') || Schema::hasColumn('surveys', 'premium_tier')) {
            return;
        }

        Schema::table('surveys', function (Blueprint $table) {
            $table->string('premium_tier', 20)
                ->default('free')
                ->after('is_premium');
            $table->index(['premium_tier', 'type'], 'surveys_premium_tier_type_idx');
        });

        DB::table('surveys')
            ->where('is_premium', true)
            ->update(['premium_tier' => 'premium']);
    }

    public function down(): void
    {
        if (!Schema::hasTable('surveys') || !Schema::hasColumn('surveys', 'premium_tier')) {
            return;
        }

        Schema::table('surveys', function (Blueprint $table) {
            $table->dropIndex('surveys_premium_tier_type_idx');
            $table->dropColumn('premium_tier');
        });
    }
};

