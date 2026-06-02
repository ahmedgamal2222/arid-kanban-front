'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { boardsApi } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white shadow-xl">
        {label && <p className="text-slate-400 mb-1 text-xs">{label}</p>}
        <p className="font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-900 p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPageClient() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['board-dashboard', id],
    queryFn: () => boardsApi.dashboard(id),
  });

  if (isLoading) return <LoadingSkeleton />;

  const stats = data as any;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-900 text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative z-10 max-w-5xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">إحصائيات اللوحة</h1>
          <p className="text-slate-400 text-sm mt-1">نظرة شاملة على أداء المشروع</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="البطاقات المتأخرة" value={stats?.overdue_count ?? 0} color="red"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} />
          <StatCard label="إجمالي البطاقات" value={stats?.total_cards ?? 0} color="blue"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>} />
          <StatCard label="الأعضاء النشطون" value={stats?.active_members ?? stats?.cards_by_member?.length ?? 0} color="green"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {stats?.cards_by_member?.length > 0 && (
            <ChartCard title="البطاقات بحسب الباحث">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.cards_by_member} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="arid_researcher_id" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {stats?.cards_by_label?.length > 0 && (
            <ChartCard title="البطاقات بحسب الملصق">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.cards_by_label} dataKey="count" nameKey="name" outerRadius={80} innerRadius={40}>
                    {stats.cards_by_label.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {stats?.activity_by_day?.length > 0 && (
            <ChartCard title="النشاط اليومي (30 يوم)" fullWidth>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.activity_by_day} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: 'red' | 'blue' | 'green' }) {
  const styles = {
    red:   'border-red-500/20 text-red-400 bg-red-500/[0.06]',
    blue:  'border-blue-500/20 text-blue-400 bg-blue-500/[0.06]',
    green: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.06]',
  };
  return (
    <div className={`rounded-2xl border p-5 ${styles[color]} backdrop-blur-sm`}>
      <div className="opacity-70 mb-3">{icon}</div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, children, fullWidth }: { title: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-sm ${fullWidth ? 'md:col-span-2' : ''}`}>
      <h2 className="text-sm font-semibold text-slate-300 mb-4">{title}</h2>
      {children}
    </div>
  );
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPageClient() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['board-dashboard', id],
    queryFn: () => boardsApi.dashboard(id),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">جارٍ التحميل...</div>;
  }

  const stats = data as any;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">إحصائيات اللوحة</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="البطاقات المتأخرة" value={stats?.overdue_count ?? 0} icon="⚠️" color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats?.cards_by_member?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">البطاقات بحسب الباحث</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.cards_by_member}>
                <XAxis dataKey="arid_researcher_id" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.cards_by_label?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">البطاقات بحسب الملصق</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.cards_by_label} dataKey="count" nameKey="name" outerRadius={80}>
                  {stats.cards_by_label.map((_: unknown, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.activity_by_day?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm md:col-span-2">
            <h2 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">النشاط اليومي (30 يوم)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.activity_by_day}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors = {
    red: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600 dark:text-green-400',
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color as keyof typeof colors] ?? colors.blue}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-75 mt-1">{label}</div>
    </div>
  );
}
