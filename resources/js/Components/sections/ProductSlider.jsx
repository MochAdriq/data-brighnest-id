import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import DataCard from "@/Components/ui/DataCard";

export default function ProductSlider({
    title,
    subtitle,
    data,
    linkUrl,
    linkText = "Lihat Semua",
    bgColor = "bg-white",
    icon,
}) {
    const scrollRef = useRef(null);

    // Logic Scroll Manual
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 350; // Lebar 1 kartu + gap
            if (direction === "left") {
                current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    // Format Data untuk Card
    const formatItem = (item) => ({
        id: item.id,
        slug: item.slug || item.id, // <--- Prioritaskan Slug dari database!
        title: item.title,
        type: item.type, // <--- TAMBAHKAN INI
        category: item.category,
        author: item.pic || "Tim Data",
        date: new Date(item.created_at).toLocaleDateString("id-ID"),
        image: item.image ? `/storage/${item.image}` : null,
        views: item.views || 0,
        excerpt: item.notes || "",
        isPremium: item.is_premium,
    });

    if (!data || data.length === 0) return null;

    return (
        <section className={`py-16 ${bgColor} relative group/section`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 1. HEADER CENTERED (Sesuai Referensi tapi Lebih Modern) */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    {icon && (
                        <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-lg text-blue-600 mb-4">
                            {icon}
                        </div>
                    )}

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-gray-500 text-lg mb-4">{subtitle}</p>
                    <Link
                        href={linkUrl}
                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {linkText} <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {/* 2. SLIDER AREA */}
                <div className="relative">
                    {/* Tombol Navigasi Kiri (Floating Glass) */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover/section:opacity-100 hidden md:flex"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Track Kartu */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 px-2 -mx-2 snap-x snap-mandatory hide-scrollbar justify-center"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {data.map((item) => (
                            <div
                                key={item.id}
                                className="min-w-[280px] md:min-w-[340px] snap-center"
                            >
                                {/* Bungkus Card biar ada efek hover naik */}
                                <div className="h-full transform transition-transform duration-300 hover:-translate-y-2">
                                    <DataCard item={formatItem(item)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tombol Navigasi Kanan (Floating Glass) */}
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover/section:opacity-100 hidden md:flex"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
}
