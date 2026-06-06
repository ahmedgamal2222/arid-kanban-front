'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

const LOGO = (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
  </svg>
);

type Tab = 'local' | 'arid';

export default function LoginClient() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [tab, setTab] = useState<Tab>('local');

  // Local login state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  // ARID login state
  const [aridEmail, setAridEmail] = useState('');
  const [aridPassword, setAridPassword] = useState('');
  const [showAridPw, setShowAridPw] = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function onSuccess(token: string) {
    session.setToken(token);
    router.replace(`/${locale}/boards`);
  }

  async function handleLocalLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      onSuccess(res.token);
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  async function handleAridLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.aridLogin(aridEmail.trim(), aridPassword);
      onSuccess(res.token);
    } catch (err: any) {
      setError(err.message ?? 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full bg-white/[0.05] border border-white/[0.09] hover:border-white/[0.14] focus:border-blue-500/60 focus:bg-blue-500/5 focus:outline-none text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm transition-all duration-150';
  const btnCls   = 'relative w-full mt-2 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40';

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-900 flex items-center justify-center p-4">
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-60"
        style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div aria-hidden className="pointer-events-none fixed -top-60 -right-60 w-[700px] h-[700px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div aria-hidden className="pointer-events-none fixed -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-900/50">
            {LOGO}
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">ARID Kanban</span>
          <p className="text-slate-400 text-sm">منصة إدارة المشاريع البحثية</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">

          {/* Tabs */}
          <div className="flex bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => { setTab('local'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'local' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              بريد إلكتروني
            </button>
            <button
              onClick={() => { setTab('arid'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${tab === 'arid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="text-base leading-none">🔬</span>
              حساب ARID
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 5v3M8 10.5v.5M2.5 13.5h11l-5.5-11-5.5 11z" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── Tab: Email / Password ── */}
          {tab === 'local' && (
            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" dir="ltr"
                    className={`${inputCls} pr-10`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">كلمة المرور</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input type={showPw ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className={`${inputCls} pr-10 pl-11`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    جارٍ التحقق...
                  </span>
                ) : 'تسجيل الدخول'}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                ليس لديك حساب؟{' '}
                <Link href={`/${locale}/register`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  إنشاء حساب
                </Link>
              </p>
            </form>
          )}

          {/* ── Tab: ARID SSO ── */}
          {tab === 'arid' && (
            <form onSubmit={handleAridLogin} className="space-y-4">
              {/* Info box */}
              {/* Info box */}
              <div className="bg-blue-500/[0.08] border border-blue-500/20 rounded-xl p-4 text-sm text-slate-300">
                <p className="font-semibold text-blue-300 flex items-center gap-2 mb-1">
                  <span>🔬</span> تسجيل الدخول بحساب ARID Portal
                </p>
                <p className="text-xs text-slate-400">
                  استخدم نفس البريد الإلكتروني وكلمة المرور الخاصة بك في{' '}
                  <span className="text-blue-400 font-mono">portal.arid.my</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input type="email" required value={aridEmail} onChange={e => setAridEmail(e.target.value)}
                    placeholder="your@arid.email" dir="ltr"
                    className={`${inputCls} pr-10`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">كلمة المرور</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input type={showAridPw ? 'text' : 'password'} required value={aridPassword}
                    onChange={e => setAridPassword(e.target.value)} placeholder="••••••••"
                    className={`${inputCls} pr-10 pl-11`} />
                  <button type="button" onClick={() => setShowAridPw(!showAridPw)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    <EyeIcon open={showAridPw} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    جارٍ التحقق...
                  </span>
                ) : 'دخول بحساب ARID'}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                ليس لديك حساب ARID؟{' '}
                <Link href="https://portal.arid.my" target="_blank" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  التسجيل في بوابة ARID
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}