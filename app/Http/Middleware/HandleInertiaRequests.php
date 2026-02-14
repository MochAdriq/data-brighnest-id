<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

/**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // KATEGORI HARDCODED (Disamakan dengan Input.jsx)
        // Nanti bisa diganti ambil dari database jika sudah ada tabel categories
        $globalCategories = [
            ['id' => 'umum', 'slug' => 'umum', 'name' => 'Umum'],
            ['id' => 'pemerintahan', 'slug' => 'pemerintahan', 'name' => 'Pemerintahan'],
            ['id' => 'infrastruktur', 'slug' => 'infrastruktur', 'name' => 'Infrastruktur'],
            ['id' => 'ekonomi', 'slug' => 'ekonomi', 'name' => 'Ekonomi'],
            ['id' => 'bisnis', 'slug' => 'bisnis', 'name' => 'Bisnis & Industri'],
            ['id' => 'pendidikan', 'slug' => 'pendidikan', 'name' => 'Pendidikan'],
            ['id' => 'sosial', 'slug' => 'sosial', 'name' => 'Sosial'],
        ];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // TAMBAHAN PENTING UNTUK NAVBAR:
            'globalCategories' => $globalCategories,
        ];
    }
}
