<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine ?? config('app.name', 'Brightnest') }}</title>
</head>
@php
    $brandName = config('app.name', 'Brightnest');
    $appUrl = rtrim((string) config('app.url', ''), '/');
    $logoUrl = $appUrl !== '' ? $appUrl.'/images/brightnest_company.png' : '';
    $logoAbsolutePath = public_path('images/brightnest_company.png');
    $embeddedLogoUrl = null;

    if (isset($message) && is_file($logoAbsolutePath)) {
        try {
            $embeddedLogoUrl = $message->embed($logoAbsolutePath);
        } catch (\Throwable $e) {
            $embeddedLogoUrl = null;
        }
    }
@endphp
<body style="margin:0; padding:0; background:#020617; font-family:Arial,Helvetica,sans-serif; color:#e2e8f0;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
        {{ $preheader ?? $subjectLine ?? $brandName }}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617; padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; background:#0f172a; border:1px solid #1e293b; border-radius:18px; overflow:hidden;">
                    <tr>
                        <td style="padding:20px 24px; background:linear-gradient(120deg,#0b2447,#1d4ed8,#0891b2);">
                            @if($embeddedLogoUrl)
                                <img src="{{ $embeddedLogoUrl }}" alt="{{ $brandName }}" style="height:38px; width:auto; display:block; margin:0 auto 8px auto;">
                            @elseif($logoUrl !== '')
                                <img src="{{ $logoUrl }}" alt="{{ $brandName }}" style="height:38px; width:auto; display:block; margin:0 auto 8px auto;">
                            @endif
                            <div style="text-align:center; font-size:13px; color:#dbeafe; letter-spacing:0.2px;">
                                Platform intelijen data daerah
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 24px; background:#0f172a;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:18px 24px; border-top:1px solid #1e293b; font-size:12px; color:#94a3b8;">
                            Email otomatis dari {{ $brandName }}. Mohon tidak membalas email ini.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
