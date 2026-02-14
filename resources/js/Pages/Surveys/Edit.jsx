import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    UploadCloud,
    FileText,
    User,
    Calendar,
    CheckCircle2,
    Building2,
    HardHat,
    TrendingUp,
    Factory,
    GraduationCap,
    HeartHandshake,
    Globe,
    Tag,
    X,
    Lock,
    Unlock,
    ArrowLeft,
} from "lucide-react";

// DATA KATEGORI (Sama seperti Input)
const CATEGORIES = [
    {
        id: "umum",
        label: "Umum",
        icon: <Globe className="w-6 h-6" />,
        color: "bg-gray-100 text-gray-600 border-gray-200",
    },
    {
        id: "pemerintahan",
        label: "Pemerintahan",
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
        label: "Bisnis",
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
        label: "Sosial",
        icon: <HeartHandshake className="w-6 h-6" />,
        color: "bg-pink-50 text-pink-600 border-pink-200",
    },
];

const SUB_CATEGORIES = {
    umum: [
        "Geografi & Wilayah",
        "Demografi",
        "Iklim",
        "Kebencanaan",
        "Lingkungan Hidup",
    ],
    pemerintahan: [
        "Pemilu",
        "Keuangan Negara",
        "Birokrasi",
        "Hukum",
        "Hubungan Internasional",
    ],
    infrastruktur: [
        "Transportasi",
        "Energi",
        "Telekomunikasi",
        "Perumahan",
        "Jalan & Jembatan",
    ],
    ekonomi: [
        "PDB/PDRB",
        "Inflasi",
        "Ekspor-Impor",
        "Keuangan",
        "Investasi",
        "UMKM",
    ],
    bisnis: [
        "Pertanian",
        "Manufaktur",
        "Pariwisata",
        "Pertambangan",
        "Digital",
        "Perdagangan",
    ],
    pendidikan: [
        "Satuan Pendidikan",
        "Peserta Didik",
        "Tenaga Pendidik",
        "Riset",
        "Kurikulum",
    ],
    sosial: [
        "Ketenagakerjaan",
        "Kemiskinan",
        "Kesehatan",
        "IPM",
        "Agama & Budaya",
    ],
};

export default function Edit({ auth, survey }) {
    // 1. Setup Tags Awal
    // Pastikan tags berupa array (karena dari DB bisa jadi JSON/Array)
    const initialTags = Array.isArray(survey.tags) ? survey.tags : [];
    const [tags, setTags] = useState(initialTags);
    const [currentTag, setCurrentTag] = useState("");

    // 2. Setup Form dengan Data Lama
    const { data, setData, put, processing, errors } = useForm({
        type: survey.type || "series",
        title: survey.title || "",
        category: survey.category || "",
        subcategory: survey.subcategory || "",
        period: survey.period || "",
        pic: survey.pic || "",
        notes: survey.notes || "",
        content: survey.content || "",
        tags: initialTags,
        is_premium: Boolean(survey.is_premium),
        file: null,
        chart_type: survey.chart_type || "bar",
        is_interactive:
            survey.is_interactive === 1 || survey.is_interactive === true,
    });

    const handleCategoryChange = (catId) => {
        setData((data) => ({ ...data, category: catId, subcategory: "" }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault();
            const newTag = currentTag.trim().replace(/^#/, "");
            if (newTag && !tags.includes(newTag)) {
                const updatedTags = [...tags, newTag];
                setTags(updatedTags);
                setData("tags", updatedTags);
                setCurrentTag("");
            }
        } else if (e.key === "Backspace" && !currentTag && tags.length > 0) {
            const updatedTags = tags.slice(0, -1);
            setTags(updatedTags);
            setData("tags", updatedTags);
        }
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(updatedTags);
        setData("tags", updatedTags);
    };

    // SUBMIT MENGGUNAKAN 'PUT'
    const submit = (e) => {
        e.preventDefault();
        // Route update butuh ID
        put(route("surveys.update", survey.id));
    };

    const POST_TYPES = [
        {
            id: "series",
            label: "Kilas Data",
            desc: "Fokus pada angka & grafik cepat.",
        },
        {
            id: "story",
            label: "Fokus Utama",
            desc: "Narasi mendalam dengan data lengkap.",
        },
        {
            id: "news",
            label: "Kabar Tepi",
            desc: "Berita/Isu tanpa wajib upload data.",
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Postingan
                </h2>
            }
        >
            <Head title="Edit Data" />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    {/* Tombol Kembali */}
                    <button
                        onClick={() => window.history.back()}
                        className="mb-6 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke
                        Dashboard
                    </button>

                    <form onSubmit={submit} className="space-y-8">
                        {/* 1. TIPE POSTINGAN */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {POST_TYPES.map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => setData("type", type.id)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                                        data.type === type.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 bg-white hover:border-blue-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-gray-800">
                                            {type.label}
                                        </span>
                                        {data.type === type.id && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {type.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* A. IDENTITAS DATA */}
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                        <FileText className="w-5 h-5 mr-2 text-blue-600" />{" "}
                                        Identitas Utama
                                    </h3>

                                    <div className="space-y-5">
                                        {/* JUDUL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Judul Postingan
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.title && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>

                                        {/* KATEGORI */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kategori
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORIES.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleCategoryChange(
                                                                cat.id,
                                                            )
                                                        }
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                                                            data.category ===
                                                            cat.id
                                                                ? `ring-2 ring-blue-500 ${cat.color}`
                                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {data.category ===
                                                            cat.id && cat.icon}
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.category && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.category}
                                                </p>
                                            )}
                                        </div>

                                        {/* SUB KATEGORI */}
                                        {data.category && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Sub Topik
                                                </label>
                                                <select
                                                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
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
                                                    {SUB_CATEGORIES[
                                                        data.category
                                                    ]?.map((sub, i) => (
                                                        <option
                                                            key={i}
                                                            value={sub}
                                                        >
                                                            {sub}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* TAGS */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tags
                                                </label>
                                                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-1 focus-within:ring-blue-500 min-h-[42px]">
                                                    <Tag className="w-4 h-4 text-gray-400 ml-1" />
                                                    {tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                                                        >
                                                            #{tag}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeTag(
                                                                        tag,
                                                                    )
                                                                }
                                                                className="hover:text-blue-900"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        className="flex-1 border-none focus:ring-0 text-sm min-w-[80px] p-0"
                                                        placeholder="Tag..."
                                                        value={currentTag}
                                                        onChange={(e) =>
                                                            setCurrentTag(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={
                                                            handleTagKeyDown
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            {/* PIC */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    PIC
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        className="pl-9 w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                                        placeholder="Nama Instansi"
                                                        value={data.pic}
                                                        onChange={(e) =>
                                                            setData(
                                                                "pic",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="text-xs font-semibold text-gray-600">
                                            Catatan Teknis
                                        </label>
                                        <textarea
                                            rows="3"
                                            className="w-full text-sm rounded-lg border-gray-300 mt-1"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData("notes", e.target.value)
                                            }
                                        ></textarea>
                                    </div>
                                </div>

                                {/* B. EDITOR ARTIKEL */}
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Konten Artikel
                                    </h3>
                                    <ReactQuill
                                        theme="snow"
                                        value={data.content}
                                        onChange={(val) =>
                                            setData("content", val)
                                        }
                                        className="h-64 mb-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* C. UPLOAD DATA */}
                                {data.type !== "news" && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                            <UploadCloud className="w-5 h-5 mr-2 text-blue-600" />{" "}
                                            Update File
                                        </h3>

                                        {/* Info File Lama */}
                                        {survey.file_path && !data.file && (
                                            <div className="mb-4 bg-green-50 border border-green-200 p-3 rounded text-xs text-green-700 flex items-center">
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                File tersimpan. Upload baru
                                                untuk mengganti.
                                            </div>
                                        )}

                                        <label
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${data.file ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                                {data.file ? (
                                                    <p className="text-sm font-semibold text-blue-700 truncate w-full">
                                                        {data.file.name}
                                                    </p>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-xs text-gray-500">
                                                            Klik ganti Excel/CSV
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) =>
                                                    setData(
                                                        "file",
                                                        e.target.files[0],
                                                    )
                                                }
                                                accept=".xlsx,.xls,.csv"
                                            />
                                        </label>
                                    </div>
                                )}

                                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Visualisasi Data
                                    </h4>

                                    <div className="space-y-4">
                                        {/* 1. Pilih Tipe Grafik */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Bentuk Grafik
                                            </label>
                                            <select
                                                value={data.chart_type}
                                                onChange={(e) =>
                                                    setData(
                                                        "chart_type",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="bar">
                                                    Grafik Batang (Bar Chart)
                                                </option>
                                                <option value="line">
                                                    Grafik Garis (Line Chart)
                                                </option>
                                                <option value="pie">
                                                    Grafik Lingkaran (Pie Chart)
                                                </option>
                                            </select>
                                        </div>

                                        {/* 2. Toggle Interaktif */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-gray-700">
                                                Mode Interaktif
                                            </label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={
                                                        data.is_interactive
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "is_interactive",
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-blue-600 italic">
                                            *Aktif: Grafik bisa di-hover &
                                            muncul angka.
                                            <br />
                                            *Mati: Grafik statis seperti gambar.
                                        </p>
                                    </div>
                                </div>

                                {/* D. PREMIUM LOCK */}
                                {data.type !== "news" && (
                                    <div
                                        className={`p-6 rounded-xl border shadow-sm transition-all ${data.is_premium ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="pt-1">
                                                {data.is_premium ? (
                                                    <Lock className="w-6 h-6 text-amber-600" />
                                                ) : (
                                                    <Unlock className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className="flex items-center space-x-2 cursor-pointer mb-1">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded text-amber-600 focus:ring-amber-500 w-5 h-5"
                                                        checked={
                                                            data.is_premium
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "is_premium",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                    />
                                                    <span className="font-bold text-gray-900">
                                                        Kunci Data
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        "Menyimpan..."
                                    ) : (
                                        <>
                                            {" "}
                                            <CheckCircle2 className="w-5 h-5" />{" "}
                                            Simpan Perubahan{" "}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
