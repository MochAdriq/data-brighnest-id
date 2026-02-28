import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

function formatErrorMessages(errors) {
    return Object.values(errors || {}).flat().filter(Boolean);
}

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    useEffect(() => {
        const messages = formatErrorMessages(errors);
        if (messages.length === 0) {
            return;
        }

        Swal.fire({
            icon: 'error',
            title: 'Permintaan gagal',
            text: messages[0],
            confirmButtonColor: '#2563eb',
        });
    }, [errors]);

    useEffect(() => {
        if (!status) {
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: status,
            confirmButtonColor: '#2563eb',
        });
    }, [status]);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
