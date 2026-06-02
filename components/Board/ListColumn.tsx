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
      className={`
        bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col shrink-0
        min-w-[260px] max-w-[260px] max-h-full
        transition-shadow ${isOver ? 'ring-2 ring-blue-400' : ''}
      `}
    >
      {/* رأس القائمة */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
          {list.name}
        </h3>
        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 shrink-0">
          {list.cards.length}
        </span>
      </div>

      {/* البطاقات */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
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
