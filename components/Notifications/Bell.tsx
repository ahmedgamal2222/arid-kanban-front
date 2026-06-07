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
  workspace_invited:  '👥',
  card_moved:         '↗️',
  checklist_assigned: '✅',
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return Math.floor(diff / 60) + ' د';
  if (diff < 86400) return Math.floor(diff / 3600) + ' س';
  return Math.floor(diff / 86400) + ' ي';
}

interface DropProps {
  notifications: Notification[];
  unread: number;
  pos: { top: number; right: number };
  onClose: () => void;
  onMarkAll: () => void;
  onItem: (n: Notification) => void;
}

function NotifDropdown({ notifications, unread, pos, onClose, onMarkAll, onItem }: DropProps) {
  return (
    <div className="fixed inset-0" style={{ zIndex: 99998 }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="fixed" style={{ top: pos.top, right: pos.right, zIndex: 99999, width: 340, maxWidth: 'calc(100vw - 16px)' }}>
        <div className="bg-[#0c1526] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/70 flex flex-col" style={{ maxHeight: 'min(520px, calc(100vh - 80px))' }}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] bg-white/[0.02] flex-shrink-0 rounded-t-2xl" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">الإشعارات</span>
              {unread > 0 && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unread > 99 ? '99+' : unread}</span>}
            </div>
            <div className="flex items-center gap-3">
              {unread > 0 && <button onClick={e => { e.stopPropagation(); onMarkAll(); }} className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">تحديد الكل كمقروء</button>}
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-base leading-none">✕</button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1" dir="rtl">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <p className="text-slate-400 text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {notifications.map(n => (
                  <button key={n.id} onClick={() => onItem(n)} className={'w-full flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-start group' + (!n.is_read ? ' bg-blue-500/[0.06]' : '')}>
                    <div className={'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm mt-0.5' + (!n.is_read ? ' bg-blue-600/20' : ' bg-white/[0.05]')}>
                      {TYPE_ICON[n.type] ?? '🔔'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={'text-xs leading-relaxed break-words' + (!n.is_read ? ' text-slate-100 font-medium' : ' text-slate-400')}>{n.message}</p>
                      {(n.board_name || n.card_title) && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {n.board_name && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md">{n.board_name}</span>}
                          {n.card_title && <span className="text-[10px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded-md">{n.card_title}</span>}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const notifications = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;

  const markRead = useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const markAll  = useMutation({ mutationFn: () => notificationsApi.markAllRead(), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });

  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const w = 340;
    const r = Math.max(8, Math.min(window.innerWidth - rect.right, window.innerWidth - w - 8));
    setPos({ top: rect.bottom + 8, right: r });
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = () => calcPos();
    window.addEventListener('scroll', h, true);
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h, true); window.removeEventListener('resize', h); };
  }, [open, calcPos]);

  function handleOpen() {
    calcPos();
    setOpen(v => { if (!v && unread > 0) setTimeout(() => markAll.mutate(), 1500); return !v; });
  }

  function handleItem(n: Notification) {
    if (!n.is_read) markRead.mutate(n.id);
    setOpen(false);
    const base = '/' + locale;
    if (n.type === 'workspace_invited' && !n.board_id) router.push(base + '/boards');
    else if (n.board_id) router.push(base + '/board/' + n.board_id);
    else router.push(base + '/boards');
  }

  return (
    <div className="relative">
      <button ref={btnRef} onClick={handleOpen} title="الإشعارات"
        className={'relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ' + (open ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.07]')}>
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
      {open && typeof window !== 'undefined' && createPortal(
        <NotifDropdown notifications={notifications} unread={unread} pos={pos} onClose={() => setOpen(false)} onMarkAll={() => markAll.mutate()} onItem={handleItem} />,
        document.body
      )}
    </div>
  );
}