'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
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

    // Navigate to workspace or board based on notification type
    if (n.type === 'workspace_invited' && !n.board_id) {
      router.push(`/${locale}/boards`);
    } else if (n.board_id) {
      router.push(`/${locale}/board/${n.board_id}`);
    } else {
      router.push(`/${locale}/boards`);
    }
  }

  // Calculate dropdown position from button
  const calcPosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right - 4),
    });
  }, []);

  // Mark all as read when dropdown opens
  function handleOpenToggle() {
    calcPosition();
    setOpen(v => {
      const next = !v;
      if (next && unread > 0) {
        setTimeout(() => markAll.mutate(), 1500);
      }
      return next;
    });
  }

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const update = () => calcPosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, calcPosition]);

  const dropdown = open && typeof window !== 'undefined' ? createPortal(
    <div
      dir="rtl"
      style={{ position: 'fixed', top: dropdownStyle.top, right: dropdownStyle.right, zIndex: 99999, width: 340 }}
    >
      <div className="bg-[#0c1526] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 100px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="text-sm font-bold text-white">الإشعارات</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unread > 99 ? '99+' : unread}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={e => { e.stopPropagation(); markAll.mutate(); }}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                تحديد الكل كمقروء
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="text-slate-600 hover:text-slate-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">لا توجد إشعارات</p>
              <p className="text-slate-600 text-xs mt-1">ستظهر هنا عند إضافتك للوحات أو البطاقات</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {notifications.map(n => (
                <button key={n.id} onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors text-start group ${
                    !n.is_read ? 'bg-blue-500/[0.06]' : ''
                  }`}>
                  {/* Type icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base mt-0.5 ${
                    !n.is_read ? 'bg-blue-600/20 ring-1 ring-blue-500/30' : 'bg-white/[0.05]'
                  }`}>
                    {TYPE_ICON[n.type] ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed break-words ${
                      !n.is_read ? 'text-slate-100 font-medium' : 'text-slate-400'
                    } group-hover:text-slate-200 transition-colors`}>
                      {n.message}
                    </p>
                    {(n.board_name || n.card_title) && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {n.board_name && (
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md truncate max-w-[140px]">🏢 {n.board_name}</span>
                        )}
                        {n.card_title && (
                          <span className="text-[10px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded-md truncate max-w-[140px]">📋 {n.card_title}</span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Unread indicator */}
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 ring-2 ring-blue-500/30" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={ref} className="relative" dir="rtl">
      <button
        ref={btnRef}
        onClick={handleOpenToggle}
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

      {dropdown}
    </div>
  );
}
