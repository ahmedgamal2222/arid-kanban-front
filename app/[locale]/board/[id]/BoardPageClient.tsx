'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { boardsApi } from '@/lib/api';
import BoardCanvas from '@/components/Board/BoardCanvas';
import BoardHeader from '@/components/Board/BoardHeader';
import type { BoardFull } from '@/lib/types';

function BoardSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-[#1d2d44]">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-4 w-px bg-white/10 mx-1" />
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="h-7 w-16 bg-white/10 rounded-lg animate-pulse" />)}
        </div>
        <div className="ms-auto flex gap-2">
          {[1,2].map(i => <div key={i} className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />)}
        </div>
      </div>
      {/* Lists skeleton */}
      <div className="flex gap-4 p-5 overflow-x-auto flex-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-shrink-0 w-64 space-y-2">
            <div className="h-8 bg-white/10 rounded-xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            {Array.from({ length: i === 1 ? 3 : i === 2 ? 5 : i === 3 ? 2 : 4 }).map((_, j) => (
              <div key={j} className="h-20 bg-white/[0.07] rounded-xl animate-pulse" style={{ animationDelay: `${(i * 4 + j) * 60}ms` }} />
            ))}
            <div className="h-8 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BoardPageClient() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardsApi.fetch(id),
    enabled: !!id,
  });

  if (isLoading) return <BoardSkeleton />;

  if (error || !data?.board) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-950 to-[#0d1b3e] gap-4" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">تعذّر تحميل اللوحة</p>
        <p className="text-slate-400 text-sm">تحقق من اتصالك وأعد المحاولة</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-xl transition-colors">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const board = data.board as BoardFull;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: board.background ?? '#1d2d44' }}>
      <BoardHeader board={board} />
      <BoardCanvas board={board} />
    </div>
  );
}

export default function BoardPageClient() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardsApi.fetch(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.board) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        حدث خطأ في تحميل اللوحة
      </div>
    );
  }

  const board = data.board as BoardFull;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: board.background ?? '#1d2d44' }}
    >
      <BoardHeader board={board} />
      <BoardCanvas board={board} />
    </div>
  );
}
