export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden"
    >
      {/* Grid background pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".9" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".5" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".5" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".9" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">ARID Kanban</span>
          </div>
          <a
            href="login"
            className="text-sm text-blue-300 hover:text-white transition-colors"
          >
            تسجيل الدخول
          </a>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            منصة إدارة المشاريع البحثية
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            نظّم بحثك{' '}
            <span className="bg-gradient-to-l from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              بكفاءة عالية
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
            لوحات Kanban تفاعلية مصممة لفرق البحث العلمي — تتبّع المهام، تعاون مع زملائك، وحلّل تقدمك في مكان واحد.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a
              href="login"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-900/40 transition-all duration-200 hover:scale-105"
            >
              ابدأ الآن
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l-4 4 4 4M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="register"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200"
            >
              إنشاء حساب
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              gradient="from-blue-500/10 to-blue-600/5"
              border="border-blue-500/20"
              iconBg="bg-blue-500/15"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="7" height="7" rx="2" stroke="#60a5fa" strokeWidth="1.5" />
                  <rect x="11" y="2" width="7" height="7" rx="2" stroke="#60a5fa" strokeWidth="1.5" fillOpacity=".3" fill="#60a5fa" />
                  <rect x="2" y="11" width="7" height="7" rx="2" stroke="#60a5fa" strokeWidth="1.5" fillOpacity=".3" fill="#60a5fa" />
                  <rect x="11" y="11" width="7" height="7" rx="2" stroke="#60a5fa" strokeWidth="1.5" />
                </svg>
              }
              title="لوحات مرنة"
              desc="قوائم وبطاقات قابلة للسحب والإفلات بتجربة سلسة"
            />
            <FeatureCard
              gradient="from-indigo-500/10 to-indigo-600/5"
              border="border-indigo-500/20"
              iconBg="bg-indigo-500/15"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="#818cf8" strokeWidth="1.5" />
                  <circle cx="4" cy="14" r="2" stroke="#818cf8" strokeWidth="1.5" />
                  <circle cx="16" cy="14" r="2" stroke="#818cf8" strokeWidth="1.5" />
                  <path d="M6 14c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
              title="تعاون فوري"
              desc="تحديثات مباشرة عبر WebSocket مع فريقك البحثي"
            />
            <FeatureCard
              gradient="from-violet-500/10 to-violet-600/5"
              border="border-violet-500/20"
              iconBg="bg-violet-500/15"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 15l4-5 3 3 3-4 4 6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="2" y="2" width="16" height="16" rx="3" stroke="#a78bfa" strokeWidth="1.5" />
                </svg>
              }
              title="إحصائيات ذكية"
              desc="تسلسل زمني ولوحات تحليل بيانية تفاعلية"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-8 py-5 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} ARID — منصة البحث العلمي
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  gradient, border, iconBg, icon, title, desc,
}: {
  gradient: string; border: string; iconBg: string;
  icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-6 backdrop-blur-sm`}>
      <div className={`${iconBg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
