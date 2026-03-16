import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { auth, globalCategoryTree = [] } = usePage().props;
    const user = auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            avatar: user.avatar || '',
            bio: user.bio || '',
            location: user.location || '',
            website_url: user.website_url || '',
            preferred_categories: Array.isArray(user.preferred_categories)
                ? user.preferred_categories
                : [],
            notify_new_content: Boolean(user.notify_new_content),
            notify_comment_replies: Boolean(user.notify_comment_replies),
            notify_premium_status: Boolean(user.notify_premium_status),
            locale: user.locale || 'id',
            timezone: user.timezone || 'Asia/Jakarta',
        });

    const toggleCategory = (categoryId) => {
        const selected = Array.isArray(data.preferred_categories)
            ? data.preferred_categories
            : [];

        if (selected.includes(categoryId)) {
            setData(
                'preferred_categories',
                selected.filter((item) => item !== categoryId),
            );
            return;
        }

        setData('preferred_categories', [...selected, categoryId]);
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const fieldClass =
        'mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500';
    const textareaClass =
        'mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 shadow-sm focus:border-blue-500 focus:ring-blue-500';
    const selectClass =
        'mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500';

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-white">
                    Identitas & Preferensi
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                    Atur profil publik, topik favorit, dan preferensi notifikasi.
                </p>
            </header>

            {status === 'profile-email-changed' && (
                <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                    Email berhasil diubah. Status verifikasi email direset, silakan verifikasi ulang.
                </div>
            )}
            {status === 'profile-updated' && (
                <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    Profil berhasil diperbarui.
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama" className="text-slate-200" />

                        <TextInput
                            id="name"
                            className={fieldClass}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError className="mt-2 !text-red-400" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-slate-200" />

                        <TextInput
                            id="email"
                            type="email"
                            className={fieldClass}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-2 !text-red-400" message={errors.email} />
                        <p className="mt-2 text-xs text-slate-400">
                            Status verifikasi email:{" "}
                            <span className="font-semibold text-slate-200">
                                {user.email_verified_at ? 'Terverifikasi' : 'Belum terverifikasi'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="avatar" value="URL Foto Profil" className="text-slate-200" />
                        <TextInput
                            id="avatar"
                            type="url"
                            className={fieldClass}
                            value={data.avatar}
                            onChange={(e) => setData('avatar', e.target.value)}
                            placeholder="https://..."
                        />
                        <InputError className="mt-2 !text-red-400" message={errors.avatar} />
                    </div>

                    <div>
                        <InputLabel htmlFor="location" value="Lokasi" className="text-slate-200" />
                        <TextInput
                            id="location"
                            className={fieldClass}
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="Kota, Provinsi"
                        />
                        <InputError className="mt-2 !text-red-400" message={errors.location} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="website_url" value="Website" className="text-slate-200" />
                    <TextInput
                        id="website_url"
                        type="url"
                        className={fieldClass}
                        value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)}
                        placeholder="https://website-anda.com"
                    />
                    <InputError className="mt-2 !text-red-400" message={errors.website_url} />
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="Bio Singkat" className="text-slate-200" />
                    <textarea
                        id="bio"
                        rows={4}
                        className={textareaClass}
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Ceritakan profil Anda dalam 1-3 kalimat"
                    />
                    <InputError className="mt-2 !text-red-400" message={errors.bio} />
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-100">
                        Topik Favorit
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {globalCategoryTree.map((category) => (
                            <label
                                key={category.id}
                                className="inline-flex items-center gap-2 text-sm text-slate-300"
                            >
                                <Checkbox
                                    checked={data.preferred_categories.includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                />
                                <span>{category.name}</span>
                            </label>
                        ))}
                    </div>
                    <InputError
                        className="mt-2 !text-red-400"
                        message={errors.preferred_categories}
                    />
                </div>

                <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <p className="text-sm font-semibold text-slate-100">Preferensi Notifikasi</p>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <Checkbox
                            checked={data.notify_new_content}
                            onChange={(e) =>
                                setData('notify_new_content', e.target.checked)
                            }
                        />
                        Konten baru sesuai topik favorit
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <Checkbox
                            checked={data.notify_comment_replies}
                            onChange={(e) =>
                                setData('notify_comment_replies', e.target.checked)
                            }
                        />
                        Balasan komentar saya
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <Checkbox
                            checked={data.notify_premium_status}
                            onChange={(e) =>
                                setData('notify_premium_status', e.target.checked)
                            }
                        />
                        Update status premium (pending/succeeded/failed/expired/cancelled)
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="locale" value="Bahasa" className="text-slate-200" />
                        <select
                            id="locale"
                            className={selectClass}
                            value={data.locale}
                            onChange={(e) => setData('locale', e.target.value)}
                        >
                            <option value="id">Indonesia</option>
                            <option value="en">English</option>
                        </select>
                        <InputError className="mt-2 !text-red-400" message={errors.locale} />
                    </div>

                    <div>
                        <InputLabel htmlFor="timezone" value="Zona Waktu" className="text-slate-200" />
                        <select
                            id="timezone"
                            className={selectClass}
                            value={data.timezone}
                            onChange={(e) => setData('timezone', e.target.value)}
                        >
                            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                            <option value="UTC">UTC</option>
                        </select>
                        <InputError className="mt-2 !text-red-400" message={errors.timezone} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-slate-200">
                            Email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm text-blue-300 underline hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                            >
                                Kirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-300">
                                Link verifikasi baru sudah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        disabled={processing}
                        className="border-blue-500 bg-blue-600 hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-700"
                    >
                        Simpan Perubahan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-300">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
