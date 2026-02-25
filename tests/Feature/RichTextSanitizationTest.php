<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RichTextSanitizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Storage::fake('public');

        foreach (['super_admin', 'publisher', 'editor', 'member'] as $role) {
            Role::findOrCreate($role, 'web');
        }
    }

    public function test_story_content_removes_dangerous_html_but_keeps_safe_link(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $payload = [
            'type' => 'story',
            'title' => 'Uji Sanitasi Rich Text',
            'category' => 'ekonomi',
            'subcategory' => 'PDB/PDRB',
            'lead' => 'Lead artikel aman',
            'content' => '<p>Konten aman</p><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">klik jahat</a><a href="https://example.com" target="_blank">link aman</a><img src="https://example.com/img.jpg" onerror="alert(1)">',
            'image_file' => UploadedFile::fake()->image('cover.jpg'),
            'is_premium' => false,
        ];

        $response = $this->actingAs($publisher)->post(route('surveys.store'), $payload);
        $response->assertRedirect(route('dashboard'));

        $survey = Survey::where('title', 'Uji Sanitasi Rich Text')->firstOrFail();
        $this->assertNotNull($survey->content);
        $this->assertStringNotContainsString('<script', $survey->content);
        $this->assertStringNotContainsString('onclick=', $survey->content);
        $this->assertStringNotContainsString('onerror=', $survey->content);
        $this->assertStringNotContainsString('javascript:', $survey->content);
        $this->assertStringContainsString('href="https://example.com"', $survey->content);
        $this->assertStringContainsString('rel="noopener noreferrer"', $survey->content);
    }

    public function test_story_content_blocks_data_uri_but_keeps_relative_media_url(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $payload = [
            'type' => 'story',
            'title' => 'Uji Data URI Rich Text',
            'category' => 'ekonomi',
            'subcategory' => 'PDB/PDRB',
            'lead' => 'Lead artikel aman',
            'content' => '<p>Teks</p><img src="data:image/png;base64,AAA"><img src="/storage/editor/safe-image.jpg"><a href="data:text/html;base64,AAA">bad data link</a>',
            'image_file' => UploadedFile::fake()->image('cover-2.jpg'),
            'is_premium' => false,
        ];

        $response = $this->actingAs($publisher)->post(route('surveys.store'), $payload);
        $response->assertRedirect(route('dashboard'));

        $survey = Survey::where('title', 'Uji Data URI Rich Text')->firstOrFail();
        $this->assertNotNull($survey->content);
        $this->assertStringNotContainsString('data:image', $survey->content);
        $this->assertStringNotContainsString('data:text/html', $survey->content);
        $this->assertStringContainsString('src="/storage/editor/safe-image.jpg"', $survey->content);
    }
}
