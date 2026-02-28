@extends('emails.layouts.brightnest', [
    'subjectLine' => 'Verifikasi Email Brightnest',
    'preheader' => 'Konfirmasi alamat email Anda untuk mengamankan akun Brightnest.',
])

@section('content')
    <h1 style="margin:0 0 10px 0; font-size:24px; color:#f8fafc;">
        Verifikasi email
    </h1>
    <p style="margin:0 0 16px 0; font-size:14px; color:#cbd5e1; line-height:1.6;">
        Untuk melanjutkan penggunaan akun, mohon verifikasi alamat email Anda melalui tombol berikut.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
        <tr>
            <td style="border-radius:10px; background:#2563eb;">
                <a
                    href="{{ $verificationUrl }}"
                    style="display:inline-block; padding:12px 18px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;"
                >
                    Verifikasi Email
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">
        Jika Anda tidak membuat akun, abaikan email ini.
    </p>
@endsection
