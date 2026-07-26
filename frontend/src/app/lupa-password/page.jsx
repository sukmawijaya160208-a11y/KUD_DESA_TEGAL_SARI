'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LupaPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.forgotPassword({ email });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.auth.resetPassword({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.auth.forgotPassword({ email });
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
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Masukkan email untuk mendapatkan kode OTP' : 'Masukkan kode OTP dan password baru'}
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4">{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@kud.com" />
              <Button type="submit" loading={loading} className="w-full">Kirim Kode OTP</Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@domain.com" />
              <Input label="Kode OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder="6 digit kode OTP" maxLength={6} inputMode="numeric" />
              <Input label="Password Baru" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <Input label="Konfirmasi Password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
              <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
              <button type="button" onClick={handleResendOtp} disabled={loading} className="w-full text-center text-sm text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50">
                Kirim ulang kode OTP
              </button>
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
