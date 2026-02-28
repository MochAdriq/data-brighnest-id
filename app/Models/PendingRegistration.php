<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'verification_code',
        'expires_at',
        'failed_attempts',
        'resend_available_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'resend_available_at' => 'datetime',
        ];
    }
}
