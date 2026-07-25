<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $table = 'newsletter_subscribers';

    protected $fillable = ['email', 'nama', 'token', 'status', 'subscribed_at'];

    protected $casts = [
        'subscribed_at' => 'datetime',
    ];
}
