import React from "react";
import { Head, usePage } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Calendar, User, Eye, BarChart3, Lock } from "lucide-react";
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

// 1. Registrasi Semua Komponen Grafik
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
    "rgba(54, 162, 235, 0.7)", // Biru
    "rgba(255, 99, 132, 0.7)", // Merah
    "rgba(255, 206, 86, 0.7)", // Kuning
    "rgba(75, 192, 192, 0.7)", // Hijau Teal
    "rgba(153, 102, 255, 0.7)", // Ungu
    "rgba(255, 159, 64, 0.7)", // Orange
];

export default function Show({ article, chartData }) {
    // 2. Breadcrumb & Label Dinamis
    const typeLabel = {
        series: { label: "Kilas Data", url: route("kilas-data") },
        story: { label: "Fokus Utama", url: route("fokus-utama") },
        news: { label: "Kabar Tepi", url: route("kabar-tepi") },
    };
    const currentParent = typeLabel[article.type] || {
        label: "Detail Data",
        url: "#",
    };

    // --- FIX ERROR WHITE SCREEN ---
    // Gunakan optional chaining (?.) agar tidak crash jika auth undefined
    const { auth } = usePage().props;
    const isLocked = article.is_premium && !auth?.user;
    // -----------------------------

    // 3. Logic: Apakah Artikel Ini Punya Data?
    const hasDataFile = article.file_path !== null;

    // 4. Logic Render Grafik Cerdas
    const renderChart = (label, rawData) => {
        const chartType = article.chart_type || "bar";
        const isInteractive =
            article.is_interactive === 1 || article.is_interactive === true;

        // --- MODE TABEL ---
        if (chartType === "table") {
            const fullData = article.csv_data || [];
            const headers = fullData.length > 0 ? Object.keys(fullData[0]) : [];

            return (
                <div className="w-full my-4">
                    <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-200 rounded-xl shadow-sm custom-scrollbar">
                        <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b sticky top-0 z-10">
                                <tr>
                                    {headers.map((header, idx) => (
                                        <th
                                            key={idx}
                                            className="px-6 py-4 font-bold text-blue-800 bg-gray-100 border-r border-gray-200 last:border-r-0"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fullData.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="bg-white border-b hover:bg-blue-50 transition-colors"
                                    >
                                        {headers.map((colKey, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className="px-6 py-4 border-r border-gray-100 last:border-r-0 font-mono text-gray-700"
                                            >
                                                {row[colKey]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 italic text-right">
                        * Geser tabel untuk melihat kolom lainnya
                    </div>
                </div>
            );
        }

        // --- PREPARE DATA & OPTIONS ---
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: label,
                    font: { size: 16 },
                },
                tooltip: { enabled: isInteractive },
            },
            hover: {
                mode: isInteractive ? "nearest" : null,
                intersect: isInteractive,
            },
            // FIX: Pie chart scales
            scales:
                chartType === "pie"
                    ? {}
                    : {
                          x: { display: true },
                          y: { beginAtZero: true },
                      },
        };

        const data = {
            // FIX: Tambahkan .map(String) agar Pie Chart tidak error baca angka
            labels: rawData.labels.map(String),
            datasets: [
                {
                    label: "Nilai Data",
                    data: rawData.values,
                    backgroundColor:
                        chartType === "pie"
                            ? chartColors
                            : chartColors.map((c) => c.replace("0.7", "1")),
                    borderColor: chartColors.map((c) => c.replace("0.7", "1")),
                    borderWidth: 1,
                    tension: 0.3,
                    fill: chartType === "line",
                },
            ],
        };

        const containerClass =
            "h-[350px] w-full flex justify-center items-center p-2";

        if (chartType === "pie")
            return (
                <div className={containerClass}>
                    <Pie data={data} options={options} />
                </div>
            );
        if (chartType === "line")
            return (
                <div className={containerClass}>
                    <Line data={data} options={options} />
                </div>
            );
        return (
            <div className={containerClass}>
                <Bar data={data} options={options} />
            </div>
        );
    };

    return (
        <PublicLayout
            pageLabel={currentParent.label}
            parentPage={currentParent}
        >
            <Head title={article.title} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* A. Header Meta */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {article.category}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" },
                        )}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                    {article.title}
                </h1>

                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                                {article.pic || "Redaksi"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Data Journalist
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views || 0} views
                    </div>
                </div>

                {/* --- TOTAL LOCKDOWN AREA --- */}
                {isLocked ? (
                    // TAMPILAN TERKUNCI (MENGGANTIKAN DATA & KONTEN)
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-12 text-center shadow-sm">
                        <div className="inline-flex bg-amber-100 p-5 rounded-full mb-6 ring-4 ring-amber-50">
                            <Lock className="w-10 h-10 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Konten Premium Terkunci
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                            Maaf, analisis mendalam dan visualisasi data lengkap
                            pada artikel ini hanya tersedia untuk anggota
                            premium. Silakan masuk atau berlangganan untuk akses
                            penuh.
                        </p>
                        <div className="flex justify-center gap-4">
                            <a
                                href={route("login")}
                                className="px-6 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-200"
                            >
                                Login Sekarang
                            </a>
                            <button className="px-6 py-3 rounded-xl bg-white text-amber-700 border border-amber-200 font-bold hover:bg-amber-50 transition">
                                Berlangganan
                            </button>
                        </div>
                    </div>
                ) : (
                    // TAMPILAN TERBUKA (JIKA LOGIN ATAU GRATIS)
                    <>
                        {/* B. AREA VISUALISASI DATA */}
                        {hasDataFile && (
                            <div className="mb-10">
                                {chartData &&
                                    Object.keys(chartData).length > 0 && (
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 sm:p-8">
                                            <div className="flex items-center mb-6">
                                                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-900">
                                                        Data Insight
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {article.is_interactive
                                                            ? "Visualisasi interaktif (Sentuh grafik untuk detail)."
                                                            : "Visualisasi data statis."}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-8">
                                                {Object.entries(chartData).map(
                                                    ([key, data]) => (
                                                        <div
                                                            key={key}
                                                            className="bg-white p-2 rounded-xl shadow-sm border border-gray-100"
                                                        >
                                                            {renderChart(
                                                                key,
                                                                data,
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* C. KONTEN ARTIKEL */}
                        <article className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed break-words overflow-hidden">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        article.content ||
                                        "<p>Tidak ada narasi tertulis.</p>",
                                }}
                            />
                        </article>

                        {/* D. CATATAN TEKNIS */}
                        {article.notes && (
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">
                                    Catatan Teknis:
                                </h4>
                                <p className="text-sm text-gray-500 italic">
                                    {article.notes}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
