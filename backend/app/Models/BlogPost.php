<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'content',
        'category', 'status', 'featured', 'published_at',
        'views', 'created_by', 'updated_by', 'allow_comments',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'published_at' => 'datetime',
            'views' => 'integer',
            'allow_comments' => 'boolean',
        ];
    }

    public function media()
    {
        return $this->hasMany(BlogMedia::class)->orderBy('order');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::creating(function (self $post) {
            if (! $post->slug) {
                $post->slug = Str::slug($post->title);
            }
            if (! $post->published_at && $post->status === 'published') {
                $post->published_at = now();
            }
        });
    }
}
