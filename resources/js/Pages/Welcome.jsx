import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import StatsSection from "@/Components/sections/StatsSection";
import ProductSlider from "@/Components/sections/ProductSlider";
import { TrendingUp, FileText, Newspaper, BadgeCheck } from "lucide-react";

export default function Welcome({
    heroArticle,
    kilasData,
    fokusUtama,
    kabarTepi,
    publikasiRiset,
    categories = [],
}) {
    const { auth } = usePage().props;
    const premiumHref = auth?.user
        ? route("premium.purchase")
        : route("login");
    const premiumCtaLabel = auth?.user ? "Lihat Paket Premium" : "Login untuk Premium";

    // Data untuk Hero Component
    const heroData = {
        featuredArticle: heroArticle
            ? { ...heroArticle, slug: heroArticle.slug || heroArticle.id }
            : null,
        categories,
    };
    const formatData = (data) => {
        const safeData = Array.isArray(data) ? data : [];
        return safeData.map((item) => ({
            ...item,
            // Prioritaskan slug, jika tidak ada gunakan ID (untuk backward compatibility)
            slug: item.slug || item.id,
        }));
    };

    return (
        <PublicLayout heroData={heroData}>
            <Head title="Brightnest Institute - Pusat Data Daerah" />

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

                {/* 4. PRODUK: BERITA */}
                <ProductSlider
                    title="Berita"
                    subtitle="Isu terkini dan perkembangan kebijakan publik."
                    data={formatData(kabarTepi)} // <--- GUNAKAN formatData DI SINI
                    linkUrl={route("berita")}
                    linkText="Lihat Semua Berita"
                    bgColor="bg-slate-50"
                    icon={<Newspaper className="w-6 h-6" />}
                />

                <ProductSlider
                    title="Publikasi Riset"
                    subtitle="Rilis riset, ringkasan temuan, dan dokumen publikasi terbaru."
                    data={formatData(publikasiRiset)}
                    linkUrl={route("surveys.index", { type: "publikasi_riset" })}
                    linkText="Lihat Semua Publikasi"
                    bgColor="bg-white"
                    icon={<BadgeCheck className="w-6 h-6" />}
                    keepPublicationPremiumImageVisible
                />

                {/* 5. CTA: PENUTUP */}
                <div className="py-16 sm:py-20 lg:py-24 bg-[#0B1120] text-center relative overflow-hidden">
                    {/* Dekorasi Blur */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 px-4">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-6">
                            Butuh Data Spesifik untuk Riset?
                        </h2>
                        <p className="text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
                            Kami menyediakan layanan pengolahan data kustom dan
                            konsultasi riset untuk instansi pemerintahan dan
                            swasta.
                        </p>
                        <button className="w-full sm:w-auto bg-white text-slate-900 font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-full hover:bg-blue-50 hover:scale-[1.02] sm:hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                            Hubungi Tim Riset
                        </button>
                    </div>
                </div>

                <div className="py-14 sm:py-16 lg:py-20 bg-white border-t border-slate-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                                <BadgeCheck className="w-4 h-4" />
                                Premium Access
                            </div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                                Cara Berlangganan Premium Brightnest Institute
                            </h3>
                            <p className="text-slate-600 max-w-3xl mx-auto">
                                Akses penuh artikel premium, analisis lanjutan,
                                dan data eksklusif dengan pembayaran Xendit yang
                                aman.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                                <p className="text-xs font-bold text-emerald-700 mb-2">
                                    LANGKAH 1
                                </p>
                                <h4 className="font-bold text-slate-900 mb-1">
                                    Login / Daftar
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Masuk ke akun Anda terlebih dahulu.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                                <p className="text-xs font-bold text-emerald-700 mb-2">
                                    LANGKAH 2
                                </p>
                                <h4 className="font-bold text-slate-900 mb-1">
                                    Pilih Metode Bayar
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Pilih channel pembayaran yang tersedia di Xendit.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                                <p className="text-xs font-bold text-emerald-700 mb-2">
                                    LANGKAH 3
                                </p>
                                <h4 className="font-bold text-slate-900 mb-1">
                                    Selesaikan Pembayaran
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Lanjutkan checkout hingga status sukses di Xendit.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                                <p className="text-xs font-bold text-emerald-700 mb-2">
                                    LANGKAH 4
                                </p>
                                <h4 className="font-bold text-slate-900 mb-1">
                                    Akses Aktif Otomatis
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Sistem akan mengaktifkan akses premium secara otomatis.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href={premiumHref}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition text-center"
                            >
                                {premiumCtaLabel}
                            </Link>
                            <span className="text-sm text-slate-500 text-center">
                                Aktivasi dilakukan otomatis saat transaksi berstatus sukses.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
