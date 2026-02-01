import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    UploadCloud,
    FileText,
    User,
    Calendar,
    AlignLeft,
    CheckCircle2,
    Briefcase,
    Building2,
    HardHat,
    TrendingUp,
    Factory,
    GraduationCap,
    HeartHandshake,
    Globe,
} from "lucide-react";

// Definisi 7 Kategori
const CATEGORIES = [
    {
        id: "umum",
        label: "Umum",
        icon: <Globe className="w-6 h-6" />,
        color: "bg-gray-100 text-gray-600 border-gray-200",
    },
    {
        id: "pemerintahan",
        label: "Pemerintahan & Politik",
        icon: <Building2 className="w-6 h-6" />,
        color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
        id: "infrastruktur",
        label: "Infrastruktur",
        icon: <HardHat className="w-6 h-6" />,
        color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
        id: "ekonomi",
        label: "Ekonomi",
        icon: <TrendingUp className="w-6 h-6" />,
        color: "bg-green-50 text-green-600 border-green-200",
    },
    {
        id: "bisnis",
        label: "Bisnis & Industri",
        icon: <Factory className="w-6 h-6" />,
        color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
        id: "pendidikan",
        label: "Pendidikan",
        icon: <GraduationCap className="w-6 h-6" />,
        color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    {
        id: "sosial",
        label: "Sosial & Kesejahteraan",
        icon: <HeartHandshake className="w-6 h-6" />,
        color: "bg-pink-50 text-pink-600 border-pink-200",
    },
];

const SUB_CATEGORIES = {
    umum: [
        "Geografi & Wilayah",
        "Demografi (Kependudukan)",
        "Iklim & Lingkungan",
        "Kebencanaan",
    ],
    pemerintahan: [
        "Pemilu & Pilkada",
        "Keuangan Negara & Daerah",
        "Birokrasi & Aparatur",
        "Hukum & Kriminalitas",
        "Legislasi",
    ],
    infrastruktur: [
        "Transportasi & Logistik",
        "Energi & Kelistrikan",
        "Telekomunikasi & Digital",
        "Perumahan & Permukiman",
        "Air Bersih & Sanitasi",
    ],
    ekonomi: [
        "Produk Domestik Bruto (PDB/PDRB)",
        "Inflasi & Harga",
        "Ekspor & Impor",
        "Keuangan & Perbankan",
        "Investasi",
    ],
    bisnis: [
        "Pertanian, Kehutanan & Perikanan",
        "Manufaktur (Pengolahan)",
        "Pariwisata & Ekonomi Kreatif",
        "Pertambangan & Energi",
        "Digital & Startups",
    ],
    pendidikan: [
        "Satuan Pendidikan",
        "Peserta Didik",
        "Tenaga Pendidik",
        "Kualitas & Literasi",
        "Pendidikan Tinggi & Riset",
    ],
    sosial: [
        "Ketenagakerjaan",
        "Kemiskinan & Ketimpangan",
        "Kesehatan",
        "Indeks Pembangunan Manusia (IPM)",
    ],
};

export default function SurveyInput({ auth }) {
    const { flash } = usePage().props;

    // Setup Form dengan Field Baru
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        category: "",
        subcategory: "",
        period: "",
        pic: "",
        description: "", // Ingat: Ini akan dimapping ke 'notes' di backend
        file: null,
    });

    const handleCategoryChange = (catId) => {
        setData((data) => ({
            ...data,
            category: catId,
            subcategory: "", // Reset sub kategori biar ga nyangkut
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("surveys.import"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Registrasi Aset Data
                </h2>
            }
        >
            <Head title="Input Data Survei" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Alert Messages */}
                    {flash.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                            <CheckCircle2 className="w-5 h-5 mr-2" />{" "}
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                            {flash.error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">
                        {/* 1. DATA IDENTITY SECTION */}
                        <div className="bg-white p-6 sm:p-8 shadow-sm sm:rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                Identitas Data
                            </h3>

                            <div className="space-y-6">
                                {/* Kategori (Grid Selection) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Kategori Utama{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        {CATEGORIES.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() =>
                                                    handleCategoryChange(cat.id)
                                                }
                                                className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md ${
                                                    data.category === cat.id
                                                        ? `ring-2 ring-offset-1 ring-blue-500 ${cat.color}`
                                                        : "border-gray-200 hover:border-blue-300 bg-white"
                                                }`}
                                            >
                                                <div
                                                    className={`mb-2 p-2 rounded-full ${data.category === cat.id ? "bg-white/50" : "bg-gray-50"}`}
                                                >
                                                    {cat.icon}
                                                </div>
                                                <span className="text-xs font-semibold leading-tight">
                                                    {cat.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.category && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {data.category && (
                                    <div className="animate-fade-in-down bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sub Kategori{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            value={data.subcategory}
                                            onChange={(e) =>
                                                setData(
                                                    "subcategory",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Pilih Sub Topik --
                                            </option>
                                            {SUB_CATEGORIES[data.category]?.map(
                                                (sub, index) => (
                                                    <option
                                                        key={index}
                                                        value={sub}
                                                    >
                                                        {sub}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {errors.subcategory && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.subcategory}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Judul Data */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Data / Survei{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Contoh: Survei Preferensi Transportasi Umum Warga Cikole"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Periode */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Periode Data{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="month"
                                                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                value={data.period}
                                                onChange={(e) =>
                                                    setData(
                                                        "period",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Bulan & Tahun pengambilan data
                                        </p>
                                        {errors.period && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.period}
                                            </p>
                                        )}
                                    </div>

                                    {/* PIC */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Penanggung Jawab (PIC){" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Nama Lead / Surveyor"
                                                value={data.pic}
                                                onChange={(e) =>
                                                    setData(
                                                        "pic",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        {errors.pic && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.pic}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Catatan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catatan / Keterangan
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <AlignLeft className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            rows="3"
                                            className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Deskripsi singkat tentang metodologi atau konteks data..."
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. FILE UPLOAD SECTION */}
                        <div className="bg-white p-6 sm:p-8 shadow-sm sm:rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                <UploadCloud className="w-5 h-5 mr-2 text-blue-600" />
                                Upload Sumber Data
                            </h3>

                            <div>
                                <label
                                    htmlFor="dropzone-file"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${data.file ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-300 hover:bg-gray-100"}`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {data.file ? (
                                            <>
                                                <FileText className="w-12 h-12 text-blue-600 mb-3" />
                                                <p className="text-sm font-bold text-blue-800">
                                                    {data.file.name}
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    {(
                                                        data.file.size / 1024
                                                    ).toFixed(2)}{" "}
                                                    KB
                                                </p>
                                                <p className="mt-2 text-xs text-blue-500 underline">
                                                    Klik untuk ganti file
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">
                                                        Klik untuk upload
                                                    </span>{" "}
                                                    atau drag & drop
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Excel (XLSX, XLS) atau CSV
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) =>
                                            setData("file", e.target.files[0])
                                        }
                                        accept=".xlsx,.xls,.csv"
                                    />
                                </label>
                                {errors.file && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.file}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ACTION BUTTON */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Simpan Aset Data
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
