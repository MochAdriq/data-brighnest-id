import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    LayoutDashboard,
    FileText,
    User,
    ShieldCheck,
    LogOut,
} from "lucide-react";

const SidebarLink = ({ href, active, icon, children }) => (
    <Link
        href={href}
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
            active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
    >
        {icon}
        <span>{children}</span>
    </Link>
);

export default function RoleWorkspaceLayout({
    title,
    subtitle,
    children,
    roleType,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isPublisher = roleType === "publisher";
    const isEditor = roleType === "editor";

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.15),transparent_55%)]" />
            <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-blue-900/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 sm:gap-6">
                <aside className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-md h-fit lg:sticky lg:top-6">
                    <div className="px-2 pt-4 pb-4 border-b border-slate-100">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-slate-800" />
                            <span className="text-sm font-bold text-slate-800">Brightnest Institute</span>
                        </Link>
                    </div>

                    <div className="px-2 pb-4 border-b border-slate-100">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                            Workspace
                        </p>
                        <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                            {isPublisher ? "Publisher Desk" : "Editor Desk"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                            {user?.email}
                        </p>
                    </div>

                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                        <SidebarLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                            icon={<LayoutDashboard className="w-4 h-4" />}
                        >
                            Dashboard
                        </SidebarLink>

                        {isPublisher && (
                            <SidebarLink
                                href={route("surveys.create")}
                                active={route().current("surveys.create")}
                                icon={<FileText className="w-4 h-4" />}
                            >
                                Buat Postingan
                            </SidebarLink>
                        )}

                        <SidebarLink
                            href={route("profile.edit")}
                            active={route().current("profile.edit")}
                            icon={<User className="w-4 h-4" />}
                        >
                            Profil
                        </SidebarLink>

                        <SidebarLink
                            href={route("premium.purchase")}
                            active={route().current("premium.purchase")}
                            icon={<ShieldCheck className="w-4 h-4" />}
                        >
                            Premium
                        </SidebarLink>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100"
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar
                        </Link>
                    </div>
                </aside>

                <main className="space-y-6">
                    <section className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-slate-600 mt-2">
                                {subtitle}
                            </p>
                        )}
                    </section>
                    {children}
                </main>
            </div>
        </div>
    );
}
