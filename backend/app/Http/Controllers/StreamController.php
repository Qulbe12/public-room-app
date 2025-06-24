<?php

namespace App\Http\Controllers;

use App\Events\WebRTCOffer;
use App\Events\WebRTCAnswer;
use App\Events\WebRTCIceCandidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StreamController extends Controller
{
    /**
     * Handle WebRTC offer
     */
    public function handleOffer(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => 'required|string',
            'from_participant_id' => 'required|string',
            'to_participant_id' => 'required|string',
            'offer' => 'required|array'
        ]);
        
        $roomId = $request->input('room_id');
        $fromParticipantId = $request->input('from_participant_id');
        $toParticipantId = $request->input('to_participant_id');
        $offer = $request->input('offer');
        
        // Broadcast the offer to the target participant
        broadcast(new WebRTCOffer($roomId, $fromParticipantId, $toParticipantId, $offer));
        
        return response()->json([
            'success' => true,
            'message' => 'Offer sent successfully'
        ]);
    }
    
    /**
     * Handle WebRTC answer
     */
    public function handleAnswer(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => 'required|string',
            'from_participant_id' => 'required|string',
            'to_participant_id' => 'required|string',
            'answer' => 'required|array'
        ]);
        
        $roomId = $request->input('room_id');
        $fromParticipantId = $request->input('from_participant_id');
        $toParticipantId = $request->input('to_participant_id');
        $answer = $request->input('answer');
        
        // Broadcast the answer to the target participant
        broadcast(new WebRTCAnswer($roomId, $fromParticipantId, $toParticipantId, $answer));
        
        return response()->json([
            'success' => true,
            'message' => 'Answer sent successfully'
        ]);
    }
    
    /**
     * Handle ICE candidate
     */
    public function handleIceCandidate(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => 'required|string',
            'from_participant_id' => 'required|string',
            'to_participant_id' => 'required|string',
            'candidate' => 'required|array'
        ]);
        
        $roomId = $request->input('room_id');
        $fromParticipantId = $request->input('from_participant_id');
        $toParticipantId = $request->input('to_participant_id');
        $candidate = $request->input('candidate');
        
        // Broadcast the ICE candidate to the target participant
        broadcast(new WebRTCIceCandidate($roomId, $fromParticipantId, $toParticipantId, $candidate));
        
        return response()->json([
            'success' => true,
            'message' => 'ICE candidate sent successfully'
        ]);
    }
}