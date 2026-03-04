import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    FileImage,
    FileSpreadsheet,
    FileText,
    Lock,
    Unlock,
    Tag,
    X,
} from "lucide-react";
import axios from "axios";

const extractFirstErrorMessage = (errors) => {
    if (!errors || typeof errors !== "object") {
        return "Terjadi kesalahan validasi. Silakan periksa kembali input Anda.";
    }

    for (const value of Object.values(errors)) {
        if (Array.isArray(value) && value.length > 0) {
            return String(value[0]);
        }

        if (typeof value === "string" && value.trim() !== "") {
            return value;
        }
    }

    return "Terjadi kesalahan validasi. Silakan periksa kembali input Anda.";
};

const POST_TYPES = [
    {
        id: "series",
        label: "Kilas Data",
        desc: "Fokus data. Wajib file Excel/CSV.",
    },
    {
        id: "story",
        label: "Fokus Utama",
        desc: "Narasi mendalam. Wajib gambar utama.",
    },
    {
        id: "news",
        label: "Kabar Tepi",
        desc: "Berita ringkas. Wajib gambar utama.",
    },
    {
        id: "publikasi_riset",
        label: "Publikasi Riset",
        desc: "Pengantar singkat + thumbnail opsional + file PDF.",
    },
];

const SERIES_TEMPLATE_FILES = [
    {
        id: "line-xlsx",
        label: "Template Grafik Garis (.xlsx)",
        href: "/templates/chart-templates/grafik-garis-template.xlsx",
    },
    {
        id: "bar-xlsx",
        label: "Template Grafik Batang (.xlsx)",
        href: "/templates/chart-templates/grafik-batang-template.xlsx",
    },
    {
        id: "pie-xlsx",
        label: "Template Grafik Pie (.xlsx)",
        href: "/templates/chart-templates/grafik-pie-template.xlsx",
    },
    {
        id: "line-csv",
        label: "Template Grafik Garis (.csv)",
        href: "/templates/chart-templates/grafik-garis-template.csv",
    },
    {
        id: "bar-csv",
        label: "Template Grafik Batang (.csv)",
        href: "/templates/chart-templates/grafik-batang-template.csv",
    },
    {
        id: "pie-csv",
        label: "Template Grafik Pie (.csv)",
        href: "/templates/chart-templates/grafik-pie-template.csv",
    },
];

export default function SurveyForm({ survey = null, existingAssets = null }) {
    const isEdit = Boolean(survey);
    const quillRef = useRef(null);
    const { globalCategoryTree = [] } = usePage().props;
    const [isTemplateGuideOpen, setIsTemplateGuideOpen] = useState(false);

    const categories = useMemo(
        () =>
            globalCategoryTree.map((cat) => ({
                id: cat.id,
                label: cat.name,
            })),
        [globalCategoryTree],
    );
    const subCategoryMap = useMemo(
        () =>
            globalCategoryTree.reduce((acc, cat) => {
                acc[cat.id] = Array.isArray(cat.subs) ? cat.subs : [];
                return acc;
            }, {}),
        [globalCategoryTree],
    );

    const initialTags = isEdit && Array.isArray(survey.tags) ? survey.tags : [];
    const [tags, setTags] = useState(initialTags);
    const [currentTag, setCurrentTag] = useState("");
    const [imagePreview, setImagePreview] = useState(
        survey?.image ? `/storage/${survey.image}` : null,
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? "PUT" : "POST",
        type: survey?.type || "series",
        title: survey?.title || "",
        pic: survey?.pic || "",
        category: survey?.category || "",
        subcategory: survey?.subcategory || "",
        period: survey?.period || "",
        notes: survey?.notes || "",
        show_notes: survey
            ? survey?.show_notes === null || survey?.show_notes === undefined
                ? true
                : Boolean(survey?.show_notes)
            : false,
        lead: survey?.lead || "",
        content: survey?.content || "",
        published_year: survey?.published_year || "",
        research_topic: survey?.research_topic || "",
        tags: initialTags,
        premium_tier:
            survey?.premium_tier ||
            (survey?.is_premium ? "premium" : "free"),
        chart_type: survey?.chart_type || "table",
        is_interactive: survey ? Boolean(survey.is_interactive) : true,
        file: null,
        image_file: null,
        pdf_file: null,
        image_caption: survey?.image_caption || "",
        image_copyright: survey?.image_copyright || "",
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstError = extractFirstErrorMessage(errors);
            Swal.fire({
                icon: "error",
                title: "Validasi Gagal",
                text: firstError,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
            });
        }
    }, [errors]);

    useEffect(() => {
        if (data.type !== "series" && isTemplateGuideOpen) {
            setIsTemplateGuideOpen(false);
        }
    }, [data.type, isTemplateGuideOpen]);

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    ["link", "image", "code-block"],
                    ["clean"],
                ],
                handlers: {
                    image: () => imageHandler(),
                },
            },
        }),
        [],
    );

    const isSeries = data.type === "series";
    const isResearchPublication = data.type === "publikasi_riset";
    const existingFile = existingAssets?.file || null;
    const existingImage = existingAssets?.image || null;
    const existingPdf = existingAssets?.pdf || null;
    const displayImagePreview = imagePreview || existingImage?.url || null;

    const formatBytes = (bytes) => {
        if (!bytes || Number.isNaN(Number(bytes))) return "-";
        const value = Number(bytes);
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    };

    const changeType = (nextType) => {
        setData((current) => {
            if (nextType === "series") {
                return {
                    ...current,
                    type: nextType,
                    file: current.file,
                    image_file: null,
                    pdf_file: null,
                    published_year: "",
                    research_topic: "",
                    lead: "",
                    content: "",
                    image_caption: "",
                    image_copyright: "",
                    show_notes: Boolean(current.show_notes),
                    chart_type: current.chart_type || "table",
                    is_interactive:
                        current.is_interactive === undefined
                            ? true
                            : Boolean(current.is_interactive),
                };
            }

            if (nextType === "publikasi_riset") {
                return {
                    ...current,
                    type: nextType,
                    file: null,
                    image_file: null,
                    period: "",
                    notes: "",
                    content: "",
                    image_caption: "",
                    image_copyright: "",
                    chart_type: "bar",
                    is_interactive: false,
                };
            }

            return {
                ...current,
                type: nextType,
                file: null,
                pdf_file: null,
                published_year: "",
                research_topic: "",
                show_notes: false,
                chart_type: "bar",
                is_interactive: false,
                notes: "",
            };
        });

        if (nextType === "series" || nextType === "publikasi_riset") {
            setImagePreview(null);
        }
    };

    const handleCategoryChange = (catId) => {
        setData((current) => ({ ...current, category: catId, subcategory: "" }));
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
            return;
        }

        if (e.key === "Backspace" && !currentTag && tags.length > 0) {
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

    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
                const res = await axios.post(route("media.upload"), formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const url = res.data.url;
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", url);
            } catch (error) {
                const status = error?.response?.status;
                const responseErrors = error?.response?.data?.errors;
                const responseMessage = error?.response?.data?.message;

                let message = "Upload gambar gagal. Silakan coba lagi.";
                if (status === 403) {
                    message = "Anda tidak memiliki akses upload gambar editor.";
                } else if (status === 422) {
                    message =
                        extractFirstErrorMessage(responseErrors) ||
                        responseMessage ||
                        "Format/ukuran gambar tidak sesuai. Maksimal 2MB.";
                } else if (typeof responseMessage === "string" && responseMessage.trim() !== "") {
                    message = responseMessage;
                }

                Swal.fire("Upload gagal", message, "error");
            }
        };
    };

    const submit = (e) => {
        e.preventDefault();

        if (isEdit) {
            post(route("surveys.update", survey.id));
            return;
        }

        post(route("surveys.store"));
    };

    return (
        <div className="py-8 sm:py-12">
            <Head title={isEdit ? "Edit Data" : "Input Data Baru"} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 flex items-center text-gray-500 hover:text-blue-600"
                    type="button"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
                </button>

                <form onSubmit={submit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                        {POST_TYPES.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => changeType(type.id)}
                                className={`text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                    data.type === type.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 bg-white hover:border-blue-300"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-800">{type.label}</span>
                                    {data.type === type.id && (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{type.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">Identitas Utama</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                        placeholder="Contoh: Tren Inflasi Kota X Triwulan I"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
                                        <input
                                            type="text"
                                            value={data.pic}
                                            onChange={(e) => setData("pic", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                            placeholder="Nama penulis / instansi"
                                        />
                                    </div>
                                    {isSeries && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Data</label>
                                            <input
                                                type="text"
                                                value={data.period}
                                                onChange={(e) => setData("period", e.target.value)}
                                                className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                                placeholder="Contoh: 2020-2025"
                                            />
                                        </div>
                                    )}
                                    {isResearchPublication && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Publikasi</label>
                                            <input
                                                type="number"
                                                min="1900"
                                                max="2100"
                                                value={data.published_year}
                                                onChange={(e) => setData("published_year", e.target.value)}
                                                className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                                placeholder="Contoh: 2026"
                                            />
                                        </div>
                                    )}
                                </div>

                                {isResearchPublication && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Topik Riset</label>
                                        <input
                                            type="text"
                                            value={data.research_topic}
                                            onChange={(e) => setData("research_topic", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                            placeholder="Contoh: Evaluasi Kinerja Pemprov Jawa Barat"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => handleCategoryChange(cat.id)}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                                                    data.category === cat.id
                                                        ? "ring-2 ring-blue-500 bg-blue-50 text-blue-700 border-blue-200"
                                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {data.category && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Topik</label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500"
                                            value={data.subcategory}
                                            onChange={(e) => setData("subcategory", e.target.value)}
                                        >
                                            <option value="">-- Pilih Sub Topik --</option>
                                            {subCategoryMap[data.category]?.map((sub) => (
                                                <option key={sub} value={sub}>
                                                    {sub}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white min-h-[42px]">
                                        <Tag className="w-4 h-4 text-gray-400 ml-1" />
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs"
                                            >
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={currentTag}
                                            onChange={(e) => setCurrentTag(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            className="flex-1 min-w-[120px] border-0 focus:ring-0 text-sm"
                                            placeholder="ketik tag lalu Enter"
                                        />
                                    </div>
                                </div>
                            </section>

                            {!isSeries && !isResearchPublication && (
                                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Lead dan Konten</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
                                        <textarea
                                            rows="4"
                                            value={data.lead}
                                            onChange={(e) => setData("lead", e.target.value)}
                                            className="w-full rounded-lg border-gray-300"
                                            placeholder="Ringkasan pembuka artikel..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Konten</label>
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={data.content}
                                            onChange={(val) => setData("content", val)}
                                            modules={modules}
                                            className="h-52 sm:h-64 mb-12"
                                        />
                                    </div>
                                </section>
                            )}

                            {isResearchPublication && (
                                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Pengantar Publikasi</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraf Pengantar</label>
                                        <textarea
                                            rows="6"
                                            value={data.lead}
                                            onChange={(e) => setData("lead", e.target.value)}
                                            className="w-full rounded-lg border-gray-300"
                                            placeholder="Tulis ringkasan utama publikasi riset."
                                        />
                                    </div>
                                </section>
                            )}

                            {isSeries && (
                                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Catatan Teknis Data</h3>
                                    <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        <span>Tampilkan catatan teknis?</span>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.show_notes)}
                                            onChange={(e) => setData("show_notes", e.target.checked)}
                                            className="rounded"
                                        />
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={data.notes}
                                        onChange={(e) => setData("notes", e.target.value)}
                                        className="w-full rounded-lg border-gray-300"
                                        placeholder="Contoh: definisi indikator, sumber data, catatan metode."
                                    />
                                </section>
                            )}
                        </div>

                        <aside className="space-y-6">
                            {isSeries ? (
                                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                        File Data (Excel/CSV)
                                    </h3>

                                    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 space-y-3">
                                        <p className="text-sm font-semibold text-blue-900">
                                            Download Template Kilas Data
                                        </p>
                                        <p className="text-xs text-blue-800">
                                            Gunakan kolom A = Label dan kolom B =
                                            Nilai (angka), tanpa header.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsTemplateGuideOpen(true)}
                                            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                                        >
                                            Lihat Panduan Format
                                        </button>
                                        <div className="grid grid-cols-1 gap-2">
                                            {SERIES_TEMPLATE_FILES.map((item) => (
                                                <a
                                                    key={item.id}
                                                    href={item.href}
                                                    download
                                                    className="inline-flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                                                >
                                                    <span>{item.label}</span>
                                                    <Download className="w-4 h-4 shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {isEdit && (
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900 space-y-2">
                                            <p className="font-semibold">
                                                Upload ulang file bersifat opsional.
                                            </p>
                                            {existingFile ? (
                                                <>
                                                    <p>
                                                        File saat ini:{" "}
                                                        <span className="font-bold">
                                                            {existingFile.name}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Format:{" "}
                                                        <span className="uppercase font-semibold">
                                                            {existingFile.extension || "-"}
                                                        </span>{" "}
                                                        • Ukuran:{" "}
                                                        <span className="font-semibold">
                                                            {formatBytes(existingFile.size_bytes)}
                                                        </span>
                                                    </p>
                                                    {existingFile.url && (
                                                        <a
                                                            href={existingFile.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex font-semibold underline"
                                                        >
                                                            Lihat file lama
                                                        </a>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-amber-700">
                                                    Belum ada file lama tersimpan.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
                                        <div className="text-center px-4">
                                            <p className="text-sm font-semibold text-gray-700">
                                                {data.file
                                                    ? data.file.name
                                                    : "Klik untuk upload file .xlsx/.xls/.csv"}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={(e) => setData("file", e.target.files[0])}
                                        />
                                    </label>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bentuk Grafik</label>
                                        <select
                                            value={data.chart_type}
                                            onChange={(e) => setData("chart_type", e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300"
                                        >
                                            <option value="table">Tabel Data</option>
                                            <option value="bar">Bar Chart</option>
                                            <option value="line">Line Chart</option>
                                            <option value="pie">Pie Chart</option>
                                        </select>
                                    </div>

                                    <label className="flex items-center justify-between text-sm text-gray-700">
                                        <span>Mode Interaktif</span>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.is_interactive)}
                                            onChange={(e) => setData("is_interactive", e.target.checked)}
                                            className="rounded"
                                        />
                                    </label>
                                </section>
                            ) : isResearchPublication ? (
                                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileImage className="w-5 h-5 text-blue-600" />
                                        Thumbnail Publikasi (Opsional)
                                    </h3>

                                    {isEdit && (
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900 space-y-2">
                                            <p className="font-semibold">
                                                Upload ulang thumbnail bersifat opsional.
                                            </p>
                                            {existingImage ? (
                                                <>
                                                    <p>
                                                        Thumbnail saat ini:{" "}
                                                        <span className="font-bold">
                                                            {existingImage.name}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Format:{" "}
                                                        <span className="uppercase font-semibold">
                                                            {existingImage.extension || "-"}
                                                        </span>{" "}
                                                        • Ukuran:{" "}
                                                        <span className="font-semibold">
                                                            {formatBytes(existingImage.size_bytes)}
                                                        </span>
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-amber-700">
                                                    Belum ada thumbnail tersimpan.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {displayImagePreview && (
                                        <img
                                            src={displayImagePreview}
                                            alt="Preview thumbnail publikasi"
                                            className="w-full h-auto rounded-lg border border-gray-200"
                                        />
                                    )}

                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
                                        <p className="text-sm font-semibold text-gray-700 px-4 text-center">
                                            {data.image_file
                                                ? data.image_file.name
                                                : "Klik untuk upload thumbnail (jpg/png/webp)"}
                                        </p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setData("image_file", file);
                                                if (file) {
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>

                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        File Publikasi (PDF)
                                    </h3>

                                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900 space-y-2">
                                        <p className="font-semibold">File publikasi disimpan di storage private.</p>
                                        <p>Pengunjung hanya bisa mengakses file setelah lolos aturan akses premium.</p>
                                    </div>

                                    {isEdit && (
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900 space-y-2">
                                            <p className="font-semibold">
                                                Upload ulang PDF bersifat opsional.
                                            </p>
                                            {existingPdf ? (
                                                <>
                                                    <p>
                                                        File saat ini:{" "}
                                                        <span className="font-bold">
                                                            {existingPdf.name}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Format:{" "}
                                                        <span className="uppercase font-semibold">
                                                            {existingPdf.extension || "-"}
                                                        </span>{" "}
                                                        • Ukuran:{" "}
                                                        <span className="font-semibold">
                                                            {formatBytes(existingPdf.size_bytes)}
                                                        </span>
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-amber-700">
                                                    Belum ada PDF lama tersimpan.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
                                        <div className="text-center px-4">
                                            <p className="text-sm font-semibold text-gray-700">
                                                {data.pdf_file
                                                    ? data.pdf_file.name
                                                    : "Klik untuk upload file .pdf"}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,application/pdf"
                                            onChange={(e) => setData("pdf_file", e.target.files[0])}
                                        />
                                    </label>
                                </section>
                            ) : (
                                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileImage className="w-5 h-5 text-blue-600" />
                                        Gambar Utama
                                    </h3>
                                    {isEdit && (
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900 space-y-2">
                                            <p className="font-semibold">
                                                Upload ulang gambar bersifat opsional.
                                            </p>
                                            {existingImage ? (
                                                <>
                                                    <p>
                                                        Gambar saat ini:{" "}
                                                        <span className="font-bold">
                                                            {existingImage.name}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Format:{" "}
                                                        <span className="uppercase font-semibold">
                                                            {existingImage.extension || "-"}
                                                        </span>{" "}
                                                        • Ukuran:{" "}
                                                        <span className="font-semibold">
                                                            {formatBytes(existingImage.size_bytes)}
                                                        </span>
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-amber-700">
                                                    Belum ada gambar lama tersimpan.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {displayImagePreview && (
                                        <img
                                            src={displayImagePreview}
                                            alt="Preview"
                                            className="w-full h-44 object-cover rounded-lg border border-gray-200"
                                        />
                                    )}

                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
                                        <p className="text-sm font-semibold text-gray-700 px-4 text-center">
                                            {data.image_file
                                                ? data.image_file.name
                                                : "Klik untuk upload gambar utama (jpg/png/webp)"}
                                        </p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setData("image_file", file);
                                                if (file) {
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Caption Gambar</label>
                                        <input
                                            type="text"
                                            value={data.image_caption}
                                            onChange={(e) => setData("image_caption", e.target.value)}
                                            className="w-full rounded-lg border-gray-300"
                                            placeholder="Contoh: Aktivitas pasar tradisional di Kota X"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
                                        <input
                                            type="text"
                                            value={data.image_copyright}
                                            onChange={(e) => setData("image_copyright", e.target.value)}
                                            className="w-full rounded-lg border-gray-300"
                                            placeholder="Contoh: Foto: BrightNest / BPS"
                                        />
                                    </div>
                                </section>
                            )}

                            <section
                                className={`p-6 rounded-xl border shadow-sm ${
                                    data.premium_tier !== "free"
                                        ? "bg-amber-50 border-amber-200"
                                        : "bg-white border-gray-100"
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        {data.premium_tier !== "free" ? (
                                            <Lock className="w-5 h-5 text-amber-600" />
                                        ) : (
                                            <Unlock className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="font-bold text-gray-900">
                                            Akses Konten
                                        </span>
                                    </div>

                                    <select
                                        value={data.premium_tier}
                                        onChange={(e) =>
                                            setData("premium_tier", e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 text-sm"
                                    >
                                        <option value="free">Gratis (Terbuka)</option>
                                        <option value="premium">Premium (Flow Pembelian)</option>
                                        <option value="special">Spesial (Arahkan ke WhatsApp)</option>
                                    </select>

                                    {data.premium_tier === "special" ? (
                                        <p className="text-xs text-amber-700">
                                            Konten spesial akan menampilkan tombol WhatsApp
                                            untuk menghubungi admin, bukan flow pembelian biasa.
                                        </p>
                                    ) : data.premium_tier === "premium" ? (
                                        <p className="text-xs text-amber-700">
                                            Konten premium akan mengikuti flow membership / pembelian artikel.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            Konten gratis dapat diakses semua pengunjung.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 sm:py-4 rounded-xl disabled:opacity-50"
                            >
                                {processing
                                    ? "Menyimpan..."
                                    : isEdit
                                      ? "Simpan Perubahan"
                                      : "Publikasikan"}
                            </button>
                        </aside>
                    </div>
                </form>
            </div>

            {isTemplateGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setIsTemplateGuideOpen(false)}
                        className="absolute inset-0 bg-black/50"
                        aria-label="Tutup panduan format"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h4 className="text-base sm:text-lg font-bold text-gray-900">
                                Panduan Format Excel/CSV Kilas Data
                            </h4>
                            <button
                                type="button"
                                onClick={() => setIsTemplateGuideOpen(false)}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4 text-sm text-gray-700">
                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                                <p className="font-semibold text-blue-900 mb-1">
                                    Format minimal yang dibaca sistem:
                                </p>
                                <p>Kolom A = Label</p>
                                <p>Kolom B = Nilai (angka)</p>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-900 mb-2">
                                    Aturan penting
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Hanya sheet pertama yang dibaca.</li>
                                    <li>Gunakan 2 kolom pertama (A dan B).</li>
                                    <li>Jangan pakai header di baris pertama.</li>
                                    <li>Jangan merge cell.</li>
                                    <li>Hindari baris kosong di tengah data.</li>
                                    <li>Pastikan kolom nilai berisi angka.</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                                Tips: jika angka memakai pemisah ribuan/desimal lokal
                                dan terbaca salah, simpan sebagai angka murni dulu.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


