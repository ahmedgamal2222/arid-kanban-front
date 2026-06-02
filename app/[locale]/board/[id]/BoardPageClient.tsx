'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { boardsApi } from '@/lib/api';
import BoardCanvas from '@/components/Board/BoardCanvas';
import BoardHeader from '@/components/Board/BoardHeader';
import type { BoardFull } from '@/lib/types';

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
