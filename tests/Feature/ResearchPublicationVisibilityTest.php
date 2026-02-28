<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ResearchPublicationVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_premium_research_publication_keeps_thumbnail_visible_for_guest(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'publikasi_riset',
            'title' => 'Publikasi Premium Dengan Thumbnail',
            'is_premium' => true,
            'image' => 'thumbnails/publication-thumb.jpg',
            'pdf_path' => 'private/research-publications/premium-file.pdf',
        ]);

        $response = $this->get(route('surveys.show', $survey));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Show')
            ->where('article.type', 'publikasi_riset')
            ->where('article.is_locked', true)
            ->where('article.image', 'thumbnails/publication-thumb.jpg')
            ->where('article.has_publication_pdf', true)
        );
    }

    public function test_premium_story_still_hides_main_image_for_guest(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
            'title' => 'Story Premium',
            'is_premium' => true,
            'image' => 'thumbnails/story-image.jpg',
            'content' => '<p>Konten premium</p>',
        ]);

        $response = $this->get(route('surveys.show', $survey));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Show')
            ->where('article.type', 'story')
            ->where('article.is_locked', true)
            ->where('article.image', null)
        );
    }
}

