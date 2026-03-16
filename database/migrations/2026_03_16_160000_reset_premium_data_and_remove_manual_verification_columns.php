<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Reset total data premium lama agar seluruh akses/riwayat dimulai dari alur Xendit-only.
        DB::transaction(function (): void {
            DB::table('article_entitlements')->delete();
            DB::table('article_purchase_requests')->delete();
            DB::table('subscriptions')->delete();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'verified_by')) {
                $table->dropConstrainedForeignId('verified_by');
            }
        });

        Schema::table('article_purchase_requests', function (Blueprint $table) {
            if (Schema::hasColumn('article_purchase_requests', 'verified_by')) {
                $table->dropConstrainedForeignId('verified_by');
            }
        });

        Schema::table('article_entitlements', function (Blueprint $table) {
            if (Schema::hasColumn('article_entitlements', 'granted_by')) {
                $table->dropConstrainedForeignId('granted_by');
            }
        });

        $subscriptionColumnsToDrop = array_values(array_filter([
            Schema::hasColumn('subscriptions', 'payment_method') ? 'payment_method' : null,
            Schema::hasColumn('subscriptions', 'reference_no') ? 'reference_no' : null,
            Schema::hasColumn('subscriptions', 'transfer_date') ? 'transfer_date' : null,
            Schema::hasColumn('subscriptions', 'proof_path') ? 'proof_path' : null,
            Schema::hasColumn('subscriptions', 'admin_note') ? 'admin_note' : null,
            Schema::hasColumn('subscriptions', 'reviewed_at') ? 'reviewed_at' : null,
        ]));
        if (!empty($subscriptionColumnsToDrop)) {
            Schema::table('subscriptions', function (Blueprint $table) use ($subscriptionColumnsToDrop) {
                $table->dropColumn($subscriptionColumnsToDrop);
            });
        }

        $articleColumnsToDrop = array_values(array_filter([
            Schema::hasColumn('article_purchase_requests', 'payment_method') ? 'payment_method' : null,
            Schema::hasColumn('article_purchase_requests', 'reference_no') ? 'reference_no' : null,
            Schema::hasColumn('article_purchase_requests', 'transfer_date') ? 'transfer_date' : null,
            Schema::hasColumn('article_purchase_requests', 'proof_path') ? 'proof_path' : null,
            Schema::hasColumn('article_purchase_requests', 'admin_note') ? 'admin_note' : null,
            Schema::hasColumn('article_purchase_requests', 'reviewed_at') ? 'reviewed_at' : null,
        ]));
        if (!empty($articleColumnsToDrop)) {
            Schema::table('article_purchase_requests', function (Blueprint $table) use ($articleColumnsToDrop) {
                $table->dropColumn($articleColumnsToDrop);
            });
        }
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('subscriptions', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete()->after('user_id');
            }
            if (!Schema::hasColumn('subscriptions', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('amount');
            }
            if (!Schema::hasColumn('subscriptions', 'reference_no')) {
                $table->string('reference_no')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('subscriptions', 'transfer_date')) {
                $table->date('transfer_date')->nullable()->after('reference_no');
            }
            if (!Schema::hasColumn('subscriptions', 'proof_path')) {
                $table->string('proof_path')->nullable()->after('transfer_date');
            }
            if (!Schema::hasColumn('subscriptions', 'admin_note')) {
                $table->text('admin_note')->nullable()->after('user_note');
            }
            if (!Schema::hasColumn('subscriptions', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('ends_at');
            }
        });

        Schema::table('article_purchase_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('article_purchase_requests', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete()->after('survey_id');
            }
            if (!Schema::hasColumn('article_purchase_requests', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('amount');
            }
            if (!Schema::hasColumn('article_purchase_requests', 'reference_no')) {
                $table->string('reference_no')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('article_purchase_requests', 'transfer_date')) {
                $table->date('transfer_date')->nullable()->after('reference_no');
            }
            if (!Schema::hasColumn('article_purchase_requests', 'proof_path')) {
                $table->string('proof_path')->nullable()->after('transfer_date');
            }
            if (!Schema::hasColumn('article_purchase_requests', 'admin_note')) {
                $table->text('admin_note')->nullable()->after('user_note');
            }
            if (!Schema::hasColumn('article_purchase_requests', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('created_at');
            }
        });

        Schema::table('article_entitlements', function (Blueprint $table) {
            if (!Schema::hasColumn('article_entitlements', 'granted_by')) {
                $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete()->after('purchase_request_id');
            }
        });
    }
};
