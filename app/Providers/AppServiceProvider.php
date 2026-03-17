<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        ResetPassword::toMailUsing(function ($notifiable, string $token) {
            $passwordBroker = (string) config('auth.defaults.passwords', 'users');
            $expireMinutes = (int) config("auth.passwords.{$passwordBroker}.expire", 60);
            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Reset Password Brightnest Institute')
                ->view('emails.auth.reset-password', [
                    'resetUrl' => $resetUrl,
                    'expireMinutes' => $expireMinutes,
                ]);
        });

        VerifyEmail::toMailUsing(function ($notifiable, string $verificationUrl) {
            return (new MailMessage)
                ->subject('Verifikasi Email Brightnest Institute')
                ->view('emails.auth.verify-email', [
                    'verificationUrl' => $verificationUrl,
                ]);
        });
    }
}
