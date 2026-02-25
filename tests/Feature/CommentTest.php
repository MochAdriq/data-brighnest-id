<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_submit_comment(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
        ]);

        $response = $this->post(route('surveys.comments.store', $survey->slug), [
            'body' => 'Komentar dari guest',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_authenticated_user_can_submit_comment_on_story(): void
    {
        $author = User::factory()->create();
        $commenter = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
        ]);

        $response = $this->actingAs($commenter)->post(
            route('surveys.comments.store', $survey->slug),
            ['body' => 'Analisisnya sangat membantu.']
        );

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('comments', [
            'survey_id' => $survey->id,
            'user_id' => $commenter->id,
        ]);
    }

    public function test_comment_endpoint_is_not_available_for_series_type(): void
    {
        $author = User::factory()->create();
        $commenter = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
        ]);

        $response = $this->actingAs($commenter)->post(
            route('surveys.comments.store', $survey->slug),
            ['body' => 'Saya coba komentar di series']
        );

        $response->assertNotFound();
        $this->assertDatabaseCount('comments', 0);
    }
}
