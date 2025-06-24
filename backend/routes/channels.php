<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Room channels for video streaming
Broadcast::channel('room.{roomId}', function ($user, $roomId) {
    // For now, allow anyone to join any room (public rooms)
    // In production, you might want to add authentication logic here
    return true;
});

// Private channel for WebRTC signaling
Broadcast::channel('webrtc.{roomId}', function ($user, $roomId) {
    return true;
});