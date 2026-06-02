export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#060b18] text-white overflow-x-hidden">

      {/* ── Background layers ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Glows */}
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full bg-blue-700/15 blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-700/12 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-700/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ══════════════════════════════════════
            NAV
        ══════════════════════════════════════ */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.06] backdrop-blur-sm bg-[#060b18]/60 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
              </svg>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-white">ARID <span className="text-blue-400">Kanban</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a href="login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
              تسجيل الدخول
            </a>
            <a href="register" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/40">
              ابدأ مجاناً
            </a>
          </div>
        </nav>

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-10 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            منصة إدارة المشاريع البحثية
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[72px] font-extrabold leading-[1.1] mb-6 tracking-tight max-w-3xl">
            نظّم بحثك{' '}
            <span className="relative">
              <span className="bg-gradient-to-l from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                بكفاءة عالية
              </span>
              <span aria-hidden className="absolute -bottom-2 right-0 left-0 h-px bg-gradient-to-l from-blue-500/0 via-indigo-400/60 to-blue-500/0" />
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed">
            لوحات Kanban تفاعلية مصممة خصيصاً لفرق البحث العلمي — تتبّع المهام، تعاون مع زملائك، وحلّل تقدمك في مكان واحد.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
            <a href="register" className="inline-flex items-center gap-2.5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-blue-900/50 transition-all duration-200 hover:scale-[1.03] hover:shadow-blue-800/60 text-[15px]">
              ابدأ مجاناً الآن
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6.5 3.5L3 8l3.5 4.5M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="login" className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 text-[15px]">
              لديّ حساب بالفعل
            </a>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden w-full max-w-2xl">
            {[
              { value: '+٥٠٠', label: 'فريق بحثي' },
              { value: '+١٢ألف', label: 'مهمة منجزة' },
              { value: '٩٩.٩٪', label: 'وقت التشغيل' },
              { value: '٢٤/٧', label: 'دعم فني' },
            ].map((s, i) => (
              <div key={i} className="flex-1 min-w-[120px] flex flex-col items-center py-5 px-4 bg-[#060b18]/80">
                <span className="text-2xl font-bold text-white mb-1">{s.value}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            BOARD PREVIEW (mock)
        ══════════════════════════════════════ */}
        <section className="px-6 pb-20 max-w-6xl mx-auto w-full">
          <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden shadow-2xl shadow-black/60">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-[#0d1425] border-b border-white/[0.06]">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="mx-auto text-xs text-slate-500 font-mono">ARID Kanban — مشروع الذكاء الاصطناعي</span>
            </div>
            {/* Board content */}
            <div className="bg-[#0a0f1e] p-5 overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {[
                  {
                    title: 'قيد الانتظار', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
                    cards: [
                      { title: 'مراجعة الأدبيات السابقة', tag: 'بحث', tagColor: 'bg-blue-500/15 text-blue-300', priority: 'عالي' },
                      { title: 'تصميم استبيان المستخدمين', tag: 'تصميم', tagColor: 'bg-violet-500/15 text-violet-300', priority: 'متوسط' },
                      { title: 'تحليل البيانات الأولية', tag: 'تحليل', tagColor: 'bg-amber-500/15 text-amber-300', priority: 'منخفض' },
                    ],
                  },
                  {
                    title: 'جارٍ التنفيذ', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    cards: [
                      { title: 'بناء نموذج التعلم الآلي', tag: 'تطوير', tagColor: 'bg-green-500/15 text-green-300', priority: 'عالي' },
                      { title: 'كتابة الفصل الثاني', tag: 'كتابة', tagColor: 'bg-pink-500/15 text-pink-300', priority: 'عالي' },
                    ],
                  },
                  {
                    title: 'مراجعة', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    cards: [
                      { title: 'مراجعة منهجية البحث', tag: 'مراجعة', tagColor: 'bg-orange-500/15 text-orange-300', priority: 'متوسط' },
                    ],
                  },
                  {
                    title: 'مكتمل', color: 'bg-green-500/20 text-green-400 border-green-500/30',
                    cards: [
                      { title: 'إعداد خطة البحث', tag: 'تخطيط', tagColor: 'bg-teal-500/15 text-teal-300', priority: 'مكتمل' },
                      { title: 'تحديد مشكلة البحث', tag: 'تخطيط', tagColor: 'bg-teal-500/15 text-teal-300', priority: 'مكتمل' },
                    ],
                  },
                ].map((col) => (
                  <div key={col.title} className="w-64 flex-shrink-0">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border mb-3 ${col.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {col.title}
                      <span className="mr-auto bg-white/10 text-white/40 text-[10px] px-1.5 py-0.5 rounded-full">{col.cards.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {col.cards.map((card) => (
                        <div key={card.title} className="bg-white/[0.035] hover:bg-white/[0.055] border border-white/[0.07] rounded-xl p-3.5 transition-colors cursor-default">
                          <p className="text-sm text-slate-200 mb-2.5 leading-snug">{card.title}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${card.tagColor}`}>{card.tag}</span>
                            <div className="flex gap-1">
                              {[1,2,3].map(i => (
                                <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-[#0a0f1e] -mr-1.5 first:mr-0" />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="w-full text-xs text-slate-600 hover:text-slate-400 border border-dashed border-white/[0.06] hover:border-white/15 rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        إضافة بطاقة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Gradient fade at sides */}
            <div aria-hidden className="absolute top-12 left-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0f1e] to-transparent pointer-events-none" />
            <div aria-hidden className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0f1e] to-transparent pointer-events-none" />
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURES
        ══════════════════════════════════════ */}
        <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">المميزات</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">كل ما تحتاجه لبحث ناجح</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">أدوات متكاملة لإدارة مشاريع البحث العلمي بكفاءة واحترافية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="2" width="8" height="8" rx="2.5" stroke="#60a5fa" strokeWidth="1.5"/>
                    <rect x="12" y="2" width="8" height="8" rx="2.5" stroke="#60a5fa" strokeWidth="1.5" fill="#60a5fa" fillOpacity=".2"/>
                    <rect x="2" y="12" width="8" height="8" rx="2.5" stroke="#60a5fa" strokeWidth="1.5" fill="#60a5fa" fillOpacity=".2"/>
                    <rect x="12" y="12" width="8" height="8" rx="2.5" stroke="#60a5fa" strokeWidth="1.5"/>
                  </svg>
                ),
                color: 'blue', title: 'لوحات Kanban مرنة',
                desc: 'أعمدة وبطاقات قابلة للسحب والإفلات بتجربة سلسة — نقّل المهام بين المراحل بضغطة واحدة.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="7" r="4" stroke="#818cf8" strokeWidth="1.5"/>
                    <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17 4l1.5 1.5L17 7" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                color: 'indigo', title: 'تعاون الفريق',
                desc: 'أضف أعضاء الفريق، وزّع المهام، وتابع مساهمات كل شخص في المشروع البحثي.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M3 17l5-6 4 4 4-5.5 4 7.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="2" y="2" width="18" height="18" rx="3.5" stroke="#a78bfa" strokeWidth="1.5"/>
                  </svg>
                ),
                color: 'violet', title: 'تحليلات متقدمة',
                desc: 'مخططات تفاعلية ولوحة dashboard تعطيك نظرة شاملة على تقدم الفريق وأداء المهام.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 2L13.5 8.5H20L14.5 12.5L16.5 19L11 15L5.5 19L7.5 12.5L2 8.5H8.5L11 2Z" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                ),
                color: 'emerald', title: 'أولويات ذكية',
                desc: 'صنّف المهام حسب الأولوية، وحدّد المواعيد النهائية، واستقبل تنبيهات المهام المتأخرة.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="9" stroke="#f59e0b" strokeWidth="1.5"/>
                    <path d="M11 7v4l3 2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                color: 'amber', title: 'سجل الأنشطة',
                desc: 'تتبّع كل تغيير في اللوحة مع طابع زمني دقيق — اعرف من فعل ماذا ومتى.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="5" width="16" height="13" rx="2.5" stroke="#f472b6" strokeWidth="1.5"/>
                    <path d="M7 5V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 11h6M8 14h4" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                color: 'pink', title: 'بطاقات غنية',
                desc: 'أضف وصفاً تفصيلياً، مرفقات، تعليقات، وقوائم مهام فرعية لكل بطاقة.',
              },
            ].map((f) => {
              const colors: Record<string, string> = {
                blue: 'from-blue-500/8 to-blue-600/4 border-blue-500/15 bg-blue-500/10',
                indigo: 'from-indigo-500/8 to-indigo-600/4 border-indigo-500/15 bg-indigo-500/10',
                violet: 'from-violet-500/8 to-violet-600/4 border-violet-500/15 bg-violet-500/10',
                emerald: 'from-emerald-500/8 to-emerald-600/4 border-emerald-500/15 bg-emerald-500/10',
                amber: 'from-amber-500/8 to-amber-600/4 border-amber-500/15 bg-amber-500/10',
                pink: 'from-pink-500/8 to-pink-600/4 border-pink-500/15 bg-pink-500/10',
              };
              const [grad, border, iconBg] = colors[f.color].split(' ');
              return (
                <div key={f.title} className={`bg-gradient-to-br ${grad} ${border} border rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200`}>
                  <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-[15px]">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════ */}
        <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">كيف يعمل</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">ابدأ في ثلاث خطوات</h2>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div aria-hidden className="hidden md:block absolute top-8 right-[16.5%] left-[16.5%] h-px bg-gradient-to-l from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '١', title: 'أنشئ حسابك', desc: 'سجّل مجاناً خلال ثوانٍ بدون أي بطاقة ائتمانية.' },
                { step: '٢', title: 'أضف مشروعك', desc: 'أنشئ لوحة جديدة وصمّم أعمدة تناسب سير عمل فريقك.' },
                { step: '٣', title: 'تعاون وأنجز', desc: 'أضف الفريق، وزّع المهام، وتابع التقدم في الوقت الفعلي.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-900/40 mb-5 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA BANNER
        ══════════════════════════════════════ */}
        <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 p-12 text-center"
            style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(59,130,246,0.15) 0%, transparent 70%), radial-gradient(ellipse at 20% 100%, rgba(99,102,241,0.12) 0%, transparent 60%), #0d1425' }}>
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> مجاني تماماً للبدء
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">جاهز لتنظيم بحثك؟</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                انضم إلى مئات الفرق البحثية التي تستخدم ARID Kanban لإنجاز أبحاثها بكفاءة أعلى.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="register" className="inline-flex items-center gap-2.5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-blue-900/50 transition-all duration-200 hover:scale-[1.03] text-[15px]">
                  أنشئ حسابك الآن — مجاناً
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6.5 3.5L3 8l3.5 4.5M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  لديّ حساب → تسجيل الدخول
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="border-t border-white/[0.05] px-8 py-7">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".9"/>
                  <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45"/>
                  <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".9"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white/60">ARID Kanban</span>
            </div>
            <p className="text-xs text-slate-600 text-center">
              © {new Date().getFullYear()} ARID — منصة إدارة المشاريع البحثية. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">الخصوصية</a>
              <a href="#" className="hover:text-slate-400 transition-colors">الشروط</a>
              <a href="#" className="hover:text-slate-400 transition-colors">الدعم</a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
