<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function paymentRequestStatus(Request $request): JsonResponse
    {
        $configuredToken = (string) config('services.xendit.webhook_verification_token', '');
        $incomingToken = (string) $request->header('x-callback-token', '');

        if ($configuredToken === '') {
            Log::warning('Xendit webhook token is not configured.', [
                'path' => $request->path(),
            ]);

            return response()->json([
                'message' => 'Webhook token not configured.',
            ], 500);
        }

        if (!hash_equals($configuredToken, $incomingToken)) {
            Log::warning('Unauthorized Xendit webhook callback.', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Unauthorized callback token.',
            ], 401);
        }

        $payload = $request->all();

        // NOTE: Status payment belum diproses di sini. Tahap ini untuk validasi endpoint test.
        Log::info('Xendit payment request webhook received.', [
            'id' => $payload['id'] ?? null,
            'status' => $payload['status'] ?? null,
            'external_id' => $payload['external_id'] ?? null,
            'event' => $request->header('webhook-event-type'),
        ]);

        return response()->json([
            'received' => true,
        ]);
    }
}
