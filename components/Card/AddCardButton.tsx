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
        className="w-full text-start text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg px-2 py-1.5 transition"
      >
        + إضافة بطاقة
      </button>
    );
  }

  return (
    <div>
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
        className="w-full rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 px-3 py-2 text-sm mb-1.5 outline-none focus:border-blue-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading || !title.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition"
        >
          إضافة
        </button>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm px-2">✕</button>
      </div>
    </div>
  );
}
