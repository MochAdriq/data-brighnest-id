<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class XenditPaymentRequestService
{
    public function createPaymentRequest(array $payload): array
    {
        $secretKey = trim((string) config('services.xendit.secret_key', ''));
        $baseUrl = rtrim((string) config('services.xendit.base_url', 'https://api.xendit.co'), '/');

        if ($secretKey === '') {
            throw new RuntimeException('Xendit secret key belum dikonfigurasi.');
        }

        $response = Http::baseUrl($baseUrl)
            ->withBasicAuth($secretKey, '')
            ->withHeaders([
                'api-version' => '2024-11-11',
                'accept' => 'application/json',
            ])
            ->timeout(30)
            ->post('/v3/payment_requests', $payload);

        if ($response->failed()) {
            $body = $response->json();
            $message = (string) (
                $body['message']
                ?? $body['error_message']
                ?? $body['errors'][0]['message']
                ?? 'Gagal membuat payment request ke Xendit.'
            );

            throw new RuntimeException($message);
        }

        $json = $response->json();
        if (!is_array($json)) {
            throw new RuntimeException('Response Xendit tidak valid.');
        }

        return $json;
    }
}
