<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserRoleController extends Controller
{
    private const ALLOWED_ROLES = ['super_admin', 'publisher', 'editor', 'member'];

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $sort = $this->resolveSortDirection($request);
        $role = trim((string) $request->query('role', ''));
        $role = in_array($role, self::ALLOWED_ROLES, true) ? $role : '';

        $users = User::query()
            ->select(['id', 'name', 'email', 'created_at'])
            ->with('roles:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', function ($query) use ($role) {
                $query->whereHas('roles', function ($roleQuery) use ($role) {
                    $roleQuery->where('name', $role);
                });
            })
            ->orderBy('created_at', $sort)
            ->paginate(20)
            ->withQueryString()
            ->through(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'primary_role' => $user->roles->pluck('name')->first() ?? 'member',
                ];
            });

        return Inertia::render('Admin/UserRoles', [
            'users' => $users,
            'filters' => [
                'q' => $search,
                'role' => $role,
                'sort' => $sort,
            ],
            'availableRoles' => self::ALLOWED_ROLES,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:' . implode(',', self::ALLOWED_ROLES)],
        ]);

        $targetRole = $validated['role'];
        $isDemotingFromSuperAdmin = $user->hasRole('super_admin') && $targetRole !== 'super_admin';

        if ($user->id === $request->user()->id && $targetRole !== 'super_admin') {
            return back()->with('error', 'Role akun super admin yang sedang login tidak bisa diturunkan.');
        }

        if ($isDemotingFromSuperAdmin && User::role('super_admin')->count() <= 1) {
            return back()->with('error', 'Minimal harus ada 1 akun dengan role super_admin.');
        }

        $user->syncRoles([$targetRole]);

        return back()->with('success', "Role {$user->email} berhasil diubah ke {$targetRole}.");
    }

    private function resolveSortDirection(Request $request): string
    {
        $sort = strtolower((string) $request->query('sort', 'desc'));

        return in_array($sort, ['asc', 'desc'], true) ? $sort : 'desc';
    }
}
