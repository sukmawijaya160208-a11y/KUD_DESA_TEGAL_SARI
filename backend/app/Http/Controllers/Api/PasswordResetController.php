<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        $message = 'Link reset password telah dikirim ke email Anda.';

        if (!$user) {
            return response()->json(['message' => $message]);
        }

        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        Mail::to($request->email)->send(new ResetPasswordMail($token, $request->email));

        Notifikasi::create([
            'user_id' => $user->id,
            'judul' => 'Reset Password',
            'pesan' => 'Link reset password telah dikirim ke email Anda.',
            'link' => '/lupa-password',
        ]);

        return response()->json(['message' => $message]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Link reset password tidak valid.'], 400);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Link reset password sudah kadaluarsa. Silakan minta ulang.'], 400);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Link reset password tidak valid.'], 400);
        }

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        Notifikasi::create([
            'user_id' => User::where('email', $request->email)->value('id'),
            'judul' => 'Password Berhasil Diubah',
            'pesan' => 'Password akun Anda telah berhasil direset.',
        ]);

        return response()->json(['message' => 'Password berhasil direset. Silakan login.']);
    }
}
