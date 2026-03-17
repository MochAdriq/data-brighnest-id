<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoBanner extends Model
{
    use HasFactory;

    public const TARGET_MEMBER_NON_PREMIUM = 'member_non_premium';
    public const TARGET_ALL_LOGGED_IN = 'all_logged_in';

    protected $fillable = [
        'title',
        'subtitle',
        'image_path',
        'cta_label',
        'cta_url',
        'target_scope',
        'priority',
        'is_active',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

