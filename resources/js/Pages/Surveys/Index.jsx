import React from "react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import DataCard from "@/Components/ui/DataCard";
import { useState } from "react";

export default function Index({ surveys, filters, title }) {
    const { globalCategoryTree = [] } = usePage().props;
    const [keyword, setKeyword] = useState(filters?.q || "");
    const sort = filters?.sort === "asc" ? "asc" : "desc";
    const type = filters?.type || "";
    const category = filters?.category || "";
    const categoryOptions = Array.isArray(globalCategoryTree)
        ? globalCategoryTree.map((item) => item.id)
        : [];

    const applyFilters = (overrides = {}) => {
        const next = {
            q: keyword,
            type,
            category,
            sort,
            ...overrides,
        };

        Object.keys(next).forEach((key) => {
            if (next[key] === "" || next[key] == null) {
                delete next[key];
            }
        });

        router.get(window.location.pathname, next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Format data agar sesuai dengan DataCard
    const formatItem = (item) => ({
        id: item.id,
        slug: item.slug || item.id,
        type: item.type,
        title: item.title,
        category: item.category,
        author: item.pic || "Tim Data",
        date: new Date(item.created_at).toLocaleDateString("id-ID"),
        image: item.image ? `/storage/${item.image}` : null,
        views: item.views || 0,
        excerpt: item.lead || item.notes || "Tidak ada deskripsi.",
        isPremium: item.is_premium,
    });

    return (
        <PublicLayout>
            <Head title={title} />

            <div className="bg-white min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Halaman */}
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
                                    {filters.category
                                        ? `Topik: ${filters.category}`
                                        : title}
                                </h1>
                                <p className="text-gray-500 mt-2">
                                    Menampilkan {surveys.data.length} hasil
                                    {filters.q && (
                                        <span>
                                            {" "}
                                            untuk kata kunci "
                                            <strong>{filters.q}</strong>"
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        applyFilters({ page: 1 });
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) =>
                                            setKeyword(e.target.value)
                                        }
                                        placeholder="Cari judul..."
                                        className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                    />
                                </form>
                                <select
                                    value={type}
                                    onChange={(e) =>
                                        applyFilters({
                                            type: e.target.value,
                                            page: 1,
                                        })
                                    }
                                    className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="series">Kilas Data</option>
                                    <option value="story">Fokus Utama</option>
                                    <option value="news">Kabar Tepi</option>
                                    <option value="publikasi_riset">Publikasi Riset</option>
                                </select>
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        applyFilters({
                                            category: e.target.value,
                                            page: 1,
                                        })
                                    }
                                    className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categoryOptions.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        applyFilters({
                                            sort: e.target.value,
                                            page: 1,
                                        })
                                    }
                                    className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                >
                                    <option value="desc">
                                        Terbaru (DESC)
                                    </option>
                                    <option value="asc">Terlama (ASC)</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setKeyword("");
                                        router.get(
                                            window.location.pathname,
                                            { sort: "desc" },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            },
                                        );
                                    }}
                                    className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid Hasil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {surveys.data.length > 0 ? (
                            surveys.data.map((item) => (
                                <DataCard
                                    key={item.id}
                                    item={formatItem(item)}
                                />
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-20 bg-gray-50 rounded-xl">
                                <p className="text-gray-500 text-lg">
                                    Tidak ditemukan data yang sesuai.
                                </p>
                                <Link
                                    href="/"
                                    className="text-blue-600 font-bold mt-2 inline-block hover:underline"
                                >
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {surveys.links.length > 3 && (
                        <div className="mt-12 flex flex-wrap justify-center gap-2">
                            {surveys.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-4 py-2 text-sm rounded-lg border ${link.active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm text-gray-400 border border-gray-100 rounded-lg"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
