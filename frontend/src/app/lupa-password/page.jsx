'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LupaPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToken('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email });
      setToken(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/95 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Lupa Password</h1>
            <p className="text-gray-500 text-sm mt-1">Masukkan email untuk mendapatkan token reset</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}

          {token ? (
            <div className="space-y-4">
              <div className="bg-success/10 text-success p-4 rounded-xl text-sm">
                <p className="font-semibold mb-1">Token berhasil dibuat!</p>
                <p>Salin token di bawah, lalu reset password Anda.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Token Reset</label>
                <div className="flex gap-2">
                  <input readOnly value={token}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm bg-muted font-mono focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
                  <button onClick={() => navigator.clipboard.writeText(token)}
                    className="px-3 py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-all cursor-pointer">Salin</button>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push(`/reset-password?token=${token}`)}>Lanjut ke Reset Password</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@kud.com" />
              <Button type="submit" loading={loading} className="w-full">Kirim Token Reset</Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Ingat password?{' '}
            <button onClick={() => router.push('/login')} className="text-primary font-semibold hover:underline cursor-pointer">Masuk</button>
          </div>
        </div>
      </div>
    </div>
  );
}
