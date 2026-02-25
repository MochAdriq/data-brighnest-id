<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('survey_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pending'); // pending|approved|rejected
            $table->decimal('amount', 12, 2)->default(10000);
            $table->string('payment_method')->nullable();
            $table->string('reference_no')->nullable();
            $table->date('transfer_date')->nullable();
            $table->string('proof_path')->nullable();
            $table->text('user_note')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status'], 'article_purchase_user_status_index');
            $table->index(['survey_id', 'status'], 'article_purchase_survey_status_index');
            $table->index(['status', 'created_at'], 'article_purchase_status_created_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_purchase_requests');
    }
};

