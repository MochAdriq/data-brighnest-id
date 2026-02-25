<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PremiumController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SurveyController; 
use App\Http\Controllers\UserRoleController;
use App\Models\Survey; 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MediaController;

Route::get('/', function () {
    $featured = null;
    $kilasData = collect();
    $fokusUtama = collect();
    $kabarTepi = collect();
    $trendingCategories = collect();

    try {
        $storyItems = Survey::where('type', 'story')->latest()->take(6)->get();
        $featured = $storyItems->first();
        $fokusUtama = $storyItems;
        $kilasData = Survey::where('type', 'series')->latest()->take(8)->get();
        $kabarTepi = Survey::where('type', 'news')->latest()->take(6)->get();

        $trendingCategories = Survey::select('category', DB::raw('SUM(views) as total_views'))
            ->groupBy('category')
            ->orderByDesc('total_views')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->category,
                    'name' => ucfirst($item->category),
                    'slug' => $item->category,
                ];
            });
    } catch (\Throwable $e) {
        report($e);
    }

    return Inertia::render('Welcome', [
        'heroArticle' => $featured,
        'kilasData' => $kilasData,
        'fokusUtama' => $fokusUtama,
        'kabarTepi' => $kabarTepi,
        'categories' => $trendingCategories,
    ]);
})->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// === GROUP MIDDLEWARE AUTH ===
Route::middleware('auth')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Media Upload (Image Handler)
    Route::post('/media/upload', [MediaController::class, 'store'])
        ->name('media.upload')
        ->middleware('role:super_admin|publisher');

    // === SURVEY / DATA ROUTES ===
    // 1. Halaman Form Create
    Route::get('/surveys/create', [SurveyController::class, 'create'])->name('surveys.create')->middleware('role:super_admin|publisher');
    
    // 2. Proses Simpan Baru (STORE)
    Route::post('/surveys', [SurveyController::class, 'store'])->name('surveys.store')->middleware('role:super_admin|publisher');

    // 3. Edit & Update
    Route::get('/surveys/{id}/edit', [SurveyController::class, 'edit'])->name('surveys.edit')->middleware('role:super_admin|publisher|editor');
    Route::put('/surveys/{id}', [SurveyController::class, 'update'])->name('surveys.update')->middleware('role:super_admin|publisher|editor');
    
    // 4. Hapus
    Route::delete('/surveys/{id}', [SurveyController::class, 'destroy'])->name('surveys.destroy')->middleware('role:super_admin|publisher');

    // 5. Komentar (Story/News)
    Route::post('/data/{survey}/comments', [SurveyController::class, 'storeComment'])->name('surveys.comments.store');

    // 6. Premium Manual Purchase
    Route::get('/premium/purchase', [PremiumController::class, 'purchase'])->name('premium.purchase');
    Route::get('/premium/checkout', [PremiumController::class, 'checkout'])->name('premium.checkout');
    Route::post('/premium/purchase', [PremiumController::class, 'submit'])->name('premium.submit'); // Backward compatible
    Route::post('/premium/membership/submit', [PremiumController::class, 'submitMembership'])->name('premium.membership.submit');
    Route::get('/premium/article/{survey}/purchase', [PremiumController::class, 'articlePurchaseForm'])->name('premium.article.purchase');
    Route::post('/premium/article/{survey}/submit', [PremiumController::class, 'submitArticle'])->name('premium.article.submit');
    Route::get('/premium/proofs/subscriptions/{subscription}', [PremiumController::class, 'downloadSubscriptionProof'])->name('premium.proofs.subscription');
    Route::get('/premium/proofs/articles/{articlePurchaseRequest}', [PremiumController::class, 'downloadArticleProof'])->name('premium.proofs.article');
    Route::get('/premium/admin/subscriptions', [PremiumController::class, 'adminIndex'])->name('premium.admin.subscriptions')->middleware('role:super_admin');
    Route::post('/premium/admin/subscriptions/{subscription}/approve', [PremiumController::class, 'approve'])->name('premium.admin.subscriptions.approve')->middleware('role:super_admin');
    Route::post('/premium/admin/subscriptions/{subscription}/reject', [PremiumController::class, 'reject'])->name('premium.admin.subscriptions.reject')->middleware('role:super_admin');
    Route::post('/premium/admin/articles/{articlePurchaseRequest}/approve', [PremiumController::class, 'approveArticle'])->name('premium.admin.articles.approve')->middleware('role:super_admin');
    Route::post('/premium/admin/articles/{articlePurchaseRequest}/reject', [PremiumController::class, 'rejectArticle'])->name('premium.admin.articles.reject')->middleware('role:super_admin');

    // 7. Manajemen Role User (Super Admin)
    Route::get('/admin/user-roles', [UserRoleController::class, 'index'])->name('admin.user-roles.index')->middleware('role:super_admin');
    Route::put('/admin/user-roles/{user}', [UserRoleController::class, 'update'])->name('admin.user-roles.update')->middleware('role:super_admin');
});

// Route Public (Bisa diakses tanpa login)
Route::get('/surveys', [SurveyController::class, 'index'])->name('surveys.index'); // Search / Index Public
Route::get('/data/{survey}', [SurveyController::class, 'show'])->name('surveys.show');
Route::get('/data/{survey}/publication/download', [SurveyController::class, 'downloadPublicationPdf'])->name('surveys.publication.download');
Route::get('/search', [SurveyController::class, 'index'])->name('search');

Route::get('/category/{slug}', function ($slug, Request $request) {
    $request->merge(['category' => $slug]);
    return app(SurveyController::class)->index($request);
})->name('category');

Route::get('/kilas-data', [SurveyController::class, 'kilasData'])->name('kilas-data');
Route::get('/fokus-utama', function(Request $request) { return app(SurveyController::class)->produk('story', $request); })->name('fokus-utama');
Route::get('/kabar-tepi', function(Request $request) { return app(SurveyController::class)->produk('news', $request); })->name('kabar-tepi');

require __DIR__.'/auth.php';
