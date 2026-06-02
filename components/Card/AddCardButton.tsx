'use client';

import { useState } from 'react';
import { cardsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  listId: string;
  boardId: string;
}

export default function AddCardButton({ listId, boardId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await cardsApi.create(listId, { title: title.trim() });
      qc.invalidateQueries({ queryKey: ['board', boardId] });
      setTitle('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-start text-[12px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded-xl px-3 py-2 transition-all flex items-center gap-2"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        إضافة بطاقة
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        rows={2}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="عنوان البطاقة..."
        className="w-full rounded-xl border border-white/10 focus:border-blue-500/50 bg-[#1e2d40] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading || !title.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          إضافة
        </button>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm px-2 transition-colors">✕</button>
      </div>
    </div>
  );
}
