'use client';

import { useState } from 'react';
import { boardsApi } from '@/lib/api';
import type { BoardFull } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  board: BoardFull;
}

export default function BoardHeader({ board }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const qc = useQueryClient();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const starMutation = useMutation({
    mutationFn: () => boardsApi.update(board.id, { is_starred: board.is_starred ? 0 : 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', board.id] }),
  });

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await boardsApi.search(board.id, q);
    setSearchResults(res.results);
  };

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-black/25 backdrop-blur-sm border-b border-white/10 text-white" dir="rtl">
      {/* رجوع للوحات */}
      <Link
        href={`/${locale}/boards`}
        className="text-white/60 hover:text-white transition-colors shrink-0"
        title="مساحات العمل"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </Link>

      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* اسم اللوحة */}
      <h1 className="font-bold text-base truncate max-w-[180px] sm:max-w-xs">{board.name}</h1>

      {/* الرؤية */}
      <span className="hidden sm:inline-flex text-xs bg-white/15 rounded-full px-2.5 py-0.5 shrink-0 items-center gap-1">
        {board.visibility === 'private' ? (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C8.7 1 6 3.7 6 7v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V11a2 2 0 00-2-2h-2V7c0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4v2H8V7c0-2.2 1.8-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg> خاص</>
        ) : board.visibility === 'public' ? (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> عام</>
        ) : (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg> المساحة</>
        )}
      </span>

      {/* نجمة */}
      <button
        onClick={() => starMutation.mutate()}
        className={`shrink-0 text-lg hover:scale-110 transition-transform ${board.is_starred ? 'text-yellow-400' : 'text-white/40 hover:text-white/80'}`}
        title={board.is_starred ? 'إلغاء النجمة' : 'وضع نجمة'}
      >
        {board.is_starred ? '★' : '☆'}
      </button>

      <div className="flex-1" />

      {/* البحث */}
      <div className="relative">
        <button
          onClick={() => setSearchOpen(o => !o)}
          className="text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="hidden sm:inline">بحث</span>
        </button>
        {searchOpen && (
          <div className="absolute top-11 end-0 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-80 p-3 z-50">
            <input
              autoFocus
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث في البطاقات..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] focus:border-blue-500/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none mb-2"
            />
            {searchResults.length > 0 && (
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {(searchResults as any[]).map(r => (
                  <div
                    key={r.id}
                    className="px-3 py-2 hover:bg-white/[0.06] rounded-xl cursor-pointer text-sm text-slate-300 hover:text-white transition-colors truncate"
                  >
                    {r.title ?? r.id}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">لا توجد نتائج</p>
            )}
          </div>
        )}
      </div>

      {/* روابط سريعة */}
      <Link
        href={`/${locale}/board/${board.id}/timeline`}
        className="hidden sm:flex text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        التسلسل
      </Link>
      <Link
        href={`/${locale}/board/${board.id}/dashboard`}
        className="hidden sm:flex text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        إحصائيات
      </Link>
    </header>
  );
}
