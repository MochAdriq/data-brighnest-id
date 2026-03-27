import React, { useState } from "react";
import {
    Calendar,
    Copy,
    Download,
    Eye,
    Facebook,
    FileText,
    Link2,
    Lock,
    MessageCircle,
    Send,
    Share2,
    User,
    BarChart3,
    Gem,
    ShieldCheck,
    ShoppingBag,
    Banknote,
    CreditCard,
    Wallet,
} from "lucide-react";
import { usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
);

const chartColors = [
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 99, 132, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
];

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const SPECIAL_WHATSAPP_NUMBER = "628133113110";

const buildSpecialWaLink = (title, userName) => {
    const safeTitle = String(title || "artikel ini").trim();
    const safeUser = String(userName || "").trim();
    const articleUrl = typeof window !== "undefined" ? window.location.href : "";

    const messageParts = [`saya tertarik terkait artikel ${safeTitle}`];

    if (safeUser) {
        messageParts.push(`nama saya ${safeUser}`);
    }

    if (articleUrl) {
        messageParts.push(`link artikel ${articleUrl}`);
    }

    messageParts.push("mohon info detail akses kategori spesial");

    return `https://wa.me/${SPECIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        messageParts.join(", ") + ".",
    )}`;
};

function PaywallPanel({ article, pricing = {}, compact = false }) {
    const { auth } = usePage().props;
    const isSpecialPremium =
        article?.premium_tier === "special" ||
        article?.is_special_premium === true;
    const waLink = buildSpecialWaLink(article?.title, auth?.user?.name);

    if (isSpecialPremium) {
        return (
            <div
                className={`rounded-2xl border border-slate-300 bg-white overflow-hidden ${
                    compact ? "shadow-lg" : "shadow-sm"
                }`}
            >
                <div className="bg-gradient-to-r from-[#0B2A48] via-[#2F63D7] to-[#0EA5A4] px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-white/15 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-white/80">
                                Kategori Spesial
                            </p>
                            <p className="text-sm font-bold text-white">
                                Konten ini diakses via admin Brightnest Institute
                            </p>
                        </div>
                    </div>
                    <ApplicationLogo className="h-7 w-auto object-contain" />
                </div>

                <div className="px-4 py-5 bg-slate-50/80">
                    <p className="text-sm text-slate-700 text-center">
                        Untuk artikel kategori spesial, silakan hubungi admin
                        melalui WhatsApp.
                    </p>

                    <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                        Hubungi via WhatsApp
                    </a>

                    <p className="mt-2 text-center text-xs text-slate-500">
                        WhatsApp: 08133113110
                    </p>
                </div>
            </div>
        );
    }

    const plans = Array.isArray(pricing?.plans) ? pricing.plans : [];
    const monthly = plans.find((p) => p.code === "monthly") || plans[0] || null;
    const yearly = plans.find((p) => p.code === "yearly") || plans[1] || null;
    const singlePrice = Number(pricing?.single_article || 10000);
    const monthlyPrice = Number(monthly?.amount || 50000);
    const yearlyPrice = Number(yearly?.amount || 500000);
    const paymentMethods = [
        { icon: Wallet, label: "QRIS / E-Wallet" },
        { icon: Banknote, label: "Transfer Bank" },
        { icon: CreditCard, label: "Kartu Debit/Kredit" },
    ];

    return (
        <div className={`rounded-2xl border border-slate-300 bg-white overflow-hidden ${compact ? "shadow-lg" : "shadow-sm"}`}>
            <div className="bg-gradient-to-r from-[#0B2A48] via-[#2F63D7] to-[#D414D4] px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-white/15 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-white/80">Akses Premium Brightnest Institute</p>
                        <p className="text-sm font-bold text-white">Konten ini terkunci premium</p>
                    </div>
                </div>
                <ApplicationLogo className="h-7 w-auto object-contain" />
            </div>

            <div className="px-4 py-5 bg-slate-50/80">
                <p className="text-sm text-slate-700 text-center">
                    Anda mengakses konten premium. Lanjutkan dengan berlangganan atau beli artikel ini saja.
                </p>

                <div className={`mt-4 grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Gem className="w-4 h-4 text-blue-600" />
                            Paket Tahunan
                        </p>
                        <p className="text-xs text-slate-600 mt-2">Paket tahunan, akses premium lebih hemat.</p>
                        <p className="mt-3 text-lg font-extrabold text-slate-900">{formatRupiah(yearlyPrice)}</p>
                        <p className="text-xs text-slate-500">per tahun</p>
                        <a
                            href={route("premium.purchase", { survey: article.slug, mode: "membership" })}
                            className="mt-3 inline-flex w-full justify-center rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                        >
                            Pilih Tahunan
                        </a>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            Paket Bulanan
                        </p>
                        <p className="text-xs text-slate-600 mt-2">Langganan bulanan untuk akses semua konten premium.</p>
                        <p className="mt-3 text-lg font-extrabold text-slate-900">{formatRupiah(monthlyPrice)}</p>
                        <p className="text-xs text-slate-500">per bulan</p>
                        <a
                            href={route("premium.purchase", { survey: article.slug, mode: "membership" })}
                            className="mt-3 inline-flex w-full justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Pilih Bulanan
                        </a>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                            Beli per Artikel
                        </p>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                            Beli akses penuh artikel: "{article.title || "Artikel Premium"}".
                        </p>
                        <p className="mt-3 text-lg font-extrabold text-slate-900">{formatRupiah(singlePrice)}</p>
                        <p className="text-xs text-slate-500">sekali beli</p>
                        <a
                            href={route("premium.article.purchase", article.slug)}
                            className="mt-3 inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Beli Artikel Ini
                        </a>
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-slate-500 mb-2">Pembayaran tersedia:</p>
                    <div className="flex flex-wrap items-center gap-3">
                        {paymentMethods.map((item) => {
                            const Icon = item.icon;
                            return (
                                <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                    <Icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


function SharePanel({ article }) {
    const [isCopySuccess, setIsCopySuccess] = useState(false);
    const [shareNotice, setShareNotice] = useState("");

    const shareUrl =
        typeof window !== "undefined" ? window.location.href : "";
    const title = String(article?.title || "Brightnest Institute").trim();
    const teaser = String(
        article?.lead ||
            article?.notes ||
            "Baca konten terbaru Brightnest Institute.",
    ).trim();
    const shareText = `${title} - ${teaser}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const shareLinks = [
        {
            key: "wa",
            label: "WhatsApp",
            href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            Icon: MessageCircle,
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
        {
            key: "fb",
            label: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            Icon: Facebook,
            className:
                "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        },
        {
            key: "x",
            label: "X / Twitter",
            href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            Icon: Send,
            className:
                "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
        },
        {
            key: "linkedin",
            label: "LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            Icon: Link2,
            className:
                "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
        },
    ];

    const copyToClipboard = async () => {
        if (!shareUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopySuccess(true);
            setShareNotice("Link berhasil disalin.");
            window.setTimeout(() => {
                setIsCopySuccess(false);
                setShareNotice("");
            }, 1800);
        } catch (error) {
            setShareNotice("Gagal menyalin link.");
        }
    };

    const handleNativeShare = async () => {
        if (typeof navigator === "undefined" || !navigator.share) {
            copyToClipboard();
            return;
        }

        try {
            await navigator.share({
                title,
                text: teaser,
                url: shareUrl,
            });
            setShareNotice("");
        } catch (error) {
            if (error?.name !== "AbortError") {
                setShareNotice("Browser tidak bisa membagikan konten ini.");
            }
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Bagikan Artikel
                    </p>
                    <p className="text-sm text-slate-600">
                        Bagikan ke sosial media atau copy link artikel.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {shareLinks.map((item) => {
                    const Icon = item.Icon;
                    return (
                        <a
                            key={item.key}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${item.className}`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </a>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="truncate text-xs text-slate-500">{shareUrl}</p>
                <button
                    type="button"
                    onClick={copyToClipboard}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
                        isCopySuccess
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    <Copy className="h-3.5 w-3.5" />
                    {isCopySuccess ? "Tersalin" : "Copy"}
                </button>
            </div>

            {shareNotice && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                    {shareNotice}
                </p>
            )}
        </section>
    );
}
function AdSlot({ label = "Ad Slot" }) {
    return (
        <div className="border border-dashed border-slate-300 bg-slate-50 rounded-xl p-6 text-center">
            <p className="text-xs tracking-[0.25em] text-slate-400 uppercase mb-2">
                Advertisement
            </p>
            <p className="text-sm font-semibold text-slate-600">{label}</p>
        </div>
    );
}

export default function ArticleViewer({ article, chartData, premiumPricing }) {
    const isSeries = article.type === "series";
    const isResearchPublication = article.type === "publikasi_riset";
    const isLocked = Boolean(article.is_locked);
    const lockMode = article.lock_mode || "none";

    const renderChart = (label, rawData) => {
        if (!rawData || !rawData.labels) return null;

        const chartType = article.chart_type || "bar";
        const isInteractive = Boolean(article.is_interactive);

        if (chartType === "table") {
            const fullData = article.csv_data || [];
            const headers = fullData.length > 0 ? Object.keys(fullData[0]) : [];

            return (
                <div className="w-full my-4">
                    <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-200 rounded-xl shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b sticky top-0 z-10">
                                <tr>
                                    {headers.map((header) => (
                                        <th
                                            key={header}
                                            className="px-6 py-4 font-bold text-blue-800 bg-gray-100 border-r border-gray-200 last:border-r-0"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fullData.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="bg-white border-b hover:bg-blue-50 transition-colors"
                                    >
                                        {headers.map((colKey) => (
                                            <td
                                                key={`${rowIdx}-${colKey}`}
                                                className="px-6 py-4 border-r border-gray-100 last:border-r-0 font-mono text-gray-700"
                                            >
                                                {row[colKey]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: label, font: { size: 16 } },
                tooltip: { enabled: isInteractive },
            },
            hover: {
                mode: isInteractive ? "nearest" : null,
                intersect: isInteractive,
            },
            scales:
                chartType === "pie"
                    ? {}
                    : {
                          x: { display: true },
                          y: { beginAtZero: true },
                      },
        };

        const data = {
            labels: (rawData.labels || []).map(String),
            datasets: [
                {
                    label: "Nilai Data",
                    data: rawData.values,
                    backgroundColor:
                        chartType === "pie"
                            ? chartColors
                            : chartColors.map((c) => c.replace("0.7", "1")),
                    borderColor: chartColors.map((c) => c.replace("0.7", "1")),
                    borderWidth: 1,
                    tension: 0.3,
                    fill: chartType === "line",
                },
            ],
        };

        if (chartType === "pie") {
            return (
                <div className="h-[280px] sm:h-[350px] w-full flex justify-center items-center p-2">
                    <Pie data={data} options={options} />
                </div>
            );
        }

        if (chartType === "line") {
            return (
                <div className="h-[280px] sm:h-[350px] w-full flex justify-center items-center p-2">
                    <Line data={data} options={options} />
                </div>
            );
        }

        return (
            <div className="h-[280px] sm:h-[350px] w-full flex justify-center items-center p-2">
                <Bar data={data} options={options} />
            </div>
        );
    };

    if (isSeries) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {article.category}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {article.created_at
                            ? new Date(article.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                              })
                            : "Tanggal Draft"}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                    {article.title || "Judul Data"}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{article.pic || "Redaksi"}</p>
                            <p className="text-xs text-gray-500">Data Journalist</p>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views || 0} views
                    </div>
                </div>

                {isLocked && lockMode === "full" ? (
                    <PaywallPanel article={article} pricing={premiumPricing} />
                ) : (
                    <>
                        <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center mb-6">
                                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">Data Insight</h3>
                                    <p className="text-sm text-gray-600">
                                        {article.is_interactive
                                            ? "Visualisasi interaktif (Sentuh grafik)."
                                            : "Visualisasi data statis."}
                                    </p>
                                </div>
                            </div>

                            {chartData && Object.keys(chartData).length > 0 ? (
                                <div className="grid grid-cols-1 gap-8">
                                    {Object.entries(chartData).map(([key, data]) => (
                                        <div
                                            key={key}
                                            className="bg-white p-2 rounded-xl shadow-sm border border-gray-100"
                                        >
                                            {renderChart(key, data)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>Visualisasi data belum tersedia.</p>
                                </div>
                            )}
                        </div>

                        {article.notes && (
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Catatan Teknis:</h4>
                                <p className="text-sm text-gray-500 italic">{article.notes}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    if (isResearchPublication) {
        const publicationImageUrl = article.image ? `/storage/${article.image}` : null;

        return (
            <div className="space-y-8">
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-10 border-b border-gray-100">
                        <div className="flex flex-wrap gap-3 items-center text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">
                            <span className="px-2 py-1 rounded bg-cyan-50 text-cyan-700">
                                Publikasi Riset
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-100">
                                {article.category || "Umum"}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
                            {article.title}
                        </h1>

                        <div className="border-t border-b border-slate-100 py-3">
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="text-slate-400">Penulis:</span>
                                    <span className="font-semibold text-slate-900">
                                        {article.pic || "Redaksi"}
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>
                                        {article.created_at
                                            ? new Date(article.created_at).toLocaleDateString("id-ID", {
                                                  day: "numeric",
                                                  month: "long",
                                                  year: "numeric",
                                              })
                                            : "-"}
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-slate-400" />
                                    <span>{article.views || 0} views</span>
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="text-slate-400">Tahun:</span>
                                    <span className="font-semibold text-slate-900">
                                        {article.published_year || "-"}
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 min-w-0">
                                    <span className="text-slate-400">Topik:</span>
                                    <span className="font-semibold text-slate-900 break-words">
                                        {article.research_topic || "-"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 space-y-6">
                        {publicationImageUrl ? (
                            <figure className="space-y-2">
                                <img
                                    src={publicationImageUrl}
                                    alt={article.title}
                                    className="block w-full h-auto max-h-[72vh] object-contain rounded-2xl border border-slate-100 bg-white"
                                />
                            </figure>
                        ) : null}

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                                Pengantar
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                {article.lead || "Publikasi ini belum memiliki pengantar."}
                            </p>
                        </div>

                        <SharePanel article={article} />

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="text-base font-bold text-slate-900">
                                    File Publikasi
                                </h3>
                            </div>

                            {!article.has_publication_pdf ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                                    File PDF belum tersedia.
                                </div>
                            ) : isLocked ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                                    File PDF terkunci. Login dengan akun premium aktif untuk mengunduh publikasi ini.
                                </div>
                            ) : (
                                <a
                                    href={route(
                                        "surveys.publication.download",
                                        article.slug || article.id,
                                    )}
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </a>
                            )}
                        </section>

                        {isLocked && <PaywallPanel article={article} pricing={premiumPricing} compact />}
                    </div>
                </article>
            </div>
        );
    }

    const imageUrl = article.image ? `/storage/${article.image}` : null;
    const typeBadgeLabel =
        {
            story: "Fokus Utama",
        news: "Berita",
            publikasi_riset: "Publikasi Riset",
        }[article.type] || "Artikel";

    return (
        <div className="space-y-8">
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10 border-b border-gray-100">
                    <div className="flex flex-wrap gap-3 items-center text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">{typeBadgeLabel}</span>
                        <span className="px-2 py-1 rounded bg-slate-100">{article.category || "Umum"}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6">{article.title}</h1>

                    <div className="border-t border-b border-slate-100 py-3">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="text-slate-400">Penulis:</span>
                                <span className="font-semibold text-slate-900">
                                    {article.pic || "Redaksi"}
                                </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>
                                    {article.created_at
                                        ? new Date(article.created_at).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                          })
                                        : "-"}
                                </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <span>{article.views || 0} views</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                    {isLocked && lockMode === "teaser" ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                            Gambar utama disembunyikan untuk konten premium terkunci.
                        </div>
                    ) : imageUrl ? (
                        <figure className="space-y-2">
                            <img
                                src={imageUrl}
                                alt={article.title}
                                className="block mx-auto w-auto h-auto max-w-full rounded-xl border border-slate-100"
                            />
                            <figcaption className="text-xs text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                                <span>{article.image_caption || "Tanpa caption"}</span>
                                <span>{article.image_copyright || ""}</span>
                            </figcaption>
                        </figure>
                    ) : null}

                    <AdSlot label="Leaderboard 970x90" />

                    {article.lead && (
                        <p className="text-lg leading-relaxed text-slate-700 font-medium border-l-4 border-blue-200 pl-4">
                            {article.lead}
                        </p>
                    )}

                    <SharePanel article={article} />

                    <div className="relative">
                        <div
                            className={`prose prose-lg max-w-none text-slate-700 break-words ${
                                isLocked && lockMode === "teaser"
                                    ? "max-h-[460px] overflow-hidden blur-[2px] select-none pointer-events-none"
                                    : ""
                            }`}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        isLocked && lockMode === "teaser"
                                            ? article.teaser_content || "<p>Konten premium tersedia setelah berlangganan.</p>"
                                            : article.content || "<p>Belum ada konten.</p>",
                                }}
                            />
                        </div>

                        {isLocked && lockMode === "teaser" && (
                            <>
                                <div className="absolute inset-0 z-10 pointer-events-none rounded-xl backdrop-blur-sm bg-slate-900/10" />
                                <div className="absolute inset-0 z-20 pointer-events-none rounded-xl bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0)_35%,_rgba(15,23,42,0.26)_100%)]" />
                                <div className="absolute inset-x-0 bottom-0 z-20 h-48 pointer-events-none bg-gradient-to-t from-white via-white/95 to-transparent" />
                                <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 w-[94%] md:w-[86%]">
                                    <PaywallPanel article={article} pricing={premiumPricing} compact />
                                </div>
                            </>
                        )}
                    </div>

                    <AdSlot label="In-Article Rectangle 300x250" />
                </div>
            </article>

            <AdSlot label="Footer Billboard 970x250" />
        </div>
    );
}

