<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule; 

class SurveyController extends Controller
{
    public function index(Request $request)
    {
        $query = Survey::query();

        // 1. Filter Pencarian (Keyword)
        if ($request->has('q') && $request->q != '') {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                  ->orWhere('notes', 'like', '%' . $request->q . '%'); // GANTI notes JADI notes
            });
        }

        // 2. Filter Kategori
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $surveys = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Surveys/Index', [
            'surveys' => $surveys,
            'filters' => $request->only(['q', 'category']),
            'title' => $request->q ? "Hasil Pencarian: {$request->q}" : "Arsip Data"
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Dinamis
        $request->validate([
            'type'        => 'required|in:series,story,news',
            'title'       => 'required|string|max:255',
            'category'    => 'required|string',
            'subcategory' => 'required|string',
            'chart_type' => 'nullable|in:bar,line,pie', 
            'is_interactive' => 'boolean',
            'file'        => 'required_unless:type,news|nullable|mimes:xlsx,xls,csv|max:10240',
            'period'      => 'nullable|string',
            'pic'         => 'nullable|string',
            'notes'         => 'nullable|string', // Notes
            'content'     => 'nullable|string', // Artikel Rich Text
            'tags'        => 'nullable|string', // Dikirim sebagai string "tag1, tag2"
            'is_premium'  => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $sheetData = [];

            // 2. Proses File (Hanya jika ada file diupload)
            if ($request->hasFile('file')) {
                $data = Excel::toArray([], $request->file('file'));
                $sheetData = !empty($data) ? $data[0] : [];
            }

            // 3. Proses Tags (Pecah String jadi Array JSON)
            // Contoh: "ekonomi,  inflasi" -> ["ekonomi", "inflasi"]
            $tagsArray = $request->tags 
                ? array_map('trim', explode(',', $request->tags)) 
                : [];

            // 4. Simpan ke Database
            Survey::create([
                'user_id'     => auth()->id(),
                'type'        => $request->type,
                'title'       => $request->title,
                'category'    => $request->category,
                'subcategory' => $request->subcategory,
                'period'      => $request->period,
                'pic'         => $request->pic,
                'is_premium'  => $request->is_premium ?? false,
                
                'notes'       => $request->notes,
                'content'     => $request->content, // HTML dari React Quill
                'tags'        => $tagsArray,
                'csv_data'    => $sheetData,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Data berhasil dipublikasikan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal simpan: ' . $e->getMessage());
        }
    }

    // HAPUS YANG LAMA: public function show($id)
    // GANTI JADI INI:
    public function show(Survey $survey) 
    {
        // HAPUS BARIS INI (KARENA KITA SUDAH PAKE BINDING DI ATAS):
        // $survey = Survey::findOrFail($id); 

        // --- Logic Views ---
        if (auth()->id() !== $survey->user_id) {
            $survey->increment('views');
        }
        
        // --- Logic Chart (Tetap Sama) ---
        $chartData = [];
        $isLocked = $survey->is_premium && !auth()->check();
        
        if (!$isLocked && !empty($survey->csv_data) && is_array($survey->csv_data)) {
             // ... (Logic CSV Boss yang panjang itu biarkan saja) ...
             // Pastikan variable $survey->csv_data dipanggil dengan $survey (bukan variable lain)
             $firstRow = $survey->csv_data[0] ?? [];
             $keys = array_keys($firstRow);
             
             if (count($keys) >= 2) {
                $labelKey = $keys[0]; 
                $valueKey = $keys[1]; 
                $labels = []; $values = [];

                foreach ($survey->csv_data as $row) {
                    $labels[] = $row[$labelKey] ?? '-';
                    $values[] = (float) ($row[$valueKey] ?? 0);
                }
                $chartData[$valueKey] = ['labels' => $labels, 'values' => $values];
             }
        }

        return Inertia::render('Surveys/Show', [
            'article' => $survey, // Pastikan namanya 'article' atau 'survey' sesuai yang diminta Frontend Show.jsx
            'chartData' => $chartData
        ]);
    }

    /**
     * Menghapus data survey
     */
    public function destroy($id)
    {
        $survey = Survey::findOrFail($id);
        
        // Pastikan yang menghapus adalah pemilik data (Security)
        if ($survey->user_id !== auth()->id()) {
            abort(403, 'Anda tidak berhak menghapus data ini.');
        }

        $survey->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
    /**
     * 1. TAMPILKAN FORM EDIT
     */
    public function edit($id)
    {
        $survey = Survey::findOrFail($id);

        // Security Check
        if ($survey->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Surveys/Edit', [
            'survey' => $survey
        ]);
    }

    /**
     * 2. PROSES SIMPAN PERUBAHAN
     */
    public function update(Request $request, $id)
    {
        $survey = Survey::findOrFail($id);
        
        if ($survey->user_id !== auth()->id()) {
            abort(403);
        }

        // Validasi (File tidak wajib di-upload ulang)
        $validated = $request->validate([
            'type' => 'required',
            'chart_type' => 'nullable|in:bar,line,pie',
            'is_interactive' => 'boolean',
            'title' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('surveys')->ignore($survey->id)
            ],
            'category' => 'required',
            'subcategory' => 'nullable|string', // Pastikan ini ada
            'content' => 'nullable',
            'pic' => 'nullable|string',
            'notes' => 'nullable|string',
            'tags' => 'nullable', // Bisa array atau string, nanti di-cast
            'is_premium' => 'boolean',
            'period' => 'nullable',
            'file' => 'nullable|file|mimes:xlsx,xls,csv|max:2048', // File opsional saat edit
        ]);

        // Handle File Baru (Jika ada upload baru)
        if ($request->hasFile('file')) {
            // Hapus file lama jika mau hemat storage (Opsional)
            // Storage::delete($survey->file_path);

            $path = $request->file('file')->store('surveys', 'public');
            $data = Excel::toArray([], $request->file('file')); // Baca isi excel baru
            
            $survey->file_path = $path;
            $survey->csv_data = count($data) > 0 ? $data[0] : null;
        }

        // Update Field Lainnya
        $survey->type = $validated['type'];
        $survey->title = $validated['title'];
        $survey->category = $validated['category'];
        $survey->subcategory = $validated['subcategory'] ?? null;
        $survey->content = $validated['content'];
        $survey->pic = $validated['pic'];
        $survey->notes = $validated['notes'] ?? null;
        $survey->is_premium = filter_var($validated['is_premium'], FILTER_VALIDATE_BOOLEAN);
        $survey->period = $validated['period'];

        // Handle Tags (Convert string "a,b,c" to Array)
        if (!empty($validated['tags'])) {
             // Cek apakah tags datang sebagai array atau string
            if (is_array($validated['tags'])) {
                $survey->tags = $validated['tags'];
            } else {
                $survey->tags = array_map('trim', explode(',', $validated['tags']));
            }
        }

        $survey->save();

        return redirect()->route('dashboard')->with('success', 'Data berhasil diperbarui!');
    }
    /**
     * Halaman Khusus Kilas Data (Split View)
     */
    public function kilasData(Request $request)
    {
        $query = Survey::where('type', 'series'); 

        // Filter Kategori & Sub (Biarkan sama)
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('subcategory')) {
            $query->where('subcategory', $request->subcategory);
        }

        $surveys = $query->latest()->paginate(20)->withQueryString();

        // --- UPDATE BAGIAN INI (SEARCH LOGIC) ---
        $selectedData = null;
        $chartData = [];
        
        // Cek: Apakah ada request 'slug' ATAU 'id'
        if ($request->has('slug') || $request->has('id')) {
            
            // Prioritaskan cari pakai Slug, kalau gak ada baru ID
            if ($request->has('slug')) {
                $selectedData = Survey::where('slug', $request->slug)->first();
            } else {
                $selectedData = Survey::find($request->id);
            }
            
            // Logic Parser Grafik (Sama seperti sebelumnya)
            if ($selectedData && !$selectedData->is_premium && !empty($selectedData->csv_data)) {
                 $firstRow = $selectedData->csv_data[0] ?? [];
                 $keys = array_keys($firstRow);
                 if (count($keys) >= 2) {
                    $labelKey = $keys[0]; 
                    $valueKey = $keys[1]; 
                    $labels = []; $values = [];
                    foreach ($selectedData->csv_data as $row) {
                        $labels[] = $row[$labelKey] ?? '-';
                        $values[] = (float) ($row[$valueKey] ?? 0);
                    }
                    $chartData = ['labels' => $labels, 'values' => $values, 'label' => $valueKey];
                 }
            }
        }
        // ----------------------------------------

        return Inertia::render('KilasData/Index', [
            'surveys' => $surveys,
            'activeFilters' => $request->only(['category', 'subcategory']),
            'selectedData' => $selectedData,
            'chartData' => $chartData
        ]);
    }
    /**
     * Halaman Produk Standar (Fokus Utama & Kabar Tepi)
     */
    public function produk($type)
    {
        // Validasi tipe biar gak asal ketik URL
        if (!in_array($type, ['story', 'news'])) {
            abort(404);
        }

        $title = ($type === 'story') ? 'Fokus Utama' : 'Kabar Tepi';
        
        $surveys = Survey::where('type', $type)
                    ->latest()
                    ->paginate(9);

        // Kita Reuse (Pakai Ulang) tampilan Index yang sudah ada
        return Inertia::render('Surveys/Index', [
            'surveys' => $surveys,
            'filters' => [],
            'title' => $title
        ]);
    }

    /**
     * Menampilkan Halaman Input Data Baru
     */
    public function create()
    {
        // Pastikan file-nya ada di resources/js/Pages/Surveys/Input.jsx
        return Inertia::render('Surveys/Input');
    }
}

