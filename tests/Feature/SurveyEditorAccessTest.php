<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SurveyEditorAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['super_admin', 'publisher', 'editor', 'member'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    public function test_editor_can_open_edit_page(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $survey = Survey::factory()->create([
            'user_id' => $publisher->id,
            'type' => 'story',
        ]);

        $response = $this->actingAs($editor)->get(route('surveys.edit', $survey->id));

        $response->assertOk();
    }

    public function test_editor_cannot_open_create_page(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $response = $this->actingAs($editor)->get(route('surveys.create'));

        $response->assertForbidden();
    }
}
