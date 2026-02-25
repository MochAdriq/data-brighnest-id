import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),transparent_55%)]" />
            <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    <div className="mb-6 text-center">
                        <Link href="/" className="inline-flex items-center justify-center">
                            <ApplicationLogo className="h-12 w-auto" />
                        </Link>
                        <p className="mt-3 text-sm text-slate-300">
                            Platform intelijen data daerah
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
