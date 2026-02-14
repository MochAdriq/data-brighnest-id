import React from "react";
import { Head } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import StatsSection from "@/Components/sections/StatsSection";
import ProductSlider from "@/Components/sections/ProductSlider";
import { TrendingUp, FileText, Newspaper } from "lucide-react";

export default function Welcome({
    heroArticle,
    kilasData,
    fokusUtama,
    kabarTepi,
}) {
    // Data untuk Hero Component
    const heroData = {
        featuredArticle: heroArticle
            ? { ...heroArticle, slug: heroArticle.slug || heroArticle.id }
            : null,
    };
    const formatData = (data) => {
        return data.map((item) => ({
            ...item,
            // Prioritaskan slug, jika tidak ada gunakan ID (untuk backward compatibility)
            slug: item.slug || item.id,
        }));
    };

    return (
        <PublicLayout heroData={heroData}>
            <Head title="Brightnest - Pusat Data Daerah" />

            <div className="min-h-screen bg-white font-sans">
                {/* 1. HOOKS: KENAPA BRIGHTNEST? */}
                <StatsSection />

                {/* 2. PRODUK: KILAS DATA (Highlight Utama) */}
                <ProductSlider
                    title="Kilas Data"
                    subtitle="Indikator strategis daerah dalam format grafik visual."
                    data={formatData(kilasData)} // <--- GUNAKAN formatData DI SINI
                    linkUrl={route("kilas-data")}
                    linkText="Buka Dashboard Data"
                    bgColor="bg-slate-50"
                    icon={<TrendingUp className="w-6 h-6" />}
                />

                {/* 3. PRODUK: FOKUS UTAMA (Artikel Mendalam) */}
                <ProductSlider
                    title="Fokus Utama"
                    subtitle="Analisis mendalam dan cerita di balik angka."
                    data={formatData(fokusUtama)} // <--- GUNAKAN formatData DI SINI
                    linkUrl={route("fokus-utama")}
                    linkText="Baca Analisis Lainnya"
                    bgColor="bg-white"
                    icon={<FileText className="w-6 h-6" />}
                />

                {/* 4. PRODUK: KABAR TEPI (Berita Ringan) */}
                <ProductSlider
                    title="Kabar Tepi"
                    subtitle="Isu terkini dan perkembangan kebijakan publik."
                    data={formatData(kabarTepi)} // <--- GUNAKAN formatData DI SINI
                    linkUrl={route("kabar-tepi")}
                    linkText="Lihat Semua Berita"
                    bgColor="bg-slate-50"
                    icon={<Newspaper className="w-6 h-6" />}
                />

                {/* 5. CTA: PENUTUP */}
                <div className="py-24 bg-[#0B1120] text-center relative overflow-hidden">
                    {/* Dekorasi Blur */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 px-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                            Butuh Data Spesifik untuk Riset?
                        </h2>
                        <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
                            Kami menyediakan layanan pengolahan data kustom dan
                            konsultasi riset untuk instansi pemerintahan dan
                            swasta.
                        </p>
                        <button className="bg-white text-slate-900 font-bold py-4 px-10 rounded-full hover:bg-blue-50 hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                            Hubungi Tim Riset
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
