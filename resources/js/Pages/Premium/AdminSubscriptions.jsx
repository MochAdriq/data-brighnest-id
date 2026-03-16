import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import PremiumTierBadge from "@/Components/ui/PremiumTierBadge";

const healthStatusStyles = {
    ok: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
    warning: "border-amber-200 bg-amber-50/90 text-amber-900",
    error: "border-rose-200 bg-rose-50/90 text-rose-900",
};

const healthSummaryStyles = {
    ok: "bg-emerald-600/10 text-emerald-700 border border-emerald-300/70",
    warning: "bg-amber-600/10 text-amber-700 border border-amber-300/70",
    error: "bg-rose-600/10 text-rose-700 border border-rose-300/70",
};

const statusStyles = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    succeeded: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    failed: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    expired: "bg-slate-500/20 text-slate-200 border-slate-400/40",
    cancelled: "bg-zinc-500/20 text-zinc-200 border-zinc-400/40",
};

const formatDate = (value) => {
    if (!value) return "-";

    try {
        return new Date(value).toLocaleDateString("id-ID");
    } catch {
        return "-";
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

function StatusBadge({ value }) {
    const normalized = String(value || "-").toLowerCase();
    const style = statusStyles[normalized] || "bg-slate-500/20 text-slate-200 border-slate-400/40";

    return (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style}`}>
            {normalized}
        </span>
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

function XenditHealthPanel({ health, onRefresh }) {
    if (!health || !Array.isArray(health?.items)) {
        return null;
    }

    const summary = health?.summary || {};
    const checkedAt = health?.checked_at
        ? new Date(health.checked_at).toLocaleString("id-ID")
        : "-";
    const overall = health?.overall || "ok";
    const overallLabel = {
        ok: "Sehat",
        warning: "Perlu Cek",
        error: "Bermasalah",
    }[overall] || "Unknown";

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white/95 p-4 sm:p-6 shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        Health Check Xendit
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Terakhir dicek: {checkedAt}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${healthSummaryStyles[overall] || healthSummaryStyles.ok}`}
                    >
                        Status: {overallLabel}
                    </span>
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        Refresh Check
                    </button>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-3 py-1 font-semibold ${healthSummaryStyles.ok}`}>
                    OK: {summary?.ok ?? 0}
                </span>
                <span className={`rounded-full px-3 py-1 font-semibold ${healthSummaryStyles.warning}`}>
                    Warning: {summary?.warning ?? 0}
                </span>
                <span className={`rounded-full px-3 py-1 font-semibold ${healthSummaryStyles.error}`}>
                    Error: {summary?.error ?? 0}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {health.items.map((item) => (
                    <div
                        key={item.key}
                        className={`rounded-xl border p-3 ${healthStatusStyles[item.status] || healthStatusStyles.ok}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-bold">{item.label}</p>
                            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                {item.status}
                            </span>
                        </div>
                        <p className="mt-1 text-xs">{item.message}</p>
                        {Array.isArray(item.details) && item.details.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                                {item.details.map((detail, idx) => (
                                    <li key={`${item.key}-detail-${idx}`}>{detail}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function AdminSubscriptions({
    auth,
    subscriptions,
    articleRequests,
    activeMemberships = [],
    recentEntitlements = [],
    premiumSummary = {},
    filters = {},
    filterOptions = {},
    xenditHealth = null,
}) {
    const sort = filters?.sort === "asc" ? "asc" : "desc";
    const [keyword, setKeyword] = useState(filters?.q || "");
    const status = filters?.status || "";
    const articleRows = Array.isArray(articleRequests?.data)
        ? articleRequests.data
        : [];

    const refreshHealth = () => {
        router.reload({
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                    Monitoring Premium (Xendit)
                </h2>
            }
        >
            <Head title="Monitoring Premium" />

            <div className="relative min-h-screen overflow-hidden bg-slate-100 py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),transparent_58%)]" />
                <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-blue-900/10 blur-3xl" />

                <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <XenditHealthPanel
                        health={xenditHealth}
                        onRefresh={refreshHealth}
                    />

                    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Membership Aktif</p>
                            <p className="mt-1 text-2xl font-black text-emerald-900">{premiumSummary?.active_memberships ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Artikel Dimiliki</p>
                            <p className="mt-1 text-2xl font-black text-blue-900">{premiumSummary?.article_entitlements ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending Membership</p>
                            <p className="mt-1 text-2xl font-black text-amber-900">{premiumSummary?.pending_membership_payments ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending Artikel</p>
                            <p className="mt-1 text-2xl font-black text-amber-900">{premiumSummary?.pending_article_payments ?? 0}</p>
                        </div>
                    </section>

                    <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-md">
                            <h3 className="text-base font-bold text-slate-900">Akun Dengan Membership Aktif</h3>
                            {activeMemberships.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">Belum ada membership aktif.</p>
                            ) : (
                                <div className="mt-3 space-y-2">
                                    {activeMemberships.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                                            <p className="text-sm font-semibold text-slate-900">{item.user?.name || "-"}</p>
                                            <p className="text-xs text-slate-500">{item.user?.email || "-"}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                <StatusBadge value={item.status} />
                                                <span className="font-semibold text-slate-700">{item.plan_name || "-"}</span>
                                                <span className="text-slate-500">Berakhir: {formatDate(item.ends_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-md">
                            <h3 className="text-base font-bold text-slate-900">Akses Artikel Permanen Terbaru</h3>
                            {recentEntitlements.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">Belum ada entitlement artikel.</p>
                            ) : (
                                <div className="mt-3 space-y-2">
                                    {recentEntitlements.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                                            <p className="text-sm font-semibold text-slate-900">{item.user?.name || "-"}</p>
                                            <p className="text-xs text-slate-500">{item.user?.email || "-"}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                <span className="font-semibold text-slate-700">{item.survey?.title || "Artikel"}</span>
                                                <PremiumTierBadge
                                                    tier={item.survey?.premium_tier}
                                                    isPremium={item.survey?.is_premium}
                                                />
                                                <span className="text-slate-500">Diberikan: {formatDate(item.granted_at || item.created_at)}</span>
                                                {item.survey?.slug ? (
                                                    <Link
                                                        href={route("surveys.show", item.survey.slug)}
                                                        className="text-blue-600 hover:underline"
                                                        target="_blank"
                                                    >
                                                        Buka artikel
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

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
                                placeholder="Cari user, plan, channel, xendit ref..."
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
                            <h3 className="text-base font-bold text-slate-900">Riwayat Membership (Xendit)</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-100/80 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Plan</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Xendit</th>
                                        <th className="px-4 py-3 text-left">Nominal</th>
                                        <th className="px-4 py-3 text-left">Channel</th>
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">Checkout</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.data.length > 0 ? (
                                        subscriptions.data.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-slate-50/80">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-slate-800">{item.user?.name || "-"}</p>
                                                    <p className="text-xs text-slate-500">{item.user?.email || "-"}</p>
                                                </td>
                                                <td className="px-4 py-3">{item.plan_name || "-"}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge value={item.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-mono text-xs text-slate-700">{item.xendit_status || "-"}</p>
                                                    <p className="font-mono text-[11px] text-slate-500">{item.xendit_reference_id || "-"}</p>
                                                </td>
                                                <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                                                <td className="px-4 py-3">{item.xendit_channel_code || "-"}</td>
                                                <td className="px-4 py-3">
                                                    <p>{formatDate(item.created_at)}</p>
                                                    <p className="text-xs text-slate-500">Paid: {formatDate(item.paid_at)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.xendit_checkout_url ? (
                                                        <a
                                                            href={item.xendit_checkout_url}
                                                            className="text-blue-600 hover:underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Buka Link
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                                                Belum ada transaksi membership.
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
                            <h3 className="text-base font-bold text-slate-900">Riwayat Pembelian Artikel (Xendit)</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-100/80 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Artikel</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Xendit</th>
                                        <th className="px-4 py-3 text-left">Nominal</th>
                                        <th className="px-4 py-3 text-left">Channel</th>
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">Checkout</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articleRows.length > 0 ? (
                                        articleRows.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-slate-50/80">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-slate-800">{item.user?.name || "-"}</p>
                                                    <p className="text-xs text-slate-500">{item.user?.email || "-"}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{item.survey?.title || "-"}</p>
                                                    <div className="mt-1">
                                                        <PremiumTierBadge
                                                            tier={item.survey?.premium_tier}
                                                            isPremium={item.survey?.is_premium}
                                                        />
                                                    </div>
                                                    {item.survey?.slug ? (
                                                        <Link
                                                            href={route("surveys.show", item.survey.slug)}
                                                            className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                                                            target="_blank"
                                                        >
                                                            Buka artikel
                                                        </Link>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge value={item.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-mono text-xs text-slate-700">{item.xendit_status || "-"}</p>
                                                    <p className="font-mono text-[11px] text-slate-500">{item.xendit_reference_id || "-"}</p>
                                                </td>
                                                <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                                                <td className="px-4 py-3">{item.xendit_channel_code || "-"}</td>
                                                <td className="px-4 py-3">
                                                    <p>{formatDate(item.created_at)}</p>
                                                    <p className="text-xs text-slate-500">Paid: {formatDate(item.paid_at)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.xendit_checkout_url ? (
                                                        <a
                                                            href={item.xendit_checkout_url}
                                                            className="text-blue-600 hover:underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Buka Link
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                                                Belum ada transaksi artikel.
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
