'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { listsApi } from '@/lib/api';
import type { List } from '@/lib/types';

interface Props {
  boardId: string;
  onCreated: (list: List) => void;
}

export default function AddListButton({ boardId, onCreated }: Props) {
  const t = useTranslations('board');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await listsApi.create(boardId, { name: name.trim() });
      onCreated((res as { list: List }).list);
      setName('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/[0.16] border border-white/[0.12] hover:border-white/20 text-white/80 hover:text-white rounded-2xl px-4 py-3 min-w-[272px] transition-all shrink-0"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        <span className="text-sm font-medium">{t('addList')}</span>
      </button>
    );
  }

  return (
    <div className="bg-[#162032] border border-white/[0.08] rounded-2xl p-3 min-w-[272px] shrink-0 space-y-2">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
        placeholder="اسم القائمة..."
        className="w-full rounded-xl border border-white/10 focus:border-blue-500/50 bg-[#1e2d40] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading || !name.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {t('addList')}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-500 hover:text-slate-300 text-sm px-3 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
