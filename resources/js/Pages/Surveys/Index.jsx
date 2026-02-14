import React from "react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Head, Link } from "@inertiajs/react";
import DataCard from "@/Components/ui/DataCard";

export default function Index({ surveys, filters, title }) {
    // Format data agar sesuai dengan DataCard
    const formatItem = (item) => ({
        id: item.id,
        slug: item.slug || item.id,
        title: item.title,
        category: item.category,
        author: item.pic || "Tim Data",
        date: new Date(item.created_at).toLocaleDateString("id-ID"),
        image: item.image ? `/storage/${item.image}` : null,
        views: item.views || 0,
        excerpt: item.notes || "Tidak ada deskripsi.",
        isPremium: item.is_premium,
    });

    return (
        <PublicLayout>
            <Head title={title} />

            <div className="bg-white min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Halaman */}
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <h1 className="text-3xl font-bold text-gray-900 capitalize">
                            {filters.category
                                ? `Topik: ${filters.category}`
                                : title}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Menampilkan {surveys.data.length} hasil
                            {filters.q && (
                                <span>
                                    {" "}
                                    untuk kata kunci "<b>{filters.q}</b>"
                                </span>
                            )}
                        </p>
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
                        <div className="mt-12 flex justify-center gap-2">
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
