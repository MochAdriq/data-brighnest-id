<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\RegistrationVerificationCodeMail;
use App\Models\PendingRegistration;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Throwable;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email'),
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $verificationCode = (string) random_int(100000, 999999);
        $expiresInMinutes = (int) config('auth.registration_verification.expires', 10);
        $resendCooldown = (int) config('auth.registration_verification.resend_cooldown', 60);
        $email = $request->string('email')->toString();

        PendingRegistration::updateOrCreate([
            'email' => $email,
        ], [
            'name' => $request->string('name')->toString(),
            'password' => Hash::make($request->string('password')->toString()),
            'verification_code' => Hash::make($verificationCode),
            'expires_at' => now()->addMinutes($expiresInMinutes),
            'failed_attempts' => 0,
            'resend_available_at' => now()->addSeconds($resendCooldown),
        ]);

        try {
            Mail::to($email)->send(new RegistrationVerificationCodeMail($verificationCode, $expiresInMinutes));
        } catch (Throwable $e) {
            report($e);
            PendingRegistration::query()->where('email', $email)->delete();

            return back()->withErrors([
                'email' => 'Gagal mengirim kode verifikasi ke email. Silakan coba lagi.',
            ])->withInput();
        }

        $request->session()->put('pending_registration_email', $email);

        return redirect()->route('register.verify')->with(
            'status',
            'Kode verifikasi sudah dikirim ke email Anda. Berlaku 10 menit.',
        );
    }

    public static function ensureMemberRole(User $user): void
    {
        $memberRole = Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);

        if (!$user->hasRole('member')) {
            $user->assignRole($memberRole);
        }
    }
}
