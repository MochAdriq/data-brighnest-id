<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\RegistrationVerificationCodeMail;
use App\Models\PendingRegistration;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RegistrationVerificationController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $pending = $this->pendingFromSession($request);
        if (!$pending) {
            return redirect()->route('register');
        }

        if (now()->greaterThan($pending->expires_at)) {
            $this->clearPending($request, $pending);

            return redirect()->route('register')->withErrors([
                'email' => 'Kode verifikasi sudah kedaluwarsa. Silakan daftar ulang.',
            ]);
        }

        $maxAttempts = (int) config('auth.registration_verification.max_attempts', 5);
        $secondsToResend = max(
            0,
            $pending->resend_available_at
                ? $pending->resend_available_at->getTimestamp() - now()->getTimestamp()
                : 0,
        );

        return Inertia::render('Auth/VerifyRegistrationCode', [
            'email' => $pending->email,
            'status' => session('status'),
            'remainingAttempts' => max(0, $maxAttempts - (int) $pending->failed_attempts),
            'maxAttempts' => $maxAttempts,
            'resendAvailableIn' => $secondsToResend,
            'expiresAt' => $pending->expires_at?->toIso8601String(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $pending = $this->pendingFromSession($request);
        if (!$pending) {
            return redirect()->route('register')->withErrors([
                'email' => 'Sesi verifikasi tidak ditemukan. Silakan daftar ulang.',
            ]);
        }

        if (now()->greaterThan($pending->expires_at)) {
            $this->clearPending($request, $pending);

            return redirect()->route('register')->withErrors([
                'email' => 'Kode verifikasi sudah kedaluwarsa. Silakan daftar ulang.',
            ]);
        }

        if (!Hash::check($request->string('code')->toString(), $pending->verification_code)) {
            $maxAttempts = (int) config('auth.registration_verification.max_attempts', 5);
            $pending->increment('failed_attempts');
            $failedAttempts = $pending->fresh()->failed_attempts;

            if ($failedAttempts >= $maxAttempts) {
                $this->clearPending($request, $pending->fresh());

                return redirect()->route('register')->withErrors([
                    'email' => 'Percobaan verifikasi habis. Silakan daftar ulang.',
                ]);
            }

            $remaining = max(0, $maxAttempts - $failedAttempts);

            return back()->withErrors([
                'code' => "Kode verifikasi tidak valid. Sisa percobaan {$remaining} kali.",
            ])->onlyInput('code');
        }

        $user = User::query()->whereRaw('LOWER(email) = ?', [strtolower($pending->email)])->first();

        if (!$user) {
            $user = User::create([
                'name' => $pending->name,
                'email' => $pending->email,
                'password' => $pending->password,
                'email_verified_at' => now(),
                'google_only' => false,
            ]);
        } else {
            $user->forceFill([
                'name' => $pending->name,
                'password' => $pending->password,
                'email_verified_at' => now(),
                'google_only' => false,
            ])->save();
        }

        RegisteredUserController::ensureMemberRole($user);
        $this->clearPending($request, $pending);

        return redirect()->route('login')->with(
            'status',
            'Email berhasil diverifikasi. Silakan login.',
        );
    }

    public function resend(Request $request): RedirectResponse
    {
        $pending = $this->pendingFromSession($request);
        if (!$pending) {
            return redirect()->route('register')->withErrors([
                'email' => 'Sesi verifikasi tidak ditemukan. Silakan daftar ulang.',
            ]);
        }

        if (now()->greaterThan($pending->expires_at)) {
            $this->clearPending($request, $pending);

            return redirect()->route('register')->withErrors([
                'email' => 'Kode verifikasi sudah kedaluwarsa. Silakan daftar ulang.',
            ]);
        }

        $secondsToResend = max(
            0,
            $pending->resend_available_at
                ? $pending->resend_available_at->getTimestamp() - now()->getTimestamp()
                : 0,
        );

        if ($secondsToResend > 0) {
            return back()->withErrors([
                'code' => "Tunggu {$secondsToResend} detik sebelum kirim ulang kode.",
            ]);
        }

        $verificationCode = (string) random_int(100000, 999999);
        $expiresInMinutes = (int) config('auth.registration_verification.expires', 10);
        $resendCooldown = (int) config('auth.registration_verification.resend_cooldown', 60);

        $pending->forceFill([
            'verification_code' => Hash::make($verificationCode),
            'expires_at' => now()->addMinutes($expiresInMinutes),
            'failed_attempts' => 0,
            'resend_available_at' => now()->addSeconds($resendCooldown),
        ])->save();

        try {
            Mail::to($pending->email)->send(
                new RegistrationVerificationCodeMail($verificationCode, $expiresInMinutes),
            );
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'code' => 'Gagal mengirim ulang kode verifikasi. Silakan coba lagi.',
            ]);
        }

        return back()->with('status', 'Kode verifikasi baru sudah dikirim ke email Anda.');
    }

    private function pendingFromSession(Request $request): ?PendingRegistration
    {
        $email = strtolower(trim((string) $request->session()->get('pending_registration_email', '')));
        if ($email === '') {
            return null;
        }

        return PendingRegistration::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();
    }

    private function clearPending(Request $request, PendingRegistration $pending): void
    {
        $pending->delete();
        $request->session()->forget('pending_registration_email');
    }
}
