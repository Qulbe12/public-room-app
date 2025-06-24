<?php

namespace App\Http\Controllers;

use App\Events\ParticipantJoined;
use App\Events\ParticipantLeft;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    /**
     * Create a new room
     */
    public function create(Request $request): JsonResponse
    {
        $roomId = $request->input('roomId') ?? Str::random(8);
        
        // Store room data in cache (in production, use a proper database)
        $roomData = [
            'id' => $roomId,
            'created_at' => now(),
            'participants' => [],
            'active' => true
        ];
        
        Cache::put("room:{$roomId}", $roomData, now()->addHours(24));
        
        return response()->json([
            'success' => true,
            'room' => $roomData
        ]);
    }
    
    /**
     * Get room information
     */
    public function show(string $roomId): JsonResponse
    {
        $room = Cache::get("room:{$roomId}");
        
        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'room' => $room
        ]);
    }
    
    /**
     * Join a room
     */
    public function join(Request $request, string $roomId): JsonResponse
    {
        $request->validate([
            'participant_id' => 'required|string',
            'participant_name' => 'required|string'
        ]);
        
        $room = Cache::get("room:{$roomId}");
        
        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }
        
        $participantId = $request->input('participant_id');
        $participantName = $request->input('participant_name');
        
        // Add participant to room
        $room['participants'][$participantId] = [
            'id' => $participantId,
            'name' => $participantName,
            'joined_at' => now(),
            'is_streaming' => false
        ];
        
        Cache::put("room:{$roomId}", $room, now()->addHours(24));
        
        // Broadcast participant joined event
        broadcast(new \App\Events\ParticipantJoined($roomId, $participantId, $participantName));
        
        return response()->json([
            'success' => true,
            'room' => $room
        ]);
    }
    
    /**
     * Leave a room
     */
    public function leave(Request $request, string $roomId): JsonResponse
    {
        $request->validate([
            'participant_id' => 'required|string'
        ]);
        
        $room = Cache::get("room:{$roomId}");
        
        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }
        
        $participantId = $request->input('participant_id');
        
        // Remove participant from room
        if (isset($room['participants'][$participantId])) {
            unset($room['participants'][$participantId]);
            Cache::put("room:{$roomId}", $room, now()->addHours(24));
            
            // Broadcast participant left event
            broadcast(new \App\Events\ParticipantLeft($roomId, $participantId));
        }
        
        return response()->json([
            'success' => true,
            'room' => $room
        ]);
    }
    
    /**
     * Get room participants
     */
    public function participants(string $roomId): JsonResponse
    {
        $room = Cache::get("room:{$roomId}");
        
        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'participants' => $room['participants'] ?? []
        ]);
    }
}