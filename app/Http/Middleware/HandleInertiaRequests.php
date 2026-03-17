<?php

namespace App\Http\Middleware;

use App\Models\PromoBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $user = $request->user();
        $roles = $user ? $user->getRoleNames()->values()->all() : [];
        $isMember = in_array('member', $roles, true);
        $hasActiveSubscription = $isMember ? $user->hasActiveSubscription() : false;
        $eligibleMemberNonPremium = (bool) ($user && $isMember && !$hasActiveSubscription);
        $activeMemberBanner = $eligibleMemberNonPremium ? $this->activeMemberBanner() : null;

        $categoryTree = collect(config('categories', []))
            ->map(function ($item) {
                return [
                    'id' => $item['id'] ?? null,
                    'slug' => $item['slug'] ?? ($item['id'] ?? null),
                    'name' => $item['name'] ?? null,
                    'subs' => array_values($item['subs'] ?? []),
                ];
            })
            ->filter(fn ($item) => !empty($item['id']) && !empty($item['name']))
            ->values()
            ->all();

        $globalCategories = array_map(function ($item) {
            return [
                'id' => $item['id'],
                'slug' => $item['slug'],
                'name' => $item['name'],
            ];
        }, $categoryTree);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'email_verified_at' => $user->email_verified_at,
                        'avatar' => $user->avatar,
                        'bio' => $user->bio,
                        'location' => $user->location,
                        'website_url' => $user->website_url,
                        'preferred_categories' => $user->preferred_categories,
                        'notify_new_content' => (bool) $user->notify_new_content,
                        'notify_comment_replies' => (bool) $user->notify_comment_replies,
                        'notify_premium_status' => (bool) $user->notify_premium_status,
                        'locale' => $user->locale ?? 'id',
                        'timezone' => $user->timezone ?? 'Asia/Jakarta',
                        'roles' => $roles,
                        'primary_role' => $roles[0] ?? null,
                        'has_active_subscription' => $hasActiveSubscription,
                    ]
                    : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Sumber kategori tunggal untuk seluruh frontend.
            'globalCategories' => $globalCategories,
            'globalCategoryTree' => $categoryTree,
            'globalPromoPopup' => [
                'delay_ms' => 4000,
                'close_unlock_ms' => 3000,
                'guest' => $this->guestPopupPayload(),
                'eligible_member_non_premium' => $eligibleMemberNonPremium,
                'member_banner' => $this->mapBanner($activeMemberBanner),
            ],
        ];
    }

    private function guestPopupPayload(): array
    {
        return [
            'title' => 'Masuk untuk akses data strategis Brightnest Institute',
            'subtitle' => 'Login atau daftar akun untuk menikmati fitur personal, analisis mendalam, dan akses premium.',
            'image_url' => asset('images/hero-background.webp'),
            'primary_cta_label' => 'Masuk',
            'primary_cta_url' => '/login',
            'secondary_cta_label' => 'Daftar',
            'secondary_cta_url' => '/register',
        ];
    }

    private function activeMemberBanner(): ?PromoBanner
    {
        return PromoBanner::query()
            ->where('is_active', true)
            ->whereIn('target_scope', [
                PromoBanner::TARGET_MEMBER_NON_PREMIUM,
                PromoBanner::TARGET_ALL_LOGGED_IN,
            ])
            ->where(function ($query) {
                $query
                    ->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query
                    ->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            })
            ->orderByDesc('priority')
            ->orderByDesc('id')
            ->first();
    }

    private function mapBanner(?PromoBanner $banner): ?array
    {
        if (!$banner) {
            return null;
        }

        return [
            'id' => $banner->id,
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'image_url' => $this->bannerImageUrl($banner->image_path),
            'cta_label' => $banner->cta_label,
            'cta_url' => $banner->cta_url,
            'priority' => (int) $banner->priority,
        ];
    }

    private function bannerImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
