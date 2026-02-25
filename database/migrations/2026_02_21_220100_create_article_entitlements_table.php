<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_entitlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('survey_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_request_id')
                ->nullable()
                ->constrained('article_purchase_requests')
                ->nullOnDelete();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('granted_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'survey_id'], 'article_entitlement_user_survey_unique');
            $table->index(['survey_id', 'user_id'], 'article_entitlement_survey_user_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_entitlements');
    }
};

