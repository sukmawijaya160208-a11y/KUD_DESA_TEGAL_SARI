<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageSetting extends Model
{
    protected $table = 'message_settings';

    protected $fillable = [
        'user_id',
        'notif_on',
        'notif_sound',
        'wallpaper',
        'enter_to_send',
    ];

    protected function casts(): array
    {
        return [
            'notif_on' => 'boolean',
            'enter_to_send' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
