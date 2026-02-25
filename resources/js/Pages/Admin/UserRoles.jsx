import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Search, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

function RoleUpdateRow({ item, availableRoles }) {
    const form = useForm({
        role: item.primary_role || "member",
    });

    useEffect(() => {
        form.setData("role", item.primary_role || "member");
    }, [item.id, item.primary_role]);

    const submit = () => {
        form.put(route("admin.user-roles.update", item.id), {
            preserveScroll: true,
        });
    };

    return (
        <tr className="border-b hover:bg-slate-50/80">
            <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
            <td className="px-4 py-3 text-slate-600">{item.email}</td>
            <td className="px-4 py-3 text-slate-600">
                {new Date(item.created_at).toLocaleDateString("id-ID")}
            </td>
            <td className="px-4 py-3">
                <select
                    value={form.data.role}
                    onChange={(e) => form.setData("role", e.target.value)}
                    className="w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                >
                    {availableRoles.map((roleName) => (
                        <option key={roleName} value={roleName}>
                            {roleName}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-4 py-3">
                <button
                    type="button"
                    onClick={submit}
                    disabled={form.processing}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                    Simpan
                </button>
            </td>
        </tr>
    );
}

function RoleUpdateCard({ item, availableRoles }) {
    const form = useForm({
        role: item.primary_role || "member",
    });

    useEffect(() => {
        form.setData("role", item.primary_role || "member");
    }, [item.id, item.primary_role]);

    const submit = () => {
        form.put(route("admin.user-roles.update", item.id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 p-4 bg-white/80">
            <p className="font-semibold text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.email}</p>
            <p className="text-xs text-slate-500 mt-1">
                Dibuat {new Date(item.created_at).toLocaleDateString("id-ID")}
            </p>
            <div className="mt-3 flex items-center gap-2">
                <select
                    value={form.data.role}
                    onChange={(e) => form.setData("role", e.target.value)}
                    className="w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                >
                    {availableRoles.map((roleName) => (
                        <option key={roleName} value={roleName}>
                            {roleName}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={submit}
                    disabled={form.processing}
                    className="shrink-0 inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                    Simpan
                </button>
            </div>
        </div>
    );
}

export default function UserRoles({ auth, users, filters, availableRoles }) {
    const searchForm = useForm({
        q: filters?.q ?? "",
        role: filters?.role ?? "",
        sort: filters?.sort === "asc" ? "asc" : "desc",
    });

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route("admin.user-roles.index"), searchForm.data, {
            preserveState: true,
            replace: true,
        });
    };

    const resetSearch = () => {
        searchForm.setData("q", "");
        router.get(
            route("admin.user-roles.index"),
            { sort: searchForm.data.sort, role: searchForm.data.role },
            { replace: true },
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                            Manajemen Role Pengguna
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Hanya super admin yang dapat mengubah role akun.
                        </p>
                    </div>
                    <Link
                        href={route("premium.admin.subscriptions")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Verifikasi Premium
                    </Link>
                </div>
            }
        >
            <Head title="Manajemen Role" />

            <div className="relative min-h-screen overflow-hidden bg-slate-100 py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),transparent_58%)]" />
                <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-blue-900/10 blur-3xl" />

                <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-md p-4 sm:p-6">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchForm.data.q}
                                    onChange={(e) =>
                                        searchForm.setData("q", e.target.value)
                                    }
                                    placeholder="Cari nama atau email user..."
                                    className="w-full rounded-lg border-slate-300/90 bg-white pl-9 text-sm focus:border-slate-400 focus:ring-slate-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                            >
                                Cari
                            </button>
                            <select
                                value={searchForm.data.sort}
                                onChange={(e) => {
                                    const nextSort = e.target.value;
                                    searchForm.setData("sort", nextSort);
                                    router.get(
                                        route("admin.user-roles.index"),
                                        {
                                            q: searchForm.data.q,
                                            role: searchForm.data.role,
                                            sort: nextSort,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true,
                                        },
                                    );
                                }}
                                className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm focus:border-slate-400 focus:ring-slate-400"
                            >
                                <option value="desc">Terbaru (DESC)</option>
                                <option value="asc">Terlama (ASC)</option>
                            </select>
                            <select
                                value={searchForm.data.role}
                                onChange={(e) => {
                                    const nextRole = e.target.value;
                                    searchForm.setData("role", nextRole);
                                    router.get(
                                        route("admin.user-roles.index"),
                                        {
                                            q: searchForm.data.q,
                                            role: nextRole,
                                            sort: searchForm.data.sort,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true,
                                        },
                                    );
                                }}
                                className="w-full sm:w-auto rounded-lg border-slate-300/90 bg-white text-sm focus:border-slate-400 focus:ring-slate-400"
                            >
                                <option value="">Semua Role</option>
                                {availableRoles.map((roleName) => (
                                    <option key={roleName} value={roleName}>
                                        {roleName}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={resetSearch}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Reset
                            </button>
                        </form>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {users.data.length > 0 ? (
                            users.data.map((item) => (
                                <RoleUpdateCard
                                    key={item.id}
                                    item={item}
                                    availableRoles={availableRoles}
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                                User tidak ditemukan.
                            </div>
                        )}
                    </div>

                    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-md overflow-x-auto hidden md:block">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-100/80 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left">Nama</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Dibuat</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length > 0 ? (
                                    users.data.map((item) => (
                                        <RoleUpdateRow
                                            key={item.id}
                                            item={item}
                                            availableRoles={availableRoles}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            User tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.links?.length > 3 && (
                        <div className="flex flex-wrap gap-2">
                            {users.links.map((link, idx) =>
                                link.url ? (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1 rounded border text-sm ${
                                            link.active
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white/80 text-slate-700 border-slate-200"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded border text-sm bg-slate-100/80 text-slate-400"
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
        </AuthenticatedLayout>
    );
}
