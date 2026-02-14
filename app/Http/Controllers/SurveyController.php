<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule; 
use Illuminate\Support\Facades\Storage; // Tambahkan ini buat hapus file lama

class SurveyController extends Controller
{
    public function index(Request $request)
    {
        $query = Survey::query();

        if ($request->has('q') && $request->q != '') {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                  ->orWhere('notes', 'like', '%' . $request->q . '%');
            });
        }

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
        $request->validate([
            'type'        => 'required|in:series,story,news',
            'title'       => 'required|string|max:255',
            'category'    => 'required|string',
            'subcategory' => 'required|string',
            'chart_type'  => 'nullable|in:bar,line,pie', 
            'is_interactive' => 'boolean',
            'file'        => 'required_unless:type,news|nullable|mimes:xlsx,xls,csv|max:10240',
            'period'      => 'nullable|string',
            'pic'         => 'nullable|string',
            'notes'       => 'nullable|string',
            'content'     => 'nullable|string',
            'tags'        => 'nullable|string',
            'is_premium'  => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $sheetData = [];
            $filePath = null; // Siapkan variabel path

            // --- PERBAIKAN 1: SIMPAN PATH FILE ---
            if ($request->hasFile('file')) {
                // Simpan fisik file
                $filePath = $request->file('file')->store('surveys', 'public');
                
                // Baca isi data
                $data = Excel::toArray([], $request->file('file'));
                $sheetData = !empty($data) ? $data[0] : [];
            }

            $tagsArray = $request->tags ? array_map('trim', explode(',', $request->tags)) : [];

            Survey::create([
                'user_id'     => auth()->id(),
                'type'        => $request->type,
                'title'       => $request->title,
                'category'    => $request->category,
                'subcategory' => $request->subcategory,
                // Pastikan opsi grafik disimpan
                'chart_type'  => $request->chart_type ?? 'bar', 
                'is_interactive' => $request->is_interactive ?? true, 
                'period'      => $request->period,
                'pic'         => $request->pic,
                'is_premium'  => $request->is_premium ?? false,
                'notes'       => $request->notes,
                'content'     => $request->content,
                'tags'        => $tagsArray,
                'csv_data'    => $sheetData,
                'file_path'   => $filePath, // Masukkan path ke DB
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Data berhasil dipublikasikan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal simpan: ' . $e->getMessage());
        }
    }

    public function show(Survey $survey) 
    {
        if (auth()->id() !== $survey->user_id) {
            $survey->increment('views');
        }
        
        $chartData = [];
        $isLocked = $survey->is_premium && !auth()->check();
        
        if (!$isLocked && !empty($survey->csv_data) && is_array($survey->csv_data)) {
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
            'article' => $survey,
            'chartData' => $chartData
        ]);
    }

    public function destroy($id)
    {
        $survey = Survey::findOrFail($id);
        if ($survey->user_id !== auth()->id()) abort(403);
        $survey->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    public function edit($id)
    {
        $survey = Survey::findOrFail($id);
        if ($survey->user_id !== auth()->id()) abort(403);
        return Inertia::render('Surveys/Edit', ['survey' => $survey]);
    }

    public function update(Request $request, $id)
    {
        $survey = Survey::findOrFail($id);
        
        if ($survey->user_id !== auth()->id()) abort(403);

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
            'subcategory' => 'nullable|string',
            'content' => 'nullable',
            'pic' => 'nullable|string',
            'notes' => 'nullable|string',
            'tags' => 'nullable',
            'is_premium' => 'boolean',
            'period' => 'nullable',
            'file' => 'nullable|file|mimes:xlsx,xls,csv|max:2048',
        ]);

        // Handle File Baru
        if ($request->hasFile('file')) {
            // Hapus file lama (Opsional, agar server bersih)
            if ($survey->file_path) {
                Storage::disk('public')->delete($survey->file_path);
            }

            $path = $request->file('file')->store('surveys', 'public');
            $data = Excel::toArray([], $request->file('file'));
            
            $survey->file_path = $path; // Update Path
            $survey->csv_data = count($data) > 0 ? $data[0] : null; // Update Isi Data
        }

        // --- PERBAIKAN 2: ASSIGNMENT KOLOM BARU (INI YANG TADI HILANG) ---
        $survey->chart_type = $validated['chart_type'] ?? 'bar';
        $survey->is_interactive = filter_var($validated['is_interactive'], FILTER_VALIDATE_BOOLEAN);
        // ---------------------------------------------------------------

        $survey->type = $validated['type'];
        $survey->title = $validated['title'];
        $survey->category = $validated['category'];
        $survey->subcategory = $validated['subcategory'] ?? null;
        $survey->content = $validated['content'];
        $survey->pic = $validated['pic'];
        $survey->notes = $validated['notes'] ?? null;
        $survey->is_premium = filter_var($validated['is_premium'], FILTER_VALIDATE_BOOLEAN);
        $survey->period = $validated['period'];

        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $survey->tags = $validated['tags'];
            } else {
                $survey->tags = array_map('trim', explode(',', $validated['tags']));
            }
        }

        $survey->save(); // Sekarang chart_type & is_interactive ikut tersimpan!

        return redirect()->route('dashboard')->with('success', 'Data berhasil diperbarui!');
    }

    public function kilasData(Request $request)
    {
        $query = Survey::where('type', 'series'); 

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('subcategory')) {
            $query->where('subcategory', $request->subcategory);
        }

        $surveys = $query->latest()->paginate(20)->withQueryString();

        $selectedData = null;
        $chartData = [];
        
        if ($request->has('slug') || $request->has('id')) {
            if ($request->has('slug')) {
                $selectedData = Survey::where('slug', $request->slug)->first();
            } else {
                $selectedData = Survey::find($request->id);
            }
            
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

        return Inertia::render('KilasData/Index', [
            'surveys' => $surveys,
            'activeFilters' => $request->only(['category', 'subcategory']),
            'selectedData' => $selectedData,
            'chartData' => $chartData
        ]);
    }

    public function produk($type)
    {
        if (!in_array($type, ['story', 'news'])) abort(404);

        $title = ($type === 'story') ? 'Fokus Utama' : 'Kabar Tepi';
        $surveys = Survey::where('type', $type)->latest()->paginate(9);

        return Inertia::render('Surveys/Index', [
            'surveys' => $surveys,
            'filters' => [],
            'title' => $title
        ]);
    }

    public function create()
    {
        return Inertia::render('Surveys/Input');
    }
}