'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/95 to-slate-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Cek Email Anda</h1>
            <p className="text-gray-500 text-sm mb-6">
              Link reset password telah dikirim ke <strong>{email}</strong>. Silakan cek inbox atau folder spam.
            </p>
            <Button onClick={() => window.location.href = '/login'} className="w-full">Kembali ke Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/95 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Lupa Password</h1>
            <p className="text-gray-500 text-sm mt-1">
              Masukkan email Anda. Kami akan mengirimkan link reset password.
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@domain.com" />
            <Button type="submit" loading={loading} className="w-full">Kirim Link Reset</Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Ingat password?{' '}
            <button onClick={() => window.location.href = '/login'} className="text-primary font-semibold hover:underline cursor-pointer">Masuk</button>
          </div>
        </div>
      </div>
    </div>
  );
}
