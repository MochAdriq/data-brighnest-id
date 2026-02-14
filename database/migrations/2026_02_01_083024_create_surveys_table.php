<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // 1. Tipe Postingan (PENTING: series, story, news)
            $table->string('type')->default('series'); 
            
            // 2. Metadata Utama
            $table->string('title');
            $table->string('category');
            $table->string('subcategory');
            $table->string('period')->nullable(); // Boleh null untuk 'News'
            $table->string('pic')->nullable();    // Boleh null untuk 'News'

            // 3. Status Data (Gembok Premium)
            $table->boolean('is_premium')->default(false); 

            
            // 4. Konten & Catatan
            $table->text('notes')->nullable();    
            $table->longText('content')->nullable(); 
            
            // 5. Data Flexible
            $table->json('tags')->nullable();     
            $table->json('csv_data')->nullable(); // Bisa null jika tipe = news
            $table->string('file_path')->nullable();
            $table->string('image')->nullable();     // <--- INI YANG BIKIN ERROR BARUSAN

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surveys');
    }
};