<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    protected $fillable = ['id_user', 'id_kuest'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function kuest()
    {
        return $this->belongsTo(Kuest::class, 'id_kuest');
    }
}
