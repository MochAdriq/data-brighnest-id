import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const todayIso = new Date().toISOString().slice(0, 10);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const typeLabels = {
    series: "Kilas Data",
    story: "Fokus Utama",
    news: "Kabar Tepi",
};

export default function PurchaseArticle({
    auth,
    article,
    activeSubscription,
    articlePurchaseState,
    pricing,
    pendingArticleRequests = [],
}) {
    const form = useForm({
        payment_method: "Transfer Bank",
        transfer_date: todayIso,
        reference_no: "",
        user_note: "",
        proof_file: null,
    });

    const blocked =
        Boolean(activeSubscription) ||
        Boolean(articlePurchaseState?.already_owned) ||
        Boolean(articlePurchaseState?.has_pending);

    const submit = (e) => {
        e.preventDefault();
        if (blocked) {
            return;
        }

        form.post(route("premium.article.submit", article.slug));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Detail Pesanan Artikel</h2>}
        >
            <Head title="Detail Pesanan Artikel" />

            <div className="relative min-h-screen overflow-hidden bg-slate-950 py-8 sm:py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_55%)]" />
                <div className="pointer-events-none absolute -left-20 top-36 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                            <ShieldCheck className="h-4 w-4 text-blue-300" />
                            Anda sedang berada di halaman detail pesanan artikel.
                        </div>
                        <Link
                            href={route("surveys.show", article.slug)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back ke Artikel
                        </Link>
                    </div>

                    {activeSubscription && (
                        <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 p-4 text-sm text-blue-200">
                            Membership Anda aktif, artikel ini sudah terbuka tanpa beli satuan.
                        </div>
                    )}
                    {articlePurchaseState?.already_owned && (
                        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                            Artikel ini sudah Anda miliki permanen.
                        </div>
                    )}
                    {articlePurchaseState?.has_pending && (
                        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                            Pengajuan artikel ini masih menunggu verifikasi.
                        </div>
                    )}

                    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                        <h1 className="text-2xl font-black text-white">Detail Pesanan</h1>

                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-slate-400">Konten</span>
                                <span className="font-bold text-right text-white">{article.title}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-400">Tipe</span>
                                <span className="font-bold text-white">{typeLabels[article.type] || article.type}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-400">Kategori</span>
                                <span className="font-bold text-white">{article.category || "Umum"}</span>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-slate-700 pt-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-300">Harga (termasuk pajak)</span>
                                <span className="text-lg font-black text-white">{formatRupiah(pricing?.single_article || 0)}</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-dashed border-slate-600 bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
                            Kode voucher belum tersedia pada sistem saat ini.
                        </div>

                        <form onSubmit={submit} className="mt-5 space-y-4 border-t border-slate-700 pt-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-200">Metode Pembayaran</label>
                                    <input
                                        type="text"
                                        value={form.data.payment_method}
                                        onChange={(e) => form.setData("payment_method", e.target.value)}
                                        className="mt-1 w-full rounded-lg border-slate-700 bg-slate-950 text-white"
                                    />
                                    {form.errors.payment_method && (
                                        <p className="text-xs text-red-400 mt-1">{form.errors.payment_method}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-200">Tanggal Transfer</label>
                                    <input
                                        type="date"
                                        value={form.data.transfer_date}
                                        onChange={(e) => form.setData("transfer_date", e.target.value)}
                                        className="mt-1 w-full rounded-lg border-slate-700 bg-slate-950 text-white"
                                    />
                                    {form.errors.transfer_date && (
                                        <p className="text-xs text-red-400 mt-1">{form.errors.transfer_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-200">No. Referensi (opsional)</label>
                                    <input
                                        type="text"
                                        value={form.data.reference_no}
                                        onChange={(e) => form.setData("reference_no", e.target.value)}
                                        className="mt-1 w-full rounded-lg border-slate-700 bg-slate-950 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-200">Bukti Pembayaran (jpg/png/pdf)</label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => form.setData("proof_file", e.target.files[0])}
                                        className="mt-1 block w-full text-sm text-slate-200"
                                    />
                                    {form.errors.proof_file && (
                                        <p className="text-xs text-red-400 mt-1">{form.errors.proof_file}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-200">Catatan Tambahan</label>
                                <textarea
                                    rows="3"
                                    value={form.data.user_note}
                                    onChange={(e) => form.setData("user_note", e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-700 bg-slate-950 text-white"
                                    placeholder="Opsional"
                                />
                            </div>

                            <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
                                <p className="text-base font-semibold text-white">
                                    Total Pembayaran <span className="text-red-400">{formatRupiah(pricing?.single_article || 0)}</span>
                                </p>
                                <button
                                    type="submit"
                                    disabled={form.processing || blocked}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {form.processing ? "Mengirim..." : "Lanjut Pembayaran"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white">Pending Artikel Satuan</h3>
                        <p className="text-sm text-slate-300 mt-1 mb-4">Daftar pengajuan artikel yang masih menunggu verifikasi.</p>
                        {pendingArticleRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-600 bg-slate-800/60 p-5 text-sm text-slate-300">
                                Belum ada pengajuan artikel satuan yang pending.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {pendingArticleRequests.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                                        <p className="font-semibold text-white">{item.survey?.title || "Artikel premium"}</p>
                                        <p className="text-xs text-slate-300 mt-1">
                                            Diajukan: {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                                        </p>
                                        {item.proof_path ? (
                                            <Link
                                                href={route("premium.proofs.article", item.id)}
                                                className="mt-2 inline-block text-sm text-blue-300 hover:underline"
                                            >
                                                Lihat Bukti Pembayaran
                                            </Link>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
