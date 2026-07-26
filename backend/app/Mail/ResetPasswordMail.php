<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $token;
    public string $email;

    public function __construct(string $token, string $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function build()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($this->email);

        return $this->subject('Reset Password - KUD Desa Sari Subur')
            ->html('
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;">
<div style="background:#059669;padding:24px;text-align:center;">
<h1 style="color:white;margin:0;font-size:20px;">KUD Desa Sari Subur</h1>
</div>
<div style="padding:32px;">
<h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Reset Password</h2>
<p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
Kami menerima permintaan reset password untuk akun <strong>' . $this->email . '</strong>.
Klik tombol di bawah untuk membuat password baru.
</p>
<div style="text-align:center;margin:24px 0;">
<a href="' . $resetUrl . '"
style="display:inline-block;background:#059669;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
Buat Password Baru
</a>
</div>
<p style="margin:20px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
Link ini berlaku selama 60 menit. Jika Anda tidak meminta reset password, abaikan email ini.
</p>
</div>
</div>
</body>
</html>');
    }
}
