<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    /**
     * Menampilkan halaman form input (Frontend React)
     */
    public function index()
    {
        // Pastikan nanti file React Boss bernama "SurveyIndex.jsx" di folder Pages
        return Inertia::render('Surveys/Input');
    }

    /**
     * Logic Inti: Menyimpan data Survey & Import CSV
     */
    public function store(Request $request)
    {
        // 1. Validasi Input (Sesuai field yang ada di Form React)
        $request->validate([
            'title'       => 'required|string|max:255',
            'category'    => 'required|string',
            'subcategory' => 'required|string',
            'period'      => 'required|string',
            'pic'         => 'required|string',
            'description' => 'nullable|string', // Ini nanti masuk ke kolom 'notes'
            'file'        => 'required|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        DB::beginTransaction(); // Mulai transaksi database (biar aman)
        try {
            // 2. Baca File Excel/CSV menggunakan Library Maatwebsite
            // Kita ubah langsung jadi Array
            $data = Excel::toArray([], $request->file('file'));
            
            // Ambil sheet pertama (index 0). Jika kosong, set array kosong.
            $sheetData = !empty($data) ? $data[0] : [];

            // Cek keamanan: Jangan simpan jika file kosong
            if (empty($sheetData)) {
                return back()->with('error', 'File Excel/CSV yang diupload tampaknya kosong.');
            }

            // 3. Simpan ke Database
            Survey::create([
                'user_id'     => auth()->id(), // Ambil ID user yang sedang login
                
                // Metadata
                'title'       => $request->title,
                'category'    => $request->category,
                'subcategory' => $request->subcategory,
                'period'      => $request->period,
                'pic'         => $request->pic,
                
                // MAPPING KHUSUS (Sesuai Request Boss Opsi A):
                // Input "Catatan" dari form masuk ke kolom 'notes' (Catatan Teknis)
                'notes'       => $request->description,
                
                // Kolom masa depan (sementara null karena belum ada inputnya di form)
                'content'     => null, 
                'tags'        => null,

                // DATA INTI:
                // Array dari Excel langsung disimpan. 
                // Karena di Model Survey.php sudah kita set 'casts' => 'array', 
                // Laravel otomatis mengubahnya jadi JSON.
                'csv_data'    => $sheetData, 
            ]);

            DB::commit(); // Simpan permanen jika tidak ada error

            // 4. Kembali ke halaman form dengan pesan sukses
            return redirect()->back()->with('success', 'Aset Data berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan semua jika ada error
            // Kembalikan pesan error ke frontend
            return back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}