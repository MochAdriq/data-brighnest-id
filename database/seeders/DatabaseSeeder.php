<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Survey;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        if (!app()->environment(['local', 'testing'])) {
            return;
        }

        $defaultPassword = env('DEFAULT_SEED_PASSWORD', 'password');

        // 1. Pastikan Ada Akun Admin (Biar Boss gak terkunci)
        // Kalau user ID 1 belum ada, dia buat baru.
        $admin = User::firstOrCreate(
            ['email' => 'admin@brightnest.id'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt($defaultPassword),
            ]
        );
        $admin->syncRoles(['super_admin']);

        // 1b. Akun default role lain (domain & password sama)
        $publisher = User::firstOrCreate(
            ['email' => 'publisher@brightnest.id'],
            [
                'name' => 'Publisher',
                'password' => bcrypt($defaultPassword),
            ]
        );
        $publisher->syncRoles(['publisher']);

        $editor = User::firstOrCreate(
            ['email' => 'editor@brightnest.id'],
            [
                'name' => 'Editor',
                'password' => bcrypt($defaultPassword),
            ]
        );
        $editor->syncRoles(['editor']);

        $member = User::firstOrCreate(
            ['email' => 'member@brightnest.id'],
            [
                'name' => 'Member',
                'password' => bcrypt($defaultPassword),
            ]
        );
        $member->syncRoles(['member']);

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

        // 5. Buat 6 "Publikasi Riset"
        Survey::factory(6)->create([
            'type' => 'publikasi_riset',
            'title' => fn() => 'Publikasi Riset: ' . fake()->sentence(5),
            'subcategory' => null,
            'published_year' => (int) fake()->year(),
            'research_topic' => fake()->randomElement([
                'Politik',
                'Ekonomi',
                'Pendidikan',
                'Kesehatan',
                'Sosial',
            ]),
            'lead' => fake()->paragraph(2),
            'content' => '<p>' . implode('</p><p>', fake()->paragraphs(5)) . '</p>',
            'notes' => null,
            'csv_data' => null,
            'file_path' => null,
            'pdf_path' => null,
            'download_count' => fake()->numberBetween(0, 250),
        ]);
    }
}
