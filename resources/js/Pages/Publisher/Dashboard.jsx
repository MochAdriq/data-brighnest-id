import { Head, Link, router, useForm } from "@inertiajs/react";
import { Edit, Eye, PlusCircle, Trash2 } from "lucide-react";
import RoleWorkspaceLayout from "@/Layouts/RoleWorkspaceLayout";
import PaginationLinks from "@/Components/PaginationLinks";
import PremiumTierBadge from "@/Components/ui/PremiumTierBadge";
import { useState } from "react";

export default function PublisherDashboard({
    surveys,
    filters = {},
    filterOptions = {},
}) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm("Yakin hapus postingan ini?")) {
            destroy(route("surveys.destroy", id));
        }
    };
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
            roleType="publisher"
            title="Dashboard Publisher"
            subtitle="Kelola postingan Anda dengan workflow yang lebih fokus."
        >
            <Head title="Publisher Dashboard" />

            <section className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">
                        Postingan Saya
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
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
                            {(filterOptions?.types || []).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
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
                            {(filterOptions?.categories || []).map(
                                (category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ),
                            )}
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
                        <Link
                            href={route("surveys.create")}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Buat Postingan Baru
                        </Link>
                    </div>
                </div>

                <div className="space-y-3 md:hidden">
                    {surveys.data.length > 0 ? (
                        surveys.data.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-slate-200 p-4 bg-white/80"
                            >
                                <p className="font-semibold text-slate-900">
                                    {item.title}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                                        {item.type}
                                    </span>
                                    <PremiumTierBadge
                                        tier={item.premium_tier}
                                        isPremium={item.is_premium}
                                    />
                                    <span className="text-slate-500">
                                        {new Date(
                                            item.created_at,
                                        ).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <a
                                        href={
                                            item.type === "series"
                                                ? route("kilas-data", {
                                                      id: item.id,
                                                  })
                                                : route(
                                                      "surveys.show",
                                                      item.slug || item.id,
                                                  )
                                        }
                                        target="_blank"
                                        className="text-blue-600"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </a>
                                    <Link
                                        href={route("surveys.edit", item.id)}
                                        className="text-amber-600"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-rose-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                            Belum ada postingan.
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Judul</th>
                                <th className="px-4 py-3 text-left">Tipe</th>
                                <th className="px-4 py-3 text-left">Tanggal</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.data.length > 0 ? (
                                surveys.data.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                            {item.title}
                                            <PremiumTierBadge
                                                tier={item.premium_tier}
                                                isPremium={item.is_premium}
                                                className="ml-2 align-middle"
                                            />
                                        </td>
                                        <td className="px-4 py-3 uppercase text-xs font-bold text-slate-500">
                                            {item.type}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {new Date(item.created_at).toLocaleDateString(
                                                "id-ID",
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-3">
                                                <a
                                                    href={
                                                        item.type === "series"
                                                            ? route("kilas-data", {
                                                                  id: item.id,
                                                              })
                                                            : route(
                                                                  "surveys.show",
                                                                  item.slug ||
                                                                      item.id,
                                                              )
                                                    }
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <Link
                                                    href={route(
                                                        "surveys.edit",
                                                        item.id,
                                                    )}
                                                    className="text-amber-600 hover:text-amber-800"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className="text-rose-600 hover:text-rose-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        Belum ada postingan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationLinks links={surveys.links} />
            </section>
        </RoleWorkspaceLayout>
    );
}
