<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (!$this->isGoogleConfigured()) {
            return redirect()->route('login')->with(
                'status',
                'Google login belum aktif. Lengkapi GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan GOOGLE_REDIRECT_URI.',
            );
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (!$this->isGoogleConfigured()) {
            return redirect()->route('login')->with(
                'status',
                'Google login belum aktif. Redirect URI atau credential belum lengkap.',
            );
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            report($e);

            return redirect()->route('login')->with(
                'status',
                'Login Google gagal diproses. Silakan coba lagi.',
            );
        }

        $email = strtolower(trim((string) $googleUser->getEmail()));
        $googleId = (string) $googleUser->getId();
        if ($email === '') {
            return redirect()->route('login')->with(
                'status',
                'Akun Google tidak menyediakan email yang valid.',
            );
        }

        $user = User::query()->where('google_id', $googleId)->first();
        if (!$user) {
            $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        }

        if ($user && $user->google_id && $user->google_id !== $googleId) {
            return redirect()->route('login')->with(
                'status',
                'Email ini sudah terhubung ke akun Google lain.',
            );
        }

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: 'User Google',
                'email' => $email,
                'google_id' => $googleId,
                'avatar' => $googleUser->getAvatar(),
                'google_only' => false,
                'password' => Hash::make(Str::random(40)),
                'email_verified_at' => now(),
            ]);
        } else {
            $user->forceFill([
                'name' => $user->name ?: ($googleUser->getName() ?: 'User Google'),
                'google_id' => $googleId,
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'google_only' => false,
            ])->save();
        }

        RegisteredUserController::ensureMemberRole($user);

        Auth::login($user, true);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function isGoogleConfigured(): bool
    {
        return !empty(config('services.google.client_id'))
            && !empty(config('services.google.client_secret'))
            && !empty(config('services.google.redirect'));
    }
}
