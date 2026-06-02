import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { workspacesApi } from '@/lib/api';

export const dynamic = 'force-static';

export default async function HomePage() {
  // الصفحة الرئيسية — المستخدم يُعاد توجيهه من ARID بتوكن
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">ARID Kanban</h1>
        <p className="text-gray-500 text-lg">منصة إدارة المشاريع البحثية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        <FeatureCard
          icon="📋"
          title="لوحات مرنة"
          desc="قوائم وبطاقات قابلة للسحب والإفلات"
        />
        <FeatureCard
          icon="👥"
          title="تعاون فوري"
          desc="تحديثات مباشرة عبر WebSocket"
        />
        <FeatureCard
          icon="📊"
          title="إحصائيات ذكية"
          desc="تسلسل زمني ولوحات تحليل"
        />
      </div>

      <a
        href={`${process.env.NEXT_PUBLIC_ARID_AUTH_URL ?? 'https://arid.sa'}/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
      >
        تسجيل الدخول عبر ARID
      </a>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
