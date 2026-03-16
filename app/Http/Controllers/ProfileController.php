<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $activeSubscription = $request->user()
            ->subscriptions()
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest('ends_at')
            ->first();

        $latestSubscription = $request->user()
            ->subscriptions()
            ->latest()
            ->first();

        $pendingSubscriptions = $request->user()
            ->subscriptions()
            ->where('status', 'pending')
            ->count();
        $pendingArticlePurchases = $request->user()
            ->articlePurchaseRequests()
            ->where('status', 'pending')
            ->count();
        $subscriptionHistory = $request->user()
            ->subscriptions()
            ->latest('created_at')
            ->take(12)
            ->get()
            ->values();
        $articlePurchaseHistory = $request->user()
            ->articlePurchaseRequests()
            ->with(['survey:id,title,slug,type'])
            ->latest('created_at')
            ->take(12)
            ->get()
            ->values();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'activeSubscription' => $activeSubscription,
            'latestSubscription' => $latestSubscription,
            'subscriptionHistory' => $subscriptionHistory,
            'articlePurchaseHistory' => $articlePurchaseHistory,
            'profileStats' => [
                'article_entitlements' => $request->user()->articleEntitlements()->count(),
                'pending_subscriptions' => $pendingSubscriptions,
                'pending_article_purchases' => $pendingArticlePurchases,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());
        $emailChanged = $request->user()->isDirty('email');

        if ($emailChanged) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with(
            'status',
            $emailChanged ? 'profile-email-changed' : 'profile-updated',
        );
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
