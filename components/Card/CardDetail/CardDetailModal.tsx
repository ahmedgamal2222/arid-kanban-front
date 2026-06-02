'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi, commentsApi, checklistsApi } from '@/lib/api';
import type { CardDetail } from '@/lib/types';
import CardDueBadge from '../CardDueBadge';
import CommentSection from './CommentSection';
import ChecklistSection from './ChecklistSection';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  cardId: string;
  boardId: string;
  onClose: () => void;
}

export default function CardDetailModal({ cardId, boardId, onClose }: Props) {
  const qc = useQueryClient();
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.fetch(cardId),
  });

  const card = data?.card;

  const updateMutation = useMutation({
    mutationFn: (fields: Record<string, unknown>) => cardsApi.update(cardId, fields),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['card', cardId] });
      qc.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: () => toast.error('فشل التحديث'),
  });

  if (isLoading || !card) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* الغلاف */}
        {card.cover_color && (
          <div className="h-20 rounded-t-2xl" style={{ background: card.cover_color }} />
        )}

        <div className="p-6">
          {/* العنوان */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl mt-0.5">📋</span>
            {editTitle ? (
              <input
                autoFocus
                className="flex-1 text-xl font-semibold border-b-2 border-blue-500 outline-none bg-transparent dark:text-white"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== card.title) {
                    updateMutation.mutate({ title: title.trim() });
                  }
                  setEditTitle(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') { setTitle(card.title); setEditTitle(false); }
                }}
              />
            ) : (
              <h2
                className="flex-1 text-xl font-semibold cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 dark:text-white"
                onClick={() => { setTitle(card.title); setEditTitle(true); }}
              >
                {card.title}
              </h2>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl shrink-0 leading-none">✕</button>
          </div>

          {/* الملصقات */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {card.labels.map(l => (
                <span
                  key={l.id}
                  className="text-xs text-white font-medium px-3 py-1 rounded-full"
                  style={{ background: l.color }}
                >
                  {l.name ?? ''}
                </span>
              ))}
            </div>
          )}

          {/* موعد الاستحقاق */}
          {card.due_date && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">الاستحقاق:</span>
              <CardDueBadge dueDate={card.due_date} complete={!!card.due_complete} />
              <button
                onClick={() => updateMutation.mutate({ due_complete: card.due_complete ? 0 : 1 })}
                className={`text-xs px-2 py-0.5 rounded border transition ${
                  card.due_complete
                    ? 'border-green-400 text-green-600 dark:text-green-400'
                    : 'border-gray-300 text-gray-500 hover:border-green-400'
                }`}
              >
                {card.due_complete ? '✓ مكتملة' : 'وضّع علامة مكتملة'}
              </button>
            </div>
          )}

          {/* الوصف */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              ☰ الوصف
            </h3>
            <DescriptionEditor
              value={card.description ?? ''}
              onSave={desc => updateMutation.mutate({ description: desc })}
            />
          </div>

          {/* قوائم التحقق */}
          {card.checklists.map(cl => (
            <ChecklistSection key={cl.id} checklist={cl} cardId={cardId} boardId={boardId} />
          ))}

          {/* التعليقات */}
          <CommentSection comments={card.comments} cardId={cardId} boardId={boardId} />
        </div>
      </div>
    </div>
  );
}

// ── محرر الوصف ──
function DescriptionEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  if (!editing) {
    return (
      <div
        className="min-h-10 text-sm text-gray-700 dark:text-gray-300 cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 whitespace-pre-wrap"
        onClick={() => { setText(value); setEditing(true); }}
      >
        {value || <span className="text-gray-400">أضف وصفاً أكثر تفصيلاً...</span>}
      </div>
    );
  }

  return (
    <div>
      <textarea
        autoFocus
        rows={5}
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full rounded-lg border border-blue-400 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none resize-y dark:text-white"
        placeholder="أضف وصفاً أكثر تفصيلاً..."
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => { onSave(text); setEditing(false); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-lg transition"
        >
          حفظ
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-gray-500 hover:text-gray-700 text-xs px-3"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
