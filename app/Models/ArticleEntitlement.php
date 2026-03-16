<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleEntitlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'survey_id',
        'purchase_request_id',
        'granted_at',
    ];

    protected $casts = [
        'granted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(ArticlePurchaseRequest::class, 'purchase_request_id');
    }

}
