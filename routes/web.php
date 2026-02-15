<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SurveyController; 
use App\Models\Survey; 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MediaController;

Route::get('/', function () {
    $featured = Survey::where('type', 'story')->latest()->first();
    $kilasData = Survey::where('type', 'series')->latest()->take(8)->get();
    
    $fokusUtama = Survey::where('type', 'story')->latest()->take(6)->get();
    $kabarTepi = Survey::where('type', 'news')->latest()->take(6)->get();

    $trendingCategories = Survey::select('category', DB::raw('SUM(views) as total_views'))
        ->groupBy('category')
        ->orderByDesc('total_views')
        ->take(5)
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->category,
                'name' => ucfirst($item->category),
                'slug' => $item->category
            ];
        });

    return Inertia::render('Welcome', [
        'heroArticle' => $featured,
        'kilasData' => $kilasData,
        'fokusUtama' => $fokusUtama,
        'kabarTepi' => $kabarTepi,
        'categories' => $trendingCategories,
    ]);
});

Route::get('/dashboard', function () {
    $surveys = Survey::where('user_id', auth()->id())->latest()->paginate(10);
    return Inertia::render('Dashboard', ['surveys' => $surveys]);
})->middleware(['auth', 'verified'])->name('dashboard');

// === GROUP MIDDLEWARE AUTH ===
Route::middleware('auth')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Media Upload (Image Handler)
    Route::post('/media/upload', [MediaController::class, 'store'])->name('media.upload');

    // === SURVEY / DATA ROUTES ===
    // 1. Halaman Form Create
    Route::get('/surveys/create', [SurveyController::class, 'create'])->name('surveys.create');
    
    // 2. Proses Simpan Baru (STORE)
    Route::post('/surveys', [SurveyController::class, 'store'])->name('surveys.store');

    // 3. Edit & Update
    Route::get('/surveys/{id}/edit', [SurveyController::class, 'edit'])->name('surveys.edit');
    Route::post('/surveys/{id}', [SurveyController::class, 'update'])->name('surveys.update')->middleware('auth');
    
    // 4. Hapus
    Route::delete('/surveys/{id}', [SurveyController::class, 'destroy'])->name('surveys.destroy');
});

// Route Public (Bisa diakses tanpa login)
Route::get('/surveys', [SurveyController::class, 'index'])->name('surveys.index'); // Search / Index Public
Route::get('/data/{survey}', [SurveyController::class, 'show'])->name('surveys.show');
Route::get('/search', [SurveyController::class, 'index'])->name('search');

Route::get('/category/{slug}', function ($slug, Request $request) {
    $request->merge(['category' => $slug]);
    return app(SurveyController::class)->index($request);
})->name('category');

Route::get('/kilas-data', [SurveyController::class, 'kilasData'])->name('kilas-data');
Route::get('/fokus-utama', function() { return app(SurveyController::class)->produk('story'); })->name('fokus-utama');
Route::get('/kabar-tepi', function() { return app(SurveyController::class)->produk('news'); })->name('kabar-tepi');

require __DIR__.'/auth.php';