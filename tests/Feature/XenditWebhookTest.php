<?php

namespace Tests\Feature;

use Tests\TestCase;

class XenditWebhookTest extends TestCase
{
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
}
