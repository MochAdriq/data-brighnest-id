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
        // 1. Kolom Tipe Chart (Default: Bar)
        $table->string('chart_type')->default('bar')->after('type'); 
        
        // 2. Kolom Interaktif (Default: True/Hidup)
        $table->boolean('is_interactive')->default(true)->after('chart_type');
    });
}

public function down(): void
{
    Schema::table('surveys', function (Blueprint $table) {
        $table->dropColumn(['chart_type', 'is_interactive']);
    });
}
};
