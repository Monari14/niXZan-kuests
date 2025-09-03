<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KuestsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'      => $this->description,
            'author'       => $this->user->name ?? null,
            'username'     => $this->user->username ?? null,
            'avatar'       => $this->user->avatar_url ?? null,
            'created_at'   => $this->created_at->toDateTimeString(),
            'created_at_human' => $this->created_at->diffForHumans(),
        ];
    }
}
