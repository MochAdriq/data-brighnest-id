<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SeriesTechnicalNotesVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_series_notes_are_hidden_on_detail_when_show_notes_is_false(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
            'title' => 'Series Dengan Catatan Tersembunyi',
            'notes' => 'Catatan internal',
            'show_notes' => false,
            'is_premium' => false,
        ]);

        $response = $this->get(route('surveys.show', $survey));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Show')
            ->where('article.type', 'series')
            ->where('article.notes', null)
        );
    }

    public function test_series_notes_are_visible_for_legacy_data_when_show_notes_is_null(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
            'title' => 'Series Legacy',
            'notes' => 'Catatan legacy tetap tampil',
            'show_notes' => null,
            'is_premium' => false,
        ]);

        $response = $this->get(route('surveys.show', $survey));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Surveys/Show')
            ->where('article.type', 'series')
            ->where('article.notes', 'Catatan legacy tetap tampil')
        );
    }

    public function test_kilas_data_selected_notes_are_hidden_when_show_notes_is_false(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
            'title' => 'Series Kilas Hidden',
            'notes' => 'Tidak boleh tampil',
            'show_notes' => false,
            'is_premium' => false,
        ]);

        $response = $this->get(route('kilas-data', ['id' => $survey->id]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('KilasData/Index')
            ->where('selectedData.id', $survey->id)
            ->where('selectedData.notes', null)
        );
    }

    public function test_kilas_data_selected_notes_are_visible_for_legacy_null_show_notes(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
            'title' => 'Series Kilas Legacy',
            'notes' => 'Legacy harus tampil',
            'show_notes' => null,
            'is_premium' => false,
        ]);

        $response = $this->get(route('kilas-data', ['id' => $survey->id]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('KilasData/Index')
            ->where('selectedData.id', $survey->id)
            ->where('selectedData.notes', 'Legacy harus tampil')
        );
    }
}

