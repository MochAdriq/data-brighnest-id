<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class MediaUploadAuthorizationTest extends TestCase
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

    public function test_member_cannot_upload_editor_media(): void
    {
        $member = User::factory()->create();
        $member->assignRole('member');

        $response = $this->actingAs($member)->post(route('media.upload'), [
            'image' => UploadedFile::fake()->image('member-test.jpg'),
        ]);

        $response->assertForbidden();
    }

    public function test_publisher_can_upload_editor_media(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $response = $this->actingAs($publisher)->post(route('media.upload'), [
            'image' => UploadedFile::fake()->image('publisher-test.jpg'),
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['url']);
    }
}
