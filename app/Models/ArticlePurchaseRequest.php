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
        'verified_by',
        'status',
        'amount',
        'payment_method',
        'reference_no',
        'transfer_date',
        'proof_path',
        'user_note',
        'admin_note',
        'reviewed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transfer_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function entitlement(): HasOne
    {
        return $this->hasOne(ArticleEntitlement::class, 'purchase_request_id');
    }
}

