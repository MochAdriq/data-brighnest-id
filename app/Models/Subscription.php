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
        'verified_by',
        'status',
        'plan_code',
        'plan_name',
        'duration_days',
        'amount',
        'payment_method',
        'reference_no',
        'transfer_date',
        'proof_path',
        'user_note',
        'admin_note',
        'starts_at',
        'ends_at',
        'reviewed_at',
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
