<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location', 120)->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'website_url')) {
                $table->string('website_url', 255)->nullable()->after('location');
            }
            if (!Schema::hasColumn('users', 'preferred_categories')) {
                $table->json('preferred_categories')->nullable()->after('website_url');
            }
            if (!Schema::hasColumn('users', 'notify_new_content')) {
                $table->boolean('notify_new_content')->default(true)->after('preferred_categories');
            }
            if (!Schema::hasColumn('users', 'notify_comment_replies')) {
                $table->boolean('notify_comment_replies')->default(true)->after('notify_new_content');
            }
            if (!Schema::hasColumn('users', 'notify_premium_status')) {
                $table->boolean('notify_premium_status')->default(true)->after('notify_comment_replies');
            }
            if (!Schema::hasColumn('users', 'locale')) {
                $table->string('locale', 10)->default('id')->after('notify_premium_status');
            }
            if (!Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone', 64)->default('Asia/Jakarta')->after('locale');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'bio',
                'location',
                'website_url',
                'preferred_categories',
                'notify_new_content',
                'notify_comment_replies',
                'notify_premium_status',
                'locale',
                'timezone',
            ];

            $dropColumns = array_values(array_filter($columns, fn ($column) => Schema::hasColumn('users', $column)));
            if (!empty($dropColumns)) {
                $table->dropColumn($dropColumns);
            }
        });
    }
};
