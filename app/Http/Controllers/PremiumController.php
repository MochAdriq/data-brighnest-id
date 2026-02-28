<?php

namespace App\Http\Controllers;

use App\Models\ArticleEntitlement;
use App\Models\ArticlePurchaseRequest;
use App\Models\Subscription;
use App\Models\Survey;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PremiumController extends Controller
{
    public function purchase(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('super_admin')) {
            return redirect()->route('premium.admin.subscriptions');
        }

        $latest = $user
            ->subscriptions()
            ->latest()
            ->first();

        $active = $user
            ->subscriptions()
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest('ends_at')
            ->first();

        $plans = $this->membershipPlansPayload();
        $selectedArticleSlug = trim((string) $request->query('survey', ''));
        $selectedPremiumArticle = null;
        $selectedArticlePurchaseState = null;

        if ($selectedArticleSlug !== '') {
            $selectedPremiumArticle = Survey::query()
                ->select(['id', 'slug', 'title', 'type', 'category', 'is_premium'])
                ->where('slug', $selectedArticleSlug)
                ->where('is_premium', true)
                ->first();
        }

        if ($selectedPremiumArticle) {
            $hasEntitlement = $user->hasArticleEntitlement((int) $selectedPremiumArticle->id);
            $pendingRequest = $user->articlePurchaseRequests()
                ->where('survey_id', $selectedPremiumArticle->id)
                ->where('status', 'pending')
                ->latest()
                ->first();

            $selectedArticlePurchaseState = [
                'already_owned' => $hasEntitlement,
                'has_pending' => (bool) $pendingRequest,
                'pending_request_id' => $pendingRequest?->id,
                'can_submit' => !$active && !$hasEntitlement && !$pendingRequest,
            ];
        }

        $availablePremiumArticles = $this->availablePremiumArticlesForUser($user);

        $pendingArticleRequests = $user->articlePurchaseRequests()
            ->with('survey:id,title,slug,type')
            ->where('status', 'pending')
            ->latest('created_at')
            ->take(10)
            ->get()
            ->values();

        return Inertia::render('Premium/Purchase', [
            'latestSubscription' => $latest,
            'activeSubscription' => $active,
            'articleEntitlementCount' => $user->articleEntitlements()->count(),
            'pricing' => [
                'single_article' => (int) config('premium.single_article_price', 10000),
                'plans' => $plans,
            ],
            'focusMode' => in_array($request->query('mode'), ['membership', 'article'], true)
                ? $request->query('mode')
                : 'membership',
            'selectedPremiumArticle' => $selectedPremiumArticle,
            'selectedArticlePurchaseState' => $selectedArticlePurchaseState,
            'availablePremiumArticles' => $availablePremiumArticles,
            'pendingArticleRequests' => $pendingArticleRequests,
        ]);
    }

    public function checkout(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('super_admin')) {
            return redirect()->route('premium.admin.subscriptions');
        }

        $planCode = strtolower(trim((string) $request->query('plan_code', '')));
        $plans = $this->membershipPlansPayload();
        $selectedPlan = collect($plans)->firstWhere('code', $planCode);

        if (!$selectedPlan) {
            return redirect()
                ->route('premium.purchase')
                ->with('error', 'Paket tidak ditemukan. Silakan pilih ulang paket berlangganan.');
        }

        return Inertia::render('Premium/Checkout', [
            'plan' => $selectedPlan,
        ]);
    }

    public function articlePurchaseForm(Request $request, Survey $survey)
    {
        if (!(bool) $survey->is_premium) {
            abort(404);
        }

        $user = $request->user();
        $activeSubscription = $user->subscriptions()
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest('ends_at')
            ->first();

        $pendingRequest = $user->articlePurchaseRequests()
            ->where('survey_id', $survey->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        return Inertia::render('Premium/PurchaseArticle', [
            'article' => $survey->only(['id', 'slug', 'title', 'type', 'category', 'created_at']),
            'activeSubscription' => $activeSubscription,
            'articlePurchaseState' => [
                'already_owned' => $user->hasArticleEntitlement((int) $survey->id),
                'has_pending' => (bool) $pendingRequest,
                'pending_request_id' => $pendingRequest?->id,
            ],
            'pricing' => [
                'single_article' => (int) config('premium.single_article_price', 10000),
            ],
            'availablePremiumArticles' => $this->availablePremiumArticlesForUser($user, (int) $survey->id),
            'pendingArticleRequests' => $user->articlePurchaseRequests()
                ->with('survey:id,title,slug,type')
                ->where('status', 'pending')
                ->latest('created_at')
                ->take(10)
                ->get()
                ->values(),
        ]);
    }

    /**
     * Backward-compatible endpoint lama.
     * Defaultkan ke membership bulanan saat plan_code tidak dikirim frontend lama.
     */
    public function submit(Request $request)
    {
        if (!$request->filled('plan_code')) {
            $request->merge(['plan_code' => 'monthly']);
        }

        return $this->submitMembership($request);
    }

    public function submitMembership(Request $request)
    {
        $validated = $request->validate([
            'plan_code' => 'required|string|in:monthly,yearly',
            'payment_method' => 'required|string|max:80',
            'transfer_date' => 'required|date',
            'reference_no' => 'nullable|string|max:100',
            'user_note' => 'nullable|string|max:1000',
            'proof_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ], [
            'proof_file.required' => 'Bukti pembayaran wajib diupload.',
            'proof_file.mimes' => 'Bukti pembayaran harus jpg/png/pdf.',
            'proof_file.max' => 'Ukuran bukti pembayaran maksimal 5MB.',
        ]);

        $plan = $this->getMembershipPlan($validated['plan_code']);
        $user = $request->user();
        $hasPending = $user->subscriptions()->where('status', 'pending')->exists();
        if ($hasPending) {
            return back()->with('error', 'Anda masih punya pengajuan premium yang menunggu verifikasi admin.');
        }

        $proofPath = $request->file('proof_file')->store('private/payments/memberships');

        $user->subscriptions()->create([
            'status' => 'pending',
            'plan_code' => $validated['plan_code'],
            'plan_name' => $plan['name'],
            'duration_days' => $plan['duration_days'],
            'amount' => $plan['amount'],
            'payment_method' => trim($validated['payment_method']),
            'reference_no' => $validated['reference_no'] ?? null,
            'transfer_date' => $validated['transfer_date'],
            'proof_path' => $proofPath,
            'user_note' => $validated['user_note'] ?? null,
        ]);

        return back()->with('success', "Pengajuan {$plan['name']} berhasil dikirim. Menunggu verifikasi super admin.");
    }

    public function submitArticle(Request $request, Survey $survey)
    {
        if (!(bool) $survey->is_premium) {
            return back()->with('error', 'Artikel ini bukan konten premium.');
        }

        $user = $request->user();
        if ($user->hasActiveSubscription()) {
            return back()->with('error', 'Akun Anda sudah memiliki membership aktif, tidak perlu beli artikel satuan.');
        }

        if ($user->hasArticleEntitlement((int) $survey->id)) {
            return back()->with('error', 'Artikel ini sudah Anda miliki secara permanen.');
        }

        $hasPendingRequest = $user->articlePurchaseRequests()
            ->where('survey_id', $survey->id)
            ->where('status', 'pending')
            ->exists();
        if ($hasPendingRequest) {
            return back()->with('error', 'Anda sudah mengirim permintaan pembelian artikel ini dan masih menunggu verifikasi.');
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|max:80',
            'transfer_date' => 'required|date',
            'reference_no' => 'nullable|string|max:100',
            'user_note' => 'nullable|string|max:1000',
            'proof_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ], [
            'proof_file.required' => 'Bukti pembayaran wajib diupload.',
            'proof_file.mimes' => 'Bukti pembayaran harus jpg/png/pdf.',
            'proof_file.max' => 'Ukuran bukti pembayaran maksimal 5MB.',
        ]);

        $proofPath = $request->file('proof_file')->store('private/payments/articles');
        $amount = (int) config('premium.single_article_price', 10000);

        $user->articlePurchaseRequests()->create([
            'survey_id' => $survey->id,
            'status' => 'pending',
            'amount' => $amount,
            'payment_method' => trim($validated['payment_method']),
            'reference_no' => $validated['reference_no'] ?? null,
            'transfer_date' => $validated['transfer_date'],
            'proof_path' => $proofPath,
            'user_note' => $validated['user_note'] ?? null,
        ]);

        return back()->with('success', 'Pengajuan pembelian artikel berhasil dikirim. Menunggu verifikasi super admin.');
    }

    public function adminIndex(Request $request)
    {
        $this->ensureAdmin($request);
        $filters = $this->resolveFilters($request);

        $subscriptions = Subscription::with(['user:id,name,email', 'verifier:id,name'])
            ->when($filters['status'] !== '', function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when($filters['q'] !== '', function ($query) use ($filters) {
                $keyword = $filters['q'];
                $query->where(function ($sub) use ($keyword) {
                    $sub->where('payment_method', 'like', "%{$keyword}%")
                        ->orWhere('reference_no', 'like', "%{$keyword}%")
                        ->orWhereHas('user', function ($userQ) use ($keyword) {
                            $userQ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        });
                });
            })
            ->orderBy('created_at', $filters['sort'])
            ->paginate(20)
            ->withQueryString();

        $articleRequests = ArticlePurchaseRequest::with([
                'user:id,name,email',
                'verifier:id,name',
                'survey:id,title,slug,type',
                'entitlement:id,purchase_request_id',
            ])
            ->when($filters['status'] !== '', function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when($filters['q'] !== '', function ($query) use ($filters) {
                $keyword = $filters['q'];
                $query->where(function ($sub) use ($keyword) {
                    $sub->where('payment_method', 'like', "%{$keyword}%")
                        ->orWhere('reference_no', 'like', "%{$keyword}%")
                        ->orWhereHas('survey', function ($surveyQ) use ($keyword) {
                            $surveyQ->where('title', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('user', function ($userQ) use ($keyword) {
                            $userQ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        });
                });
            })
            ->orderBy('created_at', $filters['sort'])
            ->paginate(20, ['*'], 'article_page')
            ->withQueryString();

        return Inertia::render('Premium/AdminSubscriptions', [
            'subscriptions' => $subscriptions,
            'articleRequests' => $articleRequests,
            'filters' => $filters,
            'filterOptions' => [
                'statuses' => ['pending', 'active', 'approved', 'rejected'],
                'plans' => array_keys(config('premium.membership_plans', [])),
            ],
        ]);
    }

    public function approve(Request $request, Subscription $subscription)
    {
        $this->ensureAdmin($request);

        if ($subscription->status === 'active') {
            return back()->with('success', 'Subscription sudah aktif.');
        }
        if ($subscription->status !== 'pending') {
            return back()->with('error', 'Hanya subscription berstatus pending yang bisa di-approve.');
        }

        $startsAt = now();
        $activeTail = Subscription::query()
            ->where('user_id', $subscription->user_id)
            ->where('status', 'active')
            ->where('id', '!=', $subscription->id)
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest('ends_at')
            ->first();
        if ($activeTail && $activeTail->ends_at && $activeTail->ends_at->gt($startsAt)) {
            $startsAt = $activeTail->ends_at->copy();
        }

        $durationDays = (int) ($subscription->duration_days ?: $this->resolvePlanDuration((string) $subscription->plan_code));
        if ($durationDays <= 0) {
            $durationDays = 30;
        }
        $endsAt = (clone $startsAt)->addDays($durationDays);

        $subscription->update([
            'status' => 'active',
            'verified_by' => $request->user()->id,
            'admin_note' => $request->input('admin_note'),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Subscription berhasil diaktifkan.');
    }

    public function reject(Request $request, Subscription $subscription)
    {
        $this->ensureAdmin($request);

        if ($subscription->status === 'rejected') {
            return back()->with('success', 'Subscription sudah berstatus ditolak.');
        }
        if ($subscription->status !== 'pending') {
            return back()->with('error', 'Hanya subscription berstatus pending yang bisa ditolak.');
        }

        $subscription->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'admin_note' => $request->input('admin_note'),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan subscription ditolak.');
    }

    public function approveArticle(Request $request, ArticlePurchaseRequest $articlePurchaseRequest)
    {
        $this->ensureAdmin($request);

        if ($articlePurchaseRequest->status === 'approved') {
            return back()->with('success', 'Permintaan pembelian artikel sudah disetujui.');
        }
        if ($articlePurchaseRequest->status !== 'pending') {
            return back()->with('error', 'Hanya permintaan berstatus pending yang bisa di-approve.');
        }

        DB::transaction(function () use ($request, $articlePurchaseRequest) {
            $articlePurchaseRequest->update([
                'status' => 'approved',
                'verified_by' => $request->user()->id,
                'admin_note' => $request->input('admin_note'),
                'reviewed_at' => now(),
            ]);

            ArticleEntitlement::firstOrCreate(
                [
                    'user_id' => $articlePurchaseRequest->user_id,
                    'survey_id' => $articlePurchaseRequest->survey_id,
                ],
                [
                    'purchase_request_id' => $articlePurchaseRequest->id,
                    'granted_by' => $request->user()->id,
                    'granted_at' => now(),
                ]
            );
        });

        return back()->with('success', 'Permintaan pembelian artikel disetujui dan akses permanen diberikan.');
    }

    public function rejectArticle(Request $request, ArticlePurchaseRequest $articlePurchaseRequest)
    {
        $this->ensureAdmin($request);

        if ($articlePurchaseRequest->status === 'rejected') {
            return back()->with('success', 'Permintaan pembelian artikel sudah ditolak.');
        }
        if ($articlePurchaseRequest->status !== 'pending') {
            return back()->with('error', 'Hanya permintaan berstatus pending yang bisa ditolak.');
        }

        $articlePurchaseRequest->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'admin_note' => $request->input('admin_note'),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Permintaan pembelian artikel ditolak.');
    }

    public function downloadSubscriptionProof(Request $request, Subscription $subscription)
    {
        $user = $request->user();
        $canAccess = $user
            && ($user->hasRole('super_admin') || (int) $subscription->user_id === (int) $user->id);
        if (!$canAccess) {
            abort(403);
        }

        if (empty($subscription->proof_path)) {
            abort(404);
        }

        return $this->downloadProofFile((string) $subscription->proof_path, "subscription-{$subscription->id}");
    }

    public function downloadArticleProof(Request $request, ArticlePurchaseRequest $articlePurchaseRequest)
    {
        $user = $request->user();
        $canAccess = $user
            && ($user->hasRole('super_admin') || (int) $articlePurchaseRequest->user_id === (int) $user->id);
        if (!$canAccess) {
            abort(403);
        }

        if (empty($articlePurchaseRequest->proof_path)) {
            abort(404);
        }

        return $this->downloadProofFile((string) $articlePurchaseRequest->proof_path, "article-{$articlePurchaseRequest->id}");
    }

    private function ensureAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->hasRole('super_admin')) {
            abort(403, 'Hanya admin yang dapat mengakses halaman ini.');
        }
    }

    private function resolveFilters(Request $request): array
    {
        $sort = strtolower((string) $request->query('sort', 'desc'));
        $status = strtolower((string) $request->query('status', ''));
        $q = trim((string) $request->query('q', ''));

        return [
            'q' => $q,
            'status' => in_array($status, ['pending', 'active', 'approved', 'rejected'], true) ? $status : '',
            'sort' => in_array($sort, ['asc', 'desc'], true) ? $sort : 'desc',
        ];
    }

    private function getMembershipPlan(string $planCode): array
    {
        $plans = config('premium.membership_plans', []);
        $plan = $plans[$planCode] ?? null;

        if (!is_array($plan)) {
            return [
                'name' => 'Premium Bulanan',
                'amount' => 100000,
                'duration_days' => 30,
            ];
        }

        return [
            'name' => (string) ($plan['name'] ?? 'Premium'),
            'amount' => (int) ($plan['amount'] ?? 0),
            'duration_days' => (int) ($plan['duration_days'] ?? 30),
        ];
    }

    private function membershipPlansPayload(): array
    {
        $plans = config('premium.membership_plans', []);
        $payload = [];

        foreach ($plans as $code => $plan) {
            if (!is_array($plan)) {
                continue;
            }

            $payload[] = [
                'code' => (string) $code,
                'name' => (string) ($plan['name'] ?? 'Premium'),
                'amount' => (int) ($plan['amount'] ?? 0),
                'duration_days' => (int) ($plan['duration_days'] ?? 30),
            ];
        }

        return $payload;
    }

    private function resolvePlanDuration(string $planCode): int
    {
        $plan = $this->getMembershipPlan($planCode);
        return (int) ($plan['duration_days'] ?? 30);
    }

    private function availablePremiumArticlesForUser(User $user, ?int $includeSurveyId = null)
    {
        $query = Survey::query()
            ->select(['id', 'slug', 'title', 'type', 'category', 'created_at'])
            ->where('is_premium', true);

        if ($includeSurveyId) {
            $query->where(function ($subQuery) use ($user, $includeSurveyId) {
                $subQuery
                    ->where('id', $includeSurveyId)
                    ->orWhereDoesntHave('articleEntitlements', function ($entitlementQuery) use ($user) {
                        $entitlementQuery->where('user_id', $user->id);
                    });
            });
        } else {
            $query->whereDoesntHave('articleEntitlements', function ($entitlementQuery) use ($user) {
                $entitlementQuery->where('user_id', $user->id);
            });
        }

        return $query
            ->latest('created_at')
            ->take(80)
            ->get()
            ->values();
    }

    private function downloadProofFile(string $storedPath, string $namePrefix)
    {
        $local = Storage::disk('local');
        $public = Storage::disk('public');

        if ($local->exists($storedPath)) {
            $absolutePath = $local->path($storedPath);
            $extension = pathinfo($storedPath, PATHINFO_EXTENSION);
            $filename = $namePrefix . ($extension ? ".{$extension}" : '');

            return response()->download($absolutePath, $filename);
        }

        // Backward compatibility untuk data lama yang tersimpan di disk public.
        if ($public->exists($storedPath)) {
            $absolutePath = $public->path($storedPath);
            $extension = pathinfo($storedPath, PATHINFO_EXTENSION);
            $filename = $namePrefix . ($extension ? ".{$extension}" : '');

            return response()->download($absolutePath, $filename);
        }

        abort(404);
    }
}
