<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kuest extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'id_user',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'id_kuest');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'id_kuest');
    }
}
