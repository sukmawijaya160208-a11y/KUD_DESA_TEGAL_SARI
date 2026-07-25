<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:newsletter_subscribers,email',
            'nama' => 'nullable|string|max:255',
        ]);

        $subscriber = NewsletterSubscriber::create([
            'email' => $validated['email'],
            'nama' => $validated['nama'] ?? null,
            'token' => Str::random(32),
            'status' => 'verified',
            'subscribed_at' => now(),
        ]);

        try {
            $waAdmin = Pengaturan::where('key', 'wa_admin')->value('value');
            $waAktif = Pengaturan::where('key', 'wa_gateway_aktif')->value('value');
            $waUrl = Pengaturan::where('key', 'wa_gateway_url')->value('value');
            $waKey = Pengaturan::where('key', 'wa_gateway_api_key')->value('value');

            if ($waAdmin && $waAktif === '1' && $waUrl && $waKey) {
                $pesan = "📬 Newsletter Baru!\n\nEmail: {$validated['email']}\nWaktu: " . now()->format('d M Y H:i');
                $this->sendWaNotification($waUrl, $waKey, $waAdmin, $pesan);
            }
        } catch (\Exception $e) {
        }

        return response()->json([
            'message' => 'Berhasil berlangganan! Selamat datang di newsletter KUD Sari Subur.',
        ], 201);
    }

    public function stats()
    {
        $total = NewsletterSubscriber::where('status', 'verified')->count();

        return response()->json([
            'total' => $total,
        ]);
    }

    private function sendWaNotification($url, $key, $phone, $message)
    {
        try {
            $client = new \GuzzleHttp\Client(['timeout' => 5]);
            $client->post(rtrim($url, '/') . '/send-message', [
                'json' => [
                    'api_key' => $key,
                    'receiver' => $phone,
                    'message' => $message,
                ],
            ]);
        } catch (\Exception $e) {
        }
    }
}
