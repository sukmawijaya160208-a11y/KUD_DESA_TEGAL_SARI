<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Models\Pekebun;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasswordResetController extends Controller
{
    public function forgot(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Jika email terdaftar, kode OTP akan dikirim.',
            ]);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['otp' => $otp, 'expires_at' => now()->addMinutes(10), 'attempts' => 0, 'created_at' => now()]
        );

        $waSent = false;
        $pekebun = Pekebun::where('user_id', $user->id)->first();

        if ($pekebun && $pekebun->no_whatsapp) {
            $waSent = WhatsAppService::sendOtp($pekebun->no_whatsapp, $otp);
        }

        if (!$waSent || !$pekebun?->no_whatsapp) {
            Notifikasi::create([
                'user_id' => $user->id,
                'judul' => 'Kode OTP Reset Password',
                'pesan' => "Kode OTP Anda: $otp. Berlaku 10 menit.",
                'link' => '/reset-password',
            ]);
        }

        return response()->json([
            'message' => 'Kode OTP telah dikirim via WhatsApp.',
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Kode OTP tidak valid'], 400);
        }

        if (now()->greaterThan($record->expires_at)) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Kode OTP sudah kadaluarsa. Silakan minta ulang.'], 400);
        }

        if ($record->attempts >= 3) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Terlalu banyak percobaan. Silakan minta OTP baru.'], 400);
        }

        if ($record->otp !== $request->otp) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->increment('attempts');
            return response()->json(['message' => 'Kode OTP salah'], 400);
        }

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $user = User::where('email', $request->email)->first();
        Notifikasi::create([
            'user_id' => $user->id,
            'judul' => 'Password Berhasil Diubah',
            'pesan' => 'Password akun Anda telah berhasil direset.',
        ]);

        return response()->json(['message' => 'Password berhasil direset. Silakan login.']);
    }
}
