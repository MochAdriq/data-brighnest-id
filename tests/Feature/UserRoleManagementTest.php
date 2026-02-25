<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class UserRoleManagementTest extends TestCase
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

    public function test_super_admin_can_open_user_role_management_page(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->get(route('admin.user-roles.index'));

        $response->assertOk();
    }

    public function test_non_super_admin_cannot_open_user_role_management_page(): void
    {
        $publisher = User::factory()->create();
        $publisher->assignRole('publisher');

        $response = $this->actingAs($publisher)->get(route('admin.user-roles.index'));

        $response->assertForbidden();
    }

    public function test_super_admin_can_change_other_user_role(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $targetUser = User::factory()->create();
        $targetUser->assignRole('member');

        $response = $this->actingAs($superAdmin)->put(route('admin.user-roles.update', $targetUser), [
            'role' => 'editor',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');
        $this->assertTrue($targetUser->fresh()->hasRole('editor'));
    }

    public function test_last_super_admin_cannot_be_demoted(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->from(route('admin.user-roles.index'))->put(
            route('admin.user-roles.update', $superAdmin),
            ['role' => 'publisher']
        );

        $response->assertRedirect(route('admin.user-roles.index'));
        $response->assertSessionHas('error');
        $this->assertTrue($superAdmin->fresh()->hasRole('super_admin'));
    }
}
