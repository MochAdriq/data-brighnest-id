<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->text('lead')->nullable()->after('notes');
            $table->string('image_caption')->nullable()->after('image');
            $table->string('image_copyright')->nullable()->after('image_caption');
        });
    }

    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropColumn(['lead', 'image_caption', 'image_copyright']);
        });
    }
};
