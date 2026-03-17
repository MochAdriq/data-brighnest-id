import React, { useState } from "react";
import { PlayCircle, Search, TrendingUp } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";

const Hero = ({ featuredArticle, categories = [] }) => {
    const [keyword, setKeyword] = useState("");
    const { auth } = usePage().props;
    const heroBackgroundImage = "/images/hero-background.webp";
    const heroFallbackImage = "/images/hero/hero-fallback.svg";
    const premiumHref = auth?.user ? route("premium.purchase") : route("login");

    const featuredImage = featuredArticle?.image
        ? `/storage/${featuredArticle.image}`
        : "/images/default-news.jpg";
    const featuredType = featuredArticle?.type
        ? featuredArticle.type.replace(/_/g, " ")
        : "Panduan Platform";
    const featuredTitle =
        featuredArticle?.title ||
        "Tutorial eksplorasi data, analisis, dan kajian strategis Brightnest Institute";

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            router.get("/search", { q: keyword });
        }
    };

    return (
        <section
            className="relative w-full pb-16 sm:pb-20 lg:pb-24 pt-14 sm:pt-16 lg:pt-20 overflow-hidden bg-[#0B1120] bg-cover bg-center"
            style={{
                backgroundImage: `linear-gradient(112deg, rgba(2,8,23,0.9) 12%, rgba(18,39,94,0.8) 48%, rgba(73,23,108,0.64) 100%), url('${heroBackgroundImage}'), url('${heroFallbackImage}')`,
            }}
        >
            <div className="hero-glow absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.24),transparent_48%),radial-gradient(circle_at_86%_82%,rgba(236,201,75,0.24),transparent_45%)]" />
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_0.94fr] items-center gap-8 lg:gap-12">
                    <div className="text-left">
                        <div className="mb-5 sm:mb-6">
                            <h1 className="hero-fade-up hero-delay-1 hero-title-wrap text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-tight tracking-tight mb-2">
                                <span className="hero-title-solid">
                                    Brightnest Institute
                                </span>
                                <span
                                    className="hero-title-gradient"
                                    aria-hidden="true"
                                >
                                    Brightnest Institute
                                </span>
                            </h1>
                            <h2 className="hero-fade-up hero-delay-2 text-lg sm:text-xl md:text-2xl font-semibold text-slate-100">
                                Welcome to Brightnest Institute
                            </h2>
                        </div>

                        <p className="hero-fade-up hero-delay-3 text-sm sm:text-base md:text-lg text-slate-200/90 mb-7 sm:mb-8 max-w-2xl leading-relaxed">
                            Telusuri data hasil survei, analisis hingga kajian
                            strategis dalam satu platform terpadu untuk memahami
                            dinamika ekonomi, masyarakat, dan kebijakan.
                        </p>

                        <div className="hero-fade-up hero-delay-4 flex flex-col sm:flex-row gap-3 sm:gap-4 mb-7">
                            <Link
                                href={premiumHref}
                                className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 font-bold text-slate-950 shadow-[0_12px_30px_-10px_rgba(245,158,11,0.75)] transition-all hover:from-amber-300 hover:via-yellow-200 hover:to-amber-400 hover:shadow-[0_20px_36px_-14px_rgba(245,158,11,0.8)]"
                            >
                                Berlangganan Sekarang
                            </Link>

                            <form
                                onSubmit={handleSearch}
                                className="relative flex-1 max-w-xl group"
                            >
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Cari data di sini"
                                    className="h-[52px] w-full rounded-xl border border-white/35 bg-slate-900/35 pl-12 pr-24 text-sm sm:text-base text-white placeholder:text-slate-300/90 backdrop-blur-sm focus:border-amber-300 focus:ring-4 focus:ring-amber-300/25 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-500/25 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-500/40 transition-colors"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>

                        <div className="hero-fade-up hero-delay-5 flex flex-col gap-3">
                            <span className="text-xs sm:text-sm font-bold text-slate-200/90 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Topik
                                Populer:
                            </span>

                            <div className="flex flex-wrap gap-2">
                                {categories.length > 0 ? (
                                    categories.slice(0, 5).map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className="px-3.5 py-2 bg-white/10 border border-white/20 text-slate-100 text-sm font-medium rounded-full hover:bg-amber-500 hover:border-amber-400 hover:text-slate-950 transition-all cursor-pointer backdrop-blur-md"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-300 italic">
                                        Belum ada topik trending.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block hero-fade-up hero-delay-4">
                        <div className="hero-float relative overflow-hidden rounded-2xl border border-amber-200/40 bg-slate-900/35 shadow-[0_30px_80px_-35px_rgba(15,23,42,1)] backdrop-blur-md">
                            <img
                                src={featuredImage}
                                alt={featuredTitle}
                                className="h-[320px] w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/90 mb-2">
                                    {featuredType}
                                </p>
                                <h3 className="text-2xl font-extrabold text-white leading-tight mb-3 line-clamp-2">
                                    {featuredTitle}
                                </h3>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                    <PlayCircle className="h-4 w-4" />
                                    Lihat Highlight
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 w-full overflow-hidden leading-none z-[5]">
                <svg
                    className="block w-full h-[56px] sm:h-[72px] lg:h-[84px]"
                    viewBox="0 0 1440 140"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d="M0 74 C 140 58 260 96 420 102 C 620 110 820 20 980 34 C 1120 46 1260 74 1440 58 L1440 140 L0 140 Z"
                        fill="#FFFFFF"
                    />
                    <path
                        d="M0 74 C 70 66 140 62 220 72"
                        fill="none"
                        stroke="#1E3A8A"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M0 74 C 140 58 260 96 420 102 C 620 110 820 20 980 34 C 1120 46 1260 74 1440 58"
                        fill="none"
                        stroke="#1E3A8A"
                        strokeWidth="4"
                    />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
