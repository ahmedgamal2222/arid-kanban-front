'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { listsApi } from '@/lib/api';

interface Props {
  boardId: string;
  onCreated: (list: unknown) => void;
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
      onCreated((res as any).list);
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
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-3 min-w-[260px] transition shrink-0"
      >
        <span className="text-lg font-light">+</span>
        <span className="text-sm font-medium">{t('addList')}</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 min-w-[260px] shrink-0">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
        placeholder={t('addList')}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm mb-2 outline-none focus:border-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading || !name.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition"
        >
          {t('addList')}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm px-3"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
