import React from "react";
import {
    Lock,
    BarChart3,
    TrendingUp,
    Eye,
    User,
    Calendar,
    Layers,
} from "lucide-react"; // Tambah icon Layers
import { Link } from "@inertiajs/react";

const DataCard = ({ item }) => {
    // 1. Helper Warna Kategori
    const getCategoryColor = (cat) => {
        const category = cat?.toLowerCase() || "";
        if (category.includes("ekonomi") || category.includes("finance"))
            return "bg-green-600";
        if (category.includes("politik") || category.includes("pemerintahan"))
            return "bg-red-600";
        if (category.includes("teknologi") || category.includes("digital"))
            return "bg-blue-600";
        if (category.includes("pendidikan") || category.includes("sosial"))
            return "bg-yellow-500";
        if (category.includes("infrastruktur")) return "bg-slate-700";
        if (category.includes("kesehatan")) return "bg-teal-500";
        return "bg-blue-700";
    };

    // 2. Helper Label Produk (BARU)
    const getProductLabel = (type) => {
        switch (type) {
            case "series":
                return {
                    label: "Kilas Data",
                    color: "bg-purple-100 text-purple-700 border-purple-200",
                };
            case "story":
                return {
                    label: "Fokus Utama",
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                };
            case "news":
                return {
                    label: "Kabar Tepi",
                    color: "bg-green-100 text-green-700 border-green-200",
                };
            default:
                return null;
        }
    };

    const getTargetLink = () => {
        // 1. Kalau tipe-nya 'series' (Kilas Data), arahkan ke dashboard split view
        if (item.type === "series") {
            // Kita pakai Query Parameter (?slug=...)
            return `/kilas-data?slug=${item.slug || item.id}`;
        }

        // 2. Kalau tipe lain (Story/News), arahkan ke halaman baca biasa
        return route("surveys.show", item.slug || item.id);
    };

    const productInfo = getProductLabel(item.type);

    return (
        // GANTI BAGIAN INI:
        <Link
            // Perbaikan: Prioritaskan slug, kalau ga ada pake id. Jangan kasih '#'
            href={getTargetLink()} // <--- PANGGIL FUNGSI DI SINI
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
        >
            {/* BAGIAN GAMBAR */}
            <div className="relative h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                {item.image && !item.image.includes("default") ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                        <BarChart3 className="w-16 h-16 text-slate-300 mb-2" />
                    </div>
                )}

                {/* Fallback Element */}
                <div className="hidden w-full h-full absolute inset-0 bg-slate-50 flex-col items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-slate-300" />
                </div>

                {/* Badge Kategori (Pojok Kanan Atas) */}
                <span
                    className={`absolute top-3 right-3 ${getCategoryColor(item.category)} text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide z-10 shadow-sm`}
                >
                    {item.category}
                </span>

                {/* Badge Premium */}
                {item.isPremium && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-20">
                        <div className="bg-white/20 p-3 rounded-full mb-2 backdrop-blur-md">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-wide">
                            Premium Data
                        </span>
                    </div>
                )}
            </div>

            {/* BAGIAN KONTEN */}
            <div className="p-5 flex flex-col flex-grow">
                {/* LABEL PRODUK (BARU - Di atas Judul) */}
                {productInfo && (
                    <div className="mb-2">
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${productInfo.color}`}
                        >
                            {productInfo.label}
                        </span>
                    </div>
                )}

                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {item.excerpt}
                </p>

                <div className="text-xs text-gray-400 font-medium pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                        </div>
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">
                                {item.author}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                        <Eye className="w-3 h-3" /> {item.views}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DataCard;
