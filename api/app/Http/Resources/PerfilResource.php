<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\KuestsResource;

class PerfilResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                       => $this->id,
            'name'                     => $this->name,
            'username'                 => $this->username,
            'email'                    => $this->email,
            'avatar'                   => $this->avatar_url,
            'stats' => [
                'seguindo'             => $this->seguindo()->count(),
                'seguidores'           => $this->seguidores()->count(),
                'kuest_count'          => $this->kuests()->count(),
                'likes_count'          => $this->likes()->count(),
                'likes_received_count' => $this->receivedLikes()->count(),
            ],
            'kuests'                   => KuestsResource::collection($this->kuests()->latest()->get()),
        ];
    }
}
