<?php

namespace App\Http\Controllers;

use App\Models\PromoBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PromoBannerController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));

        $banners = PromoBanner::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('subtitle', 'like', "%{$search}%")
                        ->orWhere('cta_label', 'like', "%{$search}%")
                        ->orWhere('cta_url', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('priority')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through(function (PromoBanner $banner) {
                return [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'subtitle' => $banner->subtitle,
                    'image_path' => $banner->image_path,
                    'image_url' => $this->imageUrl($banner->image_path),
                    'cta_label' => $banner->cta_label,
                    'cta_url' => $banner->cta_url,
                    'target_scope' => $banner->target_scope,
                    'priority' => (int) $banner->priority,
                    'is_active' => (bool) $banner->is_active,
                    'starts_at' => $banner->starts_at?->toDateTimeString(),
                    'ends_at' => $banner->ends_at?->toDateTimeString(),
                    'starts_at_input' => $banner->starts_at?->format('Y-m-d\TH:i'),
                    'ends_at_input' => $banner->ends_at?->format('Y-m-d\TH:i'),
                    'created_at' => $banner->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('Admin/PromoBanners', [
            'banners' => $banners,
            'filters' => [
                'q' => $search,
            ],
            'targetOptions' => $this->targetOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request, true);
        $imagePath = $request->file('image_file')->store('promo-banners', 'public');

        PromoBanner::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'image_path' => $imagePath,
            'cta_label' => $validated['cta_label'],
            'cta_url' => $validated['cta_url'],
            'target_scope' => $validated['target_scope'],
            'priority' => (int) ($validated['priority'] ?? 0),
            'is_active' => $this->toBool($request->input('is_active', true)),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Banner popup berhasil ditambahkan.');
    }

    public function update(Request $request, PromoBanner $promoBanner)
    {
        $validated = $this->validatePayload($request, false);

        $payload = [
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'cta_label' => $validated['cta_label'],
            'cta_url' => $validated['cta_url'],
            'target_scope' => $validated['target_scope'],
            'priority' => (int) ($validated['priority'] ?? 0),
            'is_active' => $this->toBool($request->input('is_active', true)),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
        ];

        if ($request->hasFile('image_file')) {
            if ($promoBanner->image_path && Storage::disk('public')->exists($promoBanner->image_path)) {
                Storage::disk('public')->delete($promoBanner->image_path);
            }
            $payload['image_path'] = $request->file('image_file')->store('promo-banners', 'public');
        }

        $promoBanner->update($payload);

        return back()->with('success', 'Banner popup berhasil diperbarui.');
    }

    public function destroy(PromoBanner $promoBanner)
    {
        if ($promoBanner->image_path && Storage::disk('public')->exists($promoBanner->image_path)) {
            Storage::disk('public')->delete($promoBanner->image_path);
        }

        $promoBanner->delete();

        return back()->with('success', 'Banner popup berhasil dihapus.');
    }

    private function validatePayload(Request $request, bool $isCreate): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:140'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'cta_label' => ['required', 'string', 'max:60'],
            'cta_url' => ['required', 'string', 'max:255'],
            'target_scope' => ['required', 'string', 'in:' . implode(',', array_keys($this->targetOptions()))],
            'priority' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];

        $rules['image_file'] = $isCreate
            ? ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096']
            : ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'];

        $validated = $request->validate($rules, [
            'image_file.required' => 'Gambar banner wajib diisi.',
            'image_file.image' => 'File banner harus berupa gambar.',
            'image_file.mimes' => 'Format gambar harus jpg, jpeg, png, atau webp.',
            'cta_url.required' => 'Link CTA wajib diisi.',
            'ends_at.after_or_equal' => 'Tanggal selesai harus setelah tanggal mulai.',
        ]);

        if (!$this->isValidCtaUrl((string) $validated['cta_url'])) {
            throw ValidationException::withMessages([
                'cta_url' => 'CTA URL harus berupa URL valid (https://...) atau path internal yang diawali /.',
            ]);
        }

        return $validated;
    }

    private function isValidCtaUrl(string $url): bool
    {
        $normalized = trim($url);
        if ($normalized === '') {
            return false;
        }

        if (str_starts_with($normalized, '/')) {
            return true;
        }

        return filter_var($normalized, FILTER_VALIDATE_URL) !== false;
    }

    private function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        $normalized = strtolower((string) $value);
        return in_array($normalized, ['1', 'true', 'on', 'yes'], true);
    }

    private function imageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    private function targetOptions(): array
    {
        return [
            PromoBanner::TARGET_MEMBER_NON_PREMIUM => 'Member Non-Premium',
            PromoBanner::TARGET_ALL_LOGGED_IN => 'Semua User Login',
        ];
    }
}

