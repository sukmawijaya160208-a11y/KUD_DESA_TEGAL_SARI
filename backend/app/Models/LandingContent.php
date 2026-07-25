<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingContent extends Model
{
    protected $table = 'landing_contents';

    protected $fillable = [
        'section_type',
        'title',
        'description',
        'media_url',
        'meta_data',
        'order',
        'is_active',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
