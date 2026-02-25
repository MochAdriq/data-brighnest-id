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

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-gray-900">
                    Identitas & Preferensi
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Atur profil publik, topik favorit, dan preferensi notifikasi.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama" />

                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="avatar" value="URL Foto Profil" />
                        <TextInput
                            id="avatar"
                            type="url"
                            className="mt-1 block w-full"
                            value={data.avatar}
                            onChange={(e) => setData('avatar', e.target.value)}
                            placeholder="https://..."
                        />
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>

                    <div>
                        <InputLabel htmlFor="location" value="Lokasi" />
                        <TextInput
                            id="location"
                            className="mt-1 block w-full"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="Kota, Provinsi"
                        />
                        <InputError className="mt-2" message={errors.location} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="website_url" value="Website" />
                    <TextInput
                        id="website_url"
                        type="url"
                        className="mt-1 block w-full"
                        value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)}
                        placeholder="https://website-anda.com"
                    />
                    <InputError className="mt-2" message={errors.website_url} />
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="Bio Singkat" />
                    <textarea
                        id="bio"
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Ceritakan profil Anda dalam 1-3 kalimat"
                    />
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                        Topik Favorit
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {globalCategoryTree.map((category) => (
                            <label
                                key={category.id}
                                className="inline-flex items-center gap-2 text-sm text-gray-700"
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
                        className="mt-2"
                        message={errors.preferred_categories}
                    />
                </div>

                <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Preferensi Notifikasi</p>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Checkbox
                            checked={data.notify_new_content}
                            onChange={(e) =>
                                setData('notify_new_content', e.target.checked)
                            }
                        />
                        Konten baru sesuai topik favorit
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Checkbox
                            checked={data.notify_comment_replies}
                            onChange={(e) =>
                                setData('notify_comment_replies', e.target.checked)
                            }
                        />
                        Balasan komentar saya
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Checkbox
                            checked={data.notify_premium_status}
                            onChange={(e) =>
                                setData('notify_premium_status', e.target.checked)
                            }
                        />
                        Update status premium (approve/reject/expired)
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="locale" value="Bahasa" />
                        <select
                            id="locale"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.locale}
                            onChange={(e) => setData('locale', e.target.value)}
                        >
                            <option value="id">Indonesia</option>
                            <option value="en">English</option>
                        </select>
                        <InputError className="mt-2" message={errors.locale} />
                    </div>

                    <div>
                        <InputLabel htmlFor="timezone" value="Zona Waktu" />
                        <select
                            id="timezone"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.timezone}
                            onChange={(e) => setData('timezone', e.target.value)}
                        >
                            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                            <option value="UTC">UTC</option>
                        </select>
                        <InputError className="mt-2" message={errors.timezone} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Kirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Link verifikasi baru sudah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
