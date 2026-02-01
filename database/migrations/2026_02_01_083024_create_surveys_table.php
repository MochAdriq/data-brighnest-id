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
            
            // 1. Relasi ke User (Uploader)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // 2. Metadata Utama
            $table->string('title');        // Judul Data
            $table->string('category');     // Kategori (Umum, Ekonomi, dll)
            $table->string('subcategory');  // Sub Kategori
            $table->string('period');       // Periode Data (YYYY-MM)
            $table->string('pic');          // Nama Penanggung Jawab (Sitasi)

            // 3. Konten & Catatan (Struktur Baru Opsi A)
            $table->text('notes')->nullable();    // CATATAN: Metodologi/Info Teknis (Mapping dari input 'Catatan')
            $table->longText('content')->nullable(); // KONTEN: Artikel/Narasi Data (Untuk tampilan ala Databoks)
            
            // 4. Tags & Data (Flexible Storage)
            $table->json('tags')->nullable();     // TAGS: Label pencarian ["ekonomi", "inflasi"]
            $table->json('csv_data')->nullable(); // DATA MENTAH: Isi CSV disimpan apa adanya

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surveys');
    }
};