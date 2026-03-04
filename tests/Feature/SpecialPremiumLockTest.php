<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SpecialPremiumLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_special_premium_content_stays_locked_even_when_user_has_active_membership(): void
    {
        $author = User::factory()->create();
        $member = User::factory()->create();

        Subscription::create([
            'user_id' => $member->id,
            'status' => 'active',
            'plan_code' => 'monthly',
            'plan_name' => 'Premium Bulanan',
            'duration_days' => 30,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(29),
        ]);

        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
            'title' => 'Konten Spesial',
            'is_premium' => true,
            'premium_tier' => 'special',
            'content' => '<p>Konten ini hanya untuk kanal spesial.</p>',
        ]);

        $response = $this->actingAs($member)->get(route('surveys.show', $survey));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Show')
            ->where('article.premium_tier', 'special')
            ->where('article.is_locked', true)
        );
    }
}

