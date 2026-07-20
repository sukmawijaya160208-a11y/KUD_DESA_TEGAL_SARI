'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useLogo } from '@/hooks/useLogo';
import FloatingOrbs from '@/components/auth/FloatingOrbs';
import FloatingInput from '@/components/auth/FloatingInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { BENEFITS } from '@/components/auth/benefits';

function MeshGradient() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, var(--color-primary-light), transparent 70%)' }} />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />
    </div>
  );
}

function Checkbox({ id, label, checked, onChange, required }) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer group">
      <div className="relative mt-0.5">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} required={required}
          className="peer sr-only" />
        <div className={`w-4.5 h-4.5 rounded border-2 transition-all duration-200 flex items-center justify-center
          ${checked ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-gray-400 bg-white'}`}
          style={{ width: 18, height: 18 }}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-500 leading-relaxed select-none">{label}</span>
    </label>
  );
}

function fireConfetti() {
  const duration = 1200;
  const end = Date.now() + duration;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#2563EB', '#059669', '#60A5FA', '#FFD700'] });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#2563EB', '#059669', '#60A5FA', '#FFD700'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateNIK(nik) {
  return /^\d{16}$/.test(nik);
}

export default function AuthPage() {
  const router = useRouter();
  const logoUrl = useLogo();
  const [tab, setTab] = useState('login');
  const [regStep, setRegStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [reg, setReg] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
    nama: '', nik: '', no_kk: '', tempat_lahir: '', tanggal_lahir: '',
    no_whatsapp: '', alamat: '',
  });
  const [regMethod, setRegMethod] = useState('email');
  const [regErrors, setRegErrors] = useState({});

  const pageRef = useRef(null);

  const switchTab = (t) => {
    if (t === tab) return;
    setError('');
    setRegStep(1);
    setLoginErrors({});
    setRegErrors({});
    setTab(t);
  };

  function isPhone(v) {
    return /^(\+62|62|0)\d{6,15}$/.test(v.replace(/[\s\-]/g, ''));
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const errs = {};
    const identifier = login.email?.trim();
    if (!identifier) { errs.email = 'Email atau nomor HP harus diisi'; }
    else if (isPhone(identifier)) { /* phone ok */ }
    else if (!validateEmail(identifier)) { errs.email = 'Email tidak valid'; }
    if (login.password.length < 6) errs.password = 'Password minimal 6 karakter';
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const payload = isPhone(identifier)
        ? { phone: identifier, password: login.password }
        : { email: identifier, password: login.password };
      const res = await api.auth.login(payload);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      fireConfetti();
      await new Promise((r) => setTimeout(r, 600));
      const role = res.user.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'verifikator') router.push('/verifikator');
      else router.push('/pekebun');
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const errs = {};
    if (!reg.name.trim()) errs.name = 'Nama harus diisi';
    if (regMethod === 'email') {
      if (!validateEmail(reg.email)) errs.email = 'Email tidak valid';
    } else {
      if (!isPhone(reg.phone)) errs.phone = 'Nomor HP tidak valid (contoh: 08123456789)';
    }
    if (reg.password.length < 8) errs.password = 'Password minimal 8 karakter';
    if (reg.password !== reg.password_confirmation) errs.password_confirmation = 'Password tidak cocok';
    if (regStep === 2) {
      if (!reg.nama.trim()) errs.nama = 'Nama pekebun harus diisi';
      if (!validateNIK(reg.nik)) errs.nik = 'NIK harus 16 digit angka';
    }
    if (!agreeTerms) { setError('Anda harus menyetujui Syarat & Ketentuan'); return; }
    setRegErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const payload = { ...reg };
      if (regMethod === 'phone') {
        delete payload.email;
      } else {
        delete payload.phone;
      }
      const res = await api.auth.register(payload);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      fireConfetti();
      await new Promise((r) => setTimeout(r, 600));
      router.push('/pekebun');
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const updateReg = (key) => (e) => setReg({ ...reg, [key]: e.target.value });

  return (
    <div ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2744] to-slate-800 flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans relative">
      <FloatingOrbs />
      <MeshGradient />

      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}>

        {/* ─── BRAND SIDE — static ─── */}
        <div className="lg:w-[38%] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-light/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-20 h-auto max-h-20 max-w-[160px] rounded-2xl overflow-hidden bg-white/10 backdrop-blur border border-white/10 shadow-lg flex items-center justify-center mb-6 px-2 py-2">
              {logoUrl ? (
                <img src={logoUrl} alt="KUD Desa Tegal Sari" className="w-full h-full max-h-16 object-contain" />
              ) : (
                <span className="text-white font-heading font-bold text-2xl px-3 py-1">K</span>
              )}
            </div>
            <h1 className="font-heading font-bold text-3xl lg:text-4xl text-white leading-tight mb-2">
              KUD Desa<br />
              <span className="bg-gradient-to-r from-primary-light via-blue-200 to-accent bg-clip-text text-transparent">
                Tegal Sari
              </span>
            </h1>
            <p className="text-white/50 text-sm mb-8 max-w-xs leading-relaxed">
              Koperasi modern untuk pekebun sawit — digital, transparan, dan terpercaya.
            </p>

            {/* Static benefits card */}
            <div className="space-y-3">
              {BENEFITS.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                    </svg>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row — static */}
          <div className="relative z-10 flex items-center gap-6 pt-6 mt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-white font-heading font-bold text-lg">1,250+</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Pekebun</p>
            </div>
            <div className="text-center">
              <p className="text-white font-heading font-bold text-lg">3,200+</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Hektar</p>
            </div>
            <div className="text-center">
              <p className="text-white font-heading font-bold text-lg">5</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Desa</p>
            </div>
          </div>
        </div>

        {/* ─── AUTH CARD ─── */}
        <div className="lg:w-[62%] bg-white/95 backdrop-blur-xl p-6 lg:p-8 flex flex-col max-h-[580px] lg:max-h-[620px]">
          {/* Tab bar */}
          <div className="relative flex bg-gray-100 rounded-xl p-1 mb-4 shrink-0">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => switchTab(t)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                  tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50/90 backdrop-blur border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2 shrink-0">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Content — scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin pr-1">
            {/* ── LOGIN ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-0 h-full">
                <div className="mb-5">
                  <h2 className="font-heading font-bold text-2xl text-foreground">Selamat Datang</h2>
                  <p className="text-gray-400 text-sm mt-1">Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                <div className="space-y-4">
                  <FloatingInput id="login-email" label="Email / Nomor HP" type="text"
                    icon="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })}
                    required error={loginErrors.email} valid={login.email && (validateEmail(login.email) || isPhone(login.email))} />
                  <div className="relative">
                    <svg
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 transition-colors duration-200 ${
                        loginErrors.password ? 'text-red-400' : 'text-gray-300'
                      }`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input id="login-password" type={showPassword ? 'text' : 'password'}
                      value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })}
                      required placeholder=" "
                      className={`peer w-full pt-5 pb-2 pl-10 pr-10 rounded-xl border bg-white text-sm outline-none transition-all duration-200 ${
                        loginErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]'
                          : 'border-border focus:ring-ring/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(37,99,235,0.06)]'
                      }`} />
                    <label htmlFor="login-password"
                      className={`absolute left-10 top-[14px] text-sm transition-all duration-200 pointer-events-none z-10
                        peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                        peer-focus:top-[6px] peer-focus:text-xs peer-focus:text-primary
                        peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500
                        ${loginErrors.password ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-400'}`}>
                      Password
                    </label>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer z-10">
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    {loginErrors.password && (
                      <p className="text-red-500 text-[11px] mt-1 px-1">{loginErrors.password}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Checkbox id="remember-me" label="Ingat Saya" checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)} />
                    <button type="button" onClick={() => router.push('/lupa-password')}
                      className="text-xs text-primary hover:underline cursor-pointer font-medium">Lupa Password?</button>
                  </div>
                </div>

                <div className="mt-auto pt-5 space-y-3">
                  <button type="submit" disabled={loading}
                    className={`relative overflow-hidden w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      loading
                        ? 'bg-primary/70 text-white shadow-primary/10'
                        : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] shadow-primary/20'
                    }`}>
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : null}
                    {loading ? 'Memproses...' : 'Masuk ke Akun'}
                  </button>
                  <button type="button" onClick={() => router.push('/')}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer py-1">
                    &larr; Kembali ke Beranda
                  </button>
                </div>
              </form>
            )}

            {/* ── REGISTER ── */}
            {tab === 'register' && (
              <div className="flex flex-col gap-0 h-full">
                <div className="mb-4">
                  <h2 className="font-heading font-bold text-2xl text-foreground">Bergabung Sekarang</h2>
                  <p className="text-gray-400 text-sm mt-1">Daftar sebagai pekebun dan nikmati layanan digital KUD</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                    regStep >= 1 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-200 text-gray-400'
                  }`}>1</div>
                  <div className="h-1 flex-1 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full bg-primary rounded-full origin-left transition-all duration-300`}
                      style={{ width: regStep === 2 ? '100%' : '0%' }} />
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                    regStep >= 2 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-200 text-gray-400'
                  }`}>2</div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mb-4 px-1">
                  <span className={regStep === 1 ? 'text-primary font-semibold' : ''}>Akun Login</span>
                  <span className={regStep === 2 ? 'text-primary font-semibold' : ''}>Data Pekebun</span>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-0 flex-1">
                  {/* Step 1 */}
                  {regStep === 1 && (
                    <div className="space-y-4 transition-opacity duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatingInput id="reg-name" label="Nama Lengkap" value={reg.name}
                          onChange={updateReg('name')} required error={regErrors.name} valid={reg.name.trim().length > 0} />
                        <div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <button type="button" onClick={() => setRegMethod('email')}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                regMethod === 'email' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>Email</button>
                            <button type="button" onClick={() => setRegMethod('phone')}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                regMethod === 'phone' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>Nomor HP</button>
                          </div>
                          {regMethod === 'email' ? (
                            <FloatingInput id="reg-email" label="Email" type="email" value={reg.email}
                              onChange={updateReg('email')} required error={regErrors.email} valid={validateEmail(reg.email)} />
                          ) : (
                            <FloatingInput id="reg-phone" label="Nomor HP (contoh: 08123456789)" type="tel" value={reg.phone}
                              onChange={updateReg('phone')} required error={regErrors.phone} valid={isPhone(reg.phone)} />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="relative">
                            <input id="reg-password" type={showRegPassword ? 'text' : 'password'}
                              value={reg.password} onChange={updateReg('password')}
                              required minLength={8} placeholder=" "
                              className={`peer w-full pt-5 pb-2 pl-4 pr-10 rounded-xl border bg-white text-sm outline-none transition-all duration-200 ${
                                regErrors.password
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]'
                                  : reg.password.length >= 8
                                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/30 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)]'
                                  : 'border-border focus:ring-ring/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(37,99,235,0.06)]'
                              }`} />
                            <label htmlFor="reg-password"
                              className={`absolute left-4 top-[14px] text-sm transition-all duration-200 pointer-events-none z-10
                                peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                peer-focus:top-[6px] peer-focus:text-xs peer-focus:text-primary
                                peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500
                                ${regErrors.password ? 'text-red-500 peer-focus:text-red-500' : reg.password.length >= 8 ? 'text-green-500 peer-[:not(:placeholder-shown)]:text-green-500' : 'text-gray-400'}`}>
                              Password
                            </label>
                            <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer z-10">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            {reg.password.length >= 8 && !regErrors.password && (
                              <svg className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </div>
                          <PasswordStrength password={reg.password} />
                          {regErrors.password && <p className="text-red-500 text-[11px] mt-1">{regErrors.password}</p>}
                        </div>
                        <FloatingInput id="reg-password-confirm" label="Konfirmasi Password" type="password"
                          value={reg.password_confirmation} onChange={updateReg('password_confirmation')}
                          required error={regErrors.password_confirmation}
                          valid={reg.password_confirmation && reg.password === reg.password_confirmation} />
                      </div>
                      <Checkbox id="agree-terms" label={
                        <span>Saya menyetujui <button type="button" onClick={() => router.push('/syarat-ketentuan')}
                          className="text-primary hover:underline font-medium">Syarat & Ketentuan</button> dan <button type="button" onClick={() => router.push('/kebijakan-privasi')}
                          className="text-primary hover:underline font-medium">Kebijakan Privasi</button> KUD Desa Tegal Sari</span>
                      } checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
                      <button type="button" onClick={() => setRegStep(2)}
                        className="relative overflow-hidden w-full py-3 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                        Lanjut ke Data Pekebun
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] text-gray-400">atau daftar dengan</span></div>
                      </div>
                      <button type="button" onClick={async () => {
                        try {
                          const res = await api.auth.googleRedirect();
                          if (res?.url) window.location.href = res.url;
                        } catch (err) { setError(err.message); }
                      }}
                        className="w-full py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Google
                      </button>
                    </div>
                  )}

                  {/* Step 2 */}
                  {regStep === 2 && (
                    <div className="space-y-4 transition-opacity duration-200">
                      <p className="text-xs text-gray-400">Lengkapi data diri Anda untuk verifikasi anggota KUD.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatingInput id="reg-nama" label="Nama Pekebun" value={reg.nama}
                          onChange={updateReg('nama')} required error={regErrors.nama} valid={reg.nama.trim().length > 0} />
                        <FloatingInput id="reg-nik" label="NIK" value={reg.nik}
                          onChange={updateReg('nik')} required maxLength={16}
                          error={regErrors.nik} valid={validateNIK(reg.nik)} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatingInput id="reg-no-kk" label="No. KK" value={reg.no_kk} onChange={updateReg('no_kk')} required />
                        <FloatingInput id="reg-tempat-lahir" label="Tempat Lahir" value={reg.tempat_lahir}
                          onChange={updateReg('tempat_lahir')} required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatingInput id="reg-tgl-lahir" label="Tanggal Lahir" type="date"
                          value={reg.tanggal_lahir} onChange={updateReg('tanggal_lahir')} required />
                        <FloatingInput id="reg-wa" label="No. WhatsApp" value={reg.no_whatsapp}
                          onChange={updateReg('no_whatsapp')} required />
                      </div>
                      <FloatingInput id="reg-alamat" label="Alamat" value={reg.alamat}
                        onChange={updateReg('alamat')} required />
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setRegStep(1)}
                          className="relative overflow-hidden flex-1 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                          </svg>
                          Kembali
                        </button>
                        <button type="submit" disabled={loading}
                          className={`relative overflow-hidden flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                            loading
                              ? 'bg-accent/70 text-white shadow-accent/10'
                              : 'bg-accent text-white hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98] shadow-accent/20'
                          }`}>
                          {loading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : null}
                          {loading ? 'Memproses...' : 'Daftar Sekarang'}
                          {!loading && (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom link */}
                  <div className="mt-auto pt-4 text-center">
                    <p className="text-xs text-gray-400">
                      Sudah punya akun?{' '}
                      <button type="button" onClick={() => switchTab('login')}
                        className="text-primary font-semibold hover:underline cursor-pointer">Masuk di sini</button>
                    </p>
                    <button type="button" onClick={() => router.push('/')}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mt-1">
                      &larr; Kembali ke Beranda
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 text-center text-white/20 text-[10px] tracking-wide z-10">
        &copy; {new Date().getFullYear()} CV. Sumatera Multi Jaya &mdash; Developer: M. Sukma Wijaya &middot; UX: Dedek Sulaiman
      </div>
    </div>
  );
}
