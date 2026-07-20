'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', token: searchParams.get('token') || '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.auth.resetPassword(form);
      setMessage(res.message);
      setTimeout(() => router.push('/login'), 2000);
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
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1">Buat password baru Anda</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}
          {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required placeholder="email@domain.com" />
            <Input label="Token" value={form.token} onChange={(e) => setForm({...form, token: e.target.value})} required placeholder="Masukkan token dari email" />
            <Input label="Password Baru" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={8} />
            <Input label="Konfirmasi Password" type="password" value={form.password_confirmation} onChange={(e) => setForm({...form, password_confirmation: e.target.value})} required />
            <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <button onClick={() => router.push('/login')} className="text-primary font-semibold hover:underline cursor-pointer">Kembali ke Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
