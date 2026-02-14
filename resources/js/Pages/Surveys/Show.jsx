import React from "react";
import { Head } from "@inertiajs/react";
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

    // 3. Logic: Apakah Artikel Ini Punya Data?
    // Kita cek file_path. Jika null, berarti artikel teks biasa.
    const hasDataFile = article.file_path !== null;

    // 4. Logic Render Grafik Cerdas
    const renderChart = (label, rawData) => {
        // Ambil Settingan dari Database (Default: Bar & Hidup)
        const chartType = article.chart_type || "bar";
        const isInteractive =
            article.is_interactive === 1 || article.is_interactive === true;

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
                tooltip: { enabled: isInteractive }, // Matikan tooltip jika statis
            },
            hover: {
                mode: isInteractive ? "nearest" : null, // Matikan hover jika statis
                intersect: isInteractive,
            },
            scales: {
                // Pie chart tidak butuh sumbu X/Y
                x: { display: chartType !== "pie" },
                y: { display: chartType !== "pie" },
            },
        };

        const data = {
            labels: rawData.labels,
            datasets: [
                {
                    label: "Nilai Data",
                    data: rawData.values,
                    backgroundColor: chartColors,
                    borderColor: chartColors.map((c) => c.replace("0.7", "1")),
                    borderWidth: 1,
                    tension: 0.3, // Kelengkungan garis (Line Chart)
                    fill: chartType === "line", // Area bawah garis (Line Chart)
                },
            ],
        };

        // Render Sesuai Pilihan Admin
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
                    {/* View Count */}
                    <div className="flex items-center text-gray-400 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views || 0} views
                    </div>
                </div>

                {/* B. AREA VISUALISASI DATA (Hanya muncul jika ada file) */}
                {hasDataFile ? (
                    <div className="mb-10">
                        {article.is_premium &&
                        Object.keys(chartData).length === 0 ? (
                            // TAMPILAN TERKUNCI (PREMIUM)
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center">
                                <div className="inline-flex bg-amber-100 p-4 rounded-full mb-4">
                                    <Lock className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Data Terkunci (Premium)
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Visualisasi data detail hanya tersedia untuk
                                    pelanggan premium.
                                </p>
                                <button className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-700 transition">
                                    Berlangganan Sekarang
                                </button>
                            </div>
                        ) : (
                            // TAMPILAN GRAFIK (TERBUKA)
                            chartData &&
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
                                                    {renderChart(key, data)}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : null}
                {/* Jika tidak ada file, Area B hilang total (bersih) */}

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

                {/* D. CATATAN TEKNIS (Jika Ada) */}
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
            </div>
        </PublicLayout>
    );
}
