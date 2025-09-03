<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KuestCommented extends Notification
{
    use Queueable;

    protected $commenter;
    protected $id_kuest;

    public function __construct($commenter, $id_kuest)
    {
        $this->commenter = $commenter;
        $this->id_kuest = $id_kuest;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => "{$this->commenter->username} comentou sua kuest!",
            'id_kuest' => $this->id_kuest,
        ];
    }
}
