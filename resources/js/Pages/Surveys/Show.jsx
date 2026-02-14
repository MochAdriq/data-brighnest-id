import React from "react";
import { Head } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Calendar, User, Eye, BarChart3, Hash, Lock } from "lucide-react";
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
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 99, 132, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
];

export default function Show({ article, chartData }) {
    // 1. TENTUKAN LABEL (Untuk Breadcrumb)
    const typeLabel = {
        series: { label: "Kilas Data", url: route("kilas-data") },
        story: { label: "Fokus Utama", url: route("fokus-utama") },
        news: { label: "Kabar Tepi", url: route("kabar-tepi") },
    };
    const currentLabel = typeLabel[article.type] || {
        label: "Detail Data",
        url: "#",
    };

    // (Bagian 'renderChart' Tetap Sama)
    const renderChart = (label, rawData) => {
        const data = {
            labels: rawData.labels,
            datasets: [
                {
                    label: "Nilai Data",
                    data: rawData.values,
                    backgroundColor: chartColors,
                    borderColor: chartColors.map((c) => c.replace("0.7", "1")),
                    borderWidth: 1,
                },
            ],
        };
        const options = {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: label },
            },
        };
        return <Bar data={data} options={options} />;
    };

    return (
        // 2. KIRIM PROPS 'pageLabel' KE LAYOUT
        <PublicLayout pageLabel={currentLabel}>
            <Head title={article.title} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Meta (Kategori & Tanggal) */}
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

                {/* Judul Besar */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                    {article.title}
                </h1>

                {/* Penulis */}
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
                </div>

                {/* Logic Premium Lock & Chart */}
                {article.is_premium && Object.keys(chartData).length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center mb-10">
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
                    chartData &&
                    Object.keys(chartData).length > 0 && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 sm:p-8 mb-10">
                            <div className="flex items-center mb-6">
                                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">
                                        Data Insight
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Visualisasi data interaktif.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                {Object.entries(chartData).map(
                                    ([key, data]) => (
                                        <div
                                            key={key}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                                        >
                                            {renderChart(key, data)}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )
                )}

                {/* Konten Artikel (Rich Text) */}
                <article className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed break-words overflow-hidden">
                    <div
                        dangerouslySetInnerHTML={{
                            __html:
                                article.content ||
                                "<p>Tidak ada narasi tertulis.</p>",
                        }}
                    />
                </article>
            </div>
        </PublicLayout>
    );
}
