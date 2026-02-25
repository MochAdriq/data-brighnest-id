import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Clock3,
    FileClock,
    Gem,
    Mail,
    MapPin,
    ShieldCheck,
    UserCircle2,
} from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const formatDate = (value) => {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleDateString('id-ID');
    } catch {
        return '-';
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

function HistoryEmpty({ title, subtitle }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
    );
}

export default function Edit({
    mustVerifyEmail,
    status,
    activeSubscription,
    latestSubscription,
    profileStats,
    subscriptionHistory = [],
    articlePurchaseHistory = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="relative min-h-screen overflow-hidden bg-slate-950 py-8 sm:py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_55%)]" />
                <div className="pointer-events-none absolute -left-20 top-36 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                            <ShieldCheck className="h-4 w-4 text-blue-300" />
                            Anda sedang berada di halaman profile.
                        </div>

                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back ke Dashboard
                        </Link>
                    </div>

                    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                                <div className="flex items-start gap-3">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user?.name || 'Profile'}
                                            className="h-14 w-14 rounded-xl border border-slate-700 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                                            <UserCircle2 className="h-8 w-8 text-slate-300" />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-lg font-bold text-white">{user?.name || '-'}</h1>
                                        <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">
                                            {user?.primary_role || 'member'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <p className="flex items-center gap-2 text-slate-200">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{user?.email || '-'}</span>
                                    </p>
                                    <p className="flex items-center gap-2 text-slate-200">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span>{user?.location || 'Lokasi belum diisi'}</span>
                                    </p>
                                </div>

                                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Status Premium</p>
                                    <p className="mt-1 text-sm font-bold uppercase text-white">
                                        {activeSubscription ? 'active' : latestSubscription?.status || 'none'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        {activeSubscription?.ends_at
                                            ? `Aktif sampai ${formatDate(activeSubscription.ends_at)}`
                                            : 'Belum ada langganan aktif.'}
                                    </p>
                                </div>

                                <Link
                                    href={route('premium.purchase')}
                                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                                >
                                    Kelola Premium
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Artikel Dimiliki</p>
                                    <p className="mt-2 text-2xl font-bold text-white">{profileStats?.article_entitlements || 0}</p>
                                    <p className="mt-1 text-xs text-slate-300">Akses permanen artikel satuan.</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Pending Membership</p>
                                    <p className="mt-2 text-2xl font-bold text-white">{profileStats?.pending_subscriptions || 0}</p>
                                    <p className="mt-1 text-xs text-slate-300">Menunggu verifikasi admin.</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Pending Artikel</p>
                                    <p className="mt-2 text-2xl font-bold text-white">{profileStats?.pending_article_purchases || 0}</p>
                                    <p className="mt-1 text-xs text-slate-300">Pengajuan pembelian satuan.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-700 bg-white p-4 sm:p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Riwayat Membership</h3>
                                <p className="text-sm text-slate-600 mb-4">Riwayat pengajuan dan verifikasi membership Anda.</p>

                                {subscriptionHistory.length === 0 ? (
                                    <HistoryEmpty
                                        title="Belum ada riwayat membership."
                                        subtitle="Pengajuan membership Anda akan tampil di sini."
                                    />
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="min-w-full text-sm text-left text-gray-600">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Tanggal</th>
                                                    <th className="px-4 py-3">Paket</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Nominal</th>
                                                    <th className="px-4 py-3">Verifikator</th>
                                                    <th className="px-4 py-3">Bukti</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subscriptionHistory.map((item) => (
                                                    <tr key={item.id} className="border-b last:border-b-0 bg-white">
                                                        <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                                                        <td className="px-4 py-3">{item.plan_name || '-'}</td>
                                                        <td className="px-4 py-3 uppercase font-semibold">{item.status || '-'}</td>
                                                        <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                                                        <td className="px-4 py-3">{item.verifier?.name || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            {item.proof_path ? (
                                                                <Link
                                                                    href={route('premium.proofs.subscription', item.id)}
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    Lihat Bukti
                                                                </Link>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-white p-4 sm:p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Riwayat Pembelian Artikel</h3>
                                <p className="text-sm text-slate-600 mb-4">Riwayat pembelian artikel satuan dan hasil verifikasinya.</p>

                                {articlePurchaseHistory.length === 0 ? (
                                    <HistoryEmpty
                                        title="Belum ada riwayat pembelian artikel."
                                        subtitle="Pengajuan pembelian artikel Anda akan tampil di sini."
                                    />
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="min-w-full text-sm text-left text-gray-600">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Tanggal</th>
                                                    <th className="px-4 py-3">Artikel</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Nominal</th>
                                                    <th className="px-4 py-3">Verifikator</th>
                                                    <th className="px-4 py-3">Bukti</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {articlePurchaseHistory.map((item) => (
                                                    <tr key={item.id} className="border-b last:border-b-0 bg-white">
                                                        <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-gray-900">{item.survey?.title || '-'}</p>
                                                            {item.survey?.slug ? (
                                                                <Link
                                                                    href={route('surveys.show', item.survey.slug)}
                                                                    className="text-xs text-emerald-700 hover:underline"
                                                                    target="_blank"
                                                                >
                                                                    Buka artikel
                                                                </Link>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-4 py-3 uppercase font-semibold">{item.status || '-'}</td>
                                                        <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                                                        <td className="px-4 py-3">{item.verifier?.name || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            {item.proof_path ? (
                                                                <Link
                                                                    href={route('premium.proofs.article', item.id)}
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    Lihat Bukti
                                                                </Link>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="space-y-6">
                            <div className="rounded-2xl border border-slate-700 bg-slate-900/85 p-5 text-slate-100">
                                <div className="mb-3 flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-blue-300" />
                                    <h3 className="text-sm font-bold uppercase tracking-wide">Ringkasan Notifikasi</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
                                        <p className="text-xs text-slate-400">Konten Baru</p>
                                        <p className="font-semibold">{user?.notify_new_content ? 'Aktif' : 'Nonaktif'}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
                                        <p className="text-xs text-slate-400">Balasan Komentar</p>
                                        <p className="font-semibold">{user?.notify_comment_replies ? 'Aktif' : 'Nonaktif'}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
                                        <p className="text-xs text-slate-400">Status Premium</p>
                                        <p className="font-semibold">{user?.notify_premium_status ? 'Aktif' : 'Nonaktif'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-slate-900/85 p-5 text-slate-100">
                                <div className="mb-3 flex items-center gap-2">
                                    <FileClock className="h-4 w-4 text-blue-300" />
                                    <h3 className="text-sm font-bold uppercase tracking-wide">Info Akun</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <p className="flex items-center gap-2 text-slate-200">
                                        <Clock3 className="h-4 w-4 text-slate-400" />
                                        Zona waktu: {user?.timezone || 'Asia/Jakarta'}
                                    </p>
                                    <p className="flex items-center gap-2 text-slate-200">
                                        <Gem className="h-4 w-4 text-slate-400" />
                                        Bahasa: {user?.locale === 'en' ? 'English' : 'Indonesia'}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-700 bg-white p-4 sm:p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-none"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-700 bg-white p-4 sm:p-6">
                                <UpdatePasswordForm className="max-w-none" />
                            </div>

                            <div className="rounded-2xl border border-red-200 bg-white p-4 sm:p-6">
                                <DeleteUserForm className="max-w-none" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
