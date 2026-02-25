<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SurveySearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_matches_story_lead_and_content_fields(): void
    {
        $author = User::factory()->create();

        $leadMatch = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
            'title' => 'Analisis APBD',
            'lead' => 'KataKunciLead unik untuk test',
            'content' => '<p>Konten biasa</p>',
            'notes' => null,
        ]);

        $contentMatch = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'news',
            'title' => 'Berita Infrastruktur',
            'lead' => 'Lead biasa',
            'content' => '<p>KataKunciKonten unik di isi artikel</p>',
            'notes' => null,
        ]);

        Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
            'title' => 'Data Kemiskinan',
            'lead' => null,
            'content' => null,
            'notes' => 'Tanpa kata kunci yang dicari',
        ]);

        $responseLead = $this->get(route('search', ['q' => 'KataKunciLead']));
        $responseLead->assertOk();
        $responseLead->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Index')
            ->has('surveys.data', 1)
            ->where('surveys.data.0.id', $leadMatch->id)
        );

        $responseContent = $this->get(route('search', ['q' => 'KataKunciKonten']));
        $responseContent->assertOk();
        $responseContent->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Index')
            ->has('surveys.data', 1)
            ->where('surveys.data.0.id', $contentMatch->id)
        );
    }
}
