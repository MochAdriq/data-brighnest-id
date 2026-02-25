<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SurveyUpdateTypeValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['super_admin', 'publisher', 'editor', 'member'] as $role) {
            Role::findOrCreate($role, 'web');
        }
    }

    public function test_update_to_series_requires_file_if_old_series_file_is_missing(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $survey = Survey::factory()->create([
            'user_id' => $publisher->id,
            'type' => 'story',
            'title' => 'Story Lama',
            'image' => null,
            'file_path' => null,
            'csv_data' => null,
        ]);

        $response = $this->actingAs($publisher)->from(route('surveys.edit', $survey->id))->put(
            route('surveys.update', $survey->id),
            [
                'type' => 'series',
                'title' => 'Story Lama',
                'category' => 'ekonomi',
                'subcategory' => 'PDB/PDRB',
                'chart_type' => 'bar',
                'is_interactive' => true,
                'notes' => 'Catatan data',
                'is_premium' => false,
            ]
        );

        $response->assertRedirect(route('surveys.edit', $survey->id));
        $response->assertSessionHasErrors('file');
    }

    public function test_update_to_story_requires_image_if_old_image_is_missing(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $survey = Survey::factory()->create([
            'user_id' => $publisher->id,
            'type' => 'series',
            'title' => 'Series Lama',
            'image' => null,
            'file_path' => null,
            'csv_data' => null,
        ]);

        $response = $this->actingAs($publisher)->from(route('surveys.edit', $survey->id))->put(
            route('surveys.update', $survey->id),
            [
                'type' => 'story',
                'title' => 'Series Lama',
                'category' => 'ekonomi',
                'subcategory' => 'PDB/PDRB',
                'lead' => 'Lead artikel',
                'content' => '<p>Konten artikel</p>',
                'is_premium' => false,
            ]
        );

        $response->assertRedirect(route('surveys.edit', $survey->id));
        $response->assertSessionHasErrors('image_file');
    }

    public function test_update_to_research_publication_requires_pdf_if_old_pdf_is_missing(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $survey = Survey::factory()->create([
            'user_id' => $publisher->id,
            'type' => 'story',
            'title' => 'Artikel Lama',
            'pdf_path' => null,
            'image' => null,
        ]);

        $response = $this->actingAs($publisher)->from(route('surveys.edit', $survey->id))->put(
            route('surveys.update', $survey->id),
            [
                'type' => 'publikasi_riset',
                'title' => 'Artikel Lama',
                'category' => 'politik',
                'subcategory' => 'Elektabilitas',
                'published_year' => 2026,
                'research_topic' => 'Kinerja Pemerintah Daerah',
                'lead' => 'Pengantar singkat publikasi riset.',
                'is_premium' => true,
            ]
        );

        $response->assertRedirect(route('surveys.edit', $survey->id));
        $response->assertSessionHasErrors('pdf_file');
    }

    public function test_store_research_publication_requires_metadata_and_pdf(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $response = $this->actingAs($publisher)->from(route('surveys.create'))->post(
            route('surveys.store'),
            [
                'type' => 'publikasi_riset',
                'title' => 'Publikasi Baru',
                'category' => 'politik',
                'subcategory' => 'Elektabilitas',
                'is_premium' => false,
            ]
        );

        $response->assertRedirect(route('surveys.create'));
        $response->assertSessionHasErrors([
            'published_year',
            'research_topic',
            'lead',
            'pdf_file',
        ]);
    }
}
