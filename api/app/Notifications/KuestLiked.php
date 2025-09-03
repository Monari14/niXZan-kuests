<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KuestLiked extends Notification
{
    use Queueable;

    protected $liker;
    protected $id_kuest;

    public function __construct($liker, $id_kuest)
    {
        $this->liker = $liker;
        $this->id_kuest = $id_kuest;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => "{$this->liker->username} curtiu sua kuest.",
            'id_kuest' => $this->id_kuest,
        ];
    }
}
