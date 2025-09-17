<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
    ];

    protected $appends = ['avatar_url'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function settings()
    {
        return $this->hasOne(UserSettings::class);
    }
    public function kuests()
    {
        return $this->hasMany(Kuest::class, 'id_user');
    }

    public function seguidores()
    {
        return $this->hasMany(Follower::class, 'id_seguindo');
    }

    public function seguindo()
    {
        return $this->hasMany(Follower::class, 'id_seguidor');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'id_user');
    }
    public function receivedLikes()
    {
        return $this->hasManyThrough(
            Like::class,
            Kuest::class,
            'id_user',
            'id_kuest',
            'id',
            'id'
        );
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar && file_exists(storage_path('app/public/' . $this->avatar))) {
            return asset('s/' . $this->avatar);
        }
        return asset('s/i/avatar-default.png');
    }

}
