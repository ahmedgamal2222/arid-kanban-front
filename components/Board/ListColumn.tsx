'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import type { ListFull } from '@/lib/types';
import CardItem from '@/components/Card/CardItem';
import AddCardButton from '@/components/Card/AddCardButton';

interface Props {
  list: ListFull;
  boardId: string;
}

export default function ListColumn({ list, boardId }: Props) {
  const t = useTranslations('board');
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', listId: list.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col shrink-0 rounded-2xl',
        'min-w-[272px] max-w-[272px] max-h-full',
        'bg-[#162032] border border-white/[0.08]',
        'transition-all duration-150',
        isOver ? 'ring-2 ring-blue-500/60 bg-[#1a2840]' : '',
      ].join(' ')}
    >
      {/* رأس القائمة */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h3 className="font-semibold text-[13px] text-slate-200 truncate">
          {list.name}
        </h3>
        <span className="text-[11px] text-slate-500 bg-white/[0.07] rounded-full px-2 py-0.5 shrink-0 font-medium">
          {list.cards.length}
        </span>
      </div>

      {/* البطاقات */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <SortableContext
          items={list.cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map(card => (
            <CardItem key={card.id} card={card} boardId={boardId} listId={list.id} />
          ))}
        </SortableContext>
      </div>

      {/* زر إضافة بطاقة */}
      <div className="px-2 pb-2">
        <AddCardButton listId={list.id} boardId={boardId} />
      </div>
    </div>
  );
}
