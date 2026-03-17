import { Head, Link, router, useForm } from "@inertiajs/react";
import { Megaphone, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const DEFAULT_FORM = {
    title: "",
    subtitle: "",
    image_file: null,
    cta_label: "Lihat Promo",
    cta_url: "/premium/purchase",
    target_scope: "member_non_premium",
    priority: 0,
    is_active: true,
    starts_at: "",
    ends_at: "",
};

const formatDate = (value) => {
    if (!value) return "-";

    try {
        return new Date(value).toLocaleString("id-ID");
    } catch {
        return "-";
    }
};

function ErrorText({ value }) {
    if (!value) return null;

    return <p className="mt-1 text-xs font-medium text-rose-600">{value}</p>;
}

function Pagination({ links = [] }) {
    if (!Array.isArray(links) || links.length <= 3) return null;

    return (
        <div className="mt-5 flex flex-wrap gap-2">
            {links.map((link, idx) =>
                link.url ? (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                            link.active
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-slate-700"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

function BannerForm({
    form,
    targetEntries,
    submitLabel,
    onSubmit,
    onCancel = null,
    imageHint = null,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Judul Banner
                    </label>
                    <input
                        type="text"
                        value={form.data.title}
                        onChange={(e) => form.setData("title", e.target.value)}
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                        placeholder="Contoh: Upgrade ke Premium Hari Ini"
                    />
                    <ErrorText value={form.errors.title} />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Target Banner
                    </label>
                    <select
                        value={form.data.target_scope}
                        onChange={(e) =>
                            form.setData("target_scope", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                    >
                        {targetEntries.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <ErrorText value={form.errors.target_scope} />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700">
                    Subjudul
                </label>
                <textarea
                    value={form.data.subtitle}
                    onChange={(e) => form.setData("subtitle", e.target.value)}
                    className="mt-1 min-h-[90px] w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                    placeholder="Deskripsi singkat promo"
                />
                <ErrorText value={form.errors.subtitle} />
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700">
                    Gambar Banner
                </label>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) =>
                        form.setData("image_file", e.target.files?.[0] || null)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold"
                />
                {imageHint ? (
                    <p className="mt-1 text-xs text-slate-500">{imageHint}</p>
                ) : (
                    <p className="mt-1 text-xs text-slate-500">
                        Maksimal 4MB. Format: jpg, jpeg, png, webp.
                    </p>
                )}
                <ErrorText value={form.errors.image_file} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Label Tombol CTA
                    </label>
                    <input
                        type="text"
                        value={form.data.cta_label}
                        onChange={(e) =>
                            form.setData("cta_label", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                        placeholder="Lihat Paket"
                    />
                    <ErrorText value={form.errors.cta_label} />
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                        URL CTA (boleh path internal seperti /premium/purchase)
                    </label>
                    <input
                        type="text"
                        value={form.data.cta_url}
                        onChange={(e) => form.setData("cta_url", e.target.value)}
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                        placeholder="https://... atau /premium/purchase"
                    />
                    <ErrorText value={form.errors.cta_url} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Prioritas (lebih besar lebih diprioritaskan)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="9999"
                        value={form.data.priority}
                        onChange={(e) => form.setData("priority", e.target.value)}
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                    <ErrorText value={form.errors.priority} />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Mulai Tayang
                    </label>
                    <input
                        type="datetime-local"
                        value={form.data.starts_at}
                        onChange={(e) =>
                            form.setData("starts_at", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                    <ErrorText value={form.errors.starts_at} />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Selesai Tayang
                    </label>
                    <input
                        type="datetime-local"
                        value={form.data.ends_at}
                        onChange={(e) => form.setData("ends_at", e.target.value)}
                        className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                    <ErrorText value={form.errors.ends_at} />
                </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                    type="checkbox"
                    checked={Boolean(form.data.is_active)}
                    onChange={(e) => form.setData("is_active", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Banner aktif
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitLabel}
                </button>
                {onCancel ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Batal Edit
                    </button>
                ) : null}
            </div>
        </form>
    );
}

export default function PromoBanners({
    auth,
    banners,
    filters = {},
    targetOptions = {},
}) {
    const targetEntries = useMemo(
        () => Object.entries(targetOptions || {}),
        [targetOptions],
    );
    const defaultTarget = targetEntries[0]?.[0] || "member_non_premium";

    const [keyword, setKeyword] = useState(filters?.q || "");
    const [editingId, setEditingId] = useState(null);

    const createForm = useForm({
        ...DEFAULT_FORM,
        target_scope: defaultTarget,
    });

    const editForm = useForm({
        ...DEFAULT_FORM,
        target_scope: defaultTarget,
    });

    const submitSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.promo-banners.index"),
            keyword ? { q: keyword } : {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetSearch = () => {
        setKeyword("");
        router.get(
            route("admin.promo-banners.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const submitCreate = (e) => {
        e.preventDefault();

        createForm.post(route("admin.promo-banners.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                createForm.reset();
                createForm.setData("target_scope", defaultTarget);
                createForm.setData("is_active", true);
                createForm.setData("priority", 0);
            },
        });
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        editForm.clearErrors();
        editForm.setData({
            title: item.title || "",
            subtitle: item.subtitle || "",
            image_file: null,
            cta_label: item.cta_label || "",
            cta_url: item.cta_url || "",
            target_scope: item.target_scope || defaultTarget,
            priority: item.priority ?? 0,
            is_active: item.is_active === true,
            starts_at: item.starts_at_input || "",
            ends_at: item.ends_at_input || "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingId) return;

        editForm
            .transform((data) => ({
                ...data,
                _method: "put",
            }))
            .post(route("admin.promo-banners.update", editingId), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                cancelEdit();
            },
        });
    };

    const destroyBanner = (item) => {
        const confirmed = window.confirm(
            `Hapus banner \"${item.title}\" secara permanen?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(route("admin.promo-banners.destroy", item.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                            Manajemen Popup Banner
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Atur banner promosi untuk user non-premium.
                        </p>
                    </div>
                    <Link
                        href={route("premium.admin.subscriptions")}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Monitoring Premium
                    </Link>
                </div>
            }
        >
            <Head title="Popup Banner" />

            <div className="relative min-h-screen overflow-hidden bg-slate-100 py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),transparent_58%)]" />
                <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-blue-900/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md backdrop-blur sm:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-blue-600" />
                            <h3 className="text-base font-bold text-slate-900">
                                Tambah Banner Baru
                            </h3>
                        </div>
                        <BannerForm
                            form={createForm}
                            targetEntries={targetEntries}
                            submitLabel={createForm.processing ? "Menyimpan..." : "Simpan Banner"}
                            onSubmit={submitCreate}
                        />
                    </section>

                    {editingId && (
                        <section className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-md sm:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Pencil className="h-5 w-5 text-amber-700" />
                                <h3 className="text-base font-bold text-amber-900">
                                    Edit Banner #{editingId}
                                </h3>
                            </div>
                            <BannerForm
                                form={editForm}
                                targetEntries={targetEntries}
                                submitLabel={editForm.processing ? "Menyimpan..." : "Update Banner"}
                                onSubmit={submitEdit}
                                onCancel={cancelEdit}
                                imageHint="Kosongkan jika ingin mempertahankan gambar lama."
                            />
                        </section>
                    )}

                    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md backdrop-blur sm:p-6">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Cari judul, subtitle, CTA..."
                                    className="w-full rounded-lg border-slate-300 bg-white pl-9 text-sm focus:border-slate-400 focus:ring-slate-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Cari
                            </button>
                            <button
                                type="button"
                                onClick={resetSearch}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Reset
                            </button>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-md backdrop-blur">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b bg-slate-100/80">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Banner</th>
                                        <th className="px-4 py-3 text-left">Target</th>
                                        <th className="px-4 py-3 text-left">Prioritas</th>
                                        <th className="px-4 py-3 text-left">Periode</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banners?.data?.length > 0 ? (
                                        banners.data.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b align-top hover:bg-slate-50/80"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-16 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : null}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">
                                                                {item.title}
                                                            </p>
                                                            {item.subtitle ? (
                                                                <p className="mt-1 max-w-md text-xs text-slate-600">
                                                                    {item.subtitle}
                                                                </p>
                                                            ) : null}
                                                            <p className="mt-1 text-xs text-blue-700">
                                                                {item.cta_label} - {item.cta_url}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {targetOptions?.[item.target_scope] || item.target_scope}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {item.priority}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    <p>Mulai: {formatDate(item.starts_at)}</p>
                                                    <p>Selesai: {formatDate(item.ends_at)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                                                            item.is_active
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-200 text-slate-600"
                                                        }`}
                                                    >
                                                        {item.is_active ? "Aktif" : "Nonaktif"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(item)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroyBanner(item)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-slate-500"
                                            >
                                                Belum ada banner. Klik <span className="font-semibold">Tambah Banner Baru</span> untuk membuat promo pertama.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 pb-4 sm:px-6">
                            <Pagination links={banners?.links || []} />
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
