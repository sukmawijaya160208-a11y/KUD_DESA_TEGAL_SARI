<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Notifikasi::where('user_id', $request->user()->id)
                ->latest()
                ->get()
        );
    }

    public function countUnread(Request $request)
    {
        return response()->json([
            'count' => Notifikasi::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count(),
        ]);
    }

    public function markAsRead(Request $request, Notifikasi $notifikasi)
    {
        if ($notifikasi->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $notifikasi->update(['is_read' => true]);

        return response()->json(['message' => 'OK']);
    }

    public function markAllAsRead(Request $request)
    {
        Notifikasi::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'OK']);
    }

    public static function createForUser($userId, $judul, $pesan, $link = null)
    {
        return Notifikasi::create([
            'user_id' => $userId,
            'judul' => $judul,
            'pesan' => $pesan,
            'link' => $link,
        ]);
    }
}
