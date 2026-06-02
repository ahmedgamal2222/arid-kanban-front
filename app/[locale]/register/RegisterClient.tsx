'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function RegisterClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(email, password, name);
      router.replace('../login');
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4"
    >
      {/* Grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div aria-hidden className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".9" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".9" />
            </svg>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">ARID Kanban</span>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-1">إنشاء حساب</h1>
          <p className="text-slate-400 text-sm mb-6">انضم وابدأ في إدارة مشاريعك البحثية</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">الاسم الكامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 mt-2"
            >
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="../login" className="text-blue-400 hover:text-blue-300 transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
