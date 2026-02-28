<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $this->ensurePasswordResetMailerIsConfigured();

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );
        } catch (Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'email' => ['Gagal mengirim email reset password. Periksa konfigurasi email aplikasi.'],
            ]);
        }

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    private function ensurePasswordResetMailerIsConfigured(): void
    {
        $skipValidation = (bool) config(
            'auth.skip_password_reset_mailer_validation',
            app()->runningUnitTests()
        );

        if ($skipValidation) {
            return;
        }

        $mailer = (string) config('mail.default', 'log');
        if (in_array($mailer, ['log', 'array'], true)) {
            throw ValidationException::withMessages([
                'email' => ['Layanan email belum aktif. Atur SMTP pada environment agar email reset password bisa terkirim.'],
            ]);
        }
    }
}
