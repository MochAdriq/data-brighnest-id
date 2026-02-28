<?php

namespace Tests\Feature\Auth;

use App\Mail\RegistrationVerificationCodeMail;
use App\Models\PendingRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_receive_verification_code_before_account_is_created(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register.verify', absolute: false));
        $this->assertGuest();
        $this->assertDatabaseHas('pending_registrations', [
            'email' => 'test@example.com',
        ]);
        $this->assertDatabaseMissing('users', [
            'email' => 'test@example.com',
        ]);

        Mail::assertSent(RegistrationVerificationCodeMail::class);
    }

    public function test_users_can_verify_code_and_activate_account(): void
    {
        Mail::fake();

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $code = null;
        Mail::assertSent(RegistrationVerificationCodeMail::class, function ($mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        $response = $this->post('/register/verify', [
            'code' => $code,
        ]);

        $response->assertRedirect(route('login', absolute: false));
        $this->assertGuest();

        $user = User::query()->where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->email_verified_at);
        $this->assertDatabaseMissing('pending_registrations', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_verification_code_has_maximum_five_attempts(): void
    {
        Mail::fake();

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        for ($i = 0; $i < 4; $i++) {
            $response = $this->from('/register/verify')->post('/register/verify', [
                'code' => '000000',
            ]);

            $response->assertRedirect('/register/verify');
            $response->assertSessionHasErrors('code');
        }

        $response = $this->from('/register/verify')->post('/register/verify', [
            'code' => '000000',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('pending_registrations', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_resend_verification_code_is_throttled_for_sixty_seconds(): void
    {
        Mail::fake();

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response = $this->from('/register/verify')->post('/register/verify/resend');

        $response->assertRedirect('/register/verify');
        $response->assertSessionHasErrors('code');

        $pending = PendingRegistration::query()->where('email', 'test@example.com')->first();
        $this->assertNotNull($pending);
    }
}
