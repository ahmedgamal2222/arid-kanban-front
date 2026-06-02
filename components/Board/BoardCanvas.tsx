'use client';

import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { cardsApi, listsApi } from '@/lib/api';
import type { BoardFull, CardSummary, ListFull } from '@/lib/types';
import ListColumn from './ListColumn';
import CardItem from '@/components/Card/CardItem';
import AddListButton from './AddListButton';

interface Props {
  board: BoardFull;
}

export default function BoardCanvas({ board }: Props) {
  const [lists, setLists] = useState<ListFull[]>(board.lists);
  const [activeCard, setActiveCard] = useState<CardSummary | null>(null);
  const qc = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card as CardSummary);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== 'card') return;

    const fromListId = active.data.current?.listId as string;
    const toListId = overType === 'list' ? overId : (over.data.current?.listId as string);

    if (!fromListId || !toListId || fromListId === toListId) return;

    setLists(prev => {
      const fromList = prev.find(l => l.id === fromListId);
      const toList   = prev.find(l => l.id === toListId);
      if (!fromList || !toList) return prev;

      const card = fromList.cards.find(c => c.id === activeId);
      if (!card) return prev;

      return prev.map(l => {
        if (l.id === fromListId) return { ...l, cards: l.cards.filter(c => c.id !== activeId) };
        if (l.id === toListId)   return { ...l, cards: [...l.cards, { ...card, list_id: toListId }] };
        return l;
      });
    });
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType === 'card') {
      const cardId = active.id as string;
      const fromListId = active.data.current?.listId as string;
      const toListId = over.data.current?.type === 'list'
        ? (over.id as string)
        : (over.data.current?.listId as string);

      if (!toListId) return;

      // Same-list reorder: use arrayMove to update local state
      if (fromListId === toListId) {
        const list = lists.find(l => l.id === toListId);
        if (!list) return;
        const oldIdx = list.cards.findIndex(c => c.id === cardId);
        const newIdx = over.data.current?.type === 'card'
          ? list.cards.findIndex(c => c.id === over.id)
          : list.cards.length - 1;
        if (oldIdx === newIdx || newIdx < 0) return;

        const reordered = arrayMove(list.cards, oldIdx, newIdx);
        setLists(prev => prev.map(l => l.id === toListId ? { ...l, cards: reordered } : l));

        const before = reordered[newIdx - 1]?.position ?? null;
        const after  = reordered[newIdx + 1]?.position ?? null;
        const newPos = before != null && after != null
          ? (before + after) / 2
          : before != null ? before + 1
          : after != null  ? after / 2
          : 0.5;

        try {
          await cardsApi.update(cardId, { position: newPos });
          qc.invalidateQueries({ queryKey: ['board', board.id] });
        } catch { setLists(board.lists); }
        return;
      }

      // Cross-list move: position already updated by handleDragOver
      const toList = lists.find(l => l.id === toListId);
      if (!toList) return;

      const idx = toList.cards.findIndex(c => c.id === cardId);
      const before = toList.cards[idx - 1]?.position ?? null;
      const after  = toList.cards[idx + 1]?.position ?? null;

      const newPos = before != null && after != null
        ? (before + after) / 2
        : before != null
          ? before + 1
          : after != null
            ? after / 2
            : 0.5;

      try {
        await cardsApi.update(cardId, { list_id: toListId, position: newPos });
        qc.invalidateQueries({ queryKey: ['board', board.id] });
      } catch {
        setLists(board.lists);
      }
    }

    if (activeType === 'list') {
      const listId = active.id as string;
      const overListId = over.id as string;
      const oldIdx = lists.findIndex(l => l.id === listId);
      const newIdx = lists.findIndex(l => l.id === overListId);
      if (oldIdx === newIdx) return;

      const reordered = arrayMove(lists, oldIdx, newIdx);
      setLists(reordered);

      const before = reordered[newIdx - 1]?.position ?? null;
      const after  = reordered[newIdx + 1]?.position ?? null;
      const newPos = before != null && after != null
        ? (before + after) / 2
        : before != null
          ? before + 1
          : after != null
            ? after / 2
            : 0.5;

      try {
        await listsApi.update(listId, { position: newPos });
        qc.invalidateQueries({ queryKey: ['board', board.id] });
      } catch {
        setLists(board.lists);
      }
    }
  }, [lists, board, qc]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board-canvas">
        {lists.map(list => (
          <ListColumn
            key={list.id}
            list={list}
            boardId={board.id}
            onDelete={listId => setLists(prev => prev.filter(l => l.id !== listId))}
            onRename={(listId, name) => setLists(prev => prev.map(l => l.id === listId ? { ...l, name } : l))}
          />
        ))}
        <AddListButton boardId={board.id} onCreated={newList => setLists(prev => [...prev, { ...newList, cards: [] } as ListFull])} />
      </div>

      <DragOverlay>
        {activeCard && <CardItem card={activeCard} boardId={board.id} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
