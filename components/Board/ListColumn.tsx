'use client';

import { useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ListFull } from '@/lib/types';
import CardItem from '@/components/Card/CardItem';
import AddCardButton from '@/components/Card/AddCardButton';
import { listsApi } from '@/lib/api';

interface Props {
  list: ListFull;
  boardId: string;
  onDelete?: (listId: string) => void;
  onRename?: (listId: string, name: string) => void;
}

// Small three-dot menu
function ListMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors shrink-0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-36 bg-[#1a2235] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
          <button onClick={() => { onRename(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            تعديل الاسم
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            حذف القائمة
          </button>
        </div>
      )}
    </div>
  );
}

export default function ListColumn({ list, boardId, onDelete, onRename }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(list.name);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', listId: list.id },
  });

  useEffect(() => { if (renaming) inputRef.current?.focus(); }, [renaming]);

  async function handleRenameSubmit() {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === list.name) { setRenaming(false); return; }
    setSaving(true);
    try {
      await listsApi.update(list.id, { name: trimmed });
      onRename?.(list.id, trimmed);
    } catch { setNewName(list.name); }
    finally { setSaving(false); setRenaming(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await listsApi.delete(list.id);
      onDelete?.(list.id);
    } catch { setDeleting(false); setConfirmDelete(false); }
  }

  return (
    <>
      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white mb-2">حذف "{list.name}"</h2>
            <p className="text-slate-400 text-sm mb-5">سيتم حذف القائمة وجميع بطاقاتها نهائياً.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-xl text-sm transition-colors">إلغاء</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                {deleting ? 'جارٍ الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* List header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 gap-2">
          {renaming ? (
            <input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') { setRenaming(false); setNewName(list.name); } }}
              disabled={saving}
              className="flex-1 bg-white/10 border border-blue-500/50 rounded-lg px-2 py-0.5 text-[13px] text-white font-semibold focus:outline-none"
            />
          ) : (
            <h3 className="font-semibold text-[13px] text-slate-200 truncate flex-1 cursor-pointer" onDoubleClick={() => setRenaming(true)}>
              {list.name}
            </h3>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-500 bg-white/[0.07] rounded-full px-2 py-0.5 font-medium">
              {list.cards.length}
            </span>
            <ListMenu onRename={() => { setNewName(list.name); setRenaming(true); }} onDelete={() => setConfirmDelete(true)} />
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {list.cards.map(card => (
              <CardItem key={card.id} card={card} boardId={boardId} listId={list.id} />
            ))}
          </SortableContext>
        </div>

        {/* Add card */}
        <div className="px-2 pb-2">
          <AddCardButton listId={list.id} boardId={boardId} />
        </div>
      </div>
    </>
  );
}
