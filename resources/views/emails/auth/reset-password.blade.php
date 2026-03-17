@extends('emails.layouts.brightnest', [
    'subjectLine' => 'Reset Password Brightnest Institute',
    'preheader' => 'Permintaan reset password akun Brightnest Institute Anda.',
])

@section('content')
    <h1 style="margin:0 0 10px 0; font-size:24px; color:#f8fafc;">
        Reset password
    </h1>
    <p style="margin:0 0 16px 0; font-size:14px; color:#cbd5e1; line-height:1.6;">
        Kami menerima permintaan untuk mengatur ulang password akun Anda.
        Klik tombol berikut untuk melanjutkan.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
        <tr>
            <td style="border-radius:10px; background:#2563eb;">
                <a
                    href="{{ $resetUrl }}"
                    style="display:inline-block; padding:12px 18px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;"
                >
                    Atur Ulang Password
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 10px 0; font-size:13px; color:#93c5fd;">
        Link berlaku selama {{ $expireMinutes }} menit.
    </p>
    <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">
        Jika Anda tidak meminta reset password, abaikan email ini.
    </p>
@endsection
