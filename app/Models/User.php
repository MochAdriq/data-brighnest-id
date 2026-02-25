<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'avatar',
        'bio',
        'location',
        'website_url',
        'preferred_categories',
        'notify_new_content',
        'notify_comment_replies',
        'notify_premium_status',
        'locale',
        'timezone',
        'google_only',
        'email_verified_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'google_only' => 'boolean',
            'preferred_categories' => 'array',
            'notify_new_content' => 'boolean',
            'notify_comment_replies' => 'boolean',
            'notify_premium_status' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function articlePurchaseRequests(): HasMany
    {
        return $this->hasMany(ArticlePurchaseRequest::class);
    }

    public function articleEntitlements(): HasMany
    {
        return $this->hasMany(ArticleEntitlement::class);
    }

    public function hasActiveSubscription(): bool
    {
        $now = Carbon::now();

        return $this->subscriptions()
            ->where('status', 'active')
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', $now);
            })
            ->exists();
    }

    public function hasArticleEntitlement(int $surveyId): bool
    {
        return $this->articleEntitlements()
            ->where('survey_id', $surveyId)
            ->exists();
    }
}
