'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { boardsApi } from '@/lib/api';
import Link from 'next/link';
import { useMemo } from 'react';

// ── helpers ──
function msToDate(ms: number | null) {
  if (!ms) return null;
  return new Date(ms * 1000);
}

function fmt(d: Date) {
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}

const LIST_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

// ── Loading skeleton ──
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-900 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-52 bg-white/5 rounded-xl" />
        <div className="h-4 w-72 bg-white/5 rounded-lg" />
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-40 h-5 bg-white/5 rounded" style={{ opacity: 1 - i * 0.12 }} />
              <div className="flex-1 h-8 bg-white/5 rounded-full" style={{ width: `${30 + i * 12}%`, opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimelineCard {
  id: string;
  title: string;
  start_date: number | null;
  due_date: number | null;
  due_complete: number;
  list_id: string;
  list_name: string;
  assignees: string | null;
}

export default function TimelinePageClient() {
  const pathname = usePathname();
  const id = pathname.split('/board/')[1]?.replace(/\/$/, '').split('/')[0] ?? '';

  // Extract locale from pathname  (/ar/board/... → ar)
  const locale = pathname.split('/')[1] ?? 'ar';

  const { data, isLoading, error } = useQuery({
    queryKey: ['board-timeline', id],
    queryFn: () => boardsApi.timeline(id),
    enabled: !!id,
  });

  const timeline = data as { cards: TimelineCard[]; dependencies: unknown[] } | undefined;

  // Compute Gantt bounds
  const { minDate, totalDays, listColorMap } = useMemo(() => {
    if (!timeline?.cards?.length) return { minDate: new Date(), totalDays: 30, listColorMap: {} };

    const dates: Date[] = [];
    for (const c of timeline.cards) {
      if (c.start_date) dates.push(msToDate(c.start_date)!);
      if (c.due_date) dates.push(msToDate(c.due_date)!);
    }

    const minMs = Math.min(...dates.map(d => d.getTime()));
    const maxMs = Math.max(...dates.map(d => d.getTime()));
    const minDate = new Date(minMs - 86400000 * 2); // 2-day padding left
    const maxDate = new Date(maxMs + 86400000 * 3); // 3-day padding right
    const totalDays = daysBetween(minDate, maxDate);

    const listNames = [...new Set(timeline.cards.map(c => c.list_name))];
    const listColorMap: Record<string, string> = {};
    listNames.forEach((name, i) => { listColorMap[name] = LIST_COLORS[i % LIST_COLORS.length]!; });

    return { minDate, totalDays, listColorMap };
  }, [timeline]);

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-950 to-[#0d1b3e] gap-4" dir="rtl">
        <p className="text-white font-semibold text-lg">تعذّر تحميل التسلسل الزمني</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-xl transition-colors">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const cards = timeline?.cards ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-900" dir="rtl">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-white/[0.07] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href={`/${locale}/board/${id}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            رجوع للوحة
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-white font-bold text-lg">📅 التسلسل الزمني</h1>
          <div className="ms-auto flex gap-2">
            <Link
              href={`/${locale}/board/${id}/dashboard`}
              className="text-slate-400 hover:text-white text-sm bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-all"
            >
              📊 الإحصائيات
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {cards.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.25" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">لا توجد بطاقات بتواريخ</h2>
            <p className="text-slate-500 text-sm max-w-sm">أضف تاريخ بداية أو استحقاق لبطاقاتك لتظهر هنا في التسلسل الزمني</p>
          </div>
        ) : (
          /* ── Gantt Chart ── */
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(listColorMap).map(([name, color]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400 text-xs">{name}</span>
                </div>
              ))}
            </div>

            {/* Month labels */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              {/* Timeline header */}
              <div className="flex border-b border-white/[0.07]">
                <div className="w-52 shrink-0 px-4 py-2 text-xs text-slate-500 border-e border-white/[0.07]">البطاقة</div>
                <div className="flex-1 relative h-8">
                  {/* Day markers */}
                  {Array.from({ length: Math.min(totalDays, 60) }).map((_, i) => {
                    const d = new Date(minDate.getTime() + i * 86400000);
                    const show = d.getDate() === 1 || i === 0 || (totalDays <= 14 && i % 2 === 0) || (totalDays <= 30 && i % 5 === 0) || (totalDays > 30 && i % 10 === 0);
                    if (!show) return null;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 flex items-center"
                        style={{ left: `${(i / totalDays) * 100}%` }}
                      >
                        <div className="w-px h-full bg-white/[0.05]" />
                        <span className="text-[10px] text-slate-600 ps-1 whitespace-nowrap">{fmt(d)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rows */}
              {cards.map((card, idx) => {
                const start = msToDate(card.start_date) ?? msToDate(card.due_date)!;
                const end = msToDate(card.due_date) ?? msToDate(card.start_date)!;
                const startOffset = Math.max(0, daysBetween(minDate, start));
                const duration = Math.max(1, daysBetween(start, end));
                const left = (startOffset / totalDays) * 100;
                const width = Math.max(2, (duration / totalDays) * 100);
                const color = listColorMap[card.list_name] ?? '#3b82f6';
                const isComplete = card.due_complete === 1;

                return (
                  <div
                    key={card.id}
                    className="flex items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Card title */}
                    <div className="w-52 shrink-0 px-4 py-3 border-e border-white/[0.07]">
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{card.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{card.list_name}</p>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 relative h-12 px-1">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-7 rounded-full flex items-center px-3 cursor-pointer transition-all hover:brightness-110"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: '28px',
                          background: isComplete ? '#10b981' : color,
                          opacity: isComplete ? 0.8 : 1,
                          boxShadow: `0 2px 8px ${color}40`,
                        }}
                        title={`${card.title} • ${card.start_date ? fmt(msToDate(card.start_date)!) : '؟'} → ${card.due_date ? fmt(msToDate(card.due_date)!) : '؟'}`}
                      >
                        {width > 8 && (
                          <span className="text-[11px] text-white font-medium truncate select-none">
                            {isComplete ? '✓ ' : ''}{card.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="w-36 shrink-0 px-3 text-right hidden md:block">
                      <p className="text-xs text-slate-500">
                        {card.start_date ? fmt(msToDate(card.start_date)!) : '—'}
                        {' → '}
                        {card.due_date ? fmt(msToDate(card.due_date)!) : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-slate-600 text-xs text-center">{cards.length} بطاقة بتواريخ مجدولة</p>
          </div>
        )}
      </div>
    </div>
  );
}
