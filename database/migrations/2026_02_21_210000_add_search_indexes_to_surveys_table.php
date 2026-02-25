<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->index(['type', 'created_at'], 'surveys_type_created_at_idx');
            $table->index(['category', 'created_at'], 'surveys_category_created_at_idx');
            $table->index(['type', 'category', 'subcategory', 'created_at'], 'surveys_type_category_subcategory_created_at_idx');
        });

        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE surveys ADD FULLTEXT surveys_fulltext_search_idx (title, notes, lead, content)');
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE surveys DROP INDEX surveys_fulltext_search_idx');
        }

        Schema::table('surveys', function (Blueprint $table) {
            $table->dropIndex('surveys_type_created_at_idx');
            $table->dropIndex('surveys_category_created_at_idx');
            $table->dropIndex('surveys_type_category_subcategory_created_at_idx');
        });
    }
};
