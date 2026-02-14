import React from "react";
import Navbar from "@/Components/sections/Navbar";
import Footer from "@/Components/sections/Footer";
import Hero from "@/Components/sections/Hero";
import { Head, Link, usePage } from "@inertiajs/react";
import { Home, ChevronRight } from "lucide-react";

// 1. TAMBAHKAN PROPS 'pageLabel' DI SINI
export default function PublicLayout({ children, heroData, pageLabel }) {
    const { url } = usePage();

    const renderBreadcrumb = () => {
        if (url === "/" || heroData) return null;

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
            surveys: "Detail Data", // Default kalau gak ada titipan
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

                            // --- LOGIC BARU: OVERRIDE LABEL ---
                            let label;

                            // Jika bagian URL ini adalah 'surveys' DAN Boss menitipkan label khusus...
                            if (
                                (part === "surveys" || part === "data") &&
                                pageLabel
                            ) {
                                label = pageLabel.label; // Pakai Label titipan (misal: Kilas Data)
                                linkPath = pageLabel.url;
                            } else {
                                // Logic standar (kamus default)
                                label =
                                    labels[part] ||
                                    decodeURIComponent(part).replace(/-/g, " ");
                                label =
                                    label.charAt(0).toUpperCase() +
                                    label.slice(1);
                            }
                            // -------------------------

                            const isLast = index === parts.length - 1;

                            return (
                                <React.Fragment key={index}>
                                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                                    {isLast ? (
                                        <span className="text-blue-600 font-bold max-w-[200px] truncate">
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
            <Navbar user={usePage().props.auth.user} />

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
