@extends('emails.layouts.brightnest', [
    'subjectLine' => 'Kode Verifikasi Akun Brightnest Institute',
    'preheader' => 'Kode verifikasi akun Brightnest Institute Anda sudah siap dipakai.',
])

@section('content')
    <h1 style="margin:0 0 10px 0; font-size:24px; color:#f8fafc;">
        Verifikasi akun Anda
    </h1>
    <p style="margin:0 0 16px 0; font-size:14px; color:#cbd5e1; line-height:1.6;">
        Masukkan kode berikut di halaman verifikasi untuk mengaktifkan akun Brightnest Institute Anda.
    </p>

    <div style="margin:0 0 16px 0; padding:16px; border:1px solid #1e3a8a; border-radius:12px; background:#0b1228; text-align:center;">
        <div style="font-size:34px; font-weight:700; letter-spacing:8px; color:#dbeafe;">
            {{ $code }}
        </div>
    </div>

    <p style="margin:0 0 10px 0; font-size:14px; color:#93c5fd;">
        Kode berlaku selama {{ $expiresInMinutes }} menit.
    </p>
    <p style="margin:0; font-size:13px; color:#94a3b8;">
        Jika Anda tidak merasa mendaftar, abaikan email ini.
    </p>
@endsection
