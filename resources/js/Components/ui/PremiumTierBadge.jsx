const VALID_TIERS = ["free", "premium", "special"];

const BADGE_META = {
    free: {
        label: "GRATIS",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    premium: {
        label: "PREMIUM",
        className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    special: {
        label: "SPESIAL",
        className: "bg-rose-100 text-rose-800 border-rose-200",
    },
};

const resolveTier = (tier, isPremium) => {
    const normalized = String(tier || "")
        .trim()
        .toLowerCase();
    if (VALID_TIERS.includes(normalized)) {
        return normalized;
    }

    return isPremium ? "premium" : "free";
};

export default function PremiumTierBadge({
    tier,
    isPremium = false,
    showFree = false,
    className = "",
}) {
    const resolvedTier = resolveTier(tier, isPremium);
    if (resolvedTier === "free" && !showFree) {
        return null;
    }

    const meta = BADGE_META[resolvedTier] || BADGE_META.free;

    return (
        <span
            className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.className} ${className}`.trim()}
        >
            {meta.label}
        </span>
    );
}
