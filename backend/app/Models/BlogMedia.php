<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogMedia extends Model
{
    protected $fillable = [
        'blog_post_id', 'type', 'url', 'caption', 'order',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }
}
