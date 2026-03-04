import { Head, Link, router } from "@inertiajs/react";
import { Edit, Eye, FileText } from "lucide-react";
import RoleWorkspaceLayout from "@/Layouts/RoleWorkspaceLayout";
import PaginationLinks from "@/Components/PaginationLinks";
import PremiumTierBadge from "@/Components/ui/PremiumTierBadge";
import { useState } from "react";

export default function EditorDashboard({
    recentStories,
    filters = {},
    filterOptions = {},
}) {
    const rows = recentStories?.data ?? [];
    const sort = filters?.sort === "asc" ? "asc" : "desc";
    const [keyword, setKeyword] = useState(filters?.q || "");
    const activeType = filters?.type || "";
    const activeCategory = filters?.category || "";

    const applyFilters = (overrides = {}) => {
        const next = {
            q: keyword,
            type: activeType,
            category: activeCategory,
            sort,
            ...overrides,
        };

        Object.keys(next).forEach((key) => {
            if (next[key] === "" || next[key] == null) {
                delete next[key];
            }
        });

        router.get(route("dashboard"), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <RoleWorkspaceLayout
            roleType="editor"
            title="Dashboard Editor"
            subtitle="Monitor konten terbaru untuk proses editorial."
        >
            <Head title="Editor Dashboard" />

            <section className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-md">
                <div className="mb-4 flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-slate-900">
                        Konten Terbaru (Story & News)
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
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
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Cari judul/kategori..."
                                className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm"
                            />
                        </form>
                        <select
                            value={activeType}
                            onChange={(e) =>
                                applyFilters({
                                    type: e.target.value,
                                    page: 1,
                                })
                            }
                            className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm"
                        >
                            <option value="">Semua Tipe</option>
                            {(filterOptions?.types || ["story", "news"]).map(
                                (type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ),
                            )}
                        </select>
                        <select
                            value={activeCategory}
                            onChange={(e) =>
                                applyFilters({
                                    category: e.target.value,
                                    page: 1,
                                })
                            }
                            className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm"
                        >
                            <option value="">Semua Kategori</option>
                            {(filterOptions?.categories || []).map((category) => (
                                <option key={category} value={category}>
                                    {category}
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
                            className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm"
                        >
                            <option value="desc">Terbaru (DESC)</option>
                            <option value="asc">Terlama (ASC)</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                setKeyword("");
                                router.get(
                                    route("dashboard"),
                                    { sort: "desc" },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    },
                                );
                            }}
                                className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {rows.length > 0 ? (
                        rows.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-200 bg-white/80 rounded-xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-slate-100 p-2 rounded-lg">
                                        <FileText className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {item.title}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <p className="text-xs text-slate-500">
                                                {item.type.toUpperCase()} •{" "}
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleDateString("id-ID")}
                                            </p>
                                            <PremiumTierBadge
                                                tier={item.premium_tier}
                                                isPremium={item.is_premium}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                        href={route("surveys.edit", item.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <Link
                                        href={route("surveys.show", item.slug || item.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500">
                            Belum ada konten terbaru.
                        </p>
                    )}
                </div>

                <PaginationLinks links={recentStories?.links ?? []} />
            </section>
        </RoleWorkspaceLayout>
    );
}
