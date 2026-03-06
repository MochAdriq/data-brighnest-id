<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('xendit_reference_id')->nullable()->after('proof_path');
            $table->string('xendit_payment_request_id')->nullable()->after('xendit_reference_id');
            $table->string('xendit_latest_payment_id')->nullable()->after('xendit_payment_request_id');
            $table->string('xendit_channel_code')->nullable()->after('xendit_latest_payment_id');
            $table->string('xendit_status')->nullable()->after('xendit_channel_code');
            $table->text('xendit_checkout_url')->nullable()->after('xendit_status');
            $table->json('xendit_webhook_payload')->nullable()->after('xendit_checkout_url');
            $table->timestamp('paid_at')->nullable()->after('reviewed_at');

            $table->index('xendit_reference_id');
            $table->index('xendit_payment_request_id');
            $table->index('xendit_status');
        });

        Schema::table('article_purchase_requests', function (Blueprint $table) {
            $table->string('xendit_reference_id')->nullable()->after('proof_path');
            $table->string('xendit_payment_request_id')->nullable()->after('xendit_reference_id');
            $table->string('xendit_latest_payment_id')->nullable()->after('xendit_payment_request_id');
            $table->string('xendit_channel_code')->nullable()->after('xendit_latest_payment_id');
            $table->string('xendit_status')->nullable()->after('xendit_channel_code');
            $table->text('xendit_checkout_url')->nullable()->after('xendit_status');
            $table->json('xendit_webhook_payload')->nullable()->after('xendit_checkout_url');
            $table->timestamp('paid_at')->nullable()->after('reviewed_at');

            $table->index('xendit_reference_id');
            $table->index('xendit_payment_request_id');
            $table->index('xendit_status');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex(['xendit_reference_id']);
            $table->dropIndex(['xendit_payment_request_id']);
            $table->dropIndex(['xendit_status']);
            $table->dropColumn([
                'xendit_reference_id',
                'xendit_payment_request_id',
                'xendit_latest_payment_id',
                'xendit_channel_code',
                'xendit_status',
                'xendit_checkout_url',
                'xendit_webhook_payload',
                'paid_at',
            ]);
        });

        Schema::table('article_purchase_requests', function (Blueprint $table) {
            $table->dropIndex(['xendit_reference_id']);
            $table->dropIndex(['xendit_payment_request_id']);
            $table->dropIndex(['xendit_status']);
            $table->dropColumn([
                'xendit_reference_id',
                'xendit_payment_request_id',
                'xendit_latest_payment_id',
                'xendit_channel_code',
                'xendit_status',
                'xendit_checkout_url',
                'xendit_webhook_payload',
                'paid_at',
            ]);
        });
    }
};
