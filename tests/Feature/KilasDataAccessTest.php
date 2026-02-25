<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class KilasDataAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_kilas_data_detail_accepts_series_id(): void
    {
        $author = User::factory()->create();
        $series = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'series',
            'title' => 'Series Dataset',
            'csv_data' => [
                ['Tahun' => '2024', 'Nilai' => 120],
                ['Tahun' => '2025', 'Nilai' => 140],
            ],
        ]);

        $response = $this->get(route('kilas-data', ['id' => $series->id]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('KilasData/Index')
            ->where('selectedData.id', $series->id)
            ->where('selectedData.type', 'series')
        );
    }

    public function test_kilas_data_detail_rejects_non_series_id(): void
    {
        $author = User::factory()->create();
        $story = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
            'title' => 'Story Should Not Show In Kilas Data',
        ]);

        $response = $this->get(route('kilas-data', ['id' => $story->id]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('KilasData/Index')
            ->where('selectedData', null)
        );
    }
}
