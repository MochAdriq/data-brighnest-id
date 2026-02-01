<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Survey extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'csv_data' => 'array', 
        'tags'     => 'array', 
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}