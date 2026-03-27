<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Survey;
use App\Services\OpenGraphImageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage; 

class SurveyController extends Controller
{
    /**
     * Menampilkan daftar data (Dashboard/Search).
     */
    public function index(Request $request)
    {
        $sort = $this->resolveSortDirection($request);
        $type = strtolower((string) $request->query('type', ''));
        $type = in_array($type, ['series', 'story', 'news', 'publikasi_riset'], true) ? $type : '';
        $subcategory = trim((string) $request->query('subcategory', ''));
        $query = Survey::query()->select([
            'id',
            'slug',
            'type',
            'title',
            'category',
            'pic',
            'created_at',
            'image',
            'views',
            'lead',
            'notes',
            'is_premium',
            'premium_tier',
        ]);

        if ($request->filled('q')) {
            $this->applySearchFilter($query, (string) $request->q);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($type !== '') {
            $query->where('type', $type);
        }
        if ($subcategory !== '') {
            $query->where('subcategory', $subcategory);
        }

        return Inertia::render('Surveys/Index', [
            'surveys' => $query->orderBy('created_at', $sort)->paginate(12)->withQueryString(),
            'filters' => $request->only(['q', 'category']) + [
                'type' => $type,
                'subcategory' => $subcategory,
                'sort' => $sort,
            ],
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

        $uploadedFilePath = null;
        $uploadedImagePath = null;
        $uploadedPdfPath = null;

        DB::beginTransaction();
        try {
            $type = $request->type;
            $isSeries = $type === 'series';
            $isResearchPublication = $type === 'publikasi_riset';
            $premiumTier = $this->resolvePremiumTierFromRequest($request);

            // 1. Handle upload sesuai tipe konten
            $fileData = ['file_path' => null, 'csv_data' => null];
            $imagePath = null;
            $pdfPath = null;

            if ($isSeries) {
                $fileData = $this->handleFileUpload($request);
                $uploadedFilePath = $fileData['file_path'];
            } else {
                if ($request->hasFile('image_file')) {
                    $imagePath = $this->handleImageUpload($request);
                    $uploadedImagePath = $imagePath;
                }

                if ($isResearchPublication) {
                    $pdfPath = $this->handleResearchPdfUpload($request);
                    $uploadedPdfPath = $pdfPath;
                }
            }

            // 2. Simpan Data
            $survey = Survey::create([
                'user_id'        => auth()->id(),
                'type'           => $type,
                'title'          => $this->normalizeString($request->title),
                'category'       => $this->normalizeString($request->category),
                'subcategory'    => $this->normalizeString($request->subcategory),
                'published_year' => $this->normalizePublishedYear($request->input('published_year')),
                'research_topic' => $this->normalizeString($request->input('research_topic')),
                'chart_type'     => $isSeries ? ($request->chart_type ?? 'bar') : 'bar',
                'is_interactive' => $isSeries
                    ? filter_var($request->input('is_interactive', true), FILTER_VALIDATE_BOOLEAN)
                    : false,
                'period'         => $isSeries ? $this->normalizeString($request->period) : null,
                'pic'            => $this->normalizeString($request->pic),
                'is_premium'     => $premiumTier !== Survey::PREMIUM_TIER_FREE,
                'premium_tier'   => $premiumTier,
                'notes'          => $isSeries ? $this->sanitizePlainText($request->notes) : null,
                'show_notes'     => $isSeries
                    ? filter_var($request->input('show_notes', false), FILTER_VALIDATE_BOOLEAN)
                    : null,
                'lead'           => $isSeries ? null : $this->sanitizePlainText($request->lead),
                'content'        => ($isSeries || $isResearchPublication) ? null : $this->sanitizeRichText($request->content),
                'tags'           => $this->processTags($request->tags),
                'csv_data'       => $isSeries ? $fileData['csv_data'] : null,
                'file_path'      => $isSeries ? $fileData['file_path'] : null,
                'pdf_path'       => $isResearchPublication ? $pdfPath : null,
                'image'          => $isSeries ? null : $imagePath,
                'download_count' => 0,
                'image_caption'  => ($isSeries || $isResearchPublication) ? null : $this->sanitizePlainText($request->image_caption),
                'image_copyright'=> ($isSeries || $isResearchPublication) ? null : $this->sanitizePlainText($request->image_copyright),
            ]);

            DB::commit();
            $this->ensureOpenGraphImage($survey, onlyIfMissing: false);
            return redirect()->route('dashboard')->with('success', 'Data berhasil dipublikasikan!');

        } catch (ValidationException $e) {
            DB::rollBack();

            // Cegah orphan file jika proses validasi lanjutan gagal setelah upload.
            if ($uploadedFilePath && Storage::disk('public')->exists($uploadedFilePath)) {
                Storage::disk('public')->delete($uploadedFilePath);
            }
            if ($uploadedImagePath && Storage::disk('public')->exists($uploadedImagePath)) {
                Storage::disk('public')->delete($uploadedImagePath);
            }
            if ($uploadedPdfPath) {
                $this->deleteResearchPdf($uploadedPdfPath);
            }

            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();

            // Cegah orphan file jika proses DB gagal setelah upload.
            if ($uploadedFilePath && Storage::disk('public')->exists($uploadedFilePath)) {
                Storage::disk('public')->delete($uploadedFilePath);
            }
            if ($uploadedImagePath && Storage::disk('public')->exists($uploadedImagePath)) {
                Storage::disk('public')->delete($uploadedImagePath);
            }
            if ($uploadedPdfPath) {
                $this->deleteResearchPdf($uploadedPdfPath);
            }

            report($e);
            return back()->with('error', 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
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

        // Sanitasi ulang saat read untuk melindungi data lama yang tersimpan sebelum patch.
        $survey->content = $this->sanitizeRichText($survey->content);
        $survey->notes = $this->sanitizePlainText($survey->notes);
        $survey->lead = $this->sanitizePlainText($survey->lead);
        if ($survey->type === 'series' && !$this->shouldShowSeriesNotes($survey)) {
            $survey->notes = null;
        }

        $isLocked = $this->isLocked($survey);
        $lockMode = $this->resolveLockMode($survey);
        $chartData = $this->extractChartData($survey->csv_data, $isLocked);
        $article = $this->prepareArticlePayload($survey, $isLocked, $lockMode);
        $commentsPayload = $this->prepareCommentsPayload($survey);

        return Inertia::render('Surveys/Show', [
            'article'   => $article,
            'chartData' => $chartData,
            'comments' => $commentsPayload['comments'],
            'commentWidget' => $commentsPayload['widget'],
            'detailWidgets' => $this->prepareDetailWidgets($survey),
            'premiumPricing' => $this->premiumPricingPayload(),
        ]);
    }

    /**
     * Download PDF publikasi riset (private storage + cek akses premium).
     */
    public function downloadPublicationPdf(Survey $survey)
    {
        if ($survey->type !== 'publikasi_riset') {
            abort(404);
        }

        if (empty($survey->pdf_path)) {
            abort(404);
        }

        if ($this->isLocked($survey)) {
            if (!auth()->check()) {
                return redirect()->route('login');
            }

            abort(403, 'Anda belum memiliki akses premium untuk mengunduh publikasi ini.');
        }

        $storedPath = (string) $survey->pdf_path;
        $local = Storage::disk('local');
        $public = Storage::disk('public');
        $absolutePath = null;

        if ($local->exists($storedPath)) {
            $absolutePath = $local->path($storedPath);
        } elseif ($public->exists($storedPath)) {
            // Backward compatibility untuk data lama.
            $absolutePath = $public->path($storedPath);
        }

        if (!$absolutePath || !is_file($absolutePath)) {
            abort(404);
        }

        $survey->increment('download_count');

        $extension = strtolower(pathinfo($storedPath, PATHINFO_EXTENSION));
        $safeExtension = $extension !== '' ? $extension : 'pdf';
        $filename = Str::slug((string) ($survey->title ?: 'publikasi-riset')) . '.' . $safeExtension;

        return response()->download($absolutePath, $filename);
    }

    /**
     * Menampilkan form edit.
     */
    public function edit($id)
    {
        $survey = Survey::findOrFail($id);
        $this->authorizeUser($survey, allowEditor: true);
        
        return Inertia::render('Surveys/Input', [
            'survey' => $survey,
            'existingAssets' => $this->buildExistingAssetsPayload($survey),
        ]);
    }

    /**
     * Mengupdate data yang sudah ada.
     */
    public function update(Request $request, $id)
    {
        $survey = Survey::findOrFail($id);
        $this->authorizeUser($survey, allowEditor: true);

        $this->validateRequest($request, $survey->id);
        $this->validateTypeAssetRequirementsOnUpdate($request, $survey);
        $oldContent = $survey->content;
        $oldFilePath = $survey->file_path;
        $oldImagePath = $survey->image;
        $oldPdfPath = $survey->pdf_path;
        $uploadedFilePath = null;
        $uploadedImagePath = null;
        $uploadedPdfPath = null;

        DB::beginTransaction();
        try {
            $type = $request->type;
            $isSeries = $type === 'series';
            $isResearchPublication = $type === 'publikasi_riset';
            $premiumTier = $this->resolvePremiumTierFromRequest($request, $survey);

            // 1. Handle upload sesuai tipe konten
            $fileData = ['file_path' => null, 'csv_data' => null];
            $imagePath = $survey->image;
            $pdfPath = $survey->pdf_path;

            if ($isSeries) {
                $fileData = $this->handleFileUpload($request);
                $uploadedFilePath = $fileData['file_path'];
            } else {
                if ($request->hasFile('image_file')) {
                    $imagePath = $this->handleImageUpload($request);
                    $uploadedImagePath = $imagePath;
                }

                if ($isResearchPublication && $request->hasFile('pdf_file')) {
                    $pdfPath = $this->handleResearchPdfUpload($request);
                    $uploadedPdfPath = $pdfPath;
                }
            }

            // 2. Update Field
            $survey->type           = $type;
            $survey->title          = $this->normalizeString($request->title);
            $survey->category       = $this->normalizeString($request->category);
            $survey->subcategory    = $this->normalizeString($request->subcategory);
            $survey->published_year = $this->normalizePublishedYear($request->input('published_year'));
            $survey->research_topic = $this->normalizeString($request->input('research_topic'));
            $survey->chart_type     = $isSeries ? ($request->chart_type ?? 'bar') : 'bar';
            $survey->is_interactive = $isSeries
                ? filter_var($request->input('is_interactive', true), FILTER_VALIDATE_BOOLEAN)
                : false;
            $survey->content        = ($isSeries || $isResearchPublication) ? null : $this->sanitizeRichText($request->content);
            $survey->pic            = $this->normalizeString($request->pic);
            $survey->notes          = $isSeries ? $this->sanitizePlainText($request->notes) : null;
            $survey->lead           = $isSeries ? null : $this->sanitizePlainText($request->lead);
            $survey->is_premium     = $premiumTier !== Survey::PREMIUM_TIER_FREE;
            $survey->premium_tier   = $premiumTier;
            $survey->period         = $isSeries ? $this->normalizeString($request->period) : null;
            $survey->tags           = $this->processTags($request->tags);
            $survey->show_notes     = $isSeries
                ? filter_var($request->input('show_notes', false), FILTER_VALIDATE_BOOLEAN)
                : null;
            $survey->image          = $isSeries ? null : $imagePath;
            $survey->image_caption  = ($isSeries || $isResearchPublication) ? null : $this->sanitizePlainText($request->image_caption);
            $survey->image_copyright= ($isSeries || $isResearchPublication) ? null : $this->sanitizePlainText($request->image_copyright);

            // Update file path & csv data HANYA jika ada file baru
            if ($isSeries && $fileData['file_path']) {
                $survey->file_path = $fileData['file_path'];
                $survey->csv_data  = $fileData['csv_data'];
            }
            if (!$isSeries) {
                $survey->file_path = null;
                $survey->csv_data = null;
            }
            if ($isResearchPublication && $pdfPath) {
                $survey->pdf_path = $pdfPath;
            }
            if (!$isResearchPublication) {
                $survey->pdf_path = null;
            }

            $survey->save();
            DB::commit();

            // Hapus file lama setelah transaksi sukses.
            if ($uploadedFilePath && $oldFilePath && Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
            }
            if ($uploadedImagePath && $oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
            if ($uploadedPdfPath && $oldPdfPath) {
                $this->deleteResearchPdf($oldPdfPath);
            }
            if ($isSeries && $oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
            if (!$isSeries && $oldFilePath && Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
            }
            if (!$isResearchPublication && $oldPdfPath) {
                $this->deleteResearchPdf($oldPdfPath);
            }

            $this->cleanupDetachedEditorMedia($oldContent, $survey->content);
            $this->ensureOpenGraphImage($survey->fresh(), onlyIfMissing: true);

            return redirect()->route('dashboard')->with('success', 'Data berhasil diperbarui!');
        } catch (ValidationException $e) {
            DB::rollBack();

            // Cegah orphan file jika validasi lanjutan gagal setelah upload baru.
            if ($uploadedFilePath && Storage::disk('public')->exists($uploadedFilePath)) {
                Storage::disk('public')->delete($uploadedFilePath);
            }
            if ($uploadedImagePath && Storage::disk('public')->exists($uploadedImagePath)) {
                Storage::disk('public')->delete($uploadedImagePath);
            }
            if ($uploadedPdfPath) {
                $this->deleteResearchPdf($uploadedPdfPath);
            }

            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();

            // Cegah orphan file jika upload baru berhasil tapi DB update gagal.
            if ($uploadedFilePath && Storage::disk('public')->exists($uploadedFilePath)) {
                Storage::disk('public')->delete($uploadedFilePath);
            }
            if ($uploadedImagePath && Storage::disk('public')->exists($uploadedImagePath)) {
                Storage::disk('public')->delete($uploadedImagePath);
            }
            if ($uploadedPdfPath) {
                $this->deleteResearchPdf($uploadedPdfPath);
            }

            report($e);
            return back()->with('error', 'Terjadi kesalahan saat memperbarui data. Silakan coba lagi.');
        }
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
        if ($survey->image) {
            Storage::disk('public')->delete($survey->image);
        }
        if ($survey->pdf_path) {
            $this->deleteResearchPdf($survey->pdf_path);
        }
        $this->deleteOpenGraphImage($survey);
        
        $survey->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    /**
     * Simpan komentar untuk Story/News (wajib login).
     */
    public function storeComment(Request $request, Survey $survey)
    {
        if (!$this->canCommentOnSurvey($survey)) {
            abort(404);
        }

        $validated = $request->validate([
            'body' => 'required|string|min:3|max:2000',
        ], [
            'body.required' => 'Komentar tidak boleh kosong.',
            'body.min' => 'Komentar minimal 3 karakter.',
            'body.max' => 'Komentar maksimal 2000 karakter.',
        ]);

        Comment::create([
            'survey_id' => $survey->id,
            'user_id' => $request->user()->id,
            'body' => $this->sanitizeCommentBody($validated['body']),
        ]);

        return back()->with('success', 'Komentar berhasil dikirim.');
    }

    /**
     * Halaman khusus Kilas Data (Series).
     */
    public function kilasData(Request $request)
    {
        $sort = $this->resolveSortDirection($request);
        $q = trim((string) $request->query('q', ''));
        $query = Survey::where('type', 'series'); 
        
        if ($request->filled('category')) $query->where('category', $request->category);
        if ($request->filled('subcategory')) $query->where('subcategory', $request->subcategory);
        if ($q !== '') $query->where('title', 'like', "%{$q}%");

        $selectedData = null;
        $chartData = [];
        
        // Cek apakah ada data yang dipilih via ID atau Slug
        if ($request->has('slug') || $request->has('id')) {
            $selectedData = $request->has('slug')
                ? Survey::where('type', 'series')->where('slug', $request->slug)->first()
                : Survey::where('type', 'series')->where('id', $request->id)->first();
            
            if ($selectedData) {
                $this->rehydrateCsvDataIfMissing($selectedData);
                $selectedData->content = $this->sanitizeRichText($selectedData->content);
                $selectedData->notes = $this->sanitizePlainText($selectedData->notes);
                $selectedData->lead = $this->sanitizePlainText($selectedData->lead);
                if (!$this->shouldShowSeriesNotes($selectedData)) {
                    $selectedData->notes = null;
                }
                $isLocked = $this->isLocked($selectedData);
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

                $selectedData->is_locked = $isLocked;

                // Kilas Data premium harus tertutup total (anti inspect).
                if ($isLocked) {
                    $selectedData->csv_data = null;
                    $selectedData->file_path = null;
                    $selectedData->content = null;
                    $selectedData->notes = null;
                    $selectedData->lead = null;
                }
            }
        }

        return Inertia::render('KilasData/Index', [
            'surveys'       => $query->orderBy('created_at', $sort)->paginate(20)->withQueryString(),
            'activeFilters' => $request->only(['category', 'subcategory']) + ['q' => $q, 'sort' => $sort],
            'selectedData'  => $selectedData,
            'chartData'     => $chartData,
            'premiumPricing' => $this->premiumPricingPayload(),
        ]);
    }

    /**
     * Payload harga premium untuk widget lock frontend.
     */
    private function premiumPricingPayload(): array
    {
        $plans = collect(config('premium.membership_plans', []))
            ->map(function ($plan, $code) {
                return [
                    'code' => (string) $code,
                    'name' => (string) ($plan['name'] ?? 'Premium'),
                    'amount' => (int) ($plan['amount'] ?? 0),
                    'duration_days' => (int) ($plan['duration_days'] ?? 30),
                ];
            })
            ->values()
            ->all();

        return [
            'single_article' => (int) config('premium.single_article_price', 10000),
            'plans' => $plans,
            'special' => [
                'phone' => '08133113110',
                'whatsapp_number' => '628133113110',
                'chat_template' => 'saya tertarik terkait artikel {title}',
            ],
        ];
    }

    /**
     * Backfill csv_data untuk data lama saat file_path ada tetapi csv_data kosong.
     */
    private function rehydrateCsvDataIfMissing(Survey $survey): void
    {
        if ($survey->type !== 'series') {
            return;
        }

        if (!empty($survey->csv_data) && is_array($survey->csv_data)) {
            return;
        }

        if (empty($survey->file_path)) {
            return;
        }

        $disk = Storage::disk('public');
        if (!$disk->exists($survey->file_path)) {
            return;
        }

        $extension = strtolower(pathinfo($survey->file_path, PATHINFO_EXTENSION));
        $parsed = $this->extractTabularDataFromStoredPath($disk->path($survey->file_path), $extension);
        if (empty($parsed)) {
            return;
        }

        $survey->csv_data = $parsed;
        $survey->save();
        $survey->refresh();
    }

    /**
     * Menampilkan produk lain (Fokus Utama / Berita).
     */
    public function produk($type, Request $request)
    {
        if (!in_array($type, ['story', 'news'])) abort(404);
        $sort = $this->resolveSortDirection($request);
        $q = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));
        
        return Inertia::render('Surveys/Index', [
            'surveys' => Survey::query()
                ->select([
                    'id',
                    'slug',
                    'type',
                    'title',
                    'category',
                    'pic',
                    'created_at',
                    'image',
                    'views',
                    'lead',
                    'notes',
                    'is_premium',
                    'premium_tier',
                ])
                ->where('type', $type)
                ->when($q !== '', function ($query) use ($q) {
                    $query->where(function ($sub) use ($q) {
                        $sub->where('title', 'like', "%{$q}%")
                            ->orWhere('lead', 'like', "%{$q}%")
                            ->orWhere('notes', 'like', "%{$q}%");
                    });
                })
                ->when($category !== '', function ($query) use ($category) {
                    $query->where('category', $category);
                })
                ->orderBy('created_at', $sort)
                ->paginate(9)
                ->withQueryString(),
            'filters' => ['q' => $q, 'category' => $category, 'sort' => $sort, 'type' => $type],
            'title'   => ($type === 'story') ? 'Fokus Utama' : 'Berita'
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
        $seriesFileRequiredRule = $id ? 'nullable' : 'required_if:type,series';

        $rules = [
            'type'           => 'required|in:series,story,news,publikasi_riset',
            'title'          => ['required', 'string', 'max:255', Rule::unique('surveys')->ignore($id)],
            'category'       => 'required|string',
            'subcategory'    => 'nullable|string',
            'published_year' => 'nullable|integer|min:1900|max:2100|required_if:type,publikasi_riset',
            'research_topic' => 'nullable|string|max:120|required_if:type,publikasi_riset',
            'chart_type'     => 'nullable|in:bar,line,pie,table',
            'is_interactive' => 'boolean',
            'period'         => 'nullable|string',
            'pic'            => 'nullable|string',
            'notes'          => 'nullable|string',
            'show_notes'     => 'boolean',
            'lead'           => 'nullable|string|max:1200|required_if:type,publikasi_riset',
            'content'        => 'nullable|string',
            'image_caption'  => 'nullable|string|max:255',
            'image_copyright'=> 'nullable|string|max:255',
            'tags'           => 'nullable',
            'is_premium'     => 'boolean',
            'premium_tier'   => 'nullable|string|in:free,premium,special',
            // Series wajib upload file (create), story/news pakai image.
            // Selalu nullable agar key kosong dari frontend tidak memicu false-positive validation.
            'file'           => [
                $seriesFileRequiredRule,
                'nullable',
                'file',
                'max:10240',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (!$value instanceof UploadedFile) {
                        return;
                    }

                    // CSV dari beberapa client (khususnya Windows/Excel) sering terbaca text/plain.
                    // Karena itu, validasi utama menggunakan ekstensi file agar tidak false-negative.
                    $allowedExtensions = ['xlsx', 'xls', 'csv'];
                    $clientExtension = strtolower((string) $value->getClientOriginalExtension());
                    $detectedExtension = strtolower((string) $value->extension());

                    if (
                        !in_array($clientExtension, $allowedExtensions, true)
                        && !in_array($detectedExtension, $allowedExtensions, true)
                    ) {
                        $fail('Format file harus Excel (.xlsx, .xls) atau CSV!');
                    }
                },
            ],
            'image_file'     => (($id ? 'nullable' : 'required_unless:type,series,publikasi_riset') . '|nullable|image|mimes:jpeg,png,jpg,webp|max:4096'),
            'pdf_file'       => (($id ? 'nullable' : 'required_if:type,publikasi_riset') . '|nullable|file|mimes:pdf|max:20480'),
        ];

        $messages = [
            'file.required_if'     => 'Kilas Data wajib upload file Excel/CSV.',
            'file.uploaded'        => 'Upload file Kilas Data gagal. Cek batas upload server lalu coba lagi.',
            'file.file'            => 'File Kilas Data tidak valid.',
            'file.mimes'           => 'Format file harus Excel (.xlsx, .xls) atau CSV!',
            'file.max'             => 'Ukuran file Kilas Data maksimal 10MB.',
            'image_file.required_unless' => 'Fokus Utama/Berita wajib upload gambar utama.',
            'image_file.uploaded'  => 'Upload gambar utama gagal. Cek batas upload server lalu coba lagi.',
            'image_file.image'     => 'File gambar tidak valid.',
            'image_file.mimes'     => 'Format gambar harus jpeg/png/jpg/webp.',
            'image_file.max'       => 'Ukuran gambar maksimal 4MB.',
            'pdf_file.required_if' => 'Publikasi Riset wajib upload file PDF.',
            'pdf_file.uploaded'    => 'Upload file publikasi gagal. Cek batas upload server lalu coba lagi.',
            'pdf_file.file'        => 'File publikasi tidak valid.',
            'pdf_file.mimes'       => 'Format file publikasi harus PDF.',
            'pdf_file.max'         => 'Ukuran PDF maksimal 20MB.',
            'published_year.required_if' => 'Tahun publikasi wajib diisi untuk Publikasi Riset.',
            'research_topic.required_if' => 'Topik riset wajib diisi untuk Publikasi Riset.',
            'lead.required_if'     => 'Pengantar singkat wajib diisi untuk Publikasi Riset.',
            'title.required'       => 'Judul postingan jangan kosong dong.',
            'category.required'    => 'Pilih dulu kategorinya.',
        ];

        return $request->validate($rules, $messages);
    }

    /**
     * Strategi search adaptif:
     * - MySQL/MariaDB: FULLTEXT boolean mode
     * - Driver lain: fallback LIKE
     */
    private function applySearchFilter($query, string $keyword): void
    {
        $keyword = trim($keyword);
        if ($keyword === '') {
            return;
        }

        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $booleanQuery = $this->toBooleanFullTextQuery($keyword);
            if ($booleanQuery !== '') {
                $query->whereRaw(
                    'MATCH(title, notes, lead, content) AGAINST (? IN BOOLEAN MODE)',
                    [$booleanQuery]
                );
                return;
            }
        }

        $like = '%' . $keyword . '%';
        $query->where(function ($q) use ($like) {
            $q->where('title', 'like', $like)
                ->orWhere('notes', 'like', $like)
                ->orWhere('lead', 'like', $like)
                ->orWhere('content', 'like', $like);
        });
    }

    private function resolveSortDirection(Request $request): string
    {
        $sort = strtolower((string) $request->query('sort', 'desc'));

        return in_array($sort, ['asc', 'desc'], true) ? $sort : 'desc';
    }

    /**
     * Bentuk keyword untuk FULLTEXT boolean mode.
     */
    private function toBooleanFullTextQuery(string $keyword): string
    {
        $tokens = preg_split('/\s+/u', $keyword, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $tokens = array_map(function ($token) {
            return preg_replace('/[^\pL\pN]+/u', '', $token);
        }, $tokens);
        $tokens = array_values(array_filter($tokens, fn ($token) => mb_strlen($token) >= 2));

        if (empty($tokens)) {
            return '';
        }

        return implode(' ', array_map(fn ($token) => '+' . $token . '*', $tokens));
    }

    /**
     * Validasi tambahan saat update:
     * upload ulang tidak wajib, tetapi aset wajib tersedia untuk tipe terpilih.
     */
    private function validateTypeAssetRequirementsOnUpdate(Request $request, Survey $survey): void
    {
        $targetType = (string) $request->input('type', $survey->type);

        if ($targetType === 'series') {
            $hasSeriesFile = !empty($survey->file_path) || $request->hasFile('file');
            if (!$hasSeriesFile) {
                throw ValidationException::withMessages([
                    'file' => 'Kilas Data membutuhkan file Excel/CSV. Upload file baru karena data lama belum tersedia.',
                ]);
            }

            return;
        }

        if ($targetType === 'publikasi_riset') {
            $hasPublicationPdf = !empty($survey->pdf_path) || $request->hasFile('pdf_file');
            if (!$hasPublicationPdf) {
                throw ValidationException::withMessages([
                    'pdf_file' => 'Publikasi Riset membutuhkan file PDF. Upload PDF baru karena file lama belum tersedia.',
                ]);
            }

            return;
        }

        $hasImage = !empty($survey->image) || $request->hasFile('image_file');
        if (!$hasImage) {
            throw ValidationException::withMessages([
                'image_file' => 'Fokus Utama/Berita membutuhkan gambar utama. Upload gambar baru karena gambar lama belum tersedia.',
            ]);
        }
    }

    private function normalizePublishedYear($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $year = (int) $value;
        if ($year < 1900 || $year > 2100) {
            return null;
        }

        return $year;
    }

    /**
     * Menangani Upload File, Penamaan, dan Parsing Excel.
     */
    private function handleFileUpload(Request $request)
    {
        $result = ['file_path' => null, 'csv_data' => null];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower((string) $file->getClientOriginalExtension());

            // --- FIX FILE NAME: Timestamp + Nama Asli ---
            // preg_replace untuk menghapus spasi aneh agar aman di URL
            $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '_', $file->getClientOriginalName());
            $filename = now()->format('YmdHisv') . '_' . Str::uuid() . '_' . $cleanName;
            $path = $file->storeAs('surveys', $filename, 'public');

            $result['file_path'] = $path;
            $absolutePath = Storage::disk('public')->path($path);
            $result['csv_data'] = $this->extractTabularDataFromStoredPath($absolutePath, $extension);
        }

        return $result;
    }

    /**
     * Parse tabular data dari file yang sudah tersimpan:
     * - CSV: parser native PHP (tanpa dependency zip/gd).
     * - XLS/XLSX: coba parse via Laravel Excel, jika gagal tetap lanjut simpan file.
     */
    private function extractTabularDataFromStoredPath(string $absolutePath, string $extension): array
    {
        try {
            if (!is_file($absolutePath)) {
                return [];
            }

            if ($extension === 'csv') {
                return $this->parseCsvNative($absolutePath);
            }

            $sheets = Excel::toArray([], $absolutePath);
            foreach ($sheets as $rows) {
                if (is_array($rows) && !empty($rows)) {
                    return $rows;
                }
            }

            return [];
        } catch (\Throwable $e) {
            // Jangan blokir proses simpan hanya karena parser gagal.
            report($e);
            return [];
        }
    }

    /**
     * Parser CSV native agar upload CSV tetap bisa diproses walau ext-zip belum aktif.
     */
    private function parseCsvNative(string $realPath): array
    {
        $rows = [];
        $delimiter = $this->detectCsvDelimiter($realPath);
        $handle = @fopen($realPath, 'r');
        if ($handle === false) {
            return [];
        }

        while (($cols = fgetcsv($handle, 0, $delimiter)) !== false) {
            if ($cols === [null] || $cols === null) {
                continue;
            }

            // Trim tiap kolom, pertahankan indeks numerik agar kompatibel dengan chart extractor.
            $rows[] = array_map(function ($value) {
                if (!is_string($value)) {
                    return $value;
                }

                $clean = trim($value);
                // Buang UTF-8 BOM pada kolom pertama jika ada.
                return preg_replace('/^\xEF\xBB\xBF/', '', $clean) ?? $clean;
            }, $cols);
        }

        fclose($handle);
        return $rows;
    }

    /**
     * Deteksi delimiter CSV agar file dengan pemisah ';' tetap terbaca.
     */
    private function detectCsvDelimiter(string $realPath): string
    {
        $lines = @file($realPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (!$lines || count($lines) === 0) {
            return ',';
        }

        $sample = '';
        foreach ($lines as $line) {
            $trimmed = trim((string) $line);
            if ($trimmed !== '') {
                $sample = $trimmed;
                break;
            }
        }

        if ($sample === '') {
            return ',';
        }

        $delimiters = [',', ';', "\t", '|'];
        $best = ',';
        $bestCount = -1;

        foreach ($delimiters as $candidate) {
            $count = substr_count($sample, $candidate);
            if ($count > $bestCount) {
                $best = $candidate;
                $bestCount = $count;
            }
        }

        return $best;
    }

    /**
     * Menangani Upload Gambar Utama untuk Story/News.
     */
    private function handleImageUpload(Request $request)
    {
        if (!$request->hasFile('image_file')) {
            return null;
        }

        $file = $request->file('image_file');
        $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '_', $file->getClientOriginalName());
        $filename  = now()->format('YmdHisv') . '_' . Str::uuid() . '_' . $cleanName;

        return $file->storeAs('thumbnails', $filename, 'public');
    }

    /**
     * Menangani Upload PDF untuk Publikasi Riset (storage private).
     */
    private function handleResearchPdfUpload(Request $request)
    {
        if (!$request->hasFile('pdf_file')) {
            return null;
        }

        $file = $request->file('pdf_file');
        $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '_', $file->getClientOriginalName());
        $filename  = now()->format('YmdHisv') . '_' . Str::uuid() . '_' . $cleanName;

        return $file->storeAs('private/research-publications', $filename, 'local');
    }

    /**
     * Hapus PDF publikasi dari disk local/public (kompatibilitas data lama).
     */
    private function deleteResearchPdf(string $storedPath): void
    {
        if ($storedPath === '') {
            return;
        }

        $local = Storage::disk('local');
        if ($local->exists($storedPath)) {
            $local->delete($storedPath);
            return;
        }

        $public = Storage::disk('public');
        if ($public->exists($storedPath)) {
            $public->delete($storedPath);
        }
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
     * Normalisasi string agar konsisten (trim, kosong -> null, dan tanpa HTML).
     */
    private function normalizeString($value)
    {
        if ($value === null) return null;
        $clean = trim(strip_tags((string) $value));
        return $clean === '' ? null : $clean;
    }

    /**
     * Sanitasi teks biasa.
     */
    private function sanitizePlainText($text)
    {
        return $this->normalizeString($text);
    }

    /**
     * Sanitasi rich text dari editor untuk menekan risiko XSS.
     */
    private function sanitizeRichText($html)
    {
        if ($html === null) return null;

        $raw = trim((string) $html);
        if ($raw === '') {
            return null;
        }

        // Hapus blok script/style dulu sebelum parsing DOM.
        $raw = preg_replace('#<(script|style)[^>]*>.*?</\\1>#is', '', $raw);
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        $allowed = [
            'p' => [],
            'br' => [],
            'strong' => [],
            'em' => [],
            'u' => [],
            's' => [],
            'blockquote' => [],
            'ul' => [],
            'ol' => [],
            'li' => [],
            'a' => ['href', 'title', 'target', 'rel'],
            'h1' => [],
            'h2' => [],
            'h3' => [],
            'pre' => [],
            'code' => [],
            'img' => ['src', 'alt', 'title'],
        ];

        try {
            $internalErrors = libxml_use_internal_errors(true);
            $dom = new \DOMDocument('1.0', 'UTF-8');
            $wrapped = '<!DOCTYPE html><html><body>' . $raw . '</body></html>';
            $dom->loadHTML(mb_convert_encoding($wrapped, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

            $body = $dom->getElementsByTagName('body')->item(0);
            if (!$body) {
                libxml_use_internal_errors($internalErrors);
                return null;
            }

            $this->sanitizeDomNode($body, $allowed);

            $clean = '';
            foreach ($body->childNodes as $child) {
                $clean .= $dom->saveHTML($child);
            }

            libxml_clear_errors();
            libxml_use_internal_errors($internalErrors);

            $clean = trim($clean);
            return $clean === '' ? null : $clean;
        } catch (\Throwable $e) {
            // Fallback aman jika parser DOM gagal.
            $fallback = strip_tags($raw, '<p><br><strong><em><u><s><blockquote><ul><ol><li><a><h1><h2><h3><pre><code><img>');
            $fallback = trim($fallback);
            return $fallback === '' ? null : $fallback;
        }
    }

    /**
     * Sanitasi node DOM secara rekursif (tag, atribut, protocol URL).
     */
    private function sanitizeDomNode(\DOMNode $node, array $allowed): void
    {
        if ($node->nodeType === XML_ELEMENT_NODE) {
            /** @var \DOMElement $element */
            $element = $node;
            $tag = strtolower($element->tagName);

            // Root wrapper parser, jangan disanitasi sebagai konten.
            if (in_array($tag, ['html', 'body'], true)) {
                $children = [];
                foreach ($node->childNodes as $child) {
                    $children[] = $child;
                }

                foreach ($children as $child) {
                    $this->sanitizeDomNode($child, $allowed);
                }

                return;
            }

            if (!array_key_exists($tag, $allowed)) {
                $this->unwrapDomElement($element);
                return;
            }

            $allowedAttrs = $allowed[$tag];
            $attrsToRemove = [];

            foreach ($element->attributes as $attr) {
                $name = strtolower($attr->name);
                $value = trim($attr->value);

                // Tolak seluruh event handler inline (onclick, onerror, dll).
                if (str_starts_with($name, 'on')) {
                    $attrsToRemove[] = $attr->name;
                    continue;
                }

                if (!in_array($name, $allowedAttrs, true)) {
                    $attrsToRemove[] = $attr->name;
                    continue;
                }

                if (($name === 'href' || $name === 'src') && !$this->isSafeUrl($value, $name === 'href')) {
                    $attrsToRemove[] = $attr->name;
                    continue;
                }

                if ($name === 'target' && !in_array($value, ['_blank', '_self'], true)) {
                    $attrsToRemove[] = $attr->name;
                }
            }

            foreach ($attrsToRemove as $attrName) {
                $element->removeAttribute($attrName);
            }

            // Tambahkan rel aman saat membuka tab baru.
            if ($tag === 'a' && strtolower($element->getAttribute('target')) === '_blank') {
                $element->setAttribute('rel', 'noopener noreferrer');
            }

            if ($tag === 'img') {
                $element->setAttribute('loading', 'lazy');
                if (!$element->hasAttribute('alt')) {
                    $element->setAttribute('alt', '');
                }
            }
        }

        $children = [];
        foreach ($node->childNodes as $child) {
            $children[] = $child;
        }

        foreach ($children as $child) {
            $this->sanitizeDomNode($child, $allowed);
        }
    }

    /**
     * Hapus tag tapi pertahankan child nodes agar konten tidak hilang.
     */
    private function unwrapDomElement(\DOMElement $element): void
    {
        $parent = $element->parentNode;
        if (!$parent) {
            return;
        }

        while ($element->firstChild) {
            $parent->insertBefore($element->firstChild, $element);
        }

        $parent->removeChild($element);
    }

    /**
     * Validasi URL untuk href/src agar aman dari javascript: dan protocol berbahaya.
     */
    private function isSafeUrl(string $value, bool $isHref): bool
    {
        if ($value === '') {
            return false;
        }

        // Relative URL diizinkan.
        if (str_starts_with($value, '/') || str_starts_with($value, '#')) {
            return true;
        }

        $parts = parse_url($value);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));

        if ($scheme === '') {
            return false;
        }

        if ($isHref) {
            return in_array($scheme, ['http', 'https', 'mailto', 'tel'], true);
        }

        return in_array($scheme, ['http', 'https'], true);
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
                $startIndex = 0;

                // Jika baris pertama terlihat seperti header (kolom nilai tidak numerik),
                // dan baris kedua numerik, maka skip header.
                $firstValue = $this->normalizeNumericValue($firstRow[$valueKey] ?? null);
                $secondRow = $csvData[1] ?? null;
                $secondValue = is_array($secondRow)
                    ? $this->normalizeNumericValue($secondRow[$valueKey] ?? null)
                    : null;
                if ($firstValue === null && $secondValue !== null) {
                    $startIndex = 1;
                }

                for ($i = $startIndex; $i < count($csvData); $i++) {
                    $row = $csvData[$i] ?? [];
                    $labels[] = $row[$labelKey] ?? '-';
                    $values[] = $this->normalizeNumericValue($row[$valueKey] ?? null) ?? 0.0;
                }
                $chartData[$valueKey] = ['labels' => $labels, 'values' => $values];
            }
        }
        return $chartData;
    }

    /**
     * Normalisasi angka dari string lokal:
     * - 1.234,56 -> 1234.56
     * - 1,234.56 -> 1234.56
     * - 1234 -> 1234
     */
    private function normalizeNumericValue($raw): ?float
    {
        if (is_int($raw) || is_float($raw)) {
            return (float) $raw;
        }

        if ($raw === null) {
            return null;
        }

        $value = trim((string) $raw);
        if ($value === '') {
            return null;
        }

        // Sisakan digit, koma, titik, dan minus.
        $value = preg_replace('/[^0-9,\.\-]/', '', $value) ?? '';
        if ($value === '' || $value === '-' || $value === '.' || $value === ',') {
            return null;
        }

        $commaPos = strrpos($value, ',');
        $dotPos = strrpos($value, '.');

        if ($commaPos !== false && $dotPos !== false) {
            if ($commaPos > $dotPos) {
                // 1.234,56 -> koma desimal
                $value = str_replace('.', '', $value);
                $value = str_replace(',', '.', $value);
            } else {
                // 1,234.56 -> titik desimal
                $value = str_replace(',', '', $value);
            }
        } elseif ($commaPos !== false) {
            // Hanya koma: anggap desimal jika digit belakang <=2, selain itu ribuan.
            $digitsAfter = strlen($value) - $commaPos - 1;
            if ($digitsAfter > 0 && $digitsAfter <= 2) {
                $value = str_replace('.', '', $value);
                $value = str_replace(',', '.', $value);
            } else {
                $value = str_replace(',', '', $value);
            }
        } else {
            // Hanya titik: jika lebih dari satu titik, anggap ribuan.
            if (substr_count($value, '.') > 1) {
                $value = str_replace('.', '', $value);
            }
        }

        return is_numeric($value) ? (float) $value : null;
    }

    /**
     * Status lock premium.
     */
    private function isLocked(Survey $survey)
    {
        $premiumTier = $this->resolveSurveyPremiumTier($survey);
        if ($premiumTier === Survey::PREMIUM_TIER_FREE) {
            return false;
        }

        $user = auth()->user();
        if (!$user) {
            return true;
        }

        // Penulis konten selalu bisa akses konten miliknya.
        if ((int) $survey->user_id === (int) $user->id) {
            return false;
        }

        // Role editorial/admin punya privilege akses konten premium.
        if ($user->hasAnyRole(['super_admin', 'publisher', 'editor'])) {
            return false;
        }

        if ($premiumTier === Survey::PREMIUM_TIER_SPECIAL) {
            return true;
        }

        if ($user->hasActiveSubscription()) {
            return false;
        }

        if ($user->hasArticleEntitlement((int) $survey->id)) {
            return false;
        }

        return true;
    }

    /**
     * Untuk Step 3:
     * - series: full lock
     * - story/news: teaser lock
     */
    private function resolveLockMode(Survey $survey)
    {
        if ($survey->type === 'series') return 'full';
        return 'teaser';
    }

    /**
     * Bentuk payload final article yang aman dikirim ke frontend.
     */
    private function prepareArticlePayload(Survey $survey, $isLocked, $lockMode)
    {
        $payload = $survey->toArray();
        $premiumTier = $this->resolveSurveyPremiumTier($survey);
        $isResearchPublication = $survey->type === 'publikasi_riset';
        $payload['has_publication_pdf'] = !empty($survey->pdf_path);
        // Jalur penyimpanan private tidak boleh diekspos langsung ke frontend.
        $payload['pdf_path'] = null;
        $payload['premium_tier'] = $premiumTier;
        $payload['is_special_premium'] = $premiumTier === Survey::PREMIUM_TIER_SPECIAL;
        if ($survey->type === 'series' && !$this->shouldShowSeriesNotes($survey)) {
            $payload['notes'] = null;
        }
        $payload['is_locked'] = $isLocked;
        $payload['lock_mode'] = $isLocked ? $lockMode : 'none';

        if (!$isLocked) {
            $payload['teaser_content'] = null;
            return $payload;
        }

        if ($lockMode === 'full') {
            $payload['csv_data'] = null;
            $payload['file_path'] = null;
            $payload['content'] = null;
            $payload['notes'] = null;
            $payload['lead'] = null;
            $payload['image'] = null;
            $payload['image_caption'] = null;
            $payload['image_copyright'] = null;
            $payload['teaser_content'] = null;
            return $payload;
        }

        $payload['teaser_content'] = $this->buildContentTeaser($survey->content, 0.25);
        $payload['content'] = null;
        $payload['notes'] = null;
        $payload['csv_data'] = null;
        $payload['file_path'] = null;
        if (!$isResearchPublication) {
            $payload['image'] = null;
            $payload['image_caption'] = null;
            $payload['image_copyright'] = null;
        }

        return $payload;
    }

    /**
     * Legacy default: data series lama (show_notes null) dianggap tampil.
     */
    private function shouldShowSeriesNotes(Survey $survey): bool
    {
        if ($survey->type !== 'series') {
            return false;
        }

        if ($survey->show_notes === null) {
            return true;
        }

        return (bool) $survey->show_notes;
    }

    /**
     * Ambil 25% awal konten sebagai teaser dalam HTML sederhana.
     */
    private function buildContentTeaser($html, $ratio = 0.25)
    {
        if (empty($html)) return null;

        $plain = trim(strip_tags((string) $html));
        if ($plain === '') return null;

        $words = preg_split('/\s+/', $plain);
        if (!$words || count($words) === 0) return null;

        $take = max(20, (int) ceil(count($words) * $ratio));
        $teaser = implode(' ', array_slice($words, 0, $take));

        return '<p>' . e($teaser) . '...</p>';
    }

    /**
     * Ambil payload komentar + widget untuk halaman detail story/news.
     */
    private function prepareCommentsPayload(Survey $survey)
    {
        if (!$this->canCommentOnSurvey($survey)) {
            return [
                'comments' => [],
                'widget' => null,
            ];
        }

        $comments = $survey->comments()
            ->with('user:id,name')
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'created_at' => $comment->created_at,
                    'user' => [
                        'name' => $comment->user?->name ?? 'Pengguna',
                    ],
                ];
            })
            ->values();

        $widget = [
            'total_comments' => $survey->comments()->count(),
            'latest_comments' => $survey->comments()
                ->with('user:id,name')
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($comment) {
                    return [
                        'user_name' => $comment->user?->name ?? 'Pengguna',
                        'created_at' => $comment->created_at,
                        'preview' => Str::limit($comment->body, 64),
                    ];
                })
                ->values(),
        ];

        return [
            'comments' => $comments,
            'widget' => $widget,
        ];
    }

    /**
     * Widget detail untuk halaman story/news:
     * - Hot gabungan semua tipe
     * - Terbaru (gabungan semua tipe)
     */
    private function prepareDetailWidgets(Survey $survey): array
    {
        $windowDays = 7;
        $limit = 5;
        $cacheMinutes = 5;
        $cachePoolSize = max($limit + 5, 12);
        $cacheUntil = now()->addMinutes($cacheMinutes);

        // Widget ini hanya relevan untuk halaman detail story/news.
        if (!in_array($survey->type, ['story', 'news'], true)) {
            return [
                'window_days' => $windowDays,
                'per_widget' => $limit,
                'cache_ttl_minutes' => $cacheMinutes,
                'hot_combined' => [],
                'latest' => [],
            ];
        }

        $columns = ['id', 'slug', 'title', 'type', 'category', 'created_at', 'views', 'image'];
        $hotCombinedPool = Cache::remember(
            "detail_widgets:hot:combined:days:{$windowDays}:pool:{$cachePoolSize}",
            $cacheUntil,
            fn () => $this->buildHotCombinedPool($windowDays, $cachePoolSize, $columns),
        );
        $latestPool = Cache::remember(
            "detail_widgets:latest:pool:{$cachePoolSize}",
            $cacheUntil,
            fn () => $this->buildLatestWidgetPool($cachePoolSize, $columns),
        );

        return [
            'window_days' => $windowDays,
            'per_widget' => $limit,
            'cache_ttl_minutes' => $cacheMinutes,
            'hot_combined' => $this->pickWidgetItems($hotCombinedPool, (int) $survey->id, $limit),
            'latest' => $this->pickWidgetItems($latestPool, (int) $survey->id, $limit),
        ];
    }

    /**
     * Pool item "hot" gabungan semua tipe untuk cache.
     */
    private function buildHotCombinedPool(int $windowDays, int $poolSize, array $columns): array
    {
        $since = now()->subDays($windowDays);
        $baseQuery = Survey::query()
            ->select($columns);

        $recentItems = (clone $baseQuery)
            ->where('created_at', '>=', $since)
            ->orderByDesc('views')
            ->orderByDesc('created_at')
            ->limit($poolSize)
            ->get();

        $items = $recentItems->isNotEmpty()
            ? $recentItems
            : (clone $baseQuery)
                ->orderByDesc('views')
                ->orderByDesc('created_at')
                ->limit($poolSize)
                ->get();

        return $items
            ->map(fn (Survey $item) => $this->mapDetailWidgetItem($item))
            ->values()
            ->all();
    }

    /**
     * Pool item "terbaru" untuk cache.
     */
    private function buildLatestWidgetPool(int $poolSize, array $columns): array
    {
        return Survey::query()
            ->select($columns)
            ->orderByDesc('created_at')
            ->limit($poolSize)
            ->get()
            ->map(fn (Survey $item) => $this->mapDetailWidgetItem($item))
            ->values()
            ->all();
    }

    /**
     * Ambil item final (exclude current survey).
     */
    private function pickWidgetItems(array $pool, int $excludeSurveyId, int $limit): array
    {
        return collect($pool)
            ->reject(function ($item) use ($excludeSurveyId) {
                return (int) ($item['id'] ?? 0) === $excludeSurveyId;
            })
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * Normalisasi payload item widget.
     */
    private function mapDetailWidgetItem(Survey $item): array
    {
        return [
            'id' => (int) $item->id,
            'slug' => $item->slug,
            'title' => $item->title,
            'type' => $item->type,
            'category' => $item->category,
            'created_at' => $item->created_at,
            'views' => (int) ($item->views ?? 0),
            'image' => $item->image,
        ];
    }

    /**
     * Komentar hanya aktif untuk story/news.
     */
    private function canCommentOnSurvey(Survey $survey)
    {
        return in_array($survey->type, ['story', 'news', 'publikasi_riset'], true);
    }

    private function resolvePremiumTierFromRequest(Request $request, ?Survey $survey = null): string
    {
        $tier = strtolower(trim((string) $request->input('premium_tier', '')));
        if (in_array($tier, Survey::premiumTierOptions(), true)) {
            return $tier;
        }

        if ($request->has('is_premium')) {
            return filter_var($request->input('is_premium'), FILTER_VALIDATE_BOOLEAN)
                ? Survey::PREMIUM_TIER_PREMIUM
                : Survey::PREMIUM_TIER_FREE;
        }

        if ($survey) {
            return $this->resolveSurveyPremiumTier($survey);
        }

        return Survey::PREMIUM_TIER_FREE;
    }

    private function resolveSurveyPremiumTier(Survey $survey): string
    {
        return $survey->resolvedPremiumTier();
    }

    /**
     * Sanitasi komentar dari HTML.
     */
    private function sanitizeCommentBody($body)
    {
        return trim(strip_tags((string) $body));
    }

    /**
     * Hapus file editor (storage/media) yang sudah tidak dipakai di konten terbaru.
     */
    private function cleanupDetachedEditorMedia($oldHtml, $newHtml): void
    {
        $oldPaths = $this->extractEditorMediaPaths($oldHtml);
        $newPaths = $this->extractEditorMediaPaths($newHtml);
        $detached = array_diff($oldPaths, $newPaths);

        foreach ($detached as $path) {
            $this->deleteMediaPathIfUnused($path);
        }
    }

    /**
     * Ambil path media editor dari HTML (contoh: media/abc.jpg).
     */
    private function extractEditorMediaPaths($html): array
    {
        if (empty($html)) {
            return [];
        }

        preg_match_all('#/storage/(media/[A-Za-z0-9_\-./]+)#i', (string) $html, $matches);
        $paths = $matches[1] ?? [];

        return array_values(array_unique(array_map(function ($path) {
            return ltrim($path, '/');
        }, $paths)));
    }

    /**
     * Hapus file media jika tidak direferensikan konten survey manapun.
     */
    private function deleteMediaPathIfUnused(string $path): void
    {
        if (!str_starts_with($path, 'media/')) {
            return;
        }

        $disk = Storage::disk('public');
        if (!$disk->exists($path)) {
            return;
        }

        $isReferenced = Survey::query()
            ->whereNotNull('content')
            ->where('content', 'like', "%/storage/{$path}%")
            ->exists();

        if (!$isReferenced) {
            $disk->delete($path);
        }
    }

    /**
     * Metadata aset existing untuk ditampilkan di form edit.
     */
    private function buildExistingAssetsPayload(Survey $survey): array
    {
        $disk = Storage::disk('public');
        $localDisk = Storage::disk('local');

        $existingFile = null;
        if (!empty($survey->file_path)) {
            $exists = $disk->exists($survey->file_path);
            $existingFile = [
                'path' => $survey->file_path,
                'url' => $exists ? $disk->url($survey->file_path) : null,
                'name' => basename($survey->file_path),
                'extension' => strtolower(pathinfo($survey->file_path, PATHINFO_EXTENSION)),
                'size_bytes' => $exists ? $disk->size($survey->file_path) : null,
                'exists' => $exists,
            ];
        }

        $existingImage = null;
        if (!empty($survey->image)) {
            $exists = $disk->exists($survey->image);
            $existingImage = [
                'path' => $survey->image,
                'url' => $exists ? $disk->url($survey->image) : null,
                'name' => basename($survey->image),
                'extension' => strtolower(pathinfo($survey->image, PATHINFO_EXTENSION)),
                'size_bytes' => $exists ? $disk->size($survey->image) : null,
                'exists' => $exists,
            ];
        }

        $existingPdf = null;
        if (!empty($survey->pdf_path)) {
            $existsOnLocal = $localDisk->exists($survey->pdf_path);
            $existsOnPublic = !$existsOnLocal && $disk->exists($survey->pdf_path);
            $sizeBytes = null;

            if ($existsOnLocal) {
                $sizeBytes = $localDisk->size($survey->pdf_path);
            } elseif ($existsOnPublic) {
                $sizeBytes = $disk->size($survey->pdf_path);
            }

            $existingPdf = [
                'path' => $survey->pdf_path,
                'name' => basename($survey->pdf_path),
                'extension' => strtolower(pathinfo($survey->pdf_path, PATHINFO_EXTENSION)),
                'size_bytes' => $sizeBytes,
                'exists' => $existsOnLocal || $existsOnPublic,
                'disk' => $existsOnLocal ? 'local' : ($existsOnPublic ? 'public' : null),
            ];
        }

        return [
            'file' => $existingFile,
            'image' => $existingImage,
            'pdf' => $existingPdf,
        ];
    }

    /**
     * Sinkronisasi OG image untuk kebutuhan share preview.
     */
    private function ensureOpenGraphImage(Survey $survey, bool $onlyIfMissing): void
    {
        try {
            /** @var OpenGraphImageService $ogImageService */
            $ogImageService = app(OpenGraphImageService::class);

            if ($onlyIfMissing && $ogImageService->hasValidOgImage($survey)) {
                return;
            }

            $ogImageService->ensureForSurvey($survey, force: false);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Hapus file OG ketika konten dihapus agar storage tetap bersih.
     */
    private function deleteOpenGraphImage(Survey $survey): void
    {
        try {
            /** @var OpenGraphImageService $ogImageService */
            $ogImageService = app(OpenGraphImageService::class);
            $ogImageService->deleteForSurvey($survey);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Cek otorisasi user.
     */
    private function authorizeUser($survey, bool $allowEditor = false)
    {
        $user = auth()->user();

        if ($user?->hasRole('super_admin')) {
            return;
        }

        if ($allowEditor && $user?->hasRole('editor')) {
            return;
        }

        if ($survey->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke data ini.');
        }
    }
}
