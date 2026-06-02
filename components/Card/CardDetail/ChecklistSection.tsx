'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '@/lib/api';
import type { ChecklistFull } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props {
  checklist: ChecklistFull;
  cardId: string;
  boardId: string;
}

export default function ChecklistSection({ checklist, cardId, boardId }: Props) {
  const [addingItem, setAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const qc = useQueryClient();

  const progress = checklist.total > 0
    ? Math.round((checklist.completed / checklist.total) * 100)
    : 0;

  const addItemMutation = useMutation({
    mutationFn: () => checklistsApi.createItem(checklist.id, { title: newItemTitle.trim() }),
    onSuccess: () => {
      setNewItemTitle('');
      setAddingItem(false);
      qc.invalidateQueries({ queryKey: ['card', cardId] });
    },
    onError: () => toast.error('فشل إضافة العنصر'),
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ itemId, complete }: { itemId: string; complete: boolean }) =>
      checklistsApi.updateItem(itemId, { is_complete: complete }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', cardId] }),
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: () => checklistsApi.delete(checklist.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', cardId] }),
  });

  const visibleItems = hideCompleted
    ? checklist.items.filter(i => !i.is_complete)
    : checklist.items;

  return (
    <div className="mb-5">
      {/* رأس قائمة التحقق */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          ☑ {checklist.title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            {hideCompleted ? 'إظهار المكتملة' : 'إخفاء المكتملة'}
          </button>
          <button
            onClick={() => deleteChecklistMutation.mutate()}
            className="text-xs text-red-400 hover:text-red-600 transition"
          >
            حذف
          </button>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 w-8 text-end">{progress}%</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* العناصر */}
      <div className="space-y-1">
        {visibleItems.map(item => (
          <label
            key={item.id}
            className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={!!item.is_complete}
              onChange={e => toggleItemMutation.mutate({ itemId: item.id, complete: e.target.checked })}
              className="mt-0.5 accent-blue-600 cursor-pointer"
            />
            <span className={`text-sm flex-1 ${item.is_complete ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {item.title}
            </span>
          </label>
        ))}
      </div>

      {/* إضافة عنصر */}
      {addingItem ? (
        <div className="mt-2">
          <input
            autoFocus
            value={newItemTitle}
            onChange={e => setNewItemTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newItemTitle.trim()) addItemMutation.mutate();
              if (e.key === 'Escape') setAddingItem(false);
            }}
            placeholder="أضف عنصراً..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
          />
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={() => addItemMutation.mutate()}
              disabled={!newItemTitle.trim() || addItemMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg"
            >
              إضافة
            </button>
            <button onClick={() => setAddingItem(false)} className="text-gray-500 text-xs">إلغاء</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingItem(true)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1 transition"
        >
          + إضافة عنصر
        </button>
      )}
    </div>
  );
}
