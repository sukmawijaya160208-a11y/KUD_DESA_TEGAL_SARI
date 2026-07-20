<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;

class CallController extends Controller
{
    public function initiate(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'type' => 'required|in:audio,video',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($request->conversation_id);
        $receiver = $conversation->users()->where('user_id', '!=', $user->id)->first();

        if (!$receiver) {
            return response()->json(['message' => 'No other user in conversation'], 400);
        }

        $active = Call::where('conversation_id', $conversation->id)
            ->whereIn('status', ['ringing', 'ongoing'])
            ->first();
        if ($active) {
            return response()->json(['message' => 'A call is already active'], 409);
        }

        $call = Call::create([
            'conversation_id' => $conversation->id,
            'caller_id' => $user->id,
            'receiver_id' => $receiver->id,
            'type' => $request->type,
            'status' => 'ringing',
        ]);

        return response()->json($call, 201);
    }

    public function pending(Request $request)
    {
        $user = $request->user();
        $calls = Call::where('receiver_id', $user->id)
            ->where('status', 'ringing')
            ->with(['caller', 'conversation.users'])
            ->latest()
            ->get();

        return response()->json($calls);
    }

    public function accept(Request $request, Call $call)
    {
        $user = $request->user();
        if ($call->receiver_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($call->status !== 'ringing') {
            return response()->json(['message' => 'Call is not ringing'], 400);
        }

        $call->update([
            'status' => 'ongoing',
            'started_at' => now(),
        ]);

        return response()->json($call);
    }

    public function reject(Request $request, Call $call)
    {
        $user = $request->user();
        if ($call->receiver_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $call->update(['status' => 'rejected']);

        return response()->json(['message' => 'Call rejected']);
    }

    public function end(Request $request, Call $call)
    {
        $user = $request->user();
        if ($call->caller_id !== $user->id && $call->receiver_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $now = now();
        $duration = $call->started_at ? $call->started_at->diffInSeconds($now) : 0;

        $call->update([
            'status' => 'ended',
            'ended_at' => $now,
            'duration' => $duration,
        ]);

        return response()->json(['message' => 'Call ended', 'duration' => $duration]);
    }

    public function active(Request $request)
    {
        $user = $request->user();
        $call = Call::where(function ($q) use ($user) {
                $q->where('caller_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->whereIn('status', ['ringing', 'ongoing'])
            ->with(['caller', 'receiver', 'conversation.users'])
            ->first();

        return response()->json($call);
    }

    public function history(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        if (!$conversation->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $calls = $conversation->calls()
            ->with(['caller', 'receiver'])
            ->latest()
            ->take(50)
            ->get();

        return response()->json($calls);
    }
}
