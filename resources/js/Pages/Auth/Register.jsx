import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path
                fill="#EA4335"
                d="M24 9.5c3.8 0 7.3 1.4 10 3.8l7.5-7.5C36.8 1.8 30.8 0 24 0 14.6 0 6.4 5.4 2.4 13.3l8.8 6.8C13.2 13.7 18.2 9.5 24 9.5z"
            />
            <path
                fill="#4285F4"
                d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.8-2.1 5.2-4.5 6.8l8.1 6.3c4.8-4.4 7.6-10.9 7.6-17.6z"
            />
            <path
                fill="#FBBC05"
                d="M11.2 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-8.8-6.8C.8 16.1 0 20 0 24s.8 7.9 2.4 11.5l8.8-6.8z"
            />
            <path
                fill="#34A853"
                d="M24 48c6.5 0 12-2.1 16-5.8l-8.1-6.3c-2.3 1.6-5.1 2.6-7.9 2.6-5.8 0-10.8-4.2-12.8-9.8l-8.8 6.8C6.4 42.6 14.6 48 24 48z"
            />
        </svg>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <div className="mb-5">
                <h1 className="text-2xl font-extrabold text-white">Buat Akun Baru</h1>
                <p className="mt-1 text-sm text-slate-300">
                    Daftar untuk mulai akses ekosistem Brightnest.
                </p>
            </div>

            <a
                href={route("auth.google.redirect")}
                className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/20 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
                <GoogleIcon />
                Daftar dengan Google
            </a>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-400">atau</span>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                        Nama
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        autoComplete="name"
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Nama lengkap"
                        required
                        autoFocus
                    />
                    <InputError message={errors.name} className="mt-2 text-red-300" />
                </div>

                <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        autoComplete="username"
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="you@brightnest.id"
                        required
                    />
                    <InputError message={errors.email} className="mt-2 text-red-300" />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                    />
                    <InputError message={errors.password} className="mt-2 text-red-300" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                        Konfirmasi Password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        autoComplete="new-password"
                        onChange={(e) => setData("password_confirmation", e.target.value)}
                        placeholder="Ulangi password"
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 text-red-300"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                    {processing ? "Memproses..." : "Daftar"}
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-300">
                Sudah punya akun?{" "}
                <Link
                    href={route("login")}
                    className="font-semibold text-blue-300 underline underline-offset-2 hover:text-blue-200"
                >
                    Masuk
                </Link>
            </p>
        </GuestLayout>
    );
}
