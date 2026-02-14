<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Survey;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Pastikan Ada Akun Admin (Biar Boss gak terkunci)
        // Kalau user ID 1 belum ada, dia buat baru.
        User::firstOrCreate(
            ['email' => 'admin@brightnest.id'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'), // Password default: password
            ]
        );

        // 2. Buat 10 "Kilas Data" (Series)
        Survey::factory(10)->create([
            'type' => 'series',
            'title' => fn() => 'Statistik ' . fake()->sentence(3), // Judulnya berbau data
        ]);

        // 3. Buat 8 "Fokus Utama" (Story)
        Survey::factory(8)->create([
            'type' => 'story',
            'title' => fn() => 'Analisis ' . fake()->sentence(4), // Judulnya berbau analisis
        ]);

        // 4. Buat 8 "Kabar Tepi" (News)
        Survey::factory(8)->create([
            'type' => 'news',
            'title' => fn() => 'Berita: ' . fake()->sentence(5),
            'csv_data' => null,
        ]);
    }
}