<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\ArticlePurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_authenticated_user_can_submit_manual_subscription_request(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('premium.submit'), [
            'payment_method' => 'Transfer Bank',
            'transfer_date' => now()->toDateString(),
            'amount' => '150000',
            'reference_no' => 'REF-12345',
            'user_note' => 'Pembayaran bulan ini',
            'proof_file' => UploadedFile::fake()->image('proof.jpg'),
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    public function test_non_admin_cannot_open_admin_subscription_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $response = $this->actingAs($user)->get(route('premium.admin.subscriptions'));
        $response->assertForbidden();
    }

    public function test_admin_can_approve_subscription(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        $member = User::factory()->create();
        $member->assignRole('member');
        $subscription = Subscription::create([
            'user_id' => $member->id,
            'status' => 'pending',
            'plan_name' => 'Premium Bulanan',
            'duration_days' => 30,
        ]);

        $response = $this->actingAs($admin)->post(
            route('premium.admin.subscriptions.approve', $subscription->id),
            ['admin_note' => 'Pembayaran valid']
        );

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'status' => 'active',
            'verified_by' => $admin->id,
        ]);
    }

    public function test_user_can_download_own_subscription_proof_file(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $path = 'private/payments/memberships/test-proof.pdf';
        Storage::disk('local')->put($path, 'dummy-proof');

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'plan_name' => 'Premium Bulanan',
            'duration_days' => 30,
            'proof_path' => $path,
        ]);

        $response = $this->actingAs($user)->get(route('premium.proofs.subscription', $subscription->id));

        $response->assertOk();
        $response->assertDownload('subscription-' . $subscription->id . '.pdf');
    }

    public function test_non_owner_member_cannot_download_other_users_subscription_proof_file(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $otherMember = User::factory()->create();
        $otherMember->assignRole('member');

        $path = 'private/payments/memberships/private-proof.pdf';
        Storage::disk('local')->put($path, 'dummy-proof');

        $subscription = Subscription::create([
            'user_id' => $owner->id,
            'status' => 'pending',
            'plan_name' => 'Premium Bulanan',
            'duration_days' => 30,
            'proof_path' => $path,
        ]);

        $response = $this->actingAs($otherMember)->get(route('premium.proofs.subscription', $subscription->id));

        $response->assertForbidden();
    }

    public function test_admin_can_download_article_purchase_proof_file(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        $member = User::factory()->create();

        $survey = \App\Models\Survey::factory()->create([
            'user_id' => $member->id,
            'is_premium' => true,
        ]);

        $path = 'private/payments/articles/article-proof.pdf';
        Storage::disk('local')->put($path, 'dummy-proof');

        $request = ArticlePurchaseRequest::create([
            'user_id' => $member->id,
            'survey_id' => $survey->id,
            'status' => 'pending',
            'amount' => 10000,
            'proof_path' => $path,
        ]);

        $response = $this->actingAs($admin)->get(route('premium.proofs.article', $request->id));

        $response->assertOk();
        $response->assertDownload('article-' . $request->id . '.pdf');
    }
}
