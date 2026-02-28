import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    PlusCircle,
    FileText,
    Eye,
    Trash2,
    Edit,
    ShieldCheck,
} from "lucide-react";
import PaginationLinks from "@/Components/PaginationLinks";

export default function Dashboard({
    auth,
    surveys,
    filters = {},
    filterOptions = {},
    latestUserSubscription = null,
    activeUserSubscription = null,
    pendingSubscriptions = [],
    pendingSubscriptionsCount = 0,
    pendingArticleRequests = [],
    pendingArticleRequestsCount = 0,
    pendingPremiumVerificationsCount = 0,
}) {
    const isSuperAdmin = auth?.user?.roles?.includes("super_admin");
    // Helper untuk Delete
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (
            confirm(
                "Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.",
            )
        ) {
            destroy(route("surveys.destroy", id));
        }
    };
    const sort = filters?.sort === "asc" ? "asc" : "desc";
    const [keyword, setKeyword] = useState(filters?.q || "");
    const activeType = filters?.type || "";
    const activeCategory = filters?.category || "";
    const typeLabelMap = {
        series: "Kilas Data",
        story: "Fokus Utama",
        news: "Kabar Tepi",
        publikasi_riset: "Publikasi Riset",
    };
    const typeBadgeClassMap = {
        series: "bg-purple-50 text-purple-700 border-purple-200",
        story: "bg-blue-50 text-blue-700 border-blue-200",
        news: "bg-green-50 text-green-700 border-green-200",
        publikasi_riset: "bg-cyan-50 text-cyan-700 border-cyan-200",
    };

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
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard Manajemen
                    </h2>
                    <p className="text-sm text-slate-500">
                        Anda sedang berada di halaman dashboard.
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="relative min-h-screen overflow-hidden bg-slate-100 py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),transparent_58%)]" />
                <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-blue-900/10 blur-3xl" />
                <div className="relative">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* STATISTIK RINGKAS (MOCKUP DULU) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/90 backdrop-blur border border-slate-200 overflow-hidden shadow-md sm:rounded-2xl p-6 border-l-4 border-blue-500">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Total Postingan
                                        </p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {surveys.total}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur border border-slate-200 overflow-hidden shadow-md sm:rounded-2xl p-6 border-l-4 border-indigo-500">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Status Premium Anda
                                        </p>
                                        <p className="text-sm font-bold text-gray-800 uppercase">
                                            {activeUserSubscription
                                                ? "Active"
                                                : latestUserSubscription?.status ||
                                                  "none"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {activeUserSubscription?.ends_at
                                                ? `Berakhir: ${new Date(activeUserSubscription.ends_at).toLocaleDateString("id-ID")}`
                                                : "Belum ada langganan aktif"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {isSuperAdmin && (
                                <div className="bg-white/90 backdrop-blur border border-slate-200 overflow-hidden shadow-md sm:rounded-2xl p-6 border-l-4 border-emerald-500">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">
                                                Pending Verifikasi Premium
                                            </p>
                                            <p className="text-2xl font-bold text-gray-800">
                                                {
                                                    pendingPremiumVerificationsCount
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Membership:{" "}
                                                {pendingSubscriptionsCount} |
                                                Artikel:{" "}
                                                {pendingArticleRequestsCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Bisa tambah statistik lain nanti */}
                        </div>

                        {isSuperAdmin && (
                            <div className="bg-white/90 backdrop-blur border border-slate-200 overflow-hidden shadow-md sm:rounded-2xl mb-8">
                                <div className="p-6 text-gray-900">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                        <h3 className="text-lg font-bold">
                                            Antrian Verifikasi Premium
                                        </h3>
                                        <Link
                                            href={route(
                                                "premium.admin.subscriptions",
                                            )}
                                            className="text-sm font-semibold text-emerald-700 hover:underline"
                                        >
                                            Buka Halaman Verifikasi Lengkap
                                        </Link>
                                    </div>

                                    {pendingSubscriptions.length > 0 ? (
                                        <>
                                            <div className="space-y-3 md:hidden">
                                                {pendingSubscriptions.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="rounded-xl border border-slate-200 p-4 bg-white/80"
                                                        >
                                                            <p className="font-semibold text-gray-900">
                                                                {item.user
                                                                    ?.name ||
                                                                    "-"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                {item.user
                                                                    ?.email ||
                                                                    "-"}
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <span className="text-gray-500">
                                                                    Metode
                                                                </span>
                                                                <span className="font-medium text-right">
                                                                    {item.payment_method ||
                                                                        "-"}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    Tanggal
                                                                </span>
                                                                <span className="font-medium text-right">
                                                                    {item.transfer_date
                                                                        ? new Date(
                                                                              item.transfer_date,
                                                                          ).toLocaleDateString(
                                                                              "id-ID",
                                                                          )
                                                                        : "-"}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3">
                                                                {item.proof_path ? (
                                                                    <a
                                                                        href={route(
                                                                            "premium.proofs.subscription",
                                                                            item.id,
                                                                        )}
                                                                        className="text-blue-600 hover:underline text-sm font-semibold"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Lihat
                                                                        Bukti
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">
                                                                        Bukti
                                                                        tidak
                                                                        ada
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className="overflow-x-auto hidden md:block">
                                                <table className="w-full text-sm text-left text-gray-500">
                                                    <thead className="text-xs text-gray-700 uppercase bg-slate-100/80 border-b">
                                                        <tr>
                                                            <th className="px-4 py-3">
                                                                Nama
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Metode
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Tanggal
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Bukti
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingSubscriptions.map(
                                                            (item) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="border-b"
                                                                >
                                                                    <td className="px-4 py-3">
                                                                        <p className="font-medium text-gray-800">
                                                                            {item
                                                                                .user
                                                                                ?.name ||
                                                                                "-"}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {item
                                                                                .user
                                                                                ?.email ||
                                                                                "-"}
                                                                        </p>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.payment_method ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.transfer_date
                                                                            ? new Date(
                                                                                  item.transfer_date,
                                                                              ).toLocaleDateString(
                                                                                  "id-ID",
                                                                              )
                                                                            : "-"}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.proof_path ? (
                                                                            <a
                                                                                href={route(
                                                                                    "premium.proofs.subscription",
                                                                                    item.id,
                                                                                )}
                                                                                className="text-blue-600 hover:underline"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                Lihat
                                                                                Bukti
                                                                            </a>
                                                                        ) : (
                                                                            "-"
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Tidak ada antrian verifikasi
                                                membership.
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Saat ada pengajuan baru, daftar
                                                ini akan tampil di sini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isSuperAdmin && (
                            <div className="bg-white/90 backdrop-blur border border-slate-200 overflow-hidden shadow-md sm:rounded-2xl mb-8">
                                <div className="p-6 text-gray-900">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                        <h3 className="text-lg font-bold">
                                            Antrian Verifikasi Artikel Satuan
                                        </h3>
                                        <Link
                                            href={route(
                                                "premium.admin.subscriptions",
                                            )}
                                            className="text-sm font-semibold text-emerald-700 hover:underline"
                                        >
                                            Buka Halaman Verifikasi Lengkap
                                        </Link>
                                    </div>

                                    {pendingArticleRequests.length > 0 ? (
                                        <>
                                            <div className="space-y-3 md:hidden">
                                                {pendingArticleRequests.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="rounded-xl border border-slate-200 p-4 bg-white/80"
                                                        >
                                                            <p className="font-semibold text-gray-900">
                                                                {item.user
                                                                    ?.name ||
                                                                    "-"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                {item.user
                                                                    ?.email ||
                                                                    "-"}
                                                            </p>
                                                            <p className="text-sm text-gray-800 font-medium mb-2">
                                                                {item.survey
                                                                    ?.title ||
                                                                    "-"}
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <span className="text-gray-500">
                                                                    Metode
                                                                </span>
                                                                <span className="font-medium text-right">
                                                                    {item.payment_method ||
                                                                        "-"}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    Tanggal
                                                                </span>
                                                                <span className="font-medium text-right">
                                                                    {item.transfer_date
                                                                        ? new Date(
                                                                              item.transfer_date,
                                                                          ).toLocaleDateString(
                                                                              "id-ID",
                                                                          )
                                                                        : "-"}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3 flex items-center gap-3">
                                                                {item.proof_path ? (
                                                                    <a
                                                                        href={route(
                                                                            "premium.proofs.article",
                                                                            item.id,
                                                                        )}
                                                                        className="text-blue-600 hover:underline text-sm font-semibold"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Lihat
                                                                        Bukti
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">
                                                                        Bukti
                                                                        tidak
                                                                        ada
                                                                    </span>
                                                                )}
                                                                {item.survey
                                                                    ?.slug ? (
                                                                    <Link
                                                                        href={route(
                                                                            "surveys.show",
                                                                            item
                                                                                .survey
                                                                                .slug,
                                                                        )}
                                                                        className="text-sm text-emerald-700 font-semibold hover:underline"
                                                                        target="_blank"
                                                                    >
                                                                        Buka
                                                                        artikel
                                                                    </Link>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className="overflow-x-auto hidden md:block">
                                                <table className="w-full text-sm text-left text-gray-500">
                                                    <thead className="text-xs text-gray-700 uppercase bg-slate-100/80 border-b">
                                                        <tr>
                                                            <th className="px-4 py-3">
                                                                Nama
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Artikel
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Metode
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Tanggal
                                                            </th>
                                                            <th className="px-4 py-3">
                                                                Bukti
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingArticleRequests.map(
                                                            (item) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="border-b"
                                                                >
                                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                                        {item
                                                                            .user
                                                                            ?.name ||
                                                                            "-"}
                                                                        <p className="text-xs text-gray-500">
                                                                            {item
                                                                                .user
                                                                                ?.email ||
                                                                                "-"}
                                                                        </p>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <p className="font-medium text-gray-900">
                                                                            {item
                                                                                .survey
                                                                                ?.title ||
                                                                                "-"}
                                                                        </p>
                                                                        {item
                                                                            .survey
                                                                            ?.slug ? (
                                                                            <Link
                                                                                href={route(
                                                                                    "surveys.show",
                                                                                    item
                                                                                        .survey
                                                                                        .slug,
                                                                                )}
                                                                                className="text-xs text-emerald-700 hover:underline"
                                                                                target="_blank"
                                                                            >
                                                                                Buka
                                                                                artikel
                                                                            </Link>
                                                                        ) : null}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.payment_method ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.transfer_date
                                                                            ? new Date(
                                                                                  item.transfer_date,
                                                                              ).toLocaleDateString(
                                                                                  "id-ID",
                                                                              )
                                                                            : "-"}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.proof_path ? (
                                                                            <a
                                                                                href={route(
                                                                                    "premium.proofs.article",
                                                                                    item.id,
                                                                                )}
                                                                                className="text-blue-600 hover:underline"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                Lihat
                                                                                Bukti
                                                                            </a>
                                                                        ) : (
                                                                            "-"
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Tidak ada antrian verifikasi
                                                artikel satuan.
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Data akan muncul otomatis ketika
                                                user mengirim pengajuan.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TABEL DATA */}
                        <div className="bg-white/90 backdrop-blur border border-slate-200 overflow-hidden shadow-md sm:rounded-2xl">
                            <div className="p-6 text-gray-900">
                                {/* Header Tabel & Tombol Tambah */}
                                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
                                    <h3 className="text-lg font-bold">
                                        Daftar Data & Artikel
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
                                                onChange={(e) =>
                                                    setKeyword(e.target.value)
                                                }
                                                placeholder="Cari judul/kategori..."
                                                className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
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
                                            className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                        >
                                            <option value="">Semua Tipe</option>
                                            {(filterOptions?.types || []).map(
                                                (type) => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
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
                                            className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                        >
                                            <option value="">
                                                Semua Kategori
                                            </option>
                                            {(
                                                filterOptions?.categories || []
                                            ).map((category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
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
                                            className="w-full sm:w-auto rounded-lg border-gray-300 text-sm"
                                        >
                                            <option value="desc">
                                                Terbaru (DESC)
                                            </option>
                                            <option value="asc">
                                                Terlama (ASC)
                                            </option>
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
                                            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                        <Link
                                            href={route("surveys.create")}
                                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Tambah Data Baru
                                        </Link>
                                    </div>
                                </div>

                                {/* Tabel */}
                                <div className="space-y-3 md:hidden">
                                    {surveys.data.length > 0 ? (
                                        surveys.data.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-slate-200 p-4 bg-white/80"
                                            >
                                                <p className="font-semibold text-gray-900">
                                                    {item.title}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                                        {item.category}
                                                    </span>
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                                        {typeLabelMap[
                                                            item.type
                                                        ] || item.type}
                                                    </span>
                                                    {item.is_premium ? (
                                                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                            PREMIUM
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                    )}
                                                </p>
                                                <div className="mt-3 flex items-center gap-3">
                                                    <a
                                                        href={
                                                            item.type ===
                                                            "series"
                                                                ? route(
                                                                      "kilas-data",
                                                                      {
                                                                          id: item.id,
                                                                      },
                                                                  )
                                                                : route(
                                                                      "surveys.show",
                                                                      item.slug ||
                                                                          item.id,
                                                                  )
                                                        }
                                                        target="_blank"
                                                        className="text-blue-600"
                                                        title="Lihat"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </a>
                                                    <Link
                                                        href={route(
                                                            "surveys.edit",
                                                            item.id,
                                                        )}
                                                        className="text-amber-600"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-600"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-gray-400">
                                            Belum ada data. Silakan tambah data
                                            baru.
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-x-auto hidden md:block">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-slate-100/80 border-b">
                                            <tr>
                                                <th className="px-6 py-3">
                                                    Judul
                                                </th>
                                                <th className="px-6 py-3">
                                                    Kategori
                                                </th>
                                                <th className="px-6 py-3">
                                                    Tipe
                                                </th>
                                                <th className="px-6 py-3">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-3 text-center">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {surveys.data.length > 0 ? (
                                                surveys.data.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="bg-white/70 border-b hover:bg-slate-50/80"
                                                    >
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {item.title}
                                                            {item.is_premium ? (
                                                                <span className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                                                                    PREMIUM
                                                                </span>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold border border-slate-200">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 capitalize">
                                                            {/* Badge Tipe */}
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-bold border ${
                                                                    typeBadgeClassMap[item.type] ||
                                                                    "bg-slate-50 text-slate-700 border-slate-200"
                                                                }`}
                                                            >
                                                                {typeLabelMap[item.type] || item.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {new Date(
                                                                item.created_at,
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <a
                                                                    href={
                                                                        item.type ===
                                                                        "series"
                                                                            ? route(
                                                                                  "kilas-data",
                                                                                  {
                                                                                      id: item.id,
                                                                                  },
                                                                              ) // JIKA Series -> Ke Link Khusus
                                                                            : route(
                                                                                  "surveys.show",
                                                                                  item.slug ||
                                                                                      item.id,
                                                                              ) // SELAIN ITU -> Ke Link Biasa
                                                                    }
                                                                    target="_blank"
                                                                    className="text-blue-500 hover:text-blue-700 tooltip"
                                                                    title="Lihat"
                                                                >
                                                                    <Eye className="w-5 h-5" />
                                                                </a>
                                                                <Link
                                                                    href={route(
                                                                        "surveys.edit",
                                                                        item.id,
                                                                    )}
                                                                    className="text-amber-500 hover:text-amber-700"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-5 h-5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="px-6 py-8 text-center text-gray-400"
                                                    >
                                                        Belum ada data. Silakan
                                                        tambah data baru.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 flex flex-col items-end gap-2">
                                    <p className="text-xs text-gray-400">
                                        Menampilkan {surveys.data.length} dari{" "}
                                        {surveys.total} data
                                    </p>
                                    <PaginationLinks links={surveys.links} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
