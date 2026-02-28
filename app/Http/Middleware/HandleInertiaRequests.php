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
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'email_verified_at' => $request->user()->email_verified_at,
                        'avatar' => $request->user()->avatar,
                        'bio' => $request->user()->bio,
                        'location' => $request->user()->location,
                        'website_url' => $request->user()->website_url,
                        'preferred_categories' => $request->user()->preferred_categories,
                        'notify_new_content' => (bool) $request->user()->notify_new_content,
                        'notify_comment_replies' => (bool) $request->user()->notify_comment_replies,
                        'notify_premium_status' => (bool) $request->user()->notify_premium_status,
                        'locale' => $request->user()->locale ?? 'id',
                        'timezone' => $request->user()->timezone ?? 'Asia/Jakarta',
                        'roles' => $request->user()->getRoleNames()->values()->all(),
                        'primary_role' => $request->user()->getRoleNames()->first(),
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
        ];
    }
}
