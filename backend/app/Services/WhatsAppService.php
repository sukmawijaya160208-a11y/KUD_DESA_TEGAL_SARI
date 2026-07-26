<?php

namespace App\Services;

use App\Models\Pengaturan;

class WhatsAppService
{
    public static function sendOtp(string $phone, string $otp): bool
    {
        $message = "Kode OTP reset password KUD: $otp. Berlaku 10 menit.";
        return self::sendMessage($phone, $message);
    }

    public static function sendMessage(string $phone, string $message): bool
    {
        try {
            $url = Pengaturan::where('key', 'wa_gateway_url')->value('value');
            $key = Pengaturan::where('key', 'wa_gateway_api_key')->value('value');
            $aktif = Pengaturan::where('key', 'wa_gateway_aktif')->value('value');

            if ($aktif !== '1' || !$url || !$key) {
                return false;
            }

            $client = new \GuzzleHttp\Client(['timeout' => 5]);
            $client->post(rtrim($url, '/') . '/send-message', [
                'json' => [
                    'api_key' => $key,
                    'receiver' => $phone,
                    'message' => $message,
                ],
            ]);

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
