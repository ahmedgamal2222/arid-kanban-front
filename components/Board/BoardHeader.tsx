'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { boardsApi, usersApi } from '@/lib/api';
import type { BoardFull } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from '@/components/Notifications/Bell';

interface Props { board: BoardFull }

// CSS gradients stored in DB
const BOARD_COLORS = [
  { label: 'ازرق',     value: 'linear-gradient(135deg,#2563eb,#4338ca)' },
  { label: 'بنفسجي',  value: 'linear-gradient(135deg,#7c3aed,#7e22ce)' },
  { label: 'اخضر',    value: 'linear-gradient(135deg,#059669,#0f766e)' },
  { label: 'برتقالي', value: 'linear-gradient(135deg,#ea580c,#b45309)' },
  { label: 'وردي',    value: 'linear-gradient(135deg,#db2777,#be123c)' },
  { label: 'سماوي',   value: 'linear-gradient(135deg,#0891b2,#0369a1)' },
];

// Map legacy Tailwind strings -> CSS gradient
const LEGACY: Record<string, string> = {
  'from-blue-600 to-indigo-700':   'linear-gradient(135deg,#2563eb,#4338ca)',
  'from-violet-600 to-purple-700': 'linear-gradient(135deg,#7c3aed,#7e22ce)',
  'from-emerald-600 to-teal-700':  'linear-gradient(135deg,#059669,#0f766e)',
  'from-orange-600 to-amber-700':  'linear-gradient(135deg,#ea580c,#b45309)',
  'from-pink-600 to-rose-700':     'linear-gradient(135deg,#db2777,#be123c)',
  'from-cyan-600 to-sky-700':      'linear-gradient(135deg,#0891b2,#0369a1)',
};

const VISIBILITY_OPTIONS: { value: 'private' | 'workspace' | 'public'; label: string; icon: string }[] = [
  { value: 'private',   label: 'خاص',      icon: '🔒' },
  { value: 'workspace', label: 'للمساحة',  icon: '🏢' },
  { value: 'public',    label: 'عام',       icon: '🌍' },
];

// ── User search dropdown ──
interface UserResult { id: string; name: string; email: string }

function MemberPicker({
  onAdd,
  existingIds,
}: {
  onAdd: (userId: string) => Promise<void>;
  existingIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await usersApi.search(query);
        setResults(res.users);
        setOpen(true);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function pick(user: UserResult) {
    setAdding(user.id);
    setOpen(false);
    setQuery('');
    setResults([]);
    try { await onAdd(user.id); }
    finally { setAdding(null); }
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="ابحث بالاسم أو الإيميل..."
          className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-600 rounded-lg px-3 py-1.5 text-xs pe-7"
        />
        {searching && (
          <div className="absolute inset-y-0 left-2 flex items-center">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a111e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]">
          {results.map(u => {
            const already = existingIds.includes(u.id);
            return (
              <button
                key={u.id}
                disabled={already || adding === u.id}
                onClick={() => pick(u)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.07] transition-colors text-start ${already ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                {already && <span className="text-[10px] text-slate-600">مضاف</span>}
                {adding === u.id && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Settings panel ──
function BoardSettingsPanel({ board, onClose }: { board: BoardFull; onClose: () => void }) {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const rawBg = (board as any).background ?? '';
  const initBg = LEGACY[rawBg] ?? rawBg ?? 'linear-gradient(135deg,#2563eb,#4338ca)';

  const [name, setName] = useState(board.name);
  const [visibility, setVisibility] = useState<'private' | 'workspace' | 'public'>(
    board.visibility ?? 'workspace'
  );
  const [background, setBackground] = useState(initBg);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await boardsApi.update(board.id, { name: name.trim(), visibility, background });
      qc.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('تم الحفظ');
      onClose();
    } catch (err: any) { toast.error(err.message ?? 'فشل الحفظ'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await boardsApi.delete(board.id);
      router.replace(`/${locale}/boards`);
    } catch (err: any) { toast.error(err.message ?? 'فشل الحذف'); setDeleting(false); }
  }

  async function handleAddMember(userId: string) {
    await boardsApi.addMember(board.id, userId);
    qc.invalidateQueries({ queryKey: ['board', board.id] });
    toast.success('تمت الإضافة');
  }

  async function handleRemoveMember(aridId: string) {
    try {
      await boardsApi.removeMember(board.id, aridId);
      qc.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('تمت الإزالة');
    } catch (err: any) { toast.error(err.message ?? 'فشل الإزالة'); }
  }

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const existingMemberIds = board.members?.map(m => m.arid_researcher_id) ?? [];

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[80vh]"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-bold text-white">إعدادات اللوحة</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-sm">✕</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-slate-500 block mb-1">اسم اللوحة</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="text-xs text-slate-500 block mb-1.5">الرؤية</label>
          <div className="flex gap-1.5">
            {VISIBILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setVisibility(opt.value)}
                className={`flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border text-xs transition-all ${
                  visibility === opt.value
                    ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">
            {visibility === 'private' ? 'فقط الأعضاء المدعوون يمكنهم الوصول' :
             visibility === 'workspace' ? 'كل أعضاء مساحة العمل يمكنهم الرؤية' :
             'مرئية للجميع على الإنترنت'}
          </p>
        </div>

        {/* Background color */}
        <div>
          <label className="text-xs text-slate-500 block mb-1.5">لون الخلفية</label>
          <div className="flex flex-wrap gap-2">
            {BOARD_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setBackground(c.value)}
                className={`w-8 h-8 rounded-lg transition-all ${
                  background === c.value
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0f172a] scale-110'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ background: c.value }}
                title={c.label}
              />
            ))}
          </div>
          {/* Live preview */}
          <div className="mt-2 h-8 rounded-lg" style={{ background }} />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* Members section */}
      <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-4">
        <h4 className="text-xs font-semibold text-slate-400">الأعضاء</h4>

        {/* Current members */}
        {board.members && board.members.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {board.members.map(m => (
              <div
                key={m.arid_researcher_id}
                className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {(m.arid_researcher_id ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{m.arid_researcher_id}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    m.role === 'owner' ? 'bg-amber-500/15 text-amber-400' :
                    m.role === 'admin' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-white/[0.07] text-slate-500'
                  }`}>
                    {m.role === 'owner' ? 'مالك' : m.role === 'admin' ? 'مشرف' : 'عضو'}
                  </span>
                </div>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(m.arid_researcher_id)}
                    className="text-slate-600 hover:text-red-400 transition-colors text-xs leading-none"
                    title="إزالة العضو"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add member search */}
        <div>
          <label className="text-[10px] text-slate-600 block mb-1">إضافة عضو جديد</label>
          <MemberPicker onAdd={handleAddMember} existingIds={existingMemberIds} />
        </div>
      </div>

      {/* Delete section */}
      <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            حذف اللوحة
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-400">سيتم حذف اللوحة نهائياً. هل أنت متأكد؟</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-1.5 rounded-lg text-xs">
                إلغاء
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors">
                {deleting ? 'جارٍ...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main header ──
export default function BoardHeader({ board }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const qc = useQueryClient();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const starMutation = useMutation({
    mutationFn: () => boardsApi.update(board.id, { is_starred: board.is_starred ? 0 : 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', board.id] }),
  });

  const visibilityLabel =
    board.visibility === 'private' ? '🔒 خاص' :
    board.visibility === 'public'  ? '🌍 عام' : '🏢 المساحة';

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-black/30 backdrop-blur-sm border-b border-white/10 text-white shrink-0" dir="rtl">

      {/* Back to boards */}
      <Link href={`/${locale}/boards`} className="text-white/60 hover:text-white transition-colors shrink-0" title="مساحات العمل">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </Link>
      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* Board name */}
      <h1 className="font-bold text-base truncate max-w-[160px] sm:max-w-xs">{board.name}</h1>

      {/* Visibility badge */}
      <span className="hidden sm:inline-flex text-xs bg-white/15 rounded-full px-2.5 py-0.5 shrink-0 items-center gap-1">
        {visibilityLabel}
      </span>

      {/* Members avatars */}
      {board.members && board.members.length > 0 && (
        <div className="hidden md:flex items-center -space-x-1.5 ms-1">
          {board.members.slice(0, 4).map(m => (
            <div
              key={m.arid_researcher_id}
              title={m.arid_researcher_id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-[#1d2d44] flex items-center justify-center text-[9px] font-bold text-white"
            >
              {m.arid_researcher_id.charAt(0).toUpperCase()}
            </div>
          ))}
          {board.members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#1d2d44] flex items-center justify-center text-[9px] text-slate-400">
              +{board.members.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Star */}
      <button
        onClick={() => starMutation.mutate()}
        className={`shrink-0 text-lg hover:scale-110 transition-transform ${board.is_starred ? 'text-yellow-400' : 'text-white/40 hover:text-white/80'}`}
        title={board.is_starred ? 'إلغاء النجمة' : 'وضع نجمة'}
      >
        {board.is_starred ? '★' : '☆'}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <NotificationBell />

      {/* Timeline / Dashboard links */}
      <Link href={`/${locale}/board/${board.id}/timeline`}
        className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.14] rounded-lg px-3 py-1.5 transition-all">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        الجدول الزمني
      </Link>

      {/* Mind Map link */}
      <Link href={`/${locale}/board/${board.id}/mindmap`}
        className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.14] rounded-lg px-3 py-1.5 transition-all">
        🧠 خريطة ذهنية
      </Link>
      <div className="relative shrink-0">
        <button
          onClick={() => setSettingsOpen(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            settingsOpen
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/[0.07] border-white/[0.06] hover:border-white/[0.14]'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          إعدادات
        </button>

        {settingsOpen && (
          <BoardSettingsPanel board={board} onClose={() => setSettingsOpen(false)} />
        )}
      </div>
    </header>
  );
}