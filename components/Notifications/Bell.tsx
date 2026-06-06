'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type Notification } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

const TYPE_ICON: Record<string, string> = {
  card_assigned:      '👤',
  card_unassigned:    '👤',
  card_due:           '📅',
  comment_mention:    '💬',
  board_invited:      '🏢',
  card_moved:         '↗️',
  checklist_assigned: '✅',
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)     return 'الآن';
  if (diff < 3600)   return `${Math.floor(diff / 60)} د`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000, // poll every 30s
    staleTime: 15_000,
  });

  const notifications = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function handleClick(n: Notification) {
    if (!n.is_read) markRead.mutate(n.id);
    setOpen(false);
    if (n.card_id && n.board_id) {
      router.push(`/${locale}/board/${n.board_id}`);
    }
  }

  return (
    <div ref={ref} className="relative" dir="rtl">
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
          open
            ? 'bg-blue-600/20 text-blue-400'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
        }`}
        title="الإشعارات"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-[#0d1425] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <h3 className="text-sm font-bold text-white">الإشعارات</h3>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p className="text-slate-600 text-sm mt-3">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-start ${
                    !n.is_read ? 'bg-blue-500/[0.06]' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base ${
                    !n.is_read ? 'bg-blue-500/20' : 'bg-white/[0.06]'
                  }`}>
                    {TYPE_ICON[n.type] ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-slate-200' : 'text-slate-400'}`}>
                      {n.message}
                    </p>
                    {n.card_title && (
                      <p className="text-[10px] text-slate-600 mt-0.5 truncate">📋 {n.card_title}</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
