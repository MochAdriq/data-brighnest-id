<?php

namespace App\Http\Controllers;

use App\Models\ArticleEntitlement;
use App\Models\ArticlePurchaseRequest;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : [];
        $event = strtolower((string) ($payload['event'] ?? $request->header('webhook-event-type', '')));
        $status = $this->resolveStatus($event, $data);
        $metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : [];
        $subscriptionIdFromMetadata = (int) ($metadata['subscription_id'] ?? 0);
        $purchaseRequestIdFromMetadata = (int) ($metadata['purchase_request_id'] ?? 0);
        $paymentRequestId = $this->firstNonEmptyString([
            $data['payment_request_id'] ?? null,
            data_get($data, 'payment_request.id'),
            data_get($data, 'payment_request.payment_request_id'),
            data_get($payload, 'payment_request_id'),
            data_get($payload, 'data.id'),
        ]);
        $referenceId = $this->firstNonEmptyString([
            $data['reference_id'] ?? null,
            data_get($data, 'payment_request.reference_id'),
            data_get($data, 'metadata.reference_id'),
            data_get($payload, 'data.metadata.reference_id'),
            data_get($payload, 'reference_id'),
        ]);
        $paymentId = $this->firstNonEmptyString([
            $data['payment_id'] ?? null,
            $data['latest_payment_id'] ?? null,
            data_get($data, 'payment.id'),
            data_get($payload, 'data.payment_id'),
        ]);

        // Pada sebagian event, data.id berisi payment id (prefix py-), bukan payment request id (prefix pr-).
        if ($paymentId === '' && str_starts_with($paymentRequestId, 'py-')) {
            $paymentId = $paymentRequestId;
            $paymentRequestId = '';
        }

        $handled = false;
        if ($paymentRequestId !== '' || $referenceId !== '' || $paymentId !== '') {
            $handled = $this->processSubscriptionWebhook(
                $subscriptionIdFromMetadata,
                $paymentRequestId,
                $referenceId,
                $paymentId,
                $status,
                $payload,
            ) || $handled;

            $handled = $this->processArticleWebhook(
                $purchaseRequestIdFromMetadata,
                $paymentRequestId,
                $referenceId,
                $paymentId,
                $status,
                $payload,
            ) || $handled;
        }

        Log::info('Xendit payment request webhook received.', [
            'payment_request_id' => $paymentRequestId ?: null,
            'reference_id' => $referenceId ?: null,
            'payment_id' => $paymentId ?: null,
            'subscription_id_metadata' => $subscriptionIdFromMetadata > 0 ? $subscriptionIdFromMetadata : null,
            'purchase_request_id_metadata' => $purchaseRequestIdFromMetadata > 0 ? $purchaseRequestIdFromMetadata : null,
            'status' => $status,
            'event' => $event,
            'handled' => $handled,
        ]);

        return response()->json([
            'received' => true,
            'handled' => $handled,
        ]);
    }

    private function resolveStatus(string $event, array $data): ?string
    {
        $status = strtoupper((string) ($data['status'] ?? ''));
        if ($status === 'CANCELED') {
            $status = 'CANCELLED';
        }

        if (in_array($status, ['SUCCEEDED', 'FAILED', 'EXPIRED', 'CANCELLED'], true)) {
            return $status;
        }

        return match ($event) {
            'payment.capture', 'payment_request.succeeded', 'payment_request.success' => 'SUCCEEDED',
            'payment.failure', 'payment_request.failed', 'payment_request.failure' => 'FAILED',
            'payment_request.expiry', 'payment_request.expired' => 'EXPIRED',
            'payment.cancel', 'payment.cancelled', 'payment.canceled',
            'payment_request.cancel', 'payment_request.cancelled', 'payment_request.canceled' => 'CANCELLED',
            default => null,
        };
    }

    private function processSubscriptionWebhook(
        int $subscriptionIdFromMetadata,
        string $paymentRequestId,
        string $referenceId,
        string $paymentId,
        ?string $status,
        array $payload,
    ): bool {
        $subscription = $this->findSubscription(
            $subscriptionIdFromMetadata,
            $paymentRequestId,
            $referenceId,
            $paymentId,
        );
        if (!$subscription) {
            return false;
        }

        $updates = [
            'xendit_payment_request_id' => $paymentRequestId !== '' ? $paymentRequestId : $subscription->xendit_payment_request_id,
            'xendit_reference_id' => $referenceId !== '' ? $referenceId : $subscription->xendit_reference_id,
            'xendit_latest_payment_id' => $paymentId !== '' ? $paymentId : $subscription->xendit_latest_payment_id,
            'xendit_status' => $status ?? $subscription->xendit_status,
            'xendit_webhook_payload' => $payload,
        ];

        if ($subscription->status === 'pending' && $status === 'SUCCEEDED') {
            $startsAt = Carbon::now();
            $durationDays = max((int) ($subscription->duration_days ?: 30), 1);

            $updates['status'] = 'active';
            $updates['starts_at'] = $startsAt;
            $updates['ends_at'] = (clone $startsAt)->addDays($durationDays);
            $updates['paid_at'] = Carbon::now();
        }

        if ($subscription->status === 'pending' && in_array($status, ['FAILED', 'EXPIRED', 'CANCELLED'], true)) {
            $updates['status'] = strtolower($status);
        }

        $subscription->update($updates);

        return true;
    }

    private function processArticleWebhook(
        int $purchaseRequestIdFromMetadata,
        string $paymentRequestId,
        string $referenceId,
        string $paymentId,
        ?string $status,
        array $payload,
    ): bool {
        $request = $this->findArticlePurchaseRequest(
            $purchaseRequestIdFromMetadata,
            $paymentRequestId,
            $referenceId,
            $paymentId,
        );
        if (!$request) {
            return false;
        }

        $updates = [
            'xendit_payment_request_id' => $paymentRequestId !== '' ? $paymentRequestId : $request->xendit_payment_request_id,
            'xendit_reference_id' => $referenceId !== '' ? $referenceId : $request->xendit_reference_id,
            'xendit_latest_payment_id' => $paymentId !== '' ? $paymentId : $request->xendit_latest_payment_id,
            'xendit_status' => $status ?? $request->xendit_status,
            'xendit_webhook_payload' => $payload,
        ];

        if ($request->status === 'pending' && $status === 'SUCCEEDED') {
            DB::transaction(function () use ($request, $updates): void {
                $request->update(array_merge($updates, [
                    'status' => 'succeeded',
                    'paid_at' => Carbon::now(),
                ]));

                ArticleEntitlement::firstOrCreate(
                    [
                        'user_id' => $request->user_id,
                        'survey_id' => $request->survey_id,
                    ],
                    [
                        'purchase_request_id' => $request->id,
                        'granted_at' => Carbon::now(),
                    ],
                );
            });

            return true;
        }

        if ($request->status === 'pending' && in_array($status, ['FAILED', 'EXPIRED', 'CANCELLED'], true)) {
            $request->update(array_merge($updates, [
                'status' => strtolower($status),
            ]));

            return true;
        }

        $request->update($updates);

        return true;
    }

    private function findSubscription(
        int $subscriptionIdFromMetadata,
        string $paymentRequestId,
        string $referenceId,
        string $paymentId,
    ): ?Subscription
    {
        if ($subscriptionIdFromMetadata > 0) {
            $byId = Subscription::query()->find($subscriptionIdFromMetadata);
            if ($byId) {
                return $byId;
            }
        }

        $query = Subscription::query();
        $hasCondition = false;

        if ($paymentRequestId !== '') {
            $query->where('xendit_payment_request_id', $paymentRequestId);
            $hasCondition = true;
        }

        if ($referenceId !== '') {
            if ($hasCondition) {
                $query->orWhere('xendit_reference_id', $referenceId);
            } else {
                $query->where('xendit_reference_id', $referenceId);
            }
            $hasCondition = true;
        }

        if ($paymentId !== '') {
            if ($hasCondition) {
                $query->orWhere('xendit_latest_payment_id', $paymentId);
            } else {
                $query->where('xendit_latest_payment_id', $paymentId);
            }
        }

        return $query->latest('id')->first();
    }

    private function findArticlePurchaseRequest(
        int $purchaseRequestIdFromMetadata,
        string $paymentRequestId,
        string $referenceId,
        string $paymentId,
    ): ?ArticlePurchaseRequest
    {
        if ($purchaseRequestIdFromMetadata > 0) {
            $byId = ArticlePurchaseRequest::query()->find($purchaseRequestIdFromMetadata);
            if ($byId) {
                return $byId;
            }
        }

        $query = ArticlePurchaseRequest::query();
        $hasCondition = false;

        if ($paymentRequestId !== '') {
            $query->where('xendit_payment_request_id', $paymentRequestId);
            $hasCondition = true;
        }

        if ($referenceId !== '') {
            if ($hasCondition) {
                $query->orWhere('xendit_reference_id', $referenceId);
            } else {
                $query->where('xendit_reference_id', $referenceId);
            }
            $hasCondition = true;
        }

        if ($paymentId !== '') {
            if ($hasCondition) {
                $query->orWhere('xendit_latest_payment_id', $paymentId);
            } else {
                $query->where('xendit_latest_payment_id', $paymentId);
            }
        }

        return $query->latest('id')->first();
    }

    /**
     * @param array<int, mixed> $values
     */
    private function firstNonEmptyString(array $values): string
    {
        foreach ($values as $value) {
            if (!is_scalar($value)) {
                continue;
            }

            $normalized = trim((string) $value);
            if ($normalized !== '') {
                return $normalized;
            }
        }

        return '';
    }
}
