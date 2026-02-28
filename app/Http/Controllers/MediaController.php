<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MediaController extends Controller
{
    /**
     * Handle upload gambar dari Editor (React Quill).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hasAnyRole(['super_admin', 'publisher'])) {
            abort(403, 'Anda tidak memiliki akses upload media editor.');
        }

        // 1. Validasi: Harus gambar, Max 2MB
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ], [
            'image.required' => 'Pilih gambar yang ingin diupload.',
            'image.image' => 'File yang diupload harus berupa gambar.',
            'image.mimes' => 'Format gambar harus jpeg/png/jpg/gif/webp.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
            'image.uploaded' => 'Upload gambar gagal. Cek batas upload server lalu coba lagi.',
        ]);

        if ($request->hasFile('image')) {
            // 2. Simpan ke folder 'storage/app/public/media'
            $path = $request->file('image')->store('media', 'public');

            // 3. Kembalikan URL publik agar bisa diakses browser
            // Output JSON: { "url": "http://domain.com/storage/media/namagambar.jpg" }
            return response()->json([
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['error' => 'Gagal mengupload gambar'], 400);
    }
}
