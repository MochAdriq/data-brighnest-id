<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'plan_code',
        'plan_name',
        'duration_days',
        'amount',
        'xendit_reference_id',
        'xendit_payment_request_id',
        'xendit_latest_payment_id',
        'xendit_channel_code',
        'xendit_status',
        'xendit_checkout_url',
        'xendit_webhook_payload',
        'user_note',
        'starts_at',
        'ends_at',
        'paid_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'paid_at' => 'datetime',
        'xendit_webhook_payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
