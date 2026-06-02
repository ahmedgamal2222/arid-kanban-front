'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, session } from '@/lib/api';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      session.setToken(res.token);
      router.replace('boards');
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-900 flex items-center justify-center p-4">

      {/* Background effects */}
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
      <div aria-hidden className="pointer-events-none fixed -top-60 -right-60 w-[700px] h-[700px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div aria-hidden className="pointer-events-none fixed -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-900/50">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">ARID Kanban</span>
          <p className="text-slate-400 text-sm">منصة إدارة المشاريع البحثية</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">

          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">تسجيل الدخول</h1>
            <p className="text-slate-400 text-sm mt-1">أدخل بياناتك للوصول إلى لوحاتك</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 5v3M8 10.5v.5M2.5 13.5h11l-5.5-11-5.5 11z" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">البريد الإلكتروني</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full bg-white/[0.05] border border-white/[0.09] hover:border-white/[0.14] focus:border-blue-500/60 focus:bg-blue-500/5 focus:outline-none text-white placeholder-slate-600 rounded-xl pr-10 pl-4 py-2.5 text-sm transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">كلمة المرور</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.05] border border-white/[0.09] hover:border-white/[0.14] focus:border-blue-500/60 focus:bg-blue-500/5 focus:outline-none text-white placeholder-slate-600 rounded-xl pr-10 pl-11 py-2.5 text-sm transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200 rounded-xl" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  جارٍ الدخول...
                </span>
              ) : 'دخول'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-slate-600">أو</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <p className="text-center text-sm text-slate-400">
            ليس لديك حساب؟{' '}
            <Link href="../register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          © {new Date().getFullYear()} ARID — منصة البحث العلمي
        </p>
      </div>
    </main>
  );
}
