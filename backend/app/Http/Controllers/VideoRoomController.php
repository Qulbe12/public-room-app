<?php

namespace App\Http\Controllers;

use App\Events\ParticipantJoined;
use App\Events\ParticipantLeft;
use App\Models\RoomParticipant;
use App\Models\VideoRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VideoRoomController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = VideoRoom::with(['creator', 'activeParticipants'])
            ->where('is_active', true)
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'room_id' => $room->room_id,
                    'participant_count' => $room->getParticipantCount(),
                    'created_at' => $room->created_at,
                ];
            });

        return response()->json($rooms);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $room = VideoRoom::create([
            'name' => $request->name,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'id' => $room->id,
            'name' => $room->name,
            'room_id' => $room->room_id,
            'participant_count' => 0,
            'created_at' => $room->created_at,
        ], 201);
    }

    public function show(string $roomId): JsonResponse
    {
        $room = VideoRoom::where('room_id', $roomId)
            ->where('is_active', true)
            ->with(['activeParticipants.user'])
            ->first();

        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        $participants = $room->activeParticipants->map(function ($participant) {
            return [
                'id' => $participant->id,
                'name' => $participant->participant_name,
                'joined_at' => $participant->joined_at,
                'user_id' => $participant->user_id,
            ];
        });

        return response()->json([
            'id' => $room->id,
            'name' => $room->name,
            'room_id' => $room->room_id,
            'participants' => $participants,
            'participant_count' => $participants->count(),
            'created_at' => $room->created_at,
        ]);
    }

    public function join(Request $request, string $roomId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'participant_name' => 'required|string|max:255',
            'socket_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $room = VideoRoom::where('room_id', $roomId)
            ->where('is_active', true)
            ->first();

        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        // Check if participant is already in the room
        $existingParticipant = RoomParticipant::where('room_id', $room->id)
            ->where('participant_name', $request->participant_name)
            ->where('is_active', true)
            ->first();

        if ($existingParticipant) {
            return response()->json(['error' => 'Participant already in room'], 409);
        }

        $participant = RoomParticipant::create([
            'room_id' => $room->id,
            'user_id' => auth()->id(),
            'participant_name' => $request->participant_name,
            'socket_id' => $request->socket_id,
        ]);

        // Broadcast participant joined event
        broadcast(new ParticipantJoined($room->room_id, $participant->participant_name));

        return response()->json([
            'id' => $participant->id,
            'name' => $participant->participant_name,
            'joined_at' => $participant->joined_at,
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'room_id' => $room->room_id,
            ]
        ], 201);
    }

    public function leave(Request $request, string $roomId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'participant_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $room = VideoRoom::where('room_id', $roomId)->first();

        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        $participant = RoomParticipant::where('room_id', $room->id)
            ->where('participant_name', $request->participant_name)
            ->where('is_active', true)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Participant not found in room'], 404);
        }

        $participant->leave();

        // Broadcast participant left event
        broadcast(new ParticipantLeft($room->room_id, (string)$participant->id));

        return response()->json(['message' => 'Left room successfully']);
    }
}