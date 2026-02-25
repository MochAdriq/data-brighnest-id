import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Clock3, Eye, Flame } from "lucide-react";

const typeNames = {
    series: "Kilas Data",
    story: "Fokus Utama",
    news: "Kabar Tepi",
};

const toneClassMap = {
    blue: {
        header: "from-blue-50 to-indigo-50 border-blue-100",
        icon: "text-blue-600",
        link: "hover:border-blue-200 hover:bg-blue-50/60",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    amber: {
        header: "from-amber-50 to-orange-50 border-amber-100",
        icon: "text-amber-600",
        link: "hover:border-amber-200 hover:bg-amber-50/60",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
    },
    rose: {
        header: "from-rose-50 to-pink-50 border-rose-100",
        icon: "text-rose-600",
        link: "hover:border-rose-200 hover:bg-rose-50/60",
        badge: "bg-rose-100 text-rose-700 border-rose-200",
    },
    emerald: {
        header: "from-emerald-50 to-teal-50 border-emerald-100",
        icon: "text-emerald-600",
        link: "hover:border-emerald-200 hover:bg-emerald-50/60",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
};

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function WidgetSkeleton({ rows = 4 }) {
    return (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: rows }).map((_, idx) => (
                <div
                    key={idx}
                    className="rounded-xl border border-slate-100 p-3"
                >
                    <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-slate-200 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-3 w-full bg-slate-200 rounded" />
                            <div className="h-3 w-5/6 bg-slate-200 rounded" />
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function WidgetThumb({ image, title, fallbackLabel }) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const src = image ? `/storage/${image}` : null;

    if (!src || failed) {
        return (
            <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase leading-tight flex items-center justify-center text-center px-1 shrink-0">
                {fallbackLabel}
            </div>
        );
    }

    return (
        <div className="relative w-16 h-16 rounded-lg border border-slate-100 overflow-hidden shrink-0 bg-slate-100">
            {!loaded && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
            <img
                src={src}
                alt={title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => {
                    setFailed(true);
                    setLoaded(true);
                }}
            />
        </div>
    );
}

export default function DetailListWidget({
    title,
    items = [],
    emptyText = "Belum ada data.",
    loading = false,
    tone = "blue",
}) {
    const toneClasses = toneClassMap[tone] || toneClassMap.blue;

    return (
        <section className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.12),transparent_50%)]" />

            <div className="relative z-10">
                <div
                    className={`px-4 py-3 border-b bg-gradient-to-r ${toneClasses.header}`}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <Flame className={`w-4 h-4 shrink-0 ${toneClasses.icon}`} />
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                {title}
                            </h4>
                        </div>
                        {!loading && (
                            <span
                                className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${toneClasses.badge}`}
                            >
                                {items.length}
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <WidgetSkeleton />
                    ) : items.length > 0 ? (
                        <div className="space-y-3">
                        {items.map((item) => (
                            <Link
                                key={`${item.type}-${item.id}`}
                                href={route("surveys.show", item.slug || item.id)}
                                className={`group flex gap-3 rounded-xl border border-slate-100 p-3 transition-colors ${toneClasses.link}`}
                            >
                                <WidgetThumb
                                    image={item.image}
                                    title={item.title}
                                    fallbackLabel={typeNames[item.type] || "Data"}
                                />

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                        {typeNames[item.type] || "Data"}
                                    </p>
                                    <h5 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 leading-snug line-clamp-2 mb-2">
                                        {item.title}
                                    </h5>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="w-3 h-3" />
                                            {formatDate(item.created_at)}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {item.views || 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">{emptyText}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
