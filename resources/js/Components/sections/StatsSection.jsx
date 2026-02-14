import React from "react";
import {
    PieChart,
    Search,
    Download,
    Database,
    Layers,
    FileText,
} from "lucide-react";

export default function StatsSection() {
    // Data Fitur (Kiri)
    const features = [
        {
            icon: <PieChart className="w-8 h-8 text-blue-600" />,
            title: "Agregasi Data Komprehensif",
            desc: "Akses ribuan sumber terpercaya pemerintah daerah dalam satu tempat.",
        },
        {
            icon: <Search className="w-8 h-8 text-blue-600" />,
            title: "Insight Survei Eksklusif",
            desc: "Dataset unik hasil riset mandiri yang tidak akan Anda temukan di tempat lain.",
        },
        {
            icon: <Download className="w-8 h-8 text-blue-600" />,
            title: "Format Fleksibel",
            desc: "Unduh dalam XLS, PNG, PDF, atau embed grafik dengan mudah.",
        },
        {
            icon: <Database className="w-8 h-8 text-blue-600" />,
            title: "Cakupan Luas",
            desc: "Jutaan data point mencakup indikator ekonomi, sosial, hingga infrastruktur.",
        },
    ];

    // Data Fakta (Kanan)
    const stats = {
        top: [
            { value: "5.000+", label: "Data Series" },
            { value: "50+", label: "Sumber Data Resmi" },
        ],
        middleHeader: "Kilas Data kami mencakup data dari:",
        middle: [
            { value: "100K+", label: "Entri Data" },
            { value: "12", label: "Sektor Utama" },
            { value: "27", label: "Kecamatan" },
        ],
        bottom: [
            { value: "7", label: "Kategori Utama" },
            { value: "35", label: "Subkategori" },
        ],
    };

    return (
        <section className="bg-white py-20 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                                Kenapa Pilih Data BrightNest?
                            </h2>
                            <p className="text-gray-500 font-medium">
                                Solusi Data Satu Pintu Sukabumi
                            </p>
                        </div>

                        {/* Grid Fitur 2x2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                            {features.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="bg-orange-50 p-4 rounded-lg mb-4 border border-orange-100">
                                        {/* Saya pakai background orange tipis biar mirip referensi, ikon tetap biru brand kita */}
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* === PEMISAH (GARIS VERTIKAL) === */}
                    <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-4"></div>

                    {/* === BAGIAN KANAN: FAKTA BRIGHTNEST === */}
                    <div className="w-full lg:w-1/2 lg:pl-12 flex flex-col justify-center">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                Fakta Data BrightNest
                            </h2>
                        </div>

                        {/* Stats Row 1 */}
                        <div className="flex justify-center gap-16 mb-8">
                            {stats.top.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats Middle Header */}
                        <div className="text-center mb-6">
                            <h4 className="font-bold text-gray-800 text-lg">
                                {stats.middleHeader}
                            </h4>
                        </div>

                        {/* Stats Row 2 (3 Kolom) */}
                        <div className="grid grid-cols-3 gap-4 text-center mb-8">
                            {stats.middle.map((stat, i) => (
                                <div key={i}>
                                    <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats Row 3 (2 Kolom Bawah) */}
                        <div className="flex justify-center gap-16">
                            {stats.bottom.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold text-gray-800 mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
