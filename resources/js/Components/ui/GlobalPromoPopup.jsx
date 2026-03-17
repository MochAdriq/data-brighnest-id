import { Link, usePage } from "@inertiajs/react";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const INTERNAL_ROLES = ["super_admin", "publisher", "editor"];
const GUEST_STORAGE_KEY = "brightnest_popup_guest_last_seen";
const MEMBER_STORAGE_PREFIX = "brightnest_popup_member";

const toLocalDateStamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const isExternalUrl = (url) => /^https?:\/\//i.test(String(url || "").trim());

const readStoredDate = (key) => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStoredDate = (key, value) => {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Ignore localStorage write failures (private mode / strict policy).
    }
};

function ActionButton({ href, label, className = "", onClick = null }) {
    if (!href) {
        return null;
    }

    if (isExternalUrl(href)) {
        return (
            <a
                href={href}
                className={className}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
            >
                {label}
            </a>
        );
    }

    return (
        <Link href={href} className={className} onClick={onClick}>
            {label}
        </Link>
    );
}

export default function GlobalPromoPopup() {
    const { props } = usePage();
    const authUser = props?.auth?.user || null;
    const popupConfig = props?.globalPromoPopup || {};
    const guestConfig = popupConfig?.guest || null;
    const memberBanner = popupConfig?.member_banner || null;
    const roles = Array.isArray(authUser?.roles) ? authUser.roles : [];
    const hasInternalRole = roles.some((role) => INTERNAL_ROLES.includes(role));

    const shouldShowGuest = !authUser && !!guestConfig;
    const shouldShowMember =
        !!authUser &&
        !hasInternalRole &&
        popupConfig?.eligible_member_non_premium === true &&
        !!memberBanner;

    const popupPayload = useMemo(() => {
        if (shouldShowGuest) {
            return {
                mode: "guest",
                title: guestConfig?.title,
                subtitle: guestConfig?.subtitle,
                image_url: guestConfig?.image_url,
                primary_cta_label: guestConfig?.primary_cta_label || "Masuk",
                primary_cta_url: guestConfig?.primary_cta_url || "/login",
                secondary_cta_label: guestConfig?.secondary_cta_label || "Daftar",
                secondary_cta_url: guestConfig?.secondary_cta_url || "/register",
            };
        }

        if (shouldShowMember) {
            return {
                mode: "member",
                title: memberBanner?.title,
                subtitle: memberBanner?.subtitle,
                image_url: memberBanner?.image_url,
                primary_cta_label: memberBanner?.cta_label || "Lihat Promo",
                primary_cta_url: memberBanner?.cta_url || "/premium/purchase",
                secondary_cta_label: null,
                secondary_cta_url: null,
            };
        }

        return null;
    }, [guestConfig, memberBanner, shouldShowGuest, shouldShowMember]);

    const storageKey = useMemo(() => {
        if (!popupPayload) {
            return null;
        }

        if (popupPayload.mode === "guest") {
            return GUEST_STORAGE_KEY;
        }

        return `${MEMBER_STORAGE_PREFIX}_${authUser?.id}_last_seen`;
    }, [authUser?.id, popupPayload]);

    const delayMs = Number(popupConfig?.delay_ms || 4000);
    const closeUnlockMs = Number(popupConfig?.close_unlock_ms || 3000);

    const [isOpen, setIsOpen] = useState(false);
    const [canClose, setCanClose] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    const closePopup = () => {
        if (!canClose) {
            return;
        }

        setIsOpen(false);
    };

    useEffect(() => {
        if (!popupPayload || !storageKey) {
            setIsOpen(false);
            return;
        }

        const currentDay = toLocalDateStamp();
        const seenDay = readStoredDate(storageKey);
        if (seenDay === currentDay) {
            setIsOpen(false);
            return;
        }

        const timer = window.setTimeout(() => {
            setIsOpen(true);
            writeStoredDate(storageKey, currentDay);
        }, delayMs);

        return () => {
            window.clearTimeout(timer);
        };
    }, [delayMs, popupPayload, storageKey]);

    useEffect(() => {
        if (!isOpen) {
            setCanClose(false);
            setRemainingSeconds(0);
            return;
        }

        setCanClose(false);
        setRemainingSeconds(Math.ceil(closeUnlockMs / 1000));

        const unlockTimer = window.setTimeout(() => {
            setCanClose(true);
        }, closeUnlockMs);

        const countdownTimer = window.setInterval(() => {
            setRemainingSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => {
            window.clearTimeout(unlockTimer);
            window.clearInterval(countdownTimer);
        };
    }, [closeUnlockMs, isOpen]);

    if (!popupPayload || !isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[90] bg-slate-950/85 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
            <div className="relative mx-auto h-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl">
                {popupPayload?.image_url ? (
                    <img
                        src={popupPayload.image_url}
                        alt={popupPayload.title || "Promo"}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-900/60" />

                <button
                    type="button"
                    onClick={closePopup}
                    disabled={!canClose}
                    className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <X className="h-3.5 w-3.5" />
                    {canClose ? "Tutup" : `Tutup (${remainingSeconds})`}
                </button>

                <div className="relative grid h-full min-h-[520px] grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:p-12">
                    <div className="flex h-full flex-col justify-center">
                        <p className="mb-3 inline-flex w-fit rounded-full border border-sky-300/50 bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100">
                            {popupPayload.mode === "guest"
                                ? "Akses Brightnest Institute"
                                : "Promo Khusus Member"}
                        </p>

                        <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                            {popupPayload.title}
                        </h2>

                        {popupPayload.subtitle ? (
                            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                                {popupPayload.subtitle}
                            </p>
                        ) : null}

                        <div className="mt-7 flex flex-wrap gap-3">
                            <ActionButton
                                href={popupPayload.primary_cta_url}
                                label={popupPayload.primary_cta_label || "Lihat"}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                                onClick={() => setIsOpen(false)}
                            />
                            {popupPayload.secondary_cta_url && popupPayload.secondary_cta_label ? (
                                <ActionButton
                                    href={popupPayload.secondary_cta_url}
                                    label={popupPayload.secondary_cta_label}
                                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                                    onClick={() => setIsOpen(false)}
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="hidden h-full items-end justify-end lg:flex">
                        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-slate-900/35 shadow-xl backdrop-blur-sm">
                            {popupPayload?.image_url ? (
                                <img
                                    src={popupPayload.image_url}
                                    alt="Preview banner"
                                    className="h-[300px] w-full object-cover"
                                />
                            ) : (
                                <div className="h-[300px] w-full bg-gradient-to-br from-blue-500/30 to-slate-900/90" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
