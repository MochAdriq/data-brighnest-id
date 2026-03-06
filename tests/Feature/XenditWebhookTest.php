<?php

namespace Tests\Feature;

use App\Models\ArticlePurchaseRequest;
use App\Models\Subscription;
use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class XenditWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_xendit_webhook_rejects_invalid_callback_token(): void
    {
        config([
            'services.xendit.webhook_verification_token' => 'valid-token',
        ]);

        $response = $this->postJson(route('webhooks.xendit.payment-request'), [
            'id' => 'pr_test_001',
            'status' => 'SUCCEEDED',
        ]);

        $response->assertUnauthorized();
    }

    public function test_xendit_webhook_accepts_valid_callback_token(): void
    {
        config([
            'services.xendit.webhook_verification_token' => 'valid-token',
        ]);

        $response = $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'id' => 'pr_test_001',
            'status' => 'SUCCEEDED',
            'external_id' => 'premium_membership_test_001',
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'received' => true,
            ]);
    }

    public function test_xendit_webhook_auto_activates_pending_membership_when_succeeded(): void
    {
        $user = User::factory()->create();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'plan_code' => 'monthly',
            'plan_name' => 'Premium Bulanan',
            'duration_days' => 30,
            'amount' => 100000,
            'xendit_reference_id' => 'membership_ref_001',
            'xendit_payment_request_id' => 'pr_001',
        ]);

        config([
            'services.xendit.webhook_verification_token' => 'valid-token',
        ]);

        $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'event' => 'payment_request.succeeded',
            'data' => [
                'payment_request_id' => 'pr_001',
                'reference_id' => 'membership_ref_001',
                'status' => 'SUCCEEDED',
            ],
        ])->assertOk();

        $subscription->refresh();
        $this->assertSame('active', $subscription->status);
        $this->assertNotNull($subscription->starts_at);
        $this->assertNotNull($subscription->ends_at);
        $this->assertNotNull($subscription->paid_at);
    }

    public function test_xendit_webhook_auto_approves_pending_article_request_when_succeeded(): void
    {
        $user = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $user->id,
            'is_premium' => true,
            'premium_tier' => 'premium',
        ]);

        $purchaseRequest = ArticlePurchaseRequest::create([
            'user_id' => $user->id,
            'survey_id' => $survey->id,
            'status' => 'pending',
            'amount' => 10000,
            'xendit_reference_id' => 'article_ref_001',
            'xendit_payment_request_id' => 'pr_article_001',
        ]);

        config([
            'services.xendit.webhook_verification_token' => 'valid-token',
        ]);

        $this->withHeaders([
            'X-CALLBACK-TOKEN' => 'valid-token',
        ])->postJson(route('webhooks.xendit.payment-request'), [
            'event' => 'payment_request.succeeded',
            'data' => [
                'payment_request_id' => 'pr_article_001',
                'reference_id' => 'article_ref_001',
                'status' => 'SUCCEEDED',
            ],
        ])->assertOk();

        $purchaseRequest->refresh();
        $this->assertSame('approved', $purchaseRequest->status);
        $this->assertNotNull($purchaseRequest->paid_at);
        $this->assertDatabaseHas('article_entitlements', [
            'user_id' => $user->id,
            'survey_id' => $survey->id,
            'purchase_request_id' => $purchaseRequest->id,
        ]);
    }
}
