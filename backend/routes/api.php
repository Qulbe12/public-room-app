<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoRoomController;
use App\Http\Controllers\StreamController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Video room management routes
Route::prefix('rooms')->group(function () {
    Route::get('/', [VideoRoomController::class, 'index']);
    Route::post('/', [VideoRoomController::class, 'store']);
    Route::get('/{roomId}', [VideoRoomController::class, 'show']);
    Route::post('/{roomId}/join', [VideoRoomController::class, 'join']);
    Route::post('/{roomId}/leave', [VideoRoomController::class, 'leave']);
});

// Stream management routes
Route::prefix('streams')->group(function () {
    Route::post('/offer', [StreamController::class, 'handleOffer']);
    Route::post('/answer', [StreamController::class, 'handleAnswer']);
    Route::post('/ice-candidate', [StreamController::class, 'handleIceCandidate']);
});