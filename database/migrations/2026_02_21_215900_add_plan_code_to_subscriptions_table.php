<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('plan_code', 20)->default('monthly')->after('status');
            $table->index(['plan_code', 'status'], 'subscriptions_plan_code_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('subscriptions_plan_code_status_index');
            $table->dropColumn('plan_code');
        });
    }
};

