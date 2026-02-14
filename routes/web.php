<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <--- PASTIKAN INI ADA DI PALING ATAS
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SurveyController; 
use App\Models\Survey; // <--- JANGAN LUPA IMPORT MODEL INI
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // 1. Data Hero & Produk (Sama seperti sebelumnya)
    $featured = Survey::where('type', 'story')->latest()->first();
    $kilasData = Survey::where('type', 'series')->latest()->take(8)->get();
    
    // Fokus Utama (Hapus when/pengecualian agar tetap muncul walau cuma 1)
    $fokusUtama = Survey::where('type', 'story')
                    ->latest()
                    ->take(6)
                    ->get();
                    
    $kabarTepi = Survey::where('type', 'news')->latest()->take(6)->get();

    // 2. LOGIC TRENDING TOPIC (BERDASARKAN VIEWS)
    // "Cari kategori, lalu jumlahkan views semua artikel di kategori itu. Urutkan dari yang terbanyak."
    $trendingCategories = Survey::select('category', DB::raw('SUM(views) as total_views'))
        ->groupBy('category')
        ->orderByDesc('total_views')
        ->take(5) // Ambil Top 5
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->category,
                'name' => ucfirst($item->category), // Huruf depan besar
                'slug' => $item->category
            ];
        });

    return Inertia::render('Welcome', [
        'heroArticle' => $featured,
        'kilasData' => $kilasData,
        'fokusUtama' => $fokusUtama,
        'kabarTepi' => $kabarTepi,
        'categories' => $trendingCategories, // Kirim ke Frontend
    ]);
});

Route::get('/dashboard', function () {
    // Ambil data survey punya user yang sedang login (atau semua jika admin)
    // Disini kita ambil punya user sendiri dulu
    $surveys = Survey::where('user_id', auth()->id())
                ->latest()
                ->paginate(10); // 10 baris per halaman

    return Inertia::render('Dashboard', [
        'surveys' => $surveys
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // === ROUTE PROJECT KITA ADA DISINI ===
    Route::get('/surveys/input', [SurveyController::class, 'index'])->name('surveys.index');
    Route::post('/surveys/import', [SurveyController::class, 'store'])->name('surveys.import');
});

// Route untuk membuka form Input Data Baru
Route::get('/surveys/create', [SurveyController::class, 'create'])
    ->name('surveys.create')
    ->middleware('auth');

// Route untuk menyimpan data baru (POST) - Pastikan ini sudah ada (biasanya /surveys atau /submit)
// Kalau Boss pakai '/submit', pastikan namanya sesuai.
// Standarnya Laravel resource pakai:
Route::post('/surveys', [SurveyController::class, 'store'])->name('surveys.store')->middleware('auth');

Route::get('/data/{survey}', [SurveyController::class, 'show'])->name('surveys.show');

Route::delete('/surveys/{id}', [SurveyController::class, 'destroy'])->name('surveys.destroy')->middleware('auth');

Route::get('/surveys/{id}/edit', [SurveyController::class, 'edit'])->name('surveys.edit')->middleware('auth');
Route::put('/surveys/{id}', [SurveyController::class, 'update'])->name('surveys.update')->middleware('auth');

Route::get('/search', [SurveyController::class, 'index'])->name('search');

Route::get('/category/{slug}', function ($slug, Request $request) {
    $request->merge(['category' => $slug]);
    
    return app(SurveyController::class)->index($request);
})->name('category');

Route::get('/kilas-data', [SurveyController::class, 'kilasData'])->name('kilas-data');

// Route Produk Lainnya
Route::get('/fokus-utama', function() {
    return app(SurveyController::class)->produk('story');
})->name('fokus-utama');

Route::get('/kabar-tepi', function() {
    return app(SurveyController::class)->produk('news');
})->name('kabar-tepi');

require __DIR__.'/auth.php';