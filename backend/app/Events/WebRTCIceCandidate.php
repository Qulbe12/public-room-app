<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WebRTCIceCandidate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $roomId;
    public string $fromParticipantId;
    public string $toParticipantId;
    public array $candidate;

    /**
     * Create a new event instance.
     */
    public function __construct(string $roomId, string $fromParticipantId, string $toParticipantId, array $candidate)
    {
        $this->roomId = $roomId;
        $this->fromParticipantId = $fromParticipantId;
        $this->toParticipantId = $toParticipantId;
        $this->candidate = $candidate;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('webrtc.' . $this->roomId),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'room_id' => $this->roomId,
            'from_participant_id' => $this->fromParticipantId,
            'to_participant_id' => $this->toParticipantId,
            'candidate' => $this->candidate,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'webrtc.ice-candidate';
    }
}