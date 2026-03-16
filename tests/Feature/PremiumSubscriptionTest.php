<?php

namespace Tests\Feature;

use App\Models\ArticleEntitlement;
use App\Models\ArticlePurchaseRequest;
use App\Models\Subscription;
use App\Models\Survey;
use App\Models\User;
use App\Services\XenditPaymentRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Mockery\MockInterface;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PremiumSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    }

    public function test_guest_cannot_access_purchase_page(): void
    {
        $response = $this->get(route('premium.purchase'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_cannot_submit_membership_when_xendit_not_configured(): void
    {
        config([
            'services.xendit.secret_key' => '',
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->from(route('premium.checkout', ['plan_code' => 'monthly']))
            ->post(route('premium.membership.submit'), [
                'plan_code' => 'monthly',
                'channel_code' => 'DANA',
                'user_note' => 'Coba submit',
            ]);

        $response->assertRedirect(route('premium.checkout', ['plan_code' => 'monthly']));
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('subscriptions', [
            'user_id' => $user->id,
        ]);
    }

    public function test_authenticated_user_can_submit_membership_via_xendit(): void
    {
        config([
            'services.xendit.secret_key' => 'xnd_test_key_123456',
            'services.xendit.base_url' => 'https://api.xendit.co',
            'premium.xendit.default_channel_code' => 'DANA',
            'premium.xendit.channels' => [
                ['code' => 'DANA', 'label' => 'DANA'],
            ],
        ]);

        $user = User::factory()->create();

        $this->mock(XenditPaymentRequestService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createPaymentRequest')
                ->once()
                ->andReturn([
                    'id' => 'pr_membership_001',
                    'latest_payment_id' => 'py_membership_001',
                    'status' => 'PENDING',
                    'checkout_url' => 'https://pay.xendit.test/checkout/membership-001',
                ]);
        });

        $response = $this->actingAs($user)->post(route('premium.membership.submit'), [
            'plan_code' => 'monthly',
            'channel_code' => 'DANA',
            'user_note' => 'Bayar via DANA',
        ]);

        $response->assertRedirect('https://pay.xendit.test/checkout/membership-001');

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'status' => 'pending',
            'plan_code' => 'monthly',
            'xendit_payment_request_id' => 'pr_membership_001',
            'xendit_latest_payment_id' => 'py_membership_001',
            'xendit_status' => 'PENDING',
            'xendit_channel_code' => 'DANA',
            'xendit_checkout_url' => 'https://pay.xendit.test/checkout/membership-001',
        ]);
    }

    public function test_membership_e2e_succeeded_from_checkout_to_webhook(): void
    {
        config([
            'services.xendit.secret_key' => 'xnd_test_key_123456',
            'services.xendit.base_url' => 'https://api.xendit.co',
            'services.xendit.webhook_verification_token' => 'valid-token',
            'premium.xendit.default_channel_code' => 'DANA',
            'premium.xendit.channels' => [
                ['code' => 'DANA', 'label' => 'DANA'],
            ],
        ]);

        $user = User::factory()->create();

        $this->mock(XenditPaymentRequestService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createPaymentRequest')
                ->once()
                ->andReturn([
                    'id' => 'pr_membership_e2e_success_001',
                    'latest_payment_id' => 'py_membership_e2e_success_001',
                    'status' => 'PENDING',
                    'checkout_url' => 'https://pay.xendit.test/checkout/membership-e2e-success-001',
                ]);
        });

        $submitResponse = $this->actingAs($user)->post(route('premium.membership.submit'), [
            'plan_code' => 'monthly',
            'channel_code' => 'DANA',
            'user_note' => 'Membership E2E success',
        ]);
        $submitResponse->assertRedirect('https://pay.xendit.test/checkout/membership-e2e-success-001');

        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($subscription);
        $this->assertSame('pending', $subscription->status);

        $webhookResponse = $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'event' => 'payment_request.succeeded',
            'data' => [
                'payment_request_id' => 'pr_membership_e2e_success_001',
                'reference_id' => $subscription->xendit_reference_id,
                'status' => 'SUCCEEDED',
            ],
        ]);
        $webhookResponse->assertOk();

        $subscription->refresh();
        $this->assertSame('active', $subscription->status);
        $this->assertNotNull($subscription->paid_at);
        $this->assertNotNull($subscription->starts_at);
        $this->assertNotNull($subscription->ends_at);
    }

    public function test_membership_e2e_cancelled_from_checkout_to_webhook(): void
    {
        config([
            'services.xendit.secret_key' => 'xnd_test_key_123456',
            'services.xendit.base_url' => 'https://api.xendit.co',
            'services.xendit.webhook_verification_token' => 'valid-token',
            'premium.xendit.default_channel_code' => 'DANA',
            'premium.xendit.channels' => [
                ['code' => 'DANA', 'label' => 'DANA'],
            ],
        ]);

        $user = User::factory()->create();

        $this->mock(XenditPaymentRequestService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createPaymentRequest')
                ->once()
                ->andReturn([
                    'id' => 'pr_membership_e2e_cancelled_001',
                    'latest_payment_id' => 'py_membership_e2e_cancelled_001',
                    'status' => 'PENDING',
                    'checkout_url' => 'https://pay.xendit.test/checkout/membership-e2e-cancelled-001',
                ]);
        });

        $submitResponse = $this->actingAs($user)->post(route('premium.membership.submit'), [
            'plan_code' => 'monthly',
            'channel_code' => 'DANA',
            'user_note' => 'Membership E2E cancelled',
        ]);
        $submitResponse->assertRedirect('https://pay.xendit.test/checkout/membership-e2e-cancelled-001');

        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($subscription);
        $this->assertSame('pending', $subscription->status);

        $webhookResponse = $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'event' => 'payment_request.cancelled',
            'data' => [
                'payment_request_id' => 'pr_membership_e2e_cancelled_001',
                'reference_id' => $subscription->xendit_reference_id,
                'status' => 'CANCELLED',
            ],
        ]);
        $webhookResponse->assertOk();

        $subscription->refresh();
        $this->assertSame('cancelled', $subscription->status);
        $this->assertNull($subscription->paid_at);
    }

    public function test_article_e2e_succeeded_from_checkout_to_webhook(): void
    {
        config([
            'services.xendit.secret_key' => 'xnd_test_key_123456',
            'services.xendit.base_url' => 'https://api.xendit.co',
            'services.xendit.webhook_verification_token' => 'valid-token',
            'premium.xendit.default_channel_code' => 'DANA',
            'premium.xendit.channels' => [
                ['code' => 'DANA', 'label' => 'DANA'],
            ],
        ]);

        $user = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $user->id,
            'is_premium' => true,
            'premium_tier' => 'premium',
        ]);

        $this->mock(XenditPaymentRequestService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createPaymentRequest')
                ->once()
                ->andReturn([
                    'id' => 'pr_article_e2e_success_001',
                    'latest_payment_id' => 'py_article_e2e_success_001',
                    'status' => 'PENDING',
                    'checkout_url' => 'https://pay.xendit.test/checkout/article-e2e-success-001',
                ]);
        });

        $submitResponse = $this->actingAs($user)->post(route('premium.article.submit', $survey->slug), [
            'channel_code' => 'DANA',
            'user_note' => 'Article E2E success',
        ]);
        $submitResponse->assertRedirect('https://pay.xendit.test/checkout/article-e2e-success-001');

        $request = ArticlePurchaseRequest::query()
            ->where('user_id', $user->id)
            ->where('survey_id', $survey->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($request);
        $this->assertSame('pending', $request->status);

        $webhookResponse = $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'event' => 'payment_request.succeeded',
            'data' => [
                'payment_request_id' => 'pr_article_e2e_success_001',
                'reference_id' => $request->xendit_reference_id,
                'status' => 'SUCCEEDED',
            ],
        ]);
        $webhookResponse->assertOk();

        $request->refresh();
        $this->assertSame('succeeded', $request->status);
        $this->assertNotNull($request->paid_at);
        $this->assertDatabaseHas('article_entitlements', [
            'user_id' => $user->id,
            'survey_id' => $survey->id,
            'purchase_request_id' => $request->id,
        ]);
    }

    public function test_article_e2e_failed_from_checkout_to_webhook(): void
    {
        config([
            'services.xendit.secret_key' => 'xnd_test_key_123456',
            'services.xendit.base_url' => 'https://api.xendit.co',
            'services.xendit.webhook_verification_token' => 'valid-token',
            'premium.xendit.default_channel_code' => 'DANA',
            'premium.xendit.channels' => [
                ['code' => 'DANA', 'label' => 'DANA'],
            ],
        ]);

        $user = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $user->id,
            'is_premium' => true,
            'premium_tier' => 'premium',
        ]);

        $this->mock(XenditPaymentRequestService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createPaymentRequest')
                ->once()
                ->andReturn([
                    'id' => 'pr_article_e2e_failed_001',
                    'latest_payment_id' => 'py_article_e2e_failed_001',
                    'status' => 'PENDING',
                    'checkout_url' => 'https://pay.xendit.test/checkout/article-e2e-failed-001',
                ]);
        });

        $submitResponse = $this->actingAs($user)->post(route('premium.article.submit', $survey->slug), [
            'channel_code' => 'DANA',
            'user_note' => 'Article E2E failed',
        ]);
        $submitResponse->assertRedirect('https://pay.xendit.test/checkout/article-e2e-failed-001');

        $request = ArticlePurchaseRequest::query()
            ->where('user_id', $user->id)
            ->where('survey_id', $survey->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($request);
        $this->assertSame('pending', $request->status);

        $webhookResponse = $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'event' => 'payment_request.failed',
            'data' => [
                'payment_request_id' => 'pr_article_e2e_failed_001',
                'reference_id' => $request->xendit_reference_id,
                'status' => 'FAILED',
            ],
        ]);
        $webhookResponse->assertOk();

        $request->refresh();
        $this->assertSame('failed', $request->status);
        $this->assertNull($request->paid_at);
        $this->assertDatabaseMissing('article_entitlements', [
            'user_id' => $user->id,
            'survey_id' => $survey->id,
            'purchase_request_id' => $request->id,
        ]);
    }

    public function test_non_admin_cannot_open_admin_subscription_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $response = $this->actingAs($user)->get(route('premium.admin.subscriptions'));
        $response->assertForbidden();
    }

    public function test_admin_page_exposes_xendit_health_check_payload(): void
    {
        config([
            'services.xendit.secret_key' => 'xnd_test_health_key_123456',
            'services.xendit.webhook_verification_token' => 'xendit-health-token',
            'services.xendit.base_url' => 'https://api.xendit.co',
            'premium.xendit.default_channel_code' => 'DANA',
            'premium.xendit.channels' => [
                ['code' => 'DANA', 'label' => 'DANA'],
            ],
        ]);

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');

        $response = $this->actingAs($admin)->get(route('premium.admin.subscriptions'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Premium/AdminSubscriptions')
            ->has('xenditHealth')
            ->where('xenditHealth.overall', fn ($value) => in_array($value, ['ok', 'warning', 'error'], true))
            ->has('xenditHealth.summary.ok')
            ->has('xenditHealth.summary.warning')
            ->has('xenditHealth.summary.error')
            ->has('xenditHealth.items', 7)
            ->where('xenditHealth.items.0.key', 'secret_key')
            ->where('xenditHealth.items.1.key', 'webhook_token')
            ->where('xenditHealth.items.2.key', 'base_url')
            ->where('xenditHealth.items.3.key', 'config_cache')
            ->where('xenditHealth.items.4.key', 'channels')
            ->where('xenditHealth.items.5.key', 'webhook_routes')
            ->where('xenditHealth.items.6.key', 'database_schema'));
    }

    public function test_manual_proof_and_approval_routes_are_removed(): void
    {
        $this->assertFalse(Route::has('premium.proofs.subscription'));
        $this->assertFalse(Route::has('premium.proofs.article'));
        $this->assertFalse(Route::has('premium.admin.subscriptions.approve'));
        $this->assertFalse(Route::has('premium.admin.subscriptions.reject'));
        $this->assertFalse(Route::has('premium.admin.articles.approve'));
        $this->assertFalse(Route::has('premium.admin.articles.reject'));
    }

    public function test_article_purchase_form_exposes_picker_articles_and_excludes_owned_items(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');

        $currentSurvey = Survey::factory()->create([
            'user_id' => $user->id,
            'title' => 'Current Premium Article',
            'slug' => 'current-premium-article',
            'is_premium' => true,
        ]);

        $ownedSurvey = Survey::factory()->create([
            'user_id' => $user->id,
            'title' => 'Owned Premium Article',
            'slug' => 'owned-premium-article',
            'is_premium' => true,
        ]);

        $availableSurvey = Survey::factory()->create([
            'user_id' => $user->id,
            'title' => 'Available Premium Article',
            'slug' => 'available-premium-article',
            'is_premium' => true,
        ]);

        ArticleEntitlement::create([
            'user_id' => $user->id,
            'survey_id' => $ownedSurvey->id,
            'granted_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('premium.article.purchase', $currentSurvey->slug));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Premium/PurchaseArticle')
            ->has('availablePremiumArticles', 2)
            ->where('availablePremiumArticles.0.slug', function ($slug) use ($currentSurvey, $availableSurvey) {
                return in_array($slug, [$currentSurvey->slug, $availableSurvey->slug], true);
            })
            ->where('availablePremiumArticles.1.slug', function ($slug) use ($currentSurvey, $availableSurvey) {
                return in_array($slug, [$currentSurvey->slug, $availableSurvey->slug], true);
            })
            ->missing('availablePremiumArticles.2'));
    }
}
