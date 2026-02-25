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
        Schema::table('surveys', function (Blueprint $table) {
            $table->unsignedSmallInteger('published_year')
                ->nullable()
                ->after('subcategory');
            $table->string('research_topic', 120)
                ->nullable()
                ->after('published_year');
            $table->string('pdf_path')
                ->nullable()
                ->after('file_path');
            $table->unsignedBigInteger('download_count')
                ->default(0)
                ->after('views');

            $table->index('published_year', 'surveys_published_year_idx');
            $table->index('research_topic', 'surveys_research_topic_idx');
            $table->index(['type', 'published_year'], 'surveys_type_published_year_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropIndex('surveys_published_year_idx');
            $table->dropIndex('surveys_research_topic_idx');
            $table->dropIndex('surveys_type_published_year_idx');

            $table->dropColumn([
                'published_year',
                'research_topic',
                'pdf_path',
                'download_count',
            ]);
        });
    }
};
