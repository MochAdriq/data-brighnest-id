<?php

namespace App\Http\Controllers;

use App\Models\ArticleEntitlement;
use App\Models\ArticlePurchaseRequest;
use App\Models\Subscription;
use App\Models\Survey;
use App\Models\User;
use App\Services\XenditHealthCheckService;
use App\Services\XenditPaymentRequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use RuntimeException;

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
                ->select(['id', 'slug', 'title', 'type', 'category', 'is_premium', 'premium_tier'])
                ->where('slug', $selectedArticleSlug)
                ->where(function ($query) {
                    $query
                        ->where('premium_tier', '!=', Survey::PREMIUM_TIER_FREE)
                        ->orWhere(function ($legacy) {
                            $legacy
                                ->where('is_premium', true)
                                ->where(function ($legacyTier) {
                                    $legacyTier
                                        ->whereNull('premium_tier')
                                        ->orWhere('premium_tier', '');
                                });
                        });
                })
                ->first();
        }

        if ($selectedPremiumArticle) {
            $premiumTier = $selectedPremiumArticle->resolvedPremiumTier();
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
                'premium_tier' => $premiumTier,
                'is_special' => $premiumTier === Survey::PREMIUM_TIER_SPECIAL,
                'can_submit' => $premiumTier === Survey::PREMIUM_TIER_PREMIUM
                    && !$active
                    && !$hasEntitlement,
            ];
        }

        $availablePremiumArticles = $this->availablePremiumArticlesForUser($user);

        $pendingArticleRequests = $user->articlePurchaseRequests()
            ->with('survey:id,title,slug,type,is_premium,premium_tier')
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
            'specialPremium' => [
                'phone' => '08133113110',
                'whatsapp_number' => '628133113110',
                'chat_template' => 'saya tertarik terkait artikel {title}',
            ],
            'xendit' => [
                'enabled' => $this->isXenditEnabled(),
                'channels' => $this->xenditChannelsPayload(),
            ],
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
            'xendit' => [
                'enabled' => $this->isXenditEnabled(),
                'channels' => $this->xenditChannelsPayload(),
            ],
        ]);
    }

    public function articlePurchaseForm(Request $request, Survey $survey)
    {
        $premiumTier = $survey->resolvedPremiumTier();
        if ($premiumTier === Survey::PREMIUM_TIER_FREE) {
            abort(404);
        }
        if ($premiumTier === Survey::PREMIUM_TIER_SPECIAL) {
            return redirect()
                ->route('surveys.show', $survey)
                ->with('error', 'Artikel ini termasuk kategori spesial. Silakan hubungi WhatsApp untuk akses.');
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
                ->with('survey:id,title,slug,type,is_premium,premium_tier')
                ->where('status', 'pending')
                ->latest('created_at')
                ->take(10)
                ->get()
                ->values(),
            'xendit' => [
                'enabled' => $this->isXenditEnabled(),
                'channels' => $this->xenditChannelsPayload(),
            ],
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
        if (!$this->isXenditEnabled()) {
            return back()->with('error', 'Pembayaran online belum tersedia. Silakan hubungi admin.');
        }

        return $this->submitMembershipViaXendit($request);
    }

    private function submitMembershipViaXendit(Request $request)
    {
        $availablePlanCodes = array_keys(config('premium.membership_plans', []));
        if (empty($availablePlanCodes)) {
            $availablePlanCodes = ['monthly', 'yearly'];
        }

        $validated = $request->validate([
            'plan_code' => 'required|string|in:' . implode(',', $availablePlanCodes),
            'channel_code' => 'required|string|max:120',
            'user_note' => 'nullable|string|max:1000',
        ], [
            'channel_code.required' => 'Pilih metode pembayaran terlebih dahulu.',
        ]);

        $plan = $this->getMembershipPlan($validated['plan_code']);
        $user = $request->user();

        $channelCode = $this->resolveXenditChannelCode((string) $validated['channel_code']);
        $referenceId = 'membership_' . (string) Str::uuid();

        $subscription = $user->subscriptions()->create([
            'status' => 'pending',
            'plan_code' => $validated['plan_code'],
            'plan_name' => $plan['name'],
            'duration_days' => $plan['duration_days'],
            'amount' => $plan['amount'],
            'user_note' => $validated['user_note'] ?? null,
            'xendit_reference_id' => $referenceId,
            'xendit_channel_code' => $channelCode,
            'xendit_status' => 'PENDING',
        ]);

        try {
            $response = $this->xenditService()->createPaymentRequest([
                'reference_id' => $referenceId,
                'type' => 'PAY',
                'country' => 'ID',
                'currency' => 'IDR',
                'request_amount' => (float) $plan['amount'],
                'capture_method' => 'AUTOMATIC',
                'channel_code' => $channelCode,
                'channel_properties' => $this->buildXenditChannelProperties(
                    route('premium.purchase', ['payment' => 'success']),
                    route('premium.purchase', ['payment' => 'failed']),
                    route('premium.purchase', ['payment' => 'cancel']),
                ),
                'description' => "Membership {$plan['name']} - {$user->email}",
                'metadata' => [
                    'context' => 'membership',
                    'subscription_id' => $subscription->id,
                    'user_id' => $user->id,
                    'plan_code' => $validated['plan_code'],
                ],
            ]);

            $checkoutUrl = $this->extractXenditCheckoutUrl($response);
            $subscription->update([
                'xendit_payment_request_id' => (string) ($response['id'] ?? $response['payment_request_id'] ?? ''),
                'xendit_latest_payment_id' => (string) ($response['latest_payment_id'] ?? ''),
                'xendit_status' => strtoupper((string) ($response['status'] ?? 'PENDING')),
                'xendit_checkout_url' => $checkoutUrl,
            ]);

            if ($checkoutUrl) {
                if ($request->header('X-Inertia')) {
                    return Inertia::location($checkoutUrl);
                }

                return redirect()->away($checkoutUrl);
            }

            return redirect()
                ->route('premium.purchase')
                ->with('success', 'Permintaan pembayaran berhasil dibuat. Silakan selesaikan pembayaran dari channel yang dipilih.');
        } catch (\Throwable $e) {
            report($e);
            $subscription->delete();

            $message = $e instanceof RuntimeException
                ? $e->getMessage()
                : 'Gagal membuat permintaan pembayaran ke Xendit.';

            return back()->with('error', $message);
        }
    }

    public function submitArticle(Request $request, Survey $survey)
    {
        if (!$this->isXenditEnabled()) {
            return back()->with('error', 'Pembayaran online belum tersedia. Silakan hubungi admin.');
        }

        return $this->submitArticleViaXendit($request, $survey);
    }

    private function submitArticleViaXendit(Request $request, Survey $survey)
    {
        $premiumTier = $survey->resolvedPremiumTier();
        if ($premiumTier === Survey::PREMIUM_TIER_FREE) {
            return back()->with('error', 'Artikel ini bukan konten premium.');
        }
        if ($premiumTier === Survey::PREMIUM_TIER_SPECIAL) {
            return back()->with('error', 'Artikel kategori spesial hanya dapat diakses melalui WhatsApp.');
        }

        $user = $request->user();
        if ($user->hasActiveSubscription()) {
            return back()->with('error', 'Akun Anda sudah memiliki membership aktif, tidak perlu beli artikel satuan.');
        }

        if ($user->hasArticleEntitlement((int) $survey->id)) {
            return back()->with('error', 'Artikel ini sudah Anda miliki secara permanen.');
        }

        $validated = $request->validate([
            'channel_code' => 'required|string|max:120',
            'user_note' => 'nullable|string|max:1000',
        ], [
            'channel_code.required' => 'Pilih metode pembayaran terlebih dahulu.',
        ]);

        $channelCode = $this->resolveXenditChannelCode((string) $validated['channel_code']);
        $amount = (int) config('premium.single_article_price', 10000);
        $referenceId = 'article_' . (string) Str::uuid();

        $purchaseRequest = $user->articlePurchaseRequests()->create([
            'survey_id' => $survey->id,
            'status' => 'pending',
            'amount' => $amount,
            'user_note' => $validated['user_note'] ?? null,
            'xendit_reference_id' => $referenceId,
            'xendit_channel_code' => $channelCode,
            'xendit_status' => 'PENDING',
        ]);

        try {
            $response = $this->xenditService()->createPaymentRequest([
                'reference_id' => $referenceId,
                'type' => 'PAY',
                'country' => 'ID',
                'currency' => 'IDR',
                'request_amount' => (float) $amount,
                'capture_method' => 'AUTOMATIC',
                'channel_code' => $channelCode,
                'channel_properties' => $this->buildXenditChannelProperties(
                    route('surveys.show', ['survey' => $survey->slug, 'payment' => 'success']),
                    route('surveys.show', ['survey' => $survey->slug, 'payment' => 'failed']),
                    route('surveys.show', ['survey' => $survey->slug, 'payment' => 'cancel']),
                ),
                'description' => "Akses artikel premium {$survey->title} - {$user->email}",
                'metadata' => [
                    'context' => 'article',
                    'purchase_request_id' => $purchaseRequest->id,
                    'survey_id' => $survey->id,
                    'user_id' => $user->id,
                ],
            ]);

            $checkoutUrl = $this->extractXenditCheckoutUrl($response);
            $purchaseRequest->update([
                'xendit_payment_request_id' => (string) ($response['id'] ?? $response['payment_request_id'] ?? ''),
                'xendit_latest_payment_id' => (string) ($response['latest_payment_id'] ?? ''),
                'xendit_status' => strtoupper((string) ($response['status'] ?? 'PENDING')),
                'xendit_checkout_url' => $checkoutUrl,
            ]);

            if ($checkoutUrl) {
                if ($request->header('X-Inertia')) {
                    return Inertia::location($checkoutUrl);
                }

                return redirect()->away($checkoutUrl);
            }

            return redirect()
                ->route('premium.purchase', ['survey' => $survey->slug, 'mode' => 'article'])
                ->with('success', 'Permintaan pembayaran artikel berhasil dibuat. Silakan selesaikan pembayaran dari channel yang dipilih.');
        } catch (\Throwable $e) {
            report($e);
            $purchaseRequest->delete();

            $message = $e instanceof RuntimeException
                ? $e->getMessage()
                : 'Gagal membuat permintaan pembayaran artikel ke Xendit.';

            return back()->with('error', $message);
        }
    }

    public function adminIndex(Request $request)
    {
        $this->ensureAdmin($request);
        $filters = $this->resolveFilters($request);
        $xenditHealth = app(XenditHealthCheckService::class)->run();

        $subscriptions = Subscription::with(['user:id,name,email'])
            ->when($filters['status'] !== '', function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when($filters['q'] !== '', function ($query) use ($filters) {
                $keyword = $filters['q'];
                $query->where(function ($sub) use ($keyword) {
                    $sub->where('plan_name', 'like', "%{$keyword}%")
                        ->orWhere('xendit_reference_id', 'like', "%{$keyword}%")
                        ->orWhere('xendit_payment_request_id', 'like', "%{$keyword}%")
                        ->orWhere('xendit_channel_code', 'like', "%{$keyword}%")
                        ->orWhere('xendit_status', 'like', "%{$keyword}%")
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
                'survey:id,title,slug,type,is_premium,premium_tier',
                'entitlement:id,purchase_request_id,granted_at',
            ])
            ->when($filters['status'] !== '', function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when($filters['q'] !== '', function ($query) use ($filters) {
                $keyword = $filters['q'];
                $query->where(function ($sub) use ($keyword) {
                    $sub->where('xendit_reference_id', 'like', "%{$keyword}%")
                        ->orWhere('xendit_payment_request_id', 'like', "%{$keyword}%")
                        ->orWhere('xendit_channel_code', 'like', "%{$keyword}%")
                        ->orWhere('xendit_status', 'like', "%{$keyword}%")
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

        $activeMemberships = Subscription::with(['user:id,name,email'])
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->orderBy('ends_at', 'asc')
            ->take(12)
            ->get()
            ->values();

        $recentEntitlements = ArticleEntitlement::with([
                'user:id,name,email',
                'survey:id,title,slug,type,is_premium,premium_tier',
            ])
            ->latest('granted_at')
            ->take(12)
            ->get()
            ->values();

        $premiumSummary = [
            'active_memberships' => Subscription::query()
                ->where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
                })
                ->count(),
            'article_entitlements' => ArticleEntitlement::query()->count(),
            'pending_membership_payments' => Subscription::query()
                ->where('status', 'pending')
                ->count(),
            'pending_article_payments' => ArticlePurchaseRequest::query()
                ->where('status', 'pending')
                ->count(),
        ];

        return Inertia::render('Premium/AdminSubscriptions', [
            'subscriptions' => $subscriptions,
            'articleRequests' => $articleRequests,
            'activeMemberships' => $activeMemberships,
            'recentEntitlements' => $recentEntitlements,
            'premiumSummary' => $premiumSummary,
            'filters' => $filters,
            'xenditHealth' => $xenditHealth,
            'filterOptions' => [
                'statuses' => $this->availablePremiumStatuses(),
                'plans' => array_keys(config('premium.membership_plans', [])),
            ],
        ]);
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
        $availableStatuses = $this->availablePremiumStatuses();

        return [
            'q' => $q,
            'status' => in_array($status, $availableStatuses, true) ? $status : '',
            'sort' => in_array($sort, ['asc', 'desc'], true) ? $sort : 'desc',
        ];
    }

    /**
     * @return array<int, string>
     */
    private function availablePremiumStatuses(): array
    {
        return [
            'pending',
            'active',
            'succeeded',
            'failed',
            'expired',
            'cancelled',
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
            ->select(['id', 'slug', 'title', 'type', 'category', 'created_at', 'premium_tier'])
            ->where(function ($premiumQuery) {
                $premiumQuery
                    ->where('premium_tier', Survey::PREMIUM_TIER_PREMIUM)
                    ->orWhere(function ($legacy) {
                        $legacy
                            ->where('is_premium', true)
                            ->where(function ($legacyTier) {
                                $legacyTier
                                    ->whereNull('premium_tier')
                                    ->orWhere('premium_tier', '');
                            });
                    });
            });

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

    private function isXenditEnabled(): bool
    {
        return trim((string) config('services.xendit.secret_key', '')) !== '';
    }

    private function xenditChannelsPayload(): array
    {
        $channels = config('premium.xendit.channels', []);
        if (!is_array($channels)) {
            return [];
        }

        return collect($channels)
            ->filter(fn ($item) => is_array($item) && !empty($item['code']))
            ->map(function (array $item) {
                $normalizedCode = $this->normalizeXenditChannelCode((string) $item['code']);

                return [
                    'code' => $normalizedCode,
                    'label' => (string) ($item['label'] ?? $item['code']),
                ];
            })
            ->values()
            ->all();
    }

    private function resolveXenditChannelCode(string $channelCode): string
    {
        $normalized = $this->normalizeXenditChannelCode($channelCode);
        if ($normalized === '') {
            $normalized = $this->normalizeXenditChannelCode((string) config('premium.xendit.default_channel_code', 'DANA'));
        }

        $allowed = collect($this->xenditChannelsPayload())
            ->pluck('code')
            ->all();

        if (!in_array($normalized, $allowed, true)) {
            throw ValidationException::withMessages([
                'channel_code' => 'Metode pembayaran yang dipilih tidak valid.',
            ]);
        }

        return $normalized;
    }

    private function normalizeXenditChannelCode(string $channelCode): string
    {
        $normalized = strtoupper(trim($channelCode));
        if ($normalized === '') {
            return '';
        }

        // Backward compatibility: legacy channel code style "ID_DANA" -> "DANA".
        if (str_starts_with($normalized, 'ID_')) {
            $candidate = substr($normalized, 3);
            if ($candidate !== '') {
                return $candidate;
            }
        }

        return $normalized;
    }

    private function xenditService(): XenditPaymentRequestService
    {
        return app(XenditPaymentRequestService::class);
    }

    private function extractXenditCheckoutUrl(array $response): ?string
    {
        $directUrlCandidates = [
            (string) ($response['checkout_url'] ?? ''),
            (string) ($response['payment_link_url'] ?? ''),
            (string) ($response['invoice_url'] ?? ''),
            (string) ($response['payment_url'] ?? ''),
            (string) ($response['web_url'] ?? ''),
            (string) ($response['redirect_url'] ?? ''),
        ];

        foreach ($directUrlCandidates as $candidate) {
            if ($candidate !== '' && filter_var($candidate, FILTER_VALIDATE_URL)) {
                return $candidate;
            }
        }

        $actions = $response['actions'] ?? [];
        if (!is_array($actions)) {
            return null;
        }

        foreach ($actions as $action) {
            if (!is_array($action)) {
                continue;
            }

            $actionUrlCandidates = [
                (string) ($action['value'] ?? ''),
                (string) ($action['url'] ?? ''),
                (string) ($action['href'] ?? ''),
                (string) ($action['desktop_web_checkout_url'] ?? ''),
                (string) ($action['mobile_web_checkout_url'] ?? ''),
                (string) ($action['mobile_deeplink_checkout_url'] ?? ''),
            ];

            foreach ($actionUrlCandidates as $candidate) {
                if ($candidate !== '' && filter_var($candidate, FILTER_VALIDATE_URL)) {
                    return $candidate;
                }
            }
        }

        return null;
    }

    private function buildXenditChannelProperties(
        string $successUrl,
        string $failureUrl,
        string $cancelUrl,
    ): array {
        $displayName = trim((string) config('app.name', 'Brightnest Institute'));
        if ($displayName === '') {
            $displayName = 'Brightnest Institute';
        }

        return [
            'success_return_url' => $successUrl,
            'failure_return_url' => $failureUrl,
            'cancel_return_url' => $cancelUrl,
            'display_name' => Str::limit($displayName, 30, ''),
        ];
    }

}
