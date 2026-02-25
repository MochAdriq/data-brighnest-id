import React, { useMemo, useState } from "react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ChevronRight,
    ChevronDown,
    BarChart3,
    Calendar,
    ArrowLeft,
    Lock,
    Database,
    Gem,
    ShieldCheck,
    ShoppingBag,
    CreditCard,
} from "lucide-react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
);

const chartColors = [
    "rgba(54, 162, 235, 0.8)", // Biru
    "rgba(255, 99, 132, 0.8)", // Merah
    "rgba(255, 206, 86, 0.8)", // Kuning
    "rgba(75, 192, 192, 0.8)", // Hijau Teal
    "rgba(153, 102, 255, 0.8)", // Ungu
    "rgba(255, 159, 64, 0.8)", // Orange
];

export default function KilasDataIndex({
    surveys,
    activeFilters,
    selectedData,
    chartData,
    premiumPricing,
}) {
    const { globalCategoryTree = [] } = usePage().props;
    const categoryTree = useMemo(
        () =>
            globalCategoryTree.map((cat) => ({
                id: cat.id,
                label: cat.name,
                subs: Array.isArray(cat.subs) ? cat.subs : [],
            })),
        [globalCategoryTree],
    );

    const renderChartContent = () => {
        if (!selectedData) return null;

        const chartType = selectedData.chart_type || "bar";
        const isInteractive =
            selectedData.is_interactive === 1 ||
            selectedData.is_interactive === true;

        // 1. JIKA TIPE TABEL (Biarkan logic tabel yang sudah benar)
        if (chartType === "table") {
            const rawRows = Array.isArray(selectedData.csv_data)
                ? selectedData.csv_data
                : [];

            const normalizeRowToArray = (row) => {
                if (Array.isArray(row)) return row;
                if (row && typeof row === "object") return Object.values(row);
                return [];
            };

            const cleanedRows = rawRows
                .map((row) =>
                    normalizeRowToArray(row).map((cell) =>
                        String(cell ?? "").trim(),
                    ),
                )
                .filter((row) => row.some((cell) => cell !== ""));

            // Cari kandidat header terbaik dari 5 baris pertama:
            // baris dengan jumlah sel non-empty terbanyak.
            const headerScan = cleanedRows.slice(0, 5);
            let headerIndex = 0;
            let maxFilled = -1;
            headerScan.forEach((row, idx) => {
                const filled = row.filter((cell) => cell !== "").length;
                if (filled > maxFilled) {
                    maxFilled = filled;
                    headerIndex = idx;
                }
            });

            const headerRow = cleanedRows[headerIndex] || [];
            const headers = headerRow.map((cell, idx) =>
                cell !== "" ? cell : `Kolom ${idx + 1}`,
            );

            let rows = cleanedRows.slice(headerIndex + 1);
            if (rows.length === 0 && cleanedRows.length > 1) {
                // Fallback jika semua data terbaca di atas header index.
                rows = cleanedRows.filter((_, idx) => idx !== headerIndex);
            }

            if (rows.length === 0) {
                return (
                    <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                        <Database className="w-12 h-12 mb-2 opacity-20" />
                        <p>Data tabel belum tersedia.</p>
                    </div>
                );
            }

            return (
                <div className="w-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col h-[500px]">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-blue-800">
                                Detail Data Lengkap
                            </h3>
                        </div>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {rows.length}{" "}
                            Baris
                        </span>
                    </div>
                    <div className="overflow-auto flex-1 custom-scrollbar w-full">
                        <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap relative">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {headers.map((header, i) => (
                                            <th
                                                key={i}
                                                className="px-6 py-3 font-bold border-r border-gray-200 last:border-r-0"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className="bg-white border-b hover:bg-gray-50"
                                        >
                                            {headers.map((_, vIdx) => (
                                                <td
                                                    key={vIdx}
                                                    className="px-6 py-3 border-r border-gray-100 last:border-r-0 font-mono"
                                                >
                                                    {row[vIdx] ?? ""}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (!chartData?.labels) return null;

        // 2. PERSIAPAN DATA GRAFIK (BAR/LINE/PIE)
        const commonData = {
            // FIX CRASH: Pastikan labels selalu berupa Array String
            labels: chartData.labels.map((l) => String(l)),
            datasets: [
                {
                    label: chartData.label,
                    data: chartData.values,
                    // Warna-warni jika Pie, Biru solid jika lainnya
                    backgroundColor:
                        chartType === "pie" ? chartColors : "#2563EB",
                    borderColor: chartType === "line" ? "#2563EB" : undefined,
                    // Hover color disable untuk pie biar gak aneh
                    hoverBackgroundColor:
                        chartType === "pie" ? undefined : "#1D4ED8",
                    borderRadius: chartType === "bar" ? 4 : 0,
                    borderWidth: chartType === "line" ? 2 : 0,
                    tension: 0.3,
                    fill: chartType === "line",
                },
            ],
        };

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    // Pindahkan legend ke kanan jika Pie biar rapi
                    position: chartType === "pie" ? "right" : "top",
                },
                tooltip: { enabled: isInteractive },
            },
            hover: {
                mode: isInteractive ? "nearest" : null,
                intersect: isInteractive,
            },
            // FIX: Pie chart tidak boleh punya scales (Sumbu X/Y)
            scales:
                chartType === "pie"
                    ? {}
                    : {
                          y: { beginAtZero: true },
                          x: { display: true },
                      },
        };

        // 3. RENDER SESUAI TIPE
        return (
            <div className="h-[400px] w-full relative flex items-center justify-center">
                {chartType === "pie" && (
                    <Pie data={commonData} options={commonOptions} />
                )}
                {chartType === "line" && (
                    <Line data={commonData} options={commonOptions} />
                )}
                {chartType === "bar" && (
                    <Bar data={commonData} options={commonOptions} />
                )}
            </div>
        );
    };
    const [openCategory, setOpenCategory] = useState(
        activeFilters.category || null,
    );
    const [keyword, setKeyword] = useState(activeFilters?.q || "");
    const plans = Array.isArray(premiumPricing?.plans) ? premiumPricing.plans : [];
    const monthlyPlan = plans.find((item) => item.code === "monthly") || plans[0] || null;
    const yearlyPlan = plans.find((item) => item.code === "yearly") || plans[1] || null;
    const singlePrice = Number(premiumPricing?.single_article || 10000);
    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));

    const toggleCategory = (catId) => {
        if (openCategory === catId) {
            setOpenCategory(null);
        } else {
            setOpenCategory(catId);
            router.get(
                route("kilas-data"),
                {
                    category: catId,
                    q: activeFilters?.q || "",
                    sort: activeFilters?.sort || "desc",
                },
                { preserveState: true },
            );
        }
    };

    const selectSubCategory = (catId, sub) => {
        router.get(
            route("kilas-data"),
            {
                category: catId,
                subcategory: sub,
                q: activeFilters?.q || "",
                sort: activeFilters?.sort || "desc",
            },
            { preserveState: true },
        );
    };

    const openDetail = (id) => {
        router.get(
            route("kilas-data"),
            { ...activeFilters, id: id },
            { preserveState: true, preserveScroll: true },
        );
    };

    const closeDetail = () => {
        router.get(route("kilas-data"), activeFilters, { preserveState: true });
    };
    const sort = activeFilters?.sort === "asc" ? "asc" : "desc";
    const updateSort = (value) => {
        router.get(
            route("kilas-data"),
            { ...activeFilters, sort: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };
    const applyKeywordFilter = () => {
        router.get(
            route("kilas-data"),
            { ...activeFilters, q: keyword, sort, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <PublicLayout>
            <Head title="Kilas Data" />

            {/* Container Utama: Flex Row (Kiri Kanan) pada layar MD ke atas */}
            <div className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                    {/* === SIDEBAR KIRI (MENU) === */}
                    {/* Menggunakan w-full md:w-1/4 agar split kiri kanan */}
                    <div className="w-full md:w-1/4 lg:w-1/5 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50">
                        {/* Sticky Wrapper: Biar menu diam saat discroll */}
                        <div className="md:sticky md:top-[80px]">
                            <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Database className="w-4 h-4 text-blue-600" />
                                    Katalog Data
                                </h2>
                            </div>

                            <div className="p-3 space-y-1 overflow-y-auto max-h-[280px] md:max-h-[calc(100vh-140px)] custom-scrollbar">
                                {categoryTree.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="border-b border-gray-100 last:border-0 pb-1"
                                    >
                                        <button
                                            onClick={() =>
                                                toggleCategory(cat.id)
                                            }
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                                activeFilters.category ===
                                                cat.id
                                                    ? "text-blue-700 bg-blue-100/50"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span>{cat.label}</span>
                                            {openCategory === cat.id ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>

                                        {openCategory === cat.id && (
                                            <div className="pl-3 mt-1 space-y-0.5 border-l-2 border-gray-200 ml-3">
                                                {cat.subs.map((sub) => (
                                                    <button
                                                        key={sub}
                                                        onClick={() =>
                                                            selectSubCategory(
                                                                cat.id,
                                                                sub,
                                                            )
                                                        }
                                                        className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-all ${
                                                            activeFilters.subcategory ===
                                                            sub
                                                                ? "text-blue-600 font-bold bg-white shadow-sm"
                                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === AREA KANAN (KONTEN) === */}
                    <div className="w-full md:w-3/4 lg:w-4/5 bg-white min-h-[600px]">
                        {selectedData ? (
                            <div className="p-4 sm:p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <button
                                    onClick={closeDetail}
                                    className="mb-6 flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 w-fit"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />{" "}
                                    Kembali ke Daftar
                                </button>

                                {/* HEADER (SELALU MUNCUL) */}
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                        {selectedData.subcategory ||
                                            selectedData.category}
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 leading-tight">
                                        {selectedData.title}
                                    </h1>
                                    <div className="flex items-center text-sm text-gray-400 mt-3 gap-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />{" "}
                                            {new Date(
                                                selectedData.created_at,
                                            ).toLocaleDateString("id-ID")}
                                        </span>
                                        <span>
                                            Sumber:{" "}
                                            {selectedData.pic ||
                                                "BrightNest Data"}
                                        </span>
                                    </div>
                                </div>

                                {/* --- LOGIC LOCKDOWN --- */}
                                {/* Kunci penuh mengikuti status lock dari backend */}
                                {selectedData.is_locked ? (
                                    // TAMPILAN TERKUNCI (FULL)
                                    <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-sm">
                                        <div className="bg-gradient-to-r from-[#0B2A48] via-[#2F63D7] to-[#D414D4] px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-white/15 flex items-center justify-center">
                                                    <Lock className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-white/80">Akses Premium Brightnest</p>
                                                    <p className="text-sm font-bold text-white">Akses data ini sedang terkunci</p>
                                                </div>
                                            </div>
                                            <ApplicationLogo className="h-7 w-auto object-contain" />
                                        </div>

                                        <div className="px-4 py-5 bg-slate-50/80">
                                            <p className="text-sm text-slate-700 text-center">
                                                Untuk melanjutkan, pilih membership atau beli artikel ini secara satuan.
                                            </p>

                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        <Gem className="w-4 h-4 text-blue-600" />
                                                        Paket Tahunan
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-2">Paket tahunan dengan harga lebih hemat.</p>
                                                    <p className="mt-3 text-lg font-extrabold text-slate-900">
                                                        {formatRupiah(yearlyPlan?.amount || 0)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">per tahun</p>
                                                    <a
                                                        href={route("premium.purchase", {
                                                            survey: selectedData.slug,
                                                            mode: "membership",
                                                        })}
                                                        className="mt-3 inline-flex w-full justify-center rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                                                    >
                                                        Pilih Tahunan
                                                    </a>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                                        Paket Bulanan
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-2">Langganan bulanan untuk akses semua konten premium.</p>
                                                    <p className="mt-3 text-lg font-extrabold text-slate-900">
                                                        {formatRupiah(monthlyPlan?.amount || 0)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">per bulan</p>
                                                    <a
                                                        href={route("premium.purchase", {
                                                            survey: selectedData.slug,
                                                            mode: "membership",
                                                        })}
                                                        className="mt-3 inline-flex w-full justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Pilih Bulanan
                                                    </a>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                                                        Beli per Artikel
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                                        Beli akses penuh artikel: "{selectedData.title}".
                                                    </p>
                                                    <p className="mt-3 text-lg font-extrabold text-slate-900">
                                                        {formatRupiah(singlePrice)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">sekali beli</p>
                                                    <a
                                                        href={route("premium.article.purchase", selectedData.slug)}
                                                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Beli Artikel Ini
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                                                <p className="text-xs text-slate-500 mb-2">Metode pembayaran:</p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        QRIS / E-Wallet
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        Transfer Bank
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        Kartu Debit/Kredit
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // TAMPILAN TERBUKA (JIKA LOGIN / GRATIS)
                                    <>
                                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
                                            {(selectedData.chart_type === "table" ||
                                                (chartData && chartData.labels)) ? (
                                                renderChartContent()
                                            ) : (
                                                <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                                                    <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                                                    <p>
                                                        Data visual belum
                                                        tersedia.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="prose max-w-none text-gray-600 text-sm">
                                            <h4 className="font-bold text-gray-900 text-lg mb-2">
                                                Analisis Singkat
                                            </h4>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        selectedData.content ||
                                                        selectedData.notes ||
                                                        "<p>Tidak ada keterangan tambahan.</p>",
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            // VIEW LIST DATA
                            <div className="p-4 sm:p-6 lg:p-10">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                            {activeFilters.subcategory
                                                ? activeFilters.subcategory
                                                : activeFilters.category
                                                  ? activeFilters.category.toUpperCase()
                                                  : "Kilas Data Terbaru"}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Pilih judul untuk melihat grafik.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                applyKeywordFilter();
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            <input
                                                type="text"
                                                value={keyword}
                                                onChange={(e) =>
                                                    setKeyword(e.target.value)
                                                }
                                                placeholder="Cari judul..."
                                                className="w-full sm:w-auto rounded-lg border-gray-300 text-xs"
                                            />
                                        </form>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                            {surveys.total} Data
                                        </span>
                                        <select
                                            value={sort}
                                            onChange={(e) =>
                                                updateSort(e.target.value)
                                            }
                                            className="rounded-lg border-gray-300 text-xs"
                                        >
                                            <option value="desc">
                                                Terbaru (DESC)
                                            </option>
                                            <option value="asc">
                                                Terlama (ASC)
                                            </option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setKeyword("");
                                                router.get(
                                                    route("kilas-data"),
                                                    {
                                                        category:
                                                            activeFilters?.category ||
                                                            "",
                                                        subcategory:
                                                            activeFilters?.subcategory ||
                                                            "",
                                                        sort: "desc",
                                                    },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true,
                                                    },
                                                );
                                            }}
                                            className="px-2 py-1.5 rounded border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {surveys.data.length > 0 ? (
                                        surveys.data.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() =>
                                                    openDetail(item.id)
                                                }
                                                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md hover:bg-white cursor-pointer transition-all bg-white"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <BarChart3 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm md:text-base line-clamp-1">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                            <span className="font-semibold uppercase tracking-wider text-[10px] bg-gray-100 px-1.5 rounded text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                                {item.category}
                                                            </span>
                                                            <span className="hidden md:inline">
                                                                •
                                                            </span>
                                                            <span className="hidden md:inline">
                                                                {new Date(
                                                                    item.created_at,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                )}
                                                            </span>
                                                            {item.is_premium && (
                                                                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold text-[10px] border border-amber-200">
                                                                    PREMIUM
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pl-4">
                                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                            <Database className="w-10 h-10 text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">
                                                Belum ada data di kategori ini.
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Coba pilih kategori lain di menu
                                                kiri.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {surveys.links.length > 3 && (
                                    <div className="mt-8 flex justify-center gap-1 flex-wrap">
                                        {surveys.links
                                            .filter(
                                                (l, i) =>
                                                    i > 0 &&
                                                    i <
                                                        surveys.links.length -
                                                            1,
                                            )
                                            .map((link, i) => (
                                                <Link
                                                    key={i}
                                                    href={link.url}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded border ${
                                                        link.active
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}



