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
        // 1. Validasi: Harus gambar, Max 2MB
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
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