'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi, boardsApi, listsApi, commentsApi, checklistsApi, usersApi } from '@/lib/api';
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
  'linear-gradient(135deg,#1d4ed8,#4338ca)',
  'linear-gradient(135deg,#7c3aed,#6d28d9)',
  'linear-gradient(135deg,#059669,#0f766e)',
  'linear-gradient(135deg,#d97706,#b45309)',
  'linear-gradient(135deg,#dc2626,#b91c1c)',
  'linear-gradient(135deg,#0891b2,#0369a1)',
  'linear-gradient(135deg,#be185d,#9d174d)',
  'linear-gradient(135deg,#4f46e5,#7c3aed)',
  '#1d4ed8', '#7c3aed', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#be185d', '#065f46', '#92400e',
  null,
];

// ── Small sidebar button ──
function SideBtn({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
        active
          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
          : 'bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:bg-white/[0.09] hover:text-white'
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}

// ── Description editor ──
function DescriptionEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="min-h-[60px] rounded-xl px-3 py-2 text-sm text-slate-400 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] cursor-text transition-all whitespace-pre-wrap"
      >
        {value || <span className="text-slate-600">أضف وصفاً...</span>}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        rows={4}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        className="w-full bg-white/[0.06] border border-blue-500/50 focus:outline-none text-white text-sm rounded-xl px-3 py-2 resize-y"
      />
      <div className="flex gap-2">
        <button onClick={() => { onSave(draft); setEditing(false); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">حفظ</button>
        <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white text-xs px-3 py-1.5 transition-colors">إلغاء</button>
      </div>
    </div>
  );
}

// ── Due date editor ──
function DueDateEditor({ card, onUpdate }: { card: any; onUpdate: (f: Record<string, unknown>) => void }) {
  const hasDue = !!card.due_date;
  const isComplete = !!card.due_complete;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-500 flex items-center gap-2">📅 التاريخ</h3>
      <div className="flex flex-wrap gap-2 items-center">
        <input type="date" dir="ltr"
          defaultValue={card.due_date ? new Date(card.due_date * 1000).toISOString().split('T')[0] : ''}
          onChange={e => {
            const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
            onUpdate({ due_date: ts });
          }}
          className="bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-lg px-3 py-1.5 text-xs [color-scheme:dark]" />
        {hasDue && (
          <button
            onClick={() => onUpdate({ due_complete: isComplete ? 0 : 1 })}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isComplete ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.05] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            {isComplete ? '✓ مكتمل' : 'تحديد كمكتمل'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Member search picker ──
function MemberSearchPanel({
  card,
  cardId,
  onAdded,
}: {
  card: any;
  cardId: string;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setNoResults(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      setNoResults(false);
      try {
        const res = await usersApi.search(query);
        setResults(res.users);
        setNoResults(res.users.length === 0);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const cardMemberIds: string[] = (card.members ?? []).map((m: any) => m.arid_researcher_id ?? m);

  async function pick(user: { id: string; name: string; email: string }) {
    setAdding(user.id);
    try {
      await cardsApi.addMember(cardId, user.id);
      toast.success(`تمت إضافة ${user.name} للبطاقة`);
      onAdded();
      setQuery('');
      setResults([]);
    } catch (err: any) {
      toast.error(err.message ?? 'فشل الإضافة');
    } finally { setAdding(null); }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو الإيميل..."
          className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-lg px-3 py-2 text-xs pe-7"
        />
        {searching && (
          <div className="absolute inset-y-0 left-2 flex items-center">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-[#0a111e] border border-white/10 rounded-xl overflow-hidden">
          {results.map(u => {
            const already = cardMemberIds.includes(u.id);
            return (
              <button key={u.id} disabled={already || adding === u.id} onClick={() => pick(u)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.07] transition-colors text-start ${already ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                {already && <span className="text-[10px] text-slate-600">مضاف</span>}
                {adding === u.id && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {noResults && query.length >= 2 && (
        <p className="text-xs text-slate-500 text-center py-2">
          لا يوجد مستخدم بهذا الاسم. تأكد أن الشخص مسجّل في النظام.
        </p>
      )}

      {/* Current members */}
      {cardMemberIds.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <p className="text-[10px] text-slate-600">الأعضاء الحاليون</p>
          {(card.members ?? []).map((m: any) => {
            const id = m.arid_researcher_id ?? m;
            const name = m.name ?? id;
            return (
              <div key={id} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-2.5 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-xs text-slate-300 truncate">{name}</span>
                <button onClick={async () => {
                  try { await cardsApi.removeMember(cardId, id); onAdded(); }
                  catch { toast.error('فشل الإزالة'); }
                }} className="text-slate-600 hover:text-red-400 transition-colors text-xs">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Move card panel ──
function MoveCardPanel({ card, boardId, onMoved }: { card: any; boardId: string; onMoved: () => void }) {
  const { data: boardData } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsApi.fetch(boardId),
    staleTime: 30_000,
  });
  const lists = (boardData as any)?.board?.lists ?? [];
  const [selectedList, setSelectedList] = useState(card.list_id);
  const [moving, setMoving] = useState(false);

  async function handleMove() {
    if (selectedList === card.list_id) return;
    setMoving(true);
    try {
      await cardsApi.update(card.id, { list_id: selectedList });
      toast.success('تم نقل البطاقة');
      onMoved();
    } catch (err: any) { toast.error(err.message ?? 'فشل النقل'); }
    finally { setMoving(false); }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] text-slate-500 block mb-1.5">اختر القائمة</label>
        <div className="space-y-1.5">
          {lists.map((l: any) => (
            <button
              key={l.id}
              onClick={() => setSelectedList(l.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                selectedList === l.id
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.07] hover:border-white/[0.14]'
              }`}
            >
              <span className="truncate">{l.name}</span>
              {l.id === card.list_id && <span className="text-[10px] text-slate-500 shrink-0 ms-2">الحالية</span>}
              {selectedList === l.id && l.id !== card.list_id && <span className="text-[10px] text-blue-400 shrink-0 ms-2">✓</span>}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleMove}
        disabled={moving || selectedList === card.list_id}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
      >
        {moving ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            جارٍ النقل...
          </span>
        ) : 'نقل البطاقة ↗️'}
      </button>
    </div>
  );
}

// ── Copy card panel ──
function CopyCardPanel({ card, boardId, onCopied }: { card: any; boardId: string; onCopied: () => void }) {
  const [newTitle, setNewTitle] = useState(`${card.title} (نسخة)`);
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    setCopying(true);
    try {
      await cardsApi.copy(card.id, { title: newTitle.trim() });
      toast.success('تم نسخ البطاقة');
      onCopied();
    } catch (err: any) { toast.error(err.message ?? 'فشل النسخ'); }
    finally { setCopying(false); }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] text-slate-500 block mb-1">عنوان النسخة</label>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-lg px-3 py-2 text-xs"
        />
      </div>
      <button
        onClick={handleCopy}
        disabled={copying || !newTitle.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
      >
        {copying ? 'جارٍ النسخ...' : 'نسخ البطاقة'}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════
export default function CardDetailModal({ cardId, boardId, onClose, onDeleted }: Props) {
  const qc = useQueryClient();
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  type Panel = 'labels' | 'members' | 'cover' | 'dates' | 'move' | 'copy' | null;
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.fetch(cardId),
  });

  const { data: boardData } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsApi.fetch(boardId),
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

  async function handleArchive() {
    setArchiving(true);
    try {
      await cardsApi.delete(cardId, false); // archive, not permanent
      qc.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('تمت أرشفة البطاقة');
      onDeleted?.();
      onClose();
    } catch (err: any) { toast.error(err.message ?? 'فشل الأرشفة'); setArchiving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await cardsApi.delete(cardId, true); // permanent
      qc.invalidateQueries({ queryKey: ['board', boardId] });
      onDeleted?.();
      onClose();
    } catch (err: any) { toast.error(err.message ?? 'فشل الحذف'); setDeleting(false); setConfirmDelete(false); }
  }

  async function handleToggleLabel(labelId: string, isActive: boolean) {
    try {
      if (isActive) await cardsApi.removeLabel(cardId, labelId);
      else await cardsApi.addLabel(cardId, labelId);
      qc.invalidateQueries({ queryKey: ['card', cardId] });
    } catch { toast.error('فشل تحديث الملصق'); }
  }

  function refreshCard() {
    qc.invalidateQueries({ queryKey: ['card', cardId] });
    qc.invalidateQueries({ queryKey: ['board', boardId] });
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
      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setConfirmDelete(false)}>
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white mb-1">حذف نهائي للبطاقة</h2>
            <p className="text-slate-400 text-sm mb-5">سيتم حذف البطاقة وجميع محتوياتها بشكل دائم لا يمكن التراجع عنه.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-xl text-sm transition-colors">
                إلغاء
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                {deleting ? 'جارٍ الحذف...' : 'حذف نهائي'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-2xl bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl" dir="rtl">

          {/* Cover */}
          {card.cover_color && (
            <div className="h-20 rounded-t-2xl relative group" style={{ background: card.cover_color }}>
              <button
                onClick={() => setActivePanel(p => p === 'cover' ? null : 'cover')}
                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 bg-black/40 hover:bg-black/60 text-white text-xs px-3 py-1 rounded-lg transition-all"
              >
                🎨 تغيير الغلاف
              </button>
            </div>
          )}

          <div className="p-5 md:p-6">
            {/* Header */}
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
                <h2
                  className="flex-1 text-lg font-semibold text-slate-100 cursor-text hover:bg-white/[0.05] rounded px-1 -mx-1 group"
                  onClick={() => { setTitle(card.title); setEditTitle(true); }}
                >
                  {card.title}
                  <span className="opacity-0 group-hover:opacity-100 text-slate-500 text-xs ms-2 font-normal transition-opacity">✏️ تعديل</span>
                </h2>
              )}
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl shrink-0 leading-none transition-colors">✕</button>
            </div>

            <div className="flex gap-5">
              {/* ── Main content ── */}
              <div className="flex-1 min-w-0 space-y-5">

                {/* Labels row */}
                {card.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map((l: any) => (
                      <span key={l.id}
                        onClick={() => setActivePanel(p => p === 'labels' ? null : 'labels')}
                        className="text-xs text-white font-medium px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: l.color }}>
                        {l.name ?? ''}
                      </span>
                    ))}
                    <button
                      onClick={() => setActivePanel(p => p === 'labels' ? null : 'labels')}
                      className="text-xs text-slate-500 hover:text-slate-300 bg-white/[0.05] px-2 py-1 rounded-full transition-colors">
                      + ملصق
                    </button>
                  </div>
                )}

                {/* Members chips */}
                {card.members?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">الأعضاء المعيّنون</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.members.map((m: any) => {
                        const id = m.arid_researcher_id ?? m;
                        const name = m.name ?? id;
                        return (
                          <div key={id} className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 group">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-slate-300">{name}</span>
                            <button
                              onClick={async () => {
                                try { await cardsApi.removeMember(cardId, id); refreshCard(); }
                                catch { toast.error('فشل الإزالة'); }
                              }}
                              className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs leading-none"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Due date */}
                <DueDateEditor card={card} onUpdate={fields => updateMutation.mutate(fields)} />

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 mb-2">☰ الوصف</h3>
                  <DescriptionEditor value={card.description ?? ''} onSave={desc => updateMutation.mutate({ description: desc })} />
                </div>

                {/* Checklists */}
                {card.checklists.map((cl: any) => (
                  <ChecklistSection key={cl.id} checklist={cl} cardId={cardId} boardId={boardId} />
                ))}

                {/* Comments */}
                <CommentSection comments={card.comments} cardId={cardId} boardId={boardId} />

                {/* Activity */}
                {card.activity?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 mb-2">📋 النشاط</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {card.activity.slice(0, 8).map((a: any) => (
                        <div key={a.id} className="flex items-start gap-2 text-xs text-slate-500">
                          <div className="w-5 h-5 rounded-full bg-white/[0.07] flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                            {(a.arid_researcher_id ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <span>{a.arid_researcher_id} · {a.type.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sidebar ── */}
              <div className="w-36 shrink-0 space-y-1.5">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">إضافة</p>
                <SideBtn icon="🏷" label="ملصقات" active={activePanel === 'labels'} onClick={() => setActivePanel(p => p === 'labels' ? null : 'labels')} />
                <SideBtn icon="👤" label="أعضاء" active={activePanel === 'members'} onClick={() => setActivePanel(p => p === 'members' ? null : 'members')} />
                <SideBtn icon="🎨" label="الغلاف" active={activePanel === 'cover'} onClick={() => setActivePanel(p => p === 'cover' ? null : 'cover')} />
                <SideBtn icon="📅" label="تواريخ" active={activePanel === 'dates'} onClick={() => setActivePanel(p => p === 'dates' ? null : 'dates')} />

                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 pt-3">إجراءات</p>
                <SideBtn icon="↗️" label="نقل" active={activePanel === 'move'} onClick={() => setActivePanel(p => p === 'move' ? null : 'move')} />
                <SideBtn icon="📋" label="نسخ" active={activePanel === 'copy'} onClick={() => setActivePanel(p => p === 'copy' ? null : 'copy')} />

                <div className="pt-2 space-y-1 border-t border-white/[0.06]">
                  <button
                    onClick={handleArchive}
                    disabled={archiving}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                    </svg>
                    {archiving ? 'جارٍ...' : 'أرشفة'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                    حذف
                  </button>
                </div>
              </div>
            </div>

            {/* ── Panels ── */}
            {activePanel && (
              <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">

                {activePanel === 'labels' && (
                  <>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3">الملصقات</h4>
                    {boardLabels.length === 0 ? (
                      <p className="text-xs text-slate-600">لا توجد ملصقات. أضفها من إعدادات اللوحة.</p>
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
                  </>
                )}

                {activePanel === 'members' && (
                  <>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3">إضافة أعضاء للبطاقة</h4>
                    <MemberSearchPanel card={card} cardId={cardId} onAdded={refreshCard} />
                  </>
                )}

                {activePanel === 'cover' && (
                  <>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3">لون الغلاف</h4>
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {COVER_COLORS.filter(Boolean).map((color, i) => (
                        <button key={i} onClick={() => updateMutation.mutate({ cover_color: color })}
                          className={`h-10 rounded-xl border-2 transition-all hover:scale-105 ${color === card.cover_color ? 'border-white shadow-lg' : 'border-transparent hover:border-white/40'}`}
                          style={{ background: color ?? 'transparent' }}
                          title={String(color)}
                        />
                      ))}
                    </div>
                    {card.cover_color && (
                      <button onClick={() => updateMutation.mutate({ cover_color: null })}
                        className="w-full text-xs text-slate-400 hover:text-white bg-white/[0.05] border border-white/10 hover:border-white/20 py-2 rounded-xl transition-colors">
                        ✕ إزالة الغلاف
                      </button>
                    )}
                  </>
                )}

                {activePanel === 'dates' && (
                  <>
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
                    </div>
                  </>
                )}

                {activePanel === 'move' && (
                  <>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3">نقل البطاقة إلى قائمة أخرى</h4>
                    <MoveCardPanel card={card} boardId={boardId} onMoved={() => { refreshCard(); onClose(); }} />
                  </>
                )}

                {activePanel === 'copy' && (
                  <>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3">نسخ البطاقة</h4>
                    <CopyCardPanel card={card} boardId={boardId} onCopied={() => { refreshCard(); setActivePanel(null); }} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}