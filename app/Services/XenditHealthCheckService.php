<?php

namespace App\Services;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

class XenditHealthCheckService
{
    public function run(): array
    {
        $items = [
            $this->checkSecretKey(),
            $this->checkWebhookToken(),
            $this->checkBaseUrl(),
            $this->checkConfigCache(),
            $this->checkChannels(),
            $this->checkWebhookRoutes(),
            $this->checkDatabaseSchema(),
        ];

        $summary = [
            'ok' => 0,
            'warning' => 0,
            'error' => 0,
        ];

        foreach ($items as $item) {
            $status = (string) ($item['status'] ?? '');
            if (array_key_exists($status, $summary)) {
                $summary[$status]++;
            }
        }

        $overall = $summary['error'] > 0
            ? 'error'
            : ($summary['warning'] > 0 ? 'warning' : 'ok');

        return [
            'checked_at' => now()->toIso8601String(),
            'overall' => $overall,
            'summary' => $summary,
            'items' => $items,
        ];
    }

    private function checkSecretKey(): array
    {
        $secretKey = trim((string) config('services.xendit.secret_key', ''));

        if ($secretKey === '') {
            return $this->item(
                'secret_key',
                'XENDIT_SECRET_KEY',
                'error',
                'Secret key Xendit belum diisi.',
                ['Tambahkan nilai XENDIT_SECRET_KEY di environment server.']
            );
        }

        $details = [
            'Nilai terdeteksi: ' . $this->maskSecret($secretKey),
        ];

        if (!str_starts_with($secretKey, 'xnd_')) {
            return $this->item(
                'secret_key',
                'XENDIT_SECRET_KEY',
                'warning',
                'Format key tidak diawali xnd_. Pastikan key benar dan sesuai mode akun.',
                $details
            );
        }

        return $this->item(
            'secret_key',
            'XENDIT_SECRET_KEY',
            'ok',
            'Secret key terkonfigurasi.',
            $details
        );
    }

    private function checkWebhookToken(): array
    {
        $webhookToken = trim((string) config('services.xendit.webhook_verification_token', ''));

        if ($webhookToken === '') {
            return $this->item(
                'webhook_token',
                'XENDIT_WEBHOOK_VERIFICATION_TOKEN',
                'error',
                'Token verifikasi webhook belum diisi.',
                ['Isi token yang sama persis dengan Callback Verification Token di dashboard Xendit.']
            );
        }

        return $this->item(
            'webhook_token',
            'XENDIT_WEBHOOK_VERIFICATION_TOKEN',
            'ok',
            'Token webhook terkonfigurasi.',
            ['Nilai terdeteksi: ' . $this->maskSecret($webhookToken)]
        );
    }

    private function checkBaseUrl(): array
    {
        $baseUrl = trim((string) config('services.xendit.base_url', ''));

        if ($baseUrl === '') {
            return $this->item(
                'base_url',
                'XENDIT_API_BASE_URL',
                'error',
                'Base URL API Xendit kosong.',
                ['Gunakan https://api.xendit.co untuk production.']
            );
        }

        if (!filter_var($baseUrl, FILTER_VALIDATE_URL)) {
            return $this->item(
                'base_url',
                'XENDIT_API_BASE_URL',
                'error',
                'Format base URL tidak valid.',
                ['Nilai saat ini: ' . $baseUrl]
            );
        }

        $scheme = strtolower((string) parse_url($baseUrl, PHP_URL_SCHEME));
        if ($scheme !== 'https') {
            return $this->item(
                'base_url',
                'XENDIT_API_BASE_URL',
                'warning',
                'Sebaiknya gunakan HTTPS untuk komunikasi ke Xendit.',
                ['Nilai saat ini: ' . $baseUrl]
            );
        }

        return $this->item(
            'base_url',
            'XENDIT_API_BASE_URL',
            'ok',
            'Base URL API valid.',
            ['Nilai saat ini: ' . $baseUrl]
        );
    }

    private function checkConfigCache(): array
    {
        $isCached = app()->configurationIsCached();
        $secretKey = trim((string) config('services.xendit.secret_key', ''));
        $webhookToken = trim((string) config('services.xendit.webhook_verification_token', ''));

        if ($isCached && ($secretKey === '' || $webhookToken === '')) {
            return $this->item(
                'config_cache',
                'Laravel Config Cache',
                'warning',
                'Config cache aktif dan nilai Xendit masih kosong.',
                ['Jika baru ubah .env, jalankan php artisan optimize:clear di server.']
            );
        }

        if ($isCached) {
            return $this->item(
                'config_cache',
                'Laravel Config Cache',
                'ok',
                'Config cache aktif dan nilai Xendit sudah terbaca.',
                ['Jika mengubah .env, jalankan php artisan optimize:clear lalu cache ulang.']
            );
        }

        return $this->item(
            'config_cache',
            'Laravel Config Cache',
            'ok',
            'Config cache tidak aktif.',
            ['Mode ini aman untuk debugging perubahan .env secara cepat.']
        );
    }

    private function checkChannels(): array
    {
        $channels = config('premium.xendit.channels', []);
        if (!is_array($channels) || count($channels) === 0) {
            return $this->item(
                'channels',
                'Premium Xendit Channels',
                'error',
                'Daftar channel pembayaran kosong.',
                ['Isi config premium.xendit.channels minimal 1 channel.']
            );
        }

        $codes = [];
        foreach ($channels as $channel) {
            if (!is_array($channel)) {
                continue;
            }

            $normalizedCode = $this->normalizeChannelCode((string) ($channel['code'] ?? ''));
            if ($normalizedCode !== '') {
                $codes[] = $normalizedCode;
            }
        }

        if (count($codes) === 0) {
            return $this->item(
                'channels',
                'Premium Xendit Channels',
                'error',
                'Tidak ada code channel yang valid.',
                ['Pastikan setiap item channel memiliki properti code.']
            );
        }

        $warnings = [];
        $duplicateCodes = array_keys(array_filter(array_count_values($codes), fn (int $count): bool => $count > 1));
        if (!empty($duplicateCodes)) {
            $warnings[] = 'Terdapat channel duplikat: ' . implode(', ', $duplicateCodes);
        }

        $defaultCode = $this->normalizeChannelCode((string) config('premium.xendit.default_channel_code', 'DANA'));
        if ($defaultCode === '') {
            $warnings[] = 'Default channel code kosong.';
        } elseif (!in_array($defaultCode, $codes, true)) {
            $warnings[] = 'Default channel tidak ada di daftar channel: ' . $defaultCode;
        }

        $details = [
            'Total channel valid: ' . count($codes),
            'Default channel: ' . ($defaultCode !== '' ? $defaultCode : '-'),
        ];

        if (!empty($warnings)) {
            return $this->item(
                'channels',
                'Premium Xendit Channels',
                'warning',
                'Konfigurasi channel terdeteksi, tetapi ada hal yang perlu diperbaiki.',
                array_merge($details, $warnings)
            );
        }

        return $this->item(
            'channels',
            'Premium Xendit Channels',
            'ok',
            'Konfigurasi channel valid.',
            $details
        );
    }

    private function checkWebhookRoutes(): array
    {
        $mainRoute = Route::getRoutes()->getByName('webhooks.xendit.payment-request');
        $legacyRoute = Route::getRoutes()->getByName('webhooks.xendit.legacy');

        if (!$mainRoute instanceof RoutingRoute) {
            return $this->item(
                'webhook_routes',
                'Webhook Routes',
                'error',
                'Route webhook utama tidak ditemukan.',
                ['Pastikan route webhooks.xendit.payment-request terdaftar.']
            );
        }

        $warnings = [];
        $details = [
            'Route utama: /' . ltrim($mainRoute->uri(), '/'),
        ];

        if ($legacyRoute instanceof RoutingRoute) {
            $details[] = 'Route legacy: /' . ltrim($legacyRoute->uri(), '/');
        } else {
            $warnings[] = 'Route legacy /webhooks/xendit tidak ditemukan (opsional).';
        }

        $excludedMiddleware = $mainRoute->excludedMiddleware();
        $csrfExcluded = in_array(VerifyCsrfToken::class, $excludedMiddleware, true);
        if (!$csrfExcluded) {
            $warnings[] = 'Route webhook utama belum mengecualikan VerifyCsrfToken.';
        } else {
            $details[] = 'VerifyCsrfToken sudah dikecualikan pada route utama.';
        }

        if (!empty($warnings)) {
            return $this->item(
                'webhook_routes',
                'Webhook Routes',
                'warning',
                'Route webhook tersedia, tetapi ada catatan konfigurasi.',
                array_merge($details, $warnings)
            );
        }

        return $this->item(
            'webhook_routes',
            'Webhook Routes',
            'ok',
            'Route webhook terkonfigurasi dengan benar.',
            $details
        );
    }

    private function checkDatabaseSchema(): array
    {
        try {
            $requiredSubscriptionColumns = [
                'xendit_reference_id',
                'xendit_payment_request_id',
                'xendit_latest_payment_id',
                'xendit_channel_code',
                'xendit_status',
                'xendit_checkout_url',
                'xendit_webhook_payload',
                'paid_at',
            ];

            $requiredArticleColumns = [
                'xendit_reference_id',
                'xendit_payment_request_id',
                'xendit_latest_payment_id',
                'xendit_channel_code',
                'xendit_status',
                'xendit_checkout_url',
                'xendit_webhook_payload',
                'paid_at',
            ];

            if (!Schema::hasTable('subscriptions') || !Schema::hasTable('article_purchase_requests')) {
                return $this->item(
                    'database_schema',
                    'Database Schema',
                    'error',
                    'Tabel pembayaran premium belum lengkap.',
                    ['Pastikan migration subscriptions dan article_purchase_requests sudah dijalankan.']
                );
            }

            $missingSubscriptionColumns = $this->missingColumns('subscriptions', $requiredSubscriptionColumns);
            $missingArticleColumns = $this->missingColumns('article_purchase_requests', $requiredArticleColumns);

            if (!empty($missingSubscriptionColumns) || !empty($missingArticleColumns)) {
                $details = [];
                if (!empty($missingSubscriptionColumns)) {
                    $details[] = 'subscriptions missing: ' . implode(', ', $missingSubscriptionColumns);
                }
                if (!empty($missingArticleColumns)) {
                    $details[] = 'article_purchase_requests missing: ' . implode(', ', $missingArticleColumns);
                }
                $details[] = 'Jalankan php artisan migrate di server production.';

                return $this->item(
                    'database_schema',
                    'Database Schema',
                    'error',
                    'Skema database Xendit belum lengkap.',
                    $details
                );
            }

            return $this->item(
                'database_schema',
                'Database Schema',
                'ok',
                'Kolom database Xendit sudah lengkap pada tabel premium.',
                ['Tabel terverifikasi: subscriptions, article_purchase_requests.']
            );
        } catch (\Throwable $e) {
            return $this->item(
                'database_schema',
                'Database Schema',
                'error',
                'Gagal memverifikasi skema database.',
                [
                    'Terjadi error saat memeriksa schema database. Cek koneksi database server.',
                    'Exception: ' . class_basename($e),
                ]
            );
        }
    }

    /**
     * @param array<int, string> $columns
     * @return array<int, string>
     */
    private function missingColumns(string $table, array $columns): array
    {
        $missing = [];

        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                $missing[] = $column;
            }
        }

        return $missing;
    }

    /**
     * @param array<int, string> $details
     * @return array<string, mixed>
     */
    private function item(
        string $key,
        string $label,
        string $status,
        string $message,
        array $details = []
    ): array {
        return [
            'key' => $key,
            'label' => $label,
            'status' => $status,
            'message' => $message,
            'details' => $details,
        ];
    }

    private function maskSecret(string $value): string
    {
        $length = strlen($value);
        if ($length === 0) {
            return '<empty>';
        }

        $prefix = substr($value, 0, min(6, $length));

        return $prefix . '...(len=' . $length . ')';
    }

    private function normalizeChannelCode(string $channelCode): string
    {
        $normalized = strtoupper(trim($channelCode));
        if ($normalized === '') {
            return '';
        }

        if (str_starts_with($normalized, 'ID_')) {
            $candidate = substr($normalized, 3);
            if ($candidate !== '') {
                return $candidate;
            }
        }

        return $normalized;
    }
}
