import React from "react";
import Navbar from "@/Components/sections/Navbar";
import Footer from "@/Components/sections/Footer";
import Hero from "@/Components/sections/Hero";
import { Head, Link, usePage } from "@inertiajs/react";
import { Home, ChevronRight } from "lucide-react";

// TERIMA PROPS 'parentPage' JUGA
export default function PublicLayout({
    children,
    heroData,
    pageLabel,
    parentPage,
}) {
    const { url, props } = usePage();
    const navCategories = props.globalCategories || [];

    const renderBreadcrumb = () => {
        if (url === "/" || heroData) return null;

        // Bersihkan URL dari query param (?page=1 dst)
        const path = url.split("?")[0];
        const parts = path.split("/").filter((part) => part !== "");

        const labels = {
            "kilas-data": "Kilas Data",
            "fokus-utama": "Fokus Utama",
            "kabar-tepi": "Kabar Tepi",
            search: "Pencarian",
            category: "Topik",
            login: "Masuk",
            register: "Daftar",
            surveys: "Detail Data",
            data: "Detail Data",
        };

        return (
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap">
                        <Link
                            href="/"
                            className="hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                            <Home className="w-4 h-4 mb-0.5" />
                            <span>Beranda</span>
                        </Link>

                        {parts.map((part, index) => {
                            let linkPath = `/${parts.slice(0, index + 1).join("/")}`;

                            // Default Label dari Kamus atau URL
                            let label =
                                labels[part] ||
                                decodeURIComponent(part).replace(/-/g, " ");
                            label =
                                label.charAt(0).toUpperCase() + label.slice(1);

                            const isLast = index === parts.length - 1;

                            // --- LOGIC 1: OVERRIDE PARENT (KATEGORI) ---
                            // Jika ini bukan yang terakhir, dan kita punya data parentPage
                            // Biasanya ini bagian 'surveys' atau 'data'
                            if (
                                !isLast &&
                                (part === "surveys" || part === "data") &&
                                parentPage
                            ) {
                                label = parentPage.label; // Contoh: "Kilas Data"
                                linkPath = parentPage.url;
                            }

                            // --- LOGIC 2: OVERRIDE CURRENT PAGE (JUDUL ARTIKEL) ---
                            // Jika ini adalah bagian terakhir URL, dan ada pageLabel (Judul)
                            if (isLast && pageLabel) {
                                label = pageLabel; // Contoh: "Judul Artikel Panjang..."
                            }

                            return (
                                <React.Fragment key={index}>
                                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                                    {isLast ? (
                                        <span
                                            className="text-blue-600 font-bold max-w-[140px] sm:max-w-[260px] truncate"
                                            title={label}
                                        >
                                            {label}
                                        </span>
                                    ) : (
                                        <Link
                                            href={linkPath}
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </nav>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar user={props.auth.user} categories={navCategories} />

            {heroData && (
                <Hero
                    featuredArticle={heroData.featuredArticle}
                    categories={heroData.categories || []}
                />
            )}

            {renderBreadcrumb()}

            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
