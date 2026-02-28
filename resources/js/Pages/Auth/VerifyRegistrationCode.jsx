import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

function formatErrorMessages(errors) {
    return Object.values(errors || {}).flat().filter(Boolean);
}

export default function VerifyRegistrationCode({
    email,
    status,
    remainingAttempts,
    maxAttempts,
    resendAvailableIn,
    expiresAt,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: "",
    });
    const [secondsToResend, setSecondsToResend] = useState(resendAvailableIn || 0);

    useEffect(() => {
        setSecondsToResend(resendAvailableIn || 0);
    }, [resendAvailableIn]);

    useEffect(() => {
        if (secondsToResend <= 0) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setSecondsToResend((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [secondsToResend]);

    useEffect(() => {
        const messages = formatErrorMessages(errors);
        if (messages.length === 0) {
            return;
        }

        Swal.fire({
            icon: "error",
            title: "Verifikasi gagal",
            text: messages[0],
            confirmButtonColor: "#2563eb",
        });
    }, [errors]);

    useEffect(() => {
        if (!status) {
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Kode terkirim",
            text: status,
            confirmButtonColor: "#2563eb",
        });
    }, [status]);

    const expiresLabel = useMemo(() => {
        if (!expiresAt) {
            return null;
        }

        return new Date(expiresAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [expiresAt]);

    const submit = (e) => {
        e.preventDefault();

        post(route("register.verify.store"), {
            onFinish: () => reset("code"),
        });
    };

    const resendCode = () => {
        post(route("register.verify.resend"), {
            preserveScroll: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="mb-5">
                <h1 className="text-2xl font-extrabold text-white">Verifikasi Email</h1>
                <p className="mt-1 text-sm text-slate-300">
                    Masukkan 6 digit kode yang dikirim ke <span className="font-semibold text-blue-300">{email}</span>.
                </p>
                {expiresLabel && (
                    <p className="mt-2 text-xs text-slate-400">
                        Kode berlaku sampai sekitar {expiresLabel}. Sisa percobaan: {remainingAttempts}/{maxAttempts}
                    </p>
                )}
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label
                        htmlFor="code"
                        className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                    >
                        Kode Verifikasi
                    </label>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        pattern="\\d{6}"
                        maxLength={6}
                        value={data.code}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-center text-lg tracking-[0.5em] text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        onChange={(e) => setData("code", e.target.value.replace(/\D/g, ""))}
                        placeholder="------"
                        autoFocus
                        required
                    />
                    <InputError message={errors.code} className="mt-2 text-red-300" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                    {processing ? "Memproses..." : "Verifikasi"}
                </button>

                <button
                    type="button"
                    onClick={resendCode}
                    disabled={processing || secondsToResend > 0}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {secondsToResend > 0
                        ? `Kirim Ulang (${secondsToResend}s)`
                        : "Kirim Ulang Kode"}
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-300">
                Mau ganti email?{" "}
                <Link
                    href={route("register")}
                    className="font-semibold text-blue-300 underline underline-offset-2 hover:text-blue-200"
                >
                    Daftar ulang
                </Link>
            </p>
        </GuestLayout>
    );
}
