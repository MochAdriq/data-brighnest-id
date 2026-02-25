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
            $table->string('subcategory')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Pastikan rollback tidak gagal saat ada data null.
        DB::table('surveys')->whereNull('subcategory')->update(['subcategory' => '']);

        Schema::table('surveys', function (Blueprint $table) {
            $table->string('subcategory')->nullable(false)->change();
        });
    }
};
