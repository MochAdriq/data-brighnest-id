<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SurveyFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(6); // Judul 6 kata
        $isPremium = $this->faker->boolean(50);
        
        // Generator Data Grafik Palsu (JSON)
        // Format: [{"Tahun": "2020", "Nilai": 10}, ...]
        $dummyCsvData = [];
        $startYear = 2020;
        for ($i = 0; $i < 5; $i++) {
            $dummyCsvData[] = [
                'Tahun' => (string) ($startYear + $i),
                'Nilai' => $this->faker->numberBetween(10, 100) // Angka acak 10-100
            ];
        }

        return [
            'user_id' => 1, // Pastikan User ID 1 (Admin) sudah ada
            'type' => 'story', // Default (nanti di-override di Seeder)
            'title' => $title,
            'slug' => Str::slug($title), // Otomatis bikin slug
            'category' => $this->faker->randomElement(['Ekonomi', 'Pendidikan', 'Kesehatan', 'Infrastruktur', 'Sosial', 'Pemerintahan']),
            'subcategory' => $this->faker->word(),
            'published_year' => null,
            'research_topic' => null,
            
            // PENTING: Pakai 'notes', bukan 'description'
            'notes' => $this->faker->paragraph(2), 
            'show_notes' => false,
            'lead' => $this->faker->paragraph(1),
            
            'content' => '<p>' . implode('</p><p>', $this->faker->paragraphs(8)) . '</p>', // Artikel panjang dummy
            'period' => '2024-2025',
            'pic' => 'Tim Brightnest Institute',
            'is_premium' => $isPremium, // 50% kemungkinan Premium
            'premium_tier' => null,
            'views' => $this->faker->numberBetween(100, 10000), // Views acak biar kelihatan rame
            'tags' => ['data', 'riset', '2025'],
            
            // Data Grafik Dummy
            'csv_data' => $dummyCsvData, 
            'file_path' => null, // Kosongin aja
            'pdf_path' => null,
            'image' => null, // Kosongin biar pake gambar default grafik
            'image_caption' => null,
            'image_copyright' => null,
            'download_count' => 0,
        ];
    }
}
