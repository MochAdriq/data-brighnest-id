<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage; 

class SurveyController extends Controller
{
    /**
     * Menampilkan daftar data (Dashboard/Search).
     */
    public function index(Request $request)
    {
        $query = Survey::query();

        if ($request->filled('q')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                  ->orWhere('notes', 'like', '%' . $request->q . '%');
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return Inertia::render('Surveys/Index', [
            'surveys' => $query->latest()->paginate(12)->withQueryString(),
            'filters' => $request->only(['q', 'category']),
            'title'   => $request->q ? "Hasil Pencarian: {$request->q}" : "Arsip Data"
        ]);
    }

    /**
     * Menampilkan form input data baru.
     */
    public function create()
    {
        return Inertia::render('Surveys/Input');
    }

    /**
     * Menyimpan data baru ke database.
     */
    public function store(Request $request)
    {
        $this->validateRequest($request);

        DB::beginTransaction();
        try {
            // 1. Handle File Upload & Excel Parsing
            $fileData = $this->handleFileUpload($request); 

            // 2. Simpan Data
            Survey::create([
                'user_id'        => auth()->id(),
                'type'           => $request->type,
                'title'          => $request->title,
                'category'       => $request->category,
                'subcategory'    => $request->subcategory,
                'chart_type'     => $request->chart_type ?? 'bar', 
                'is_interactive' => $request->is_interactive ?? true, 
                'period'         => $request->period,
                'pic'            => $request->pic,
                'is_premium'     => $request->is_premium ?? false,
                'notes'          => $request->notes,
                'content'        => $request->content,
                'tags'           => $this->processTags($request->tags),
                'csv_data'       => $fileData['csv_data'],
                'file_path'      => $fileData['file_path'], 
            ]);

            DB::commit();
            return redirect()->route('dashboard')->with('success', 'Data berhasil dipublikasikan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal simpan: ' . $e->getMessage());
        }
    }

    /**
     * Menampilkan detail data (Halaman Grafik).
     */
    public function show(Survey $survey) 
    {
        if (auth()->id() !== $survey->user_id) {
            $survey->increment('views');
        }
        
        $isLocked = $survey->is_premium && !auth()->check();
        $chartData = $this->extractChartData($survey->csv_data, $isLocked);

        return Inertia::render('Surveys/Show', [
            'article'   => $survey,
            'chartData' => $chartData
        ]);
    }

    /**
     * Menampilkan form edit.
     */
    public function edit($id)
    {
        $survey = Survey::findOrFail($id);
        $this->authorizeUser($survey);
        
        return Inertia::render('Surveys/Input', ['survey' => $survey]);
    }

    /**
     * Mengupdate data yang sudah ada.
     */
    public function update(Request $request, $id)
    {
        $survey = Survey::findOrFail($id);
        $this->authorizeUser($survey);

        $this->validateRequest($request, $survey->id);

        // 1. Handle File Upload (Jika ada file baru, file lama dihapus di dalam fungsi ini)
        $fileData = $this->handleFileUpload($request, $survey->file_path);

        // 2. Update Field
        $survey->type           = $request->type;
        $survey->title          = $request->title;
        $survey->category       = $request->category;
        $survey->subcategory    = $request->subcategory;
        $survey->chart_type     = $request->chart_type ?? 'bar';
        $survey->is_interactive = filter_var($request->is_interactive, FILTER_VALIDATE_BOOLEAN);
        $survey->content        = $request->content;
        $survey->pic            = $request->pic;
        $survey->notes          = $request->notes;
        $survey->is_premium     = filter_var($request->is_premium, FILTER_VALIDATE_BOOLEAN);
        $survey->period         = $request->period;
        $survey->tags           = $this->processTags($request->tags);

        // Update file path & csv data HANYA jika ada file baru
        if ($fileData['file_path']) {
            $survey->file_path = $fileData['file_path'];
            $survey->csv_data  = $fileData['csv_data'];
        }

        $survey->save(); 

        return redirect()->route('dashboard')->with('success', 'Data berhasil diperbarui!');
    }

    /**
     * Menghapus data & file fisik.
     */
    public function destroy($id)
    {
        $survey = Survey::findOrFail($id);
        $this->authorizeUser($survey);
        
        if ($survey->file_path) {
            Storage::disk('public')->delete($survey->file_path);
        }
        
        $survey->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    /**
     * Halaman khusus Kilas Data (Series).
     */
    public function kilasData(Request $request)
    {
        $query = Survey::where('type', 'series'); 
        
        if ($request->has('category')) $query->where('category', $request->category);
        if ($request->has('subcategory')) $query->where('subcategory', $request->subcategory);

        $selectedData = null;
        $chartData = [];
        
        // Cek apakah ada data yang dipilih via ID atau Slug
        if ($request->has('slug') || $request->has('id')) {
            $selectedData = $request->has('slug') 
                ? Survey::where('slug', $request->slug)->first() 
                : Survey::find($request->id);
            
            if ($selectedData) {
                $isLocked = $selectedData->is_premium && !auth()->check();
                // Format chart data khusus untuk halaman Kilas Data
                $rawChart = $this->extractChartData($selectedData->csv_data, $isLocked);
                
                // Normalisasi struktur array agar sesuai props frontend KilasData
                if (!empty($rawChart)) {
                    $firstKey = array_key_first($rawChart); // Ambil key pertama (Value column)
                    $chartData = [
                        'labels' => $rawChart[$firstKey]['labels'],
                        'values' => $rawChart[$firstKey]['values'],
                        'label'  => $firstKey
                    ];
                }
            }
        }

        return Inertia::render('KilasData/Index', [
            'surveys'       => $query->latest()->paginate(20)->withQueryString(),
            'activeFilters' => $request->only(['category', 'subcategory']),
            'selectedData'  => $selectedData,
            'chartData'     => $chartData
        ]);
    }

    /**
     * Menampilkan produk lain (Fokus Utama / Kabar Tepi).
     */
    public function produk($type)
    {
        if (!in_array($type, ['story', 'news'])) abort(404);
        
        return Inertia::render('Surveys/Index', [
            'surveys' => Survey::where('type', $type)->latest()->paginate(9),
            'filters' => [],
            'title'   => ($type === 'story') ? 'Fokus Utama' : 'Kabar Tepi'
        ]);
    }

    // =========================================================================
    // PRIVATE METHODS (HELPER) - Agar Kode Utama Bersih
    // =========================================================================

    /**
     * Validasi Request untuk Store & Update.
     */
    private function validateRequest(Request $request, $id = null)
    {
        $rules = [
            'type'           => 'required|in:series,story,news',
            'title'          => ['required', 'string', 'max:255', Rule::unique('surveys')->ignore($id)],
            'category'       => 'required|string',
            'subcategory'    => 'nullable|string',
            'chart_type'     => 'nullable|in:bar,line,pie,table', 
            'is_interactive' => 'boolean',
            'period'         => 'nullable|string',
            'pic'            => 'nullable|string',
            'notes'          => 'nullable|string',
            'content'        => 'nullable|string',
            'tags'           => 'nullable',
            'is_premium'     => 'boolean',
            // File wajib jika bukan news, opsional jika update (id != null)
            'file'           => ($id ? 'nullable' : 'required_unless:type,news') . '|file|mimes:xlsx,xls,csv|max:10240',
        ];

        $messages = [
            'file.required_unless' => 'Wajib upload file Excel untuk kategori ini, Boss!',
            'file.mimes'           => 'Format file harus Excel (.xlsx, .xls) atau CSV!',
            'file.max'             => 'Ukuran file kegedean! Maksimal 10MB.',
            'title.required'       => 'Judul postingan jangan kosong dong.',
            'category.required'    => 'Pilih dulu kategorinya.',
        ];

        return $request->validate($rules, $messages);
    }

    /**
     * Menangani Upload File, Penamaan, dan Parsing Excel.
     */
    private function handleFileUpload(Request $request, $oldFilePath = null)
    {
        $result = ['file_path' => null, 'csv_data' => null];

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada (Clean Mode)
            if ($oldFilePath && Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
            }

            $file = $request->file('file');
            
            // --- FIX FILE NAME: Timestamp + Nama Asli ---
            // preg_replace untuk menghapus spasi aneh agar aman di URL
            $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '_', $file->getClientOriginalName());
            $filename  = time() . '_' . $cleanName;
            
            $path = $file->storeAs('surveys', $filename, 'public');
            
            // Baca isi Excel
            $data = Excel::toArray([], $file);
            
            $result['file_path'] = $path;
            $result['csv_data']  = !empty($data) ? $data[0] : [];
        }

        return $result;
    }

    /**
     * Memproses Tags (Array atau String).
     */
    private function processTags($tags)
    {
        if (empty($tags)) return [];
        if (is_array($tags)) return $tags;
        return array_map('trim', explode(',', $tags));
    }

    /**
     * Mengambil data untuk grafik dari JSON.
     */
    private function extractChartData($csvData, $isLocked)
    {
        $chartData = [];
        if (!$isLocked && !empty($csvData) && is_array($csvData)) {
            $firstRow = $csvData[0] ?? [];
            $keys = array_keys($firstRow);
            
            // Minimal harus ada 2 kolom (Label & Value)
            if (count($keys) >= 2) {
                $labelKey = $keys[0]; 
                $valueKey = $keys[1]; 
                $labels = []; 
                $values = [];

                foreach ($csvData as $row) {
                    $labels[] = $row[$labelKey] ?? '-';
                    $values[] = (float) ($row[$valueKey] ?? 0);
                }
                $chartData[$valueKey] = ['labels' => $labels, 'values' => $values];
            }
        }
        return $chartData;
    }

    /**
     * Cek otorisasi user.
     */
    private function authorizeUser($survey)
    {
        if ($survey->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke data ini.');
        }
    }
}