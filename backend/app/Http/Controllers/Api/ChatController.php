<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ChatController extends Controller
{
    public function conversations(Request $request)
    {
        $user = $request->user();
        $conversations = $user->conversations()
            ->with(['lastMessage.sender', 'users'])
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)
                    ->where(function ($q) {
                        $q->whereNull('created_at')
                            ->orWhereRaw('messages.created_at > COALESCE(conversation_user.last_read_at, ?)', ['0001-01-01']);
                    });
            }])
            ->orderByDesc(
                Message::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest()
                    ->take(1)
            )
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'users' => $c->users->map(fn ($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'role' => $u->role,
                        'foto_profil' => $u->foto_profil,
                    ]),
                    'last_message' => $c->lastMessage ? [
                        'id' => $c->lastMessage->id,
                        'message' => $c->lastMessage->message,
                        'sender_id' => $c->lastMessage->sender_id,
                        'created_at' => $c->lastMessage->created_at,
                    ] : null,
                    'unread_count' => (int) $c->unread_count,
                    'created_at' => $c->created_at,
                ];
            });

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                Rule::notIn([$request->user()->id]),
            ],
        ]);

        $user = $request->user();
        $otherId = $request->user_id;

        $existing = $user->conversations()
            ->whereHas('users', fn ($q) => $q->where('user_id', $otherId))
            ->first();

        if ($existing) {
            return response()->json(['id' => $existing->id, 'existing' => true]);
        }

        DB::beginTransaction();
        try {
            $conversation = Conversation::create();
            $conversation->users()->attach([$user->id, $otherId]);
            DB::commit();

            return response()->json([
                'id' => $conversation->id,
                'existing' => false,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal membuat percakapan'], 500);
        }
    }

    public function messages(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $perPage = min((int) ($request->per_page ?? 50), 100);
        $messages = $conversation->messages()
            ->with('sender')
            ->oldest()
            ->paginate($perPage)
            ->map(fn ($m) => [
                'id' => $m->id,
                'conversation_id' => $m->conversation_id,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender->name,
                'sender_role' => $m->sender->role,
                'message' => $m->message,
                'attachment' => $m->attachment,
                'created_at' => $m->created_at,
                'is_mine' => $m->sender_id === $user->id,
            ]);

        return response()->json($messages);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'message' => 'nullable|string|max:5000',
            'attachment' => 'nullable|array',
            'attachment.url' => 'required_with:attachment|string',
            'attachment.name' => 'required_with:attachment|string',
            'attachment.type' => 'required_with:attachment|string',
            'attachment.size' => 'required_with:attachment|integer',
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'message' => strip_tags($request->message ?? ''),
            'attachment' => $request->attachment,
        ]);

        return response()->json([
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $user->name,
            'sender_role' => $user->role,
            'message' => $message->message,
            'attachment' => $message->attachment,
            'created_at' => $message->created_at,
            'is_mine' => true,
        ], 201);
    }

    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $conversation->users()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        return response()->json(['message' => 'OK']);
    }

    public function destroy(Request $request, Conversation $conversation, Message $message)
    {
        $user = $request->user();
        if ($message->sender_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($message->conversation_id !== $conversation->id) {
            return response()->json(['message' => 'Message not in this conversation'], 400);
        }

        $message->update(['message' => '[Pesan telah dihapus]', 'attachment' => null]);

        return response()->json(['message' => 'OK']);
    }

    public function users(Request $request)
    {
        $user = $request->user();
        $users = User::where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'foto_profil']);

        return response()->json($users);
    }
}
