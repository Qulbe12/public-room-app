<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class VideoRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'room_id',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($room) {
            if (empty($room->room_id)) {
                $room->room_id = Str::random(10);
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(RoomParticipant::class, 'room_id');
    }

    public function activeParticipants(): HasMany
    {
        return $this->hasMany(RoomParticipant::class, 'room_id')
                    ->where('is_active', true);
    }

    public function getParticipantCount(): int
    {
        return $this->activeParticipants()->count();
    }
}