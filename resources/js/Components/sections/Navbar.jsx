import React, { useEffect, useRef, useState } from "react";
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Menu,
    User,
    X,
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { createPortal } from "react-dom";

const Navbar = ({ user, categories = [] }) => {
    const { url } = usePage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDesktopNavVisible, setIsDesktopNavVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const userRef = useRef(null);
    const lastScrollYRef = useRef(0);

    useEffect(() => {
        let ticking = false;

        const updateNavbarState = () => {
            const currentY = window.scrollY;
            const previousY = lastScrollYRef.current;
            const delta = currentY - previousY;
            const isDesktop = window.innerWidth >= 1024;

            setIsScrolled(currentY > 10);

            if (!isDesktop || isMobileMenuOpen) {
                setIsDesktopNavVisible(true);
            } else if (currentY <= 72) {
                setIsDesktopNavVisible(true);
            } else if (delta > 6) {
                setIsDesktopNavVisible(false);
            } else if (delta < -6) {
                setIsDesktopNavVisible(true);
            }

            lastScrollYRef.current = currentY;
            ticking = false;
        };

        const onScrollOrResize = () => {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateNavbarState);
        };

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        updateNavbarState();

        return () => {
            window.removeEventListener("scroll", onScrollOrResize);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userRef.current && !userRef.current.contains(event.target)) {
                setIsUserOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserOpen(false);
    }, [url]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsDesktopNavVisible(true);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsMobileMenuOpen(false);
                setIsUserOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = previousOverflow || "";
        }

        return () => {
            document.body.style.overflow = previousOverflow || "";
        };
    }, [isMobileMenuOpen]);

    const closeMobileDrawer = () => setIsMobileMenuOpen(false);

    const handleLogout = () => {
        setIsMobileMenuOpen(false);
        setIsUserOpen(false);
        router.post(route("logout"));
    };

    const userRoles = Array.isArray(user?.roles) ? user.roles : [];
    const isSuperAdmin = userRoles.includes("super_admin");
    const isPublisher = userRoles.includes("publisher");
    const isEditor = userRoles.includes("editor");
    const isMember = !isSuperAdmin && !isPublisher && !isEditor;

    const dashboardLabel = isSuperAdmin
        ? "Dashboard Super Admin"
        : isPublisher
          ? "Dashboard Publisher"
          : "Dashboard Editor";

    const mobileDrawer = (
        <div
            id="mobile-nav-drawer"
            className="fixed inset-0 z-[200] flex flex-col bg-white lg:hidden"
        >
            <div className="border-b border-gray-100 px-4">
                <div className="mx-auto flex h-16 max-w-7xl items-center">
                    <Link
                        href="/"
                        className="mr-auto flex items-center gap-3"
                        onClick={closeMobileDrawer}
                    >
                        <img
                            src="/images/brightnest_company.png"
                            alt="Logo"
                            className="h-8 w-auto object-contain"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-500">
                            Brightnest Institute
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={closeMobileDrawer}
                        className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        aria-label="Tutup menu mobile"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block rounded-lg px-3 py-2 text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={closeMobileDrawer}
                    >
                        Beranda
                    </Link>
                    <Link
                        href={route("kilas-data")}
                        className="block rounded-lg px-3 py-2 text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={closeMobileDrawer}
                    >
                        Kilas Data
                    </Link>
                    <Link
                        href={route("fokus-utama")}
                        className="block rounded-lg px-3 py-2 text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={closeMobileDrawer}
                    >
                        Fokus Utama
                    </Link>
                    <Link
                        href={route("berita")}
                        className="block rounded-lg px-3 py-2 text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={closeMobileDrawer}
                    >
                        Berita
                    </Link>
                    <Link
                        href={route("surveys.index", { type: "publikasi_riset" })}
                        className="block rounded-lg px-3 py-2 text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={closeMobileDrawer}
                    >
                        Publikasi Riset
                    </Link>
                </div>

                <div className="mt-5">
                    <span className="mb-2 block px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Topik
                    </span>
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug}`}
                                    className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    onClick={closeMobileDrawer}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="px-3 text-xs italic text-gray-400">
                            Belum ada topik.
                        </p>
                    )}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                    {user ? (
                        <>
                            <div className="mb-4 flex items-center gap-3 px-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-gray-900">
                                        {user.name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={isMember ? route("premium.purchase") : route("dashboard")}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                onClick={closeMobileDrawer}
                            >
                                {isMember ? "Berlangganan" : dashboardLabel}
                            </Link>
                            <Link
                                href={route("profile.edit")}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                onClick={closeMobileDrawer}
                            >
                                Profile Saya
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Keluar
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 px-3">
                            <Link
                                href={route("login")}
                                className="w-full rounded-lg border border-gray-200 py-2.5 text-center text-sm font-bold text-gray-700"
                                onClick={closeMobileDrawer}
                            >
                                Masuk
                            </Link>
                            <Link
                                href={route("register")}
                                className="w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-bold text-white"
                                onClick={closeMobileDrawer}
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[60] w-full border-b transition-transform duration-300 ease-out ${
                    isDesktopNavVisible
                        ? "translate-y-0"
                        : "translate-y-0 lg:-translate-y-full"
                } ${
                    isScrolled
                        ? "border-gray-100 bg-white/95 shadow-sm backdrop-blur-md"
                        : "border-gray-100 bg-white/90 backdrop-blur-sm"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center">
                    <Link
                        href="/"
                        className="mr-auto flex flex-shrink-0 items-center gap-3 group"
                        onClick={() => {
                            setIsUserOpen(false);
                            closeMobileDrawer();
                        }}
                    >
                        <img
                            src="/images/brightnest_company.png"
                            alt="Logo"
                            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                        <span className="hidden md:inline text-xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-500">
                            Brightnest Institute
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-8 mr-8">
                        <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                            Beranda
                        </Link>
                        <Link
                            href={route("kilas-data")}
                            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                DATA
                            </span>
                            Kilas Data
                        </Link>
                        <Link href={route("fokus-utama")} className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                            Fokus Utama
                        </Link>
                        <Link href={route("berita")} className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                            Berita
                        </Link>
                        <Link
                            href={route("surveys.index", { type: "publikasi_riset" })}
                            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            Publikasi Riset
                        </Link>

                        <div className="relative group">
                            <button className="text-sm font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1">
                                Topik <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="invisible absolute left-0 z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                <div className="py-2">
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/category/${cat.slug}`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <span className="block px-4 py-2 text-xs italic text-gray-400">
                                            Belum ada topik.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center">
                        {user ? (
                            <div className="relative" ref={userRef}>
                                <button
                                    onClick={() => setIsUserOpen((state) => !state)}
                                    className="group flex items-center gap-2 rounded-full border border-gray-200 py-1.5 pl-3 pr-2 transition-all hover:border-blue-400 hover:bg-blue-50/50"
                                >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="max-w-[100px] truncate text-sm font-bold text-gray-700 group-hover:text-blue-600">
                                        {user.name.split(" ")[0]}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                </button>

                                {isUserOpen && (
                                    <div className="absolute right-0 mt-3 w-52 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                                        <div className="mb-1 border-b border-gray-50 px-4 py-2">
                                            <p className="text-xs text-gray-500">Masuk sebagai</p>
                                            <p className="truncate text-sm font-bold text-gray-900">{user.email}</p>
                                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                                                {isSuperAdmin
                                                    ? "super_admin"
                                                    : isPublisher
                                                      ? "publisher"
                                                      : isEditor
                                                        ? "editor"
                                                        : "member"}
                                            </p>
                                        </div>

                                        {!isMember && (
                                            <Link
                                                href={route("dashboard")}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                {dashboardLabel}
                                            </Link>
                                        )}

                                        {isMember && (
                                            <Link
                                                href={route("premium.purchase")}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                            >
                                                Berlangganan
                                            </Link>
                                        )}

                                        <Link
                                            href={route("profile.edit")}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Profile Saya
                                        </Link>

                                        <div className="mt-1 border-t border-gray-50 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Keluar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route("login")}
                                    className="text-sm font-bold text-gray-600 transition-colors hover:text-blue-600"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-800 hover:shadow-lg"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((state) => !state)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-nav-drawer"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                    </div>
                </div>
            </nav>
            <div className="h-16 w-full" aria-hidden="true" />

            {isMobileMenuOpen && typeof window !== "undefined"
                ? createPortal(mobileDrawer, document.body)
                : null}
        </>
    );
};

export default Navbar;
