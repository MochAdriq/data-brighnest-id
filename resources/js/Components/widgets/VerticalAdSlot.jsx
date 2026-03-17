import React from "react";
import { Megaphone, ExternalLink } from "lucide-react";

export default function VerticalAdSlot({
    title = "Slot Iklan",
    size = "160x600",
    className = "",
    slotHeightClass = "h-[600px]",
    ctaLabel = "Pasang Iklan",
    ctaHref = "#",
}) {
    return (
        <aside
            className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.12),transparent_50%)]" />

            <div className="relative z-10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                        Advertisement
                    </span>
                    <Megaphone className="w-4 h-4 text-blue-600" />
                </div>

                <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>
                <p className="text-xs text-slate-500 mb-4">Ukuran {size}</p>

                <div
                    className={`rounded-xl border border-slate-200 ${slotHeightClass} bg-gradient-to-b from-slate-50 to-white flex items-center justify-center text-xs text-slate-400 text-center px-3`}
                >
                    Ruang Iklan Brightnest Institute
                </div>

                <a
                    href={ctaHref}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                    {ctaLabel}
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </aside>
    );
}
