import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react"; // Tambah useForm
import {
    PlusCircle,
    FileText,
    Eye,
    Trash2,
    Edit,
    TrendingUp,
    Search,
} from "lucide-react";

export default function Dashboard({ auth, surveys }) {
    // Helper untuk Delete
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (
            confirm(
                "Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.",
            )
        ) {
            destroy(route("surveys.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard Manajemen
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* STATISTIK RINGKAS (MOCKUP DULU) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Postingan
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {surveys.total}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Bisa tambah statistik lain nanti */}
                    </div>

                    {/* TABEL DATA */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header Tabel & Tombol Tambah */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="text-lg font-bold">
                                    Daftar Data & Artikel
                                </h3>
                                <Link
                                    href={route("surveys.create")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Tambah Data Baru
                                </Link>
                            </div>

                            {/* Tabel */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Judul</th>
                                            <th className="px-6 py-3">
                                                Kategori
                                            </th>
                                            <th className="px-6 py-3">Tipe</th>
                                            <th className="px-6 py-3">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-center">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {surveys.data.length > 0 ? (
                                            surveys.data.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="bg-white border-b hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {item.title}
                                                        {item.is_premium ? (
                                                            <span className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                                                                PREMIUM
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold border border-gray-200">
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 capitalize">
                                                        {/* Badge Tipe */}
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-bold border ${
                                                                item.type ===
                                                                "series"
                                                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                                                    : item.type ===
                                                                        "story"
                                                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                      : "bg-green-50 text-green-700 border-green-200"
                                                            }`}
                                                        >
                                                            {item.type ===
                                                            "series"
                                                                ? "Kilas Data"
                                                                : item.type ===
                                                                    "story"
                                                                  ? "Fokus Utama"
                                                                  : "Kabar Tepi"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleDateString(
                                                            "id-ID",
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <a
                                                                href={
                                                                    item.type ===
                                                                    "series"
                                                                        ? route(
                                                                              "kilas-data",
                                                                              {
                                                                                  id: item.id,
                                                                              },
                                                                          ) // JIKA Series -> Ke Link Khusus
                                                                        : route(
                                                                              "surveys.show",
                                                                              item.slug ||
                                                                                  item.id,
                                                                          ) // SELAIN ITU -> Ke Link Biasa
                                                                }
                                                                target="_blank"
                                                                className="text-blue-500 hover:text-blue-700 tooltip"
                                                                title="Lihat"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </a>
                                                            <Link
                                                                href={route(
                                                                    "surveys.edit",
                                                                    item.id,
                                                                )}
                                                                className="text-amber-500 hover:text-amber-700"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="text-red-500 hover:text-red-700"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-8 text-center text-gray-400"
                                                >
                                                    Belum ada data. Silakan
                                                    tambah data baru.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Sederhana */}
                            <div className="mt-4 flex justify-end">
                                {/* (Nanti bisa ditambah pagination link kalau data sudah banyak) */}
                                <p className="text-xs text-gray-400">
                                    Menampilkan {surveys.data.length} dari{" "}
                                    {surveys.total} data
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
