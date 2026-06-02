'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi, boardsApi, commentsApi, checklistsApi } from '@/lib/api';
import type { CardDetail } from '@/lib/types';
import CardDueBadge from '../CardDueBadge';
import CommentSection from './CommentSection';
import ChecklistSection from './ChecklistSection';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Props {
  cardId: string;
  boardId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

const COVER_COLORS = [
  '#1d4ed8', '#7c3aed', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#be185d', '#4f46e5', '#065f46', '#92400e',
  null,
];

export default function CardDetailModal({ cardId, boardId, onClose, onDeleted }: Props) {
  const qc = useQueryClient();
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [activePanel, setActivePanel] = useState<'labels' | 'members' | 'cover' | 'dates' | null>(null);
  const [addMemberId, setAddMemberId] = useState('');
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.fetch(cardId),
  });

  const { data: boardData } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => import('@/lib/api').then(m => m.boardsApi.fetch(boardId)),
    staleTime: 60_000,
  });

  const card = data?.card;
  const boardLabels = (boardData as any)?.board?.labels ?? [];

  const updateMutation = useMutation({
    mutationFn: (fields: Record<string, unknown>) => cardsApi.update(cardId, fields),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['card', cardId] });
      qc.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: () => toast.error('فشل التحديث'),
  });

  async function handleDelete() {
    setDeleting(true);
    try {
      await cardsApi.delete(cardId);
      qc.invalidateQueries({ queryKey: ['board', boardId] });
      onDeleted?.();
      onClose();
    } catch (err: any) { toast.error(err.message ?? 'فشل الحذف'); setDeleting(false); setConfirmDelete(false); }
  }

  async function handleAddMember() {
    if (!addMemberId.trim()) return;
    setAddMemberLoading(true);
    try {
      await cardsApi.addMember(cardId, addMemberId.trim());
      qc.invalidateQueries({ queryKey: ['card', cardId] });
      setAddMemberId('');
      toast.success('تمت إضافة العضو');
    } catch (err: any) { toast.error(err.message ?? 'فشل الإضافة'); }
    finally { setAddMemberLoading(false); }
  }

  async function handleRemoveMember(aridId: string) {
    try {
      await cardsApi.removeMember(cardId, aridId);
      qc.invalidateQueries({ queryKey: ['card', cardId] });
    } catch { toast.error('فشل الإزالة'); }
  }

  async function handleToggleLabel(labelId: string, isActive: boolean) {
    try {
      if (isActive) await cardsApi.removeLabel(cardId, labelId);
      else await cardsApi.addLabel(cardId, labelId);
      qc.invalidateQueries({ queryKey: ['card', cardId] });
    } catch { toast.error('فشل تحديث الملصق'); }
  }

  if (isLoading || !card) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  const cardLabelIds = new Set(card.labels.map((l: any) => l.id));

  return (
    <>
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80" onClick={() => setConfirmDelete(false)}>
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white mb-2">حذف البطاقة</h2>
            <p className="text-slate-400 text-sm mb-5">سيتم حذف هذه البطاقة نهائياً.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-xl text-sm transition-colors">إلغاء</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                {deleting ? 'جارٍ الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="w-full max-w-2xl bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl" dir="rtl">
          {/* Cover */}
          {card.cover_color && (
            <div className="h-20 rounded-t-2xl" style={{ background: card.cover_color }} />
          )}

          <div className="p-5 md:p-6">
            {/* Header: title + close */}
            <div className="flex items-start gap-3 mb-5">
              <span className="text-lg mt-0.5 shrink-0">📋</span>
              {editTitle ? (
                <input autoFocus
                  className="flex-1 text-lg font-semibold border-b-2 border-blue-500 outline-none bg-transparent text-white"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={() => {
                    if (title.trim() && title !== card.title) updateMutation.mutate({ title: title.trim() });
                    setEditTitle(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') { setTitle(card.title); setEditTitle(false); }
                  }}
                />
              ) : (
                <h2 className="flex-1 text-lg font-semibold text-slate-100 cursor-text hover:bg-white/[0.05] rounded px-1 -mx-1"
                  onClick={() => { setTitle(card.title); setEditTitle(true); }}>
                  {card.title}
                </h2>
              )}
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl shrink-0 leading-none transition-colors">✕</button>
            </div>

            <div className="flex gap-5">
              {/* ── Main content ── */}
              <div className="flex-1 min-w-0 space-y-5">
                {/* Labels */}
                {card.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map((l: any) => (
                      <span key={l.id} className="text-xs text-white font-medium px-3 py-1 rounded-full"
                        style={{ background: l.color }}>
                        {l.name ?? ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Members */}
                {card.members?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">الأعضاء</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.members.map((m: any) => (
                        <div key={m.arid_researcher_id} className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold">
                            {(m.name ?? m.arid_researcher_id ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-300">{m.name ?? m.arid_researcher_id}</span>
                          <button onClick={() => handleRemoveMember(m.arid_researcher_id)}
                            className="text-slate-600 hover:text-red-400 transition-colors text-xs leading-none">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Due date */}
                <DueDateEditor card={card} onUpdate={fields => updateMutation.mutate(fields)} />

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">☰ الوصف</h3>
                  <DescriptionEditor value={card.description ?? ''} onSave={desc => updateMutation.mutate({ description: desc })} />
                </div>

                {/* Checklists */}
                {card.checklists.map((cl: any) => (
                  <ChecklistSection key={cl.id} checklist={cl} cardId={cardId} boardId={boardId} />
                ))}

                {/* Comments */}
                <CommentSection comments={card.comments} cardId={cardId} boardId={boardId} />
              </div>

              {/* ── Sidebar actions ── */}
              <div className="w-36 shrink-0 space-y-1.5">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">إجراءات</p>

                <SideBtn icon="🏷" label="ملصقات" active={activePanel === 'labels'} onClick={() => setActivePanel(p => p === 'labels' ? null : 'labels')} />
                <SideBtn icon="👤" label="أعضاء" active={activePanel === 'members'} onClick={() => setActivePanel(p => p === 'members' ? null : 'members')} />
                <SideBtn icon="🎨" label="الغلاف" active={activePanel === 'cover'} onClick={() => setActivePanel(p => p === 'cover' ? null : 'cover')} />
                <SideBtn icon="📅" label="تواريخ" active={activePanel === 'dates'} onClick={() => setActivePanel(p => p === 'dates' ? null : 'dates')} />

                <div className="pt-2 border-t border-white/[0.06]">
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    حذف
                  </button>
                </div>
              </div>
            </div>

            {/* ── Panels ── */}
            {activePanel === 'labels' && (
              <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">ملصقات اللوحة</h4>
                {boardLabels.length === 0 ? (
                  <p className="text-xs text-slate-600">لا توجد ملصقات بعد. أضف من إعدادات اللوحة.</p>
                ) : (
                  <div className="space-y-1.5">
                    {boardLabels.map((l: any) => {
                      const active = cardLabelIds.has(l.id);
                      return (
                        <button key={l.id} onClick={() => handleToggleLabel(l.id, active)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${active ? 'border-white/20 bg-white/[0.08]' : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                          <div className="w-8 h-4 rounded-sm shrink-0" style={{ background: l.color }} />
                          <span className="text-xs text-slate-300 flex-1 text-start">{l.name || l.color}</span>
                          {active && <span className="text-green-400 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activePanel === 'members' && (
              <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">إضافة عضو</h4>
                <div className="flex gap-2">
                  <input value={addMemberId} onChange={e => setAddMemberId(e.target.value)}
                    placeholder="معرف ARID"
                    className="flex-1 bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-lg px-3 py-2 text-xs"
                    onKeyDown={e => { if (e.key === 'Enter') handleAddMember(); }}
                  />
                  <button onClick={handleAddMember} disabled={addMemberLoading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs transition-colors">
                    إضافة
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'cover' && (
              <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">لون الغلاف</h4>
                <div className="flex flex-wrap gap-2">
                  {COVER_COLORS.map((color, i) => (
                    <button key={i} onClick={() => updateMutation.mutate({ cover_color: color })}
                      className={`w-8 h-8 rounded-lg border transition-all ${color === card.cover_color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f172a]' : 'border-white/10 hover:scale-110'}`}
                      style={{ background: color ?? 'transparent' }}
                      title={color ?? 'بدون لون'}>
                      {!color && <span className="text-slate-500 text-xs">✕</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'dates' && (
              <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">تواريخ البطاقة</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">تاريخ البداية</label>
                    <input type="date"
                      defaultValue={card.start_date ? new Date(card.start_date * 1000).toISOString().split('T')[0] : ''}
                      onChange={e => {
                        const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
                        updateMutation.mutate({ start_date: ts });
                      }}
                      className="bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-lg px-3 py-2 text-xs w-full [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">تاريخ الاستحقاق</label>
                    <input type="date"
                      defaultValue={card.due_date ? new Date(card.due_date * 1000).toISOString().split('T')[0] : ''}
                      onChange={e => {
                        const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
                        updateMutation.mutate({ due_date: ts });
                      }}
                      className="bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-lg px-3 py-2 text-xs w-full [color-scheme:dark]" />
                  </div>
                  {card.due_date && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input type="checkbox" checked={!!card.due_complete}
                          onChange={() => updateMutation.mutate({ due_complete: card.due_complete ? 0 : 1 })}
                          className="rounded" />
                        مكتملة
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sidebar action button ──
function SideBtn({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${active ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'}`}>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}

// ── Due date section ──
function DueDateEditor({ card, onUpdate }: { card: CardDetail; onUpdate: (f: Record<string, unknown>) => void }) {
  if (!card.due_date) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500">الاستحقاق:</span>
      <CardDueBadge dueDate={card.due_date} complete={!!card.due_complete} />
      <button onClick={() => onUpdate({ due_complete: card.due_complete ? 0 : 1 })}
        className={`text-xs px-2 py-0.5 rounded border transition-colors ${card.due_complete ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-white/10 text-slate-400 hover:border-green-500/50'}`}>
        {card.due_complete ? '✓ مكتملة' : 'وضّع علامة مكتملة'}
      </button>
    </div>
  );
}

// ── Description editor ──
function DescriptionEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  if (!editing) {
    return (
      <div className="min-h-10 text-sm text-slate-400 cursor-text hover:bg-white/[0.04] rounded-lg p-2 whitespace-pre-wrap border border-transparent hover:border-white/[0.06] transition-all"
        onClick={() => { setText(value); setEditing(true); }}>
        {value || <span className="text-slate-600">أضف وصفاً أكثر تفصيلاً...</span>}
      </div>
    );
  }

  return (
    <div>
      <textarea autoFocus rows={5} value={text} onChange={e => setText(e.target.value)}
        className="w-full rounded-lg border border-blue-500/50 bg-white/[0.05] px-3 py-2 text-sm text-slate-200 outline-none resize-y"
        placeholder="أضف وصفاً أكثر تفصيلاً..." />
      <div className="flex gap-2 mt-2">
        <button onClick={() => { onSave(text); setEditing(false); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-lg transition-colors">حفظ</button>
        <button onClick={() => setEditing(false)}
          className="text-slate-500 hover:text-slate-300 text-xs px-3 transition-colors">إلغاء</button>
      </div>
    </div>
  );
}
