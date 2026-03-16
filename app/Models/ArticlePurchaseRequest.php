<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ArticlePurchaseRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'survey_id',
        'status',
        'amount',
        'xendit_reference_id',
        'xendit_payment_request_id',
        'xendit_latest_payment_id',
        'xendit_channel_code',
        'xendit_status',
        'xendit_checkout_url',
        'xendit_webhook_payload',
        'user_note',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'xendit_webhook_payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function entitlement(): HasOne
    {
        return $this->hasOne(ArticleEntitlement::class, 'purchase_request_id');
    }
}
