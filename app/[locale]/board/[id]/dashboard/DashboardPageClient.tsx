'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { boardsApi } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

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
