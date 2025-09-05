<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'id_kuest',
        'id_user',
        'content'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kuest()
    {
        return $this->belongsTo(Kuest::class);
    }
}

