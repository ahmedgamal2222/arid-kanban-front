'use client';

import { useState } from 'react';
import { boardsApi } from '@/lib/api';
import type { BoardFull } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Props {
  board: BoardFull;
}

export default function BoardHeader({ board }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const qc = useQueryClient();

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
    <header className="h-14 flex items-center gap-3 px-4 bg-black/20 text-white">
      {/* اسم اللوحة */}
      <h1 className="font-bold text-base truncate max-w-xs">{board.name}</h1>

      {/* الرؤية */}
      <span className="text-xs bg-white/20 rounded px-2 py-0.5 shrink-0">
        {board.visibility === 'private' ? '🔒 خاص' : board.visibility === 'public' ? '🌍 عام' : '🏢 المساحة'}
      </span>

      {/* نجمة */}
      <button
        onClick={() => starMutation.mutate()}
        className="text-lg hover:scale-110 transition"
        title={board.is_starred ? 'إلغاء النجمة' : 'وضع نجمة'}
      >
        {board.is_starred ? '⭐' : '☆'}
      </button>

      <div className="flex-1" />

      {/* البحث */}
      <div className="relative">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition flex items-center gap-1.5"
        >
          🔍 بحث
        </button>
        {searchOpen && (
          <div className="absolute top-10 end-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-80 p-3 z-50">
            <input
              autoFocus
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث في البطاقات..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 mb-2"
            />
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {(searchResults as any[]).map(r => (
                  <div
                    key={r.id}
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: `<span class="text-sm text-gray-800 dark:text-gray-200">${r.title_snippet ?? r.title}</span>` }}
                  />
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">لا توجد نتائج</p>
            )}
          </div>
        )}
      </div>

      {/* روابط سريعة */}
      <Link
        href={`/board/${board.id}/timeline`}
        className="text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition"
      >
        📅 التسلسل
      </Link>
      <Link
        href={`/board/${board.id}/dashboard`}
        className="text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition"
      >
        📊 إحصائيات
      </Link>
    </header>
  );
}
