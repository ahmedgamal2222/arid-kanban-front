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
    opacity: isDragging ? 0.35 : 1,
  };

  const checkDone =
    card.checklist_progress.total > 0 &&
    card.checklist_progress.completed === card.checklist_progress.total;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragOverlay && setOpen(true)}
        className={[
          'group relative rounded-xl cursor-pointer select-none',
          'bg-[#1e2d40] hover:bg-[#243450]',
          'border border-white/[0.08] hover:border-white/[0.18]',
          'shadow-sm hover:shadow-lg hover:shadow-black/30',
          'transition-all duration-150',
          isDragOverlay ? 'rotate-2 shadow-2xl shadow-black/50 scale-[1.03]' : '',
        ].join(' ')}
      >
        {card.cover_color && (
          <div
            className="h-9 rounded-t-xl w-full"
            style={{ background: card.cover_color }}
          />
        )}

        <div className={card.cover_color ? 'px-3 pt-2 pb-3' : 'p-3'}>
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map(label => (
                <span
                  key={label.id}
                  className="h-[6px] rounded-full inline-block min-w-[28px]"
                  style={{ background: label.color }}
                  title={label.name ?? undefined}
                />
              ))}
            </div>
          )}

          <p className="text-[13px] font-medium text-slate-100 leading-snug break-words">
            {card.title}
          </p>

          {(card.due_date || card.checklist_progress.total > 0 || card.comments_count > 0 || card.attachments_count > 0 || card.members.length > 0) && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {card.due_date && (
                <CardDueBadge dueDate={card.due_date} complete={!!card.due_complete} />
              )}

              {card.checklist_progress.total > 0 && (
                <span className={`text-[11px] flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${
                  checkDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.07] text-slate-400 border border-white/[0.06]'
                }`}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="10" height="10" rx="2"/>{checkDone && <path d="M3.5 6l2 2 3-3"/>}
                  </svg>
                  {card.checklist_progress.completed}/{card.checklist_progress.total}
                </span>
              )}

              {card.comments_count > 0 && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  {card.comments_count}
                </span>
              )}

              {card.attachments_count > 0 && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  {card.attachments_count}
                </span>
              )}

              {card.members.length > 0 && (
                <div className="flex -space-x-1 ms-auto">
                  {card.members.slice(0, 3).map(id => (
                    <div
                      key={id}
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[9px] flex items-center justify-center border border-[#1e2d40] font-bold"
                      title={id}
                    >
                      {id.slice(0, 1).toUpperCase()}
                    </div>
                  ))}
                  {card.members.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-white/10 text-slate-400 text-[9px] flex items-center justify-center border border-[#1e2d40]">
                      +{card.members.length - 3}
                    </div>
                  )}
                </div>
              )}
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