'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardSummary } from '@/lib/types';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import CardDueBadge from './CardDueBadge';

const CardDetailModal = dynamic(() => import('./CardDetail/CardDetailModal'), { ssr: false });

interface Props {
  card: CardSummary;
  boardId: string;
  listId?: string;
  isDragOverlay?: boolean;
}

export default function CardItem({ card, boardId, listId, isDragOverlay }: Props) {
  const [open, setOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card, listId },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragOverlay && setOpen(true)}
        className={`
          bg-white dark:bg-gray-700 rounded-lg shadow-sm
          border border-gray-200 dark:border-gray-600
          p-3 cursor-pointer hover:shadow-md transition-shadow select-none
          ${isDragOverlay ? 'rotate-2 shadow-xl' : ''}
        `}
      >
        {/* غلاف ملون */}
        {card.cover_color && (
          <div
            className="h-8 rounded-t-md -mx-3 -mt-3 mb-2"
            style={{ background: card.cover_color }}
          />
        )}

        {/* الملصقات */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map(label => (
              <span
                key={label.id}
                className="h-2 w-8 rounded-full inline-block"
                style={{ background: label.color }}
                title={label.name ?? undefined}
              />
            ))}
          </div>
        )}

        {/* العنوان */}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
          {card.title}
        </p>

        {/* الوسوم السفلية */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {card.due_date && (
            <CardDueBadge dueDate={card.due_date} complete={!!card.due_complete} />
          )}
          {card.checklist_progress.total > 0 && (
            <span className={`text-xs flex items-center gap-1 rounded px-1.5 py-0.5 ${
              card.checklist_progress.completed === card.checklist_progress.total
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-300'
            }`}>
              ☑ {card.checklist_progress.completed}/{card.checklist_progress.total}
            </span>
          )}
          {card.comments_count > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              💬 {card.comments_count}
            </span>
          )}
          {card.attachments_count > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              📎 {card.attachments_count}
            </span>
          )}
          {card.members.length > 0 && (
            <div className="flex -space-x-1 ms-auto">
              {card.members.slice(0, 3).map(id => (
                <div
                  key={id}
                  className="w-5 h-5 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center border border-white dark:border-gray-700 font-semibold"
                  title={id}
                >
                  {id.slice(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <CardDetailModal cardId={card.id} boardId={boardId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
