import React, { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const buildSpecialWaLink = (phone, title, userName) => {
    const safePhone = String(phone || "628133113110").replace(/\D/g, "");
    const safeTitle = String(title || "artikel ini").trim();
    const safeUser = String(userName || "").trim();
    const messageParts = [`saya tertarik terkait artikel ${safeTitle}`];

    if (safeUser) {
        messageParts.push(`nama saya ${safeUser}`);
    }

    messageParts.push("mohon info detail akses kategori spesial");

    return `https://wa.me/${safePhone}?text=${encodeURIComponent(
        messageParts.join(", ") + ".",
    )}`;
};

const PLAN_FEATURES = {
    monthly: [
        "Akses konten premium selama paket aktif",
        "Bisa lanjutkan kapan saja",
        "Tanpa iklan pada konten premium",
    ],
    yearly: [
        "Akses premium 12 bulan penuh",
        "Lebih hemat dibanding bulanan",
        "Cocok untuk kebutuhan rutin",
    ],
};

const GROUP_LABELS = {
    monthly: "Bulanan",
    yearly: "Tahunan",
};

const classifyPlanGroup = (plan) => {
    const code = String(plan?.code || "").toLowerCase();
    if (code.includes("year") || Number(plan?.duration_days) >= 300) {
        return "yearly";
    }
    return "monthly";
};

function PlanCard({ plan, recommended = false }) {
    const group = classifyPlanGroup(plan);
    const features = PLAN_FEATURES[group] || [];

    return (
        <div
            className={`h-full rounded-2xl border p-5 sm:p-6 flex flex-col ${
                recommended
                    ? "border-blue-500/70 bg-slate-900/80 shadow-xl shadow-blue-500/10"
                    : "border-slate-700 bg-slate-900/80"
            }`}
        >
            {recommended && (
                <span className="inline-flex w-fit rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Rekomendasi
                </span>
            )}
            <h3 className="mt-3 text-xl font-extrabold text-white">{plan.name}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {GROUP_LABELS[group]} - {plan.duration_days} hari
            </p>
            <p className="mt-3 text-3xl font-black text-white">{formatRupiah(plan.amount)}</p>
            <p className="text-xs text-slate-400">per paket</p>

            <Link
                href={route("premium.checkout", { plan_code: plan.code })}
                className={`mt-5 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold ${
                    recommended
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-blue-400 text-blue-300 hover:bg-blue-500/10"
                }`}
            >
                Dapatkan Sekarang
            </Link>

            <ul className="mt-5 space-y-2 text-sm text-slate-300">
                {features.map((feature) => (
                    <li key={`${plan.code}-${feature}`} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Purchase({
    auth,
    latestSubscription,
    activeSubscription,
    articleEntitlementCount = 0,
    pricing = { single_article: 10000, plans: [] },
    selectedPremiumArticle = null,
    selectedArticlePurchaseState = null,
    pendingArticleRequests = [],
    availablePremiumArticles = [],
    specialPremium = null,
}) {
    const plans = Array.isArray(pricing?.plans) ? pricing.plans : [];
    const groups = useMemo(() => {
        return plans.reduce(
            (acc, plan) => {
                const key = classifyPlanGroup(plan);
                acc[key].push(plan);
                return acc;
            },
            { monthly: [], yearly: [] },
        );
    }, [plans]);

    const [activeTab, setActiveTab] = useState(
        groups.monthly.length > 0 ? "monthly" : "yearly",
    );
    const visiblePlans = groups[activeTab] || [];
    const retailTargetSlug =
        selectedPremiumArticle?.slug || availablePremiumArticles?.[0]?.slug || null;
    const selectedIsSpecial =
        Boolean(selectedArticlePurchaseState?.is_special) ||
        selectedPremiumArticle?.premium_tier === "special";
    const specialWaLink = buildSpecialWaLink(
        specialPremium?.whatsapp_number,
        selectedPremiumArticle?.title,
        auth?.user?.name,
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Berlangganan</h2>}
        >
            <Head title="Berlangganan" />

            <div className="relative min-h-screen overflow-hidden bg-slate-950 py-8 sm:py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_55%)]" />
                <div className="pointer-events-none absolute -left-20 top-36 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                            <ShieldCheck className="h-4 w-4 text-blue-300" />
                            Anda sedang berada di halaman berlangganan.
                        </div>

                        <Link
                            href={route("dashboard")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back ke Dashboard
                        </Link>
                    </div>

                    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            Temukan paket langganan yang sesuai.
                        </h1>
                        <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                            Dapatkan akses lengkap konten premium dan lanjutkan ke detail pesanan untuk proses pembayaran.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("monthly")}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                    activeTab === "monthly"
                                        ? "bg-blue-600 text-white"
                                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                                }`}
                            >
                                Bulanan
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("yearly")}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                    activeTab === "yearly"
                                        ? "bg-blue-600 text-white"
                                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                                }`}
                            >
                                Tahunan
                            </button>
                        </div>

                        {selectedPremiumArticle && (
                            <div className="mt-5 rounded-xl border border-amber-300/40 bg-amber-500/10 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                    Konten Terkunci
                                </p>
                                <p className="mt-1 text-sm text-slate-200">
                                    Anda sedang membuka: <span className="font-semibold">{selectedPremiumArticle.title}</span>.
                                </p>
                                {selectedArticlePurchaseState?.already_owned && (
                                    <p className="mt-1 text-xs text-emerald-700">Artikel ini sudah Anda miliki permanen.</p>
                                )}
                                {selectedIsSpecial && (
                                    <p className="mt-1 text-xs text-cyan-700">
                                        Artikel ini termasuk kategori spesial dan diarahkan ke WhatsApp admin.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visiblePlans.length === 0 ? (
                                <div className="md:col-span-2 rounded-xl border border-dashed border-slate-600 bg-slate-800/60 p-6 text-sm text-slate-300">
                                    Paket {activeTab === "monthly" ? "bulanan" : "tahunan"} belum tersedia.
                                </div>
                            ) : (
                                visiblePlans.map((plan, idx) => (
                                    <PlanCard
                                        key={plan.code}
                                        plan={plan}
                                        recommended={idx === 0}
                                    />
                                ))
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                <p className="text-sm font-bold text-white">Retail</p>
                                <p className="text-xs text-slate-300 mt-1">Mau akses artikel premium satuan?</p>
                                <p className="mt-2 text-sm text-slate-200">
                                    Mulai dari <span className="font-bold">{formatRupiah(pricing.single_article)}</span> / artikel.
                                </p>
                                {selectedIsSpecial ? (
                                    <a
                                        href={specialWaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                    >
                                        Hubungi WhatsApp Admin
                                    </a>
                                ) : retailTargetSlug ? (
                                    <Link
                                        href={route("premium.article.purchase", retailTargetSlug)}
                                        className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                                    >
                                        Beli Artikel Sekarang
                                    </Link>
                                ) : (
                                    <p className="mt-3 text-xs text-slate-400">
                                        Belum ada artikel premium yang tersedia saat ini.
                                    </p>
                                )}
                            </div>
                            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                <p className="text-sm font-bold text-white">Status Akun</p>
                                <p className="text-xs text-slate-300 mt-1">Ringkasan akses premium Anda saat ini.</p>
                                <p className="mt-2 text-sm text-slate-200">
                                    Membership: <span className="font-semibold uppercase">{activeSubscription ? "active" : latestSubscription?.status || "none"}</span>
                                </p>
                                <p className="text-sm text-slate-200">
                                    Artikel dimiliki: <span className="font-semibold">{articleEntitlementCount}</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white">Pending Artikel Satuan</h3>
                        <p className="text-sm text-slate-300 mt-1 mb-4">
                            Daftar pengajuan artikel yang masih menunggu verifikasi.
                        </p>
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
                                            <a
                                                href={route("premium.proofs.article", item.id)}
                                                className="mt-2 inline-block text-sm text-blue-300 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Lihat Bukti Pembayaran
                                            </a>
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
