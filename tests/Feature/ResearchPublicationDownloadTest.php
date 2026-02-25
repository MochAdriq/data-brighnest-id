<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResearchPublicationDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_download_non_premium_publication_pdf_and_counter_increments(): void
    {
        Storage::fake('local');

        $author = User::factory()->create();
        $path = 'private/research-publications/public-rilis-2026.pdf';
        Storage::disk('local')->put($path, 'dummy-pdf');

        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'publikasi_riset',
            'is_premium' => false,
            'pdf_path' => $path,
            'download_count' => 0,
        ]);

        $response = $this->get(route('surveys.publication.download', $survey));

        $response->assertOk();
        $this->assertStringContainsString(
            'attachment;',
            (string) $response->headers->get('content-disposition')
        );

        $survey->refresh();
        $this->assertSame(1, (int) $survey->download_count);
    }

    public function test_guest_is_redirected_to_login_when_publication_is_premium(): void
    {
        Storage::fake('local');

        $author = User::factory()->create();
        $path = 'private/research-publications/premium-rilis-2026.pdf';
        Storage::disk('local')->put($path, 'dummy-pdf');

        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'publikasi_riset',
            'is_premium' => true,
            'pdf_path' => $path,
            'download_count' => 0,
        ]);

        $response = $this->get(route('surveys.publication.download', $survey));

        $response->assertRedirect(route('login'));
        $survey->refresh();
        $this->assertSame(0, (int) $survey->download_count);
    }

    public function test_owner_can_download_own_premium_publication_pdf(): void
    {
        Storage::fake('local');

        $author = User::factory()->create();
        $path = 'private/research-publications/owner-premium-rilis.pdf';
        Storage::disk('local')->put($path, 'dummy-pdf');

        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'publikasi_riset',
            'is_premium' => true,
            'pdf_path' => $path,
            'download_count' => 0,
        ]);

        $response = $this->actingAs($author)->get(route('surveys.publication.download', $survey));

        $response->assertOk();
        $survey->refresh();
        $this->assertSame(1, (int) $survey->download_count);
    }

    public function test_download_publication_pdf_returns_404_for_non_publication_type(): void
    {
        $author = User::factory()->create();
        $survey = Survey::factory()->create([
            'user_id' => $author->id,
            'type' => 'story',
            'pdf_path' => null,
        ]);

        $response = $this->get(route('surveys.publication.download', $survey));

        $response->assertNotFound();
    }
}

