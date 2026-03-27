<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str; 

class Survey extends Model
{
    use HasFactory;

    public const PREMIUM_TIER_FREE = 'free';
    public const PREMIUM_TIER_PREMIUM = 'premium';
    public const PREMIUM_TIER_SPECIAL = 'special';

    protected $fillable = [
        'user_id', 'type',
        'chart_type',      // <--- TAMBAHKAN INI
        'is_interactive',
        'title', 'slug', 'category', 'subcategory',
        'published_year', 'research_topic',
        'notes', // Tetap notes
        'show_notes',
        'lead', 'content', 'period', 'pic', 'is_premium', 'premium_tier', 'tags',
        'csv_data', 'file_path', 'pdf_path', 'image', 'views', 'download_count',
        'image_caption', 'image_copyright',
        'og_image_path', 'og_generated_at',
    ];

    protected $casts = [
        'tags' => 'array',         
        'csv_data' => 'array',     
        'is_interactive' => 'boolean', 
        'is_premium' => 'boolean',
        'show_notes' => 'boolean',
        'published_year' => 'integer',
        'download_count' => 'integer',
        'og_generated_at' => 'datetime',
    ];

    /**
     * MAGIC: Otomatis bikin Slug saat Save
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($survey) {
            // Kalau slug kosong, bikin dari title
            if (empty($survey->slug)) {
                $survey->slug = Str::slug($survey->title);
            }

            $tier = strtolower((string) ($survey->premium_tier ?? ''));
            if (!in_array($tier, self::premiumTierOptions(), true)) {
                $tier = (bool) $survey->is_premium ? self::PREMIUM_TIER_PREMIUM : self::PREMIUM_TIER_FREE;
            }

            $survey->premium_tier = $tier;
            $survey->is_premium = $tier !== self::PREMIUM_TIER_FREE;
             
            // Cek kalau ada slug kembar (misal judul sama), tambahkan angka di belakang
            $originalSlug = $survey->slug;
            $count = 1;
            while (static::where('slug', $survey->slug)->where('id', '!=', $survey->id)->exists()) {
                $survey->slug = $originalSlug . '-' . $count++;
            }
        });
    }

    /**
     * MAGIC: Biar Laravel cari data pakai SLUG, bukan ID lagi
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function articlePurchaseRequests(): HasMany
    {
        return $this->hasMany(ArticlePurchaseRequest::class);
    }

    public function articleEntitlements(): HasMany
    {
        return $this->hasMany(ArticleEntitlement::class);
    }

    public static function premiumTierOptions(): array
    {
        return [
            self::PREMIUM_TIER_FREE,
            self::PREMIUM_TIER_PREMIUM,
            self::PREMIUM_TIER_SPECIAL,
        ];
    }

    public function resolvedPremiumTier(): string
    {
        $tier = strtolower((string) ($this->premium_tier ?? ''));
        if (in_array($tier, self::premiumTierOptions(), true)) {
            return $tier;
        }

        return (bool) $this->is_premium
            ? self::PREMIUM_TIER_PREMIUM
            : self::PREMIUM_TIER_FREE;
    }
}
