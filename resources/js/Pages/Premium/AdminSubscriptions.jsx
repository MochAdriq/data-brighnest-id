import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import PremiumTierBadge from "@/Components/ui/PremiumTierBadge";

function ActionButtons({ item, approveRouteName, rejectRouteName }) {
    const approveForm = useForm({ admin_note: "" });
    const rejectForm = useForm({ admin_note: "" });

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button
                disabled={item.status !== "pending" || approveForm.processing}
                onClick={() =>
                    approveForm.post(route(approveRouteName, item.id))
                }
                className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold disabled:opacity-50"
            >
                Approve
            </button>
            <button
                disabled={item.status !== "pending" || rejectForm.processing}
                onClick={() => rejectForm.post(route(rejectRouteName, item.id))}
                className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold disabled:opacity-50"
            >
                Reject
            </button>
        </div>
    );
}

function PaginationBlock({ links = [] }) {
    if (!Array.isArray(links) || links.length <= 3) return null;

    return (
        <div className="mt-6 flex flex-wrap gap-2">
            {links.map((link, idx) =>
                link.url ? (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`px-3 py-1 rounded border text-sm ${
                            link.active
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white/80 text-slate-700 border-slate-200"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={idx}
                        className="px-3 py-1 rounded border text-sm bg-slate-100/80 text-slate-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

export default function AdminSubscriptions({
    auth,
    subscriptions,
    articleRequests,
    filters = {},
    filterOptions = {},
}) {
    const sort = filters?.sort === "asc" ? "asc" : "desc";
    const [keyword, setKeyword] = useState(filters?.q || "");
    const status = filters?.status || "";
    const articleRows = Array.isArray(articleRequests?.data)
        ? articleRequests.data
        : [];

    const applyFilters = (overrides = {}) => {
        const next = {
            q: keyword,
            status,
            sort,
            ...overrides,
        };

        Object.keys(next).forEach((key) => {
            if (next[key] === "" || next[key] == null) {
                delete next[key];
            }
        });

        router.get(route("premium.admin.subscriptions"), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Verifikasi Premium
                </h2>
            }
        >
            <Head title="Admin Subscriptions" />

            <div className="relative min-h-screen overflow-hidden bg-slate-100 py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),transparent_58%)]" />
                <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-blue-900/10 blur-3xl" />

                <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilters({ page: 1, article_page: 1 });
                            }}
                            className="w-full sm:w-auto"
                        >
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Cari user, artikel, metode, ref..."
                                className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm"
                            />
                        </form>
                        <select
                            value={status}
                            onChange={(e) =>
                                applyFilters({
                                    status: e.target.value,
                                    page: 1,
                                    article_page: 1,
                                })
                            }
                            className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm"
                        >
                            <option value="">Semua Status</option>
                            {(filterOptions?.statuses || []).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sort}
                            onChange={(e) =>
                                applyFilters({
                                    sort: e.target.value,
                                    page: 1,
                                    article_page: 1,
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
                                    route("premium.admin.subscriptions"),
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

                    <section className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-md overflow-hidden mb-8">
                        <div className="px-4 sm:px-6 py-4 border-b bg-slate-100/80">
                            <h3 className="text-base font-bold text-slate-900">
                                Verifikasi Membership
                            </h3>
                        </div>

                        <div className="space-y-3 md:hidden p-4">
                            {subscriptions.data.length > 0 ? (
                                subscriptions.data.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-slate-200 p-4 bg-white/80"
                                >
                                    <p className="font-semibold text-slate-900">
                                        {item.user?.name || "-"}
                                    </p>
                                    <p className="text-xs text-slate-500 mb-2">
                                        {item.user?.email || "-"}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <span className="text-slate-500">Status</span>
                                        <span className="font-semibold uppercase text-right">
                                            {item.status}
                                        </span>
                                        <span className="text-slate-500">Paket</span>
                                        <span className="font-medium text-right">
                                            {item.plan_name || "-"}
                                        </span>
                                        <span className="text-slate-500">Transfer</span>
                                        <span className="font-medium text-right">
                                            {item.transfer_date
                                                ? new Date(
                                                      item.transfer_date,
                                                  ).toLocaleDateString("id-ID")
                                                : "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        {item.proof_path ? (
                                            <a
                                                href={route("premium.proofs.subscription", item.id)}
                                                className="text-blue-600 hover:underline text-sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Lihat Bukti
                                            </a>
                                        ) : (
                                            <span className="text-sm text-slate-400">
                                                Bukti tidak ada
                                            </span>
                                        )}
                                    </div>
                                    <ActionButtons
                                        item={item}
                                        approveRouteName="premium.admin.subscriptions.approve"
                                        rejectRouteName="premium.admin.subscriptions.reject"
                                    />
                                </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/90 p-6 text-center">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Belum ada pengajuan membership.
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Saat ada request baru, data verifikasi membership akan tampil di sini.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto hidden md:block">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-100/80 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Paket</th>
                                        <th className="px-4 py-3 text-left">Transfer</th>
                                        <th className="px-4 py-3 text-left">Bukti</th>
                                        <th className="px-4 py-3 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.data.length > 0 ? (
                                        subscriptions.data.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-slate-50/80">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-slate-800">
                                                        {item.user?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.user?.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 uppercase font-semibold">
                                                    {item.status}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.plan_name || "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.transfer_date
                                                        ? new Date(
                                                              item.transfer_date,
                                                          ).toLocaleDateString("id-ID")
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.proof_path ? (
                                                        <a
                                                            href={route("premium.proofs.subscription", item.id)}
                                                            className="text-blue-600 hover:underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Lihat Bukti
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ActionButtons
                                                        item={item}
                                                        approveRouteName="premium.admin.subscriptions.approve"
                                                        rejectRouteName="premium.admin.subscriptions.reject"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Belum ada pengajuan membership.
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Saat ada request baru, data verifikasi membership akan tampil di sini.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 sm:px-6">
                            <PaginationBlock links={subscriptions.links} />
                        </div>
                    </section>

                    <section className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 border-b bg-slate-100/80">
                            <h3 className="text-base font-bold text-slate-900">
                                Verifikasi Artikel Satuan
                            </h3>
                        </div>

                        <div className="space-y-3 md:hidden p-4">
                            {articleRows.length > 0 ? (
                                articleRows.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-slate-200 p-4 bg-white/80"
                                >
                                    <p className="font-semibold text-slate-900">
                                        {item.user?.name || "-"}
                                    </p>
                                    <p className="text-xs text-slate-500 mb-1">
                                        {item.user?.email || "-"}
                                    </p>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium text-slate-800">
                                            {item.survey?.title || "Artikel tidak ditemukan"}
                                        </p>
                                        <PremiumTierBadge
                                            tier={item.survey?.premium_tier}
                                            isPremium={item.survey?.is_premium}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <span className="text-slate-500">Status</span>
                                        <span className="font-semibold uppercase text-right">
                                            {item.status}
                                        </span>
                                        <span className="text-slate-500">Nominal</span>
                                        <span className="font-medium text-right">
                                            Rp{Number(item.amount || 0).toLocaleString("id-ID")}
                                        </span>
                                        <span className="text-slate-500">Transfer</span>
                                        <span className="font-medium text-right">
                                            {item.transfer_date
                                                ? new Date(
                                                      item.transfer_date,
                                                  ).toLocaleDateString("id-ID")
                                                : "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        {item.proof_path ? (
                                            <a
                                                href={route("premium.proofs.article", item.id)}
                                                className="text-blue-600 hover:underline text-sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Lihat Bukti
                                            </a>
                                        ) : (
                                            <span className="text-sm text-slate-400">
                                                Bukti tidak ada
                                            </span>
                                        )}
                                        {item.survey?.slug ? (
                                            <Link
                                                href={route(
                                                    "surveys.show",
                                                    item.survey.slug,
                                                )}
                                                className="text-xs font-semibold text-slate-600 hover:underline"
                                                target="_blank"
                                            >
                                                Buka artikel
                                            </Link>
                                        ) : null}
                                    </div>
                                    <ActionButtons
                                        item={item}
                                        approveRouteName="premium.admin.articles.approve"
                                        rejectRouteName="premium.admin.articles.reject"
                                    />
                                </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/90 p-6 text-center">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Belum ada pengajuan artikel satuan.
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Saat ada request baru, data verifikasi artikel akan tampil di sini.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto hidden md:block">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-100/80 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Artikel</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Nominal</th>
                                        <th className="px-4 py-3 text-left">Transfer</th>
                                        <th className="px-4 py-3 text-left">Bukti</th>
                                        <th className="px-4 py-3 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articleRows.length > 0 ? (
                                        articleRows.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-slate-50/80">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-slate-800">
                                                        {item.user?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.user?.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium text-slate-900">
                                                            {item.survey?.title || "-"}
                                                        </p>
                                                        <PremiumTierBadge
                                                            tier={item.survey?.premium_tier}
                                                            isPremium={item.survey?.is_premium}
                                                        />
                                                    </div>
                                                    {item.survey?.slug ? (
                                                        <Link
                                                            href={route(
                                                                "surveys.show",
                                                                item.survey.slug,
                                                            )}
                                                            className="text-xs text-blue-600 hover:underline"
                                                            target="_blank"
                                                        >
                                                            Lihat artikel
                                                        </Link>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3 uppercase font-semibold">
                                                    {item.status}
                                                </td>
                                                <td className="px-4 py-3">
                                                    Rp
                                                    {Number(item.amount || 0).toLocaleString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.transfer_date
                                                        ? new Date(
                                                              item.transfer_date,
                                                          ).toLocaleDateString("id-ID")
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.proof_path ? (
                                                        <a
                                                            href={route("premium.proofs.article", item.id)}
                                                            className="text-blue-600 hover:underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Lihat Bukti
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ActionButtons
                                                        item={item}
                                                        approveRouteName="premium.admin.articles.approve"
                                                        rejectRouteName="premium.admin.articles.reject"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Belum ada pengajuan artikel satuan.
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Saat ada request baru, data verifikasi artikel akan tampil di sini.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 sm:px-6">
                            <PaginationBlock links={articleRequests?.links} />
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
