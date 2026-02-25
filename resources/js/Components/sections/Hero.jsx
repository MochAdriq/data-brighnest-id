import React, { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Link, router } from "@inertiajs/react";

const Hero = ({ featuredArticle, categories = [] }) => {
    // State untuk Search
    const [keyword, setKeyword] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            router.get("/search", { q: keyword });
        }
    };

    return (
        <section className="relative w-full bg-[#0B1120] pb-16 sm:pb-20 lg:pb-24 pt-14 sm:pt-16 lg:pt-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[280px] sm:w-[500px] sm:h-[420px] lg:w-[600px] lg:h-[500px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-purple-600/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Data Brightnest.
                            </span>
                        </h1>
                        <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-white/90">
                            Pusat Intelijen Data Daerah
                        </h2>
                    </div>

                    <p className="text-sm sm:text-base md:text-lg text-slate-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Akses ribuan dataset strategis dan riset mendalam untuk
                        akselerasi keputusan Anda.
                    </p>

                    {/* === 3. SEARCH BAR (Putih Kontras) === */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8 sm:mb-10 group">
                        {/* Ikon Search */}
                        <div className="absolute left-4 top-4 sm:top-1/2 sm:-translate-y-1/2 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>

                        {/* Input Field */}
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Cari data, misal: 'Kemiskinan' atau 'Infrastruktur'"
                            className="w-full pl-12 sm:pl-14 pr-4 sm:pr-36 py-3.5 sm:py-4 rounded-2xl sm:rounded-full border-0 bg-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] focus:ring-4 focus:ring-blue-500/30 text-gray-800 placeholder:text-gray-400 text-sm sm:text-base transition-all"
                        />

                        {/* Tombol Cari */}
                        <button
                            type="submit"
                            className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 w-full sm:w-auto bg-blue-600 text-white px-5 sm:px-8 py-3 sm:py-0 rounded-xl sm:rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
                        >
                            Cari
                        </button>
                    </form>

                    {/* === 4. TAG CLOUD (Glassmorphism) === */}
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Topik Populer:
                        </span>

                        <div className="flex flex-wrap justify-center gap-2 px-1">
                            {categories.length > 0 ? (
                                categories.slice(0, 5).map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-medium rounded-full hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                                    >
                                        {cat.name}
                                    </Link>
                                ))
                            ) : (
                                <span className="text-xs text-gray-500 italic">
                                    Belum ada topik trending.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
