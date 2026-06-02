'use client';

import { useState, useRef, useEffect } from 'react';
import { boardsApi } from '@/lib/api';
import type { BoardFull } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  board: BoardFull;
}

const BOARD_COLORS = [
  { label: 'أزرق', value: 'from-blue-600 to-indigo-700' },
  { label: 'بنفسجي', value: 'from-violet-600 to-purple-700' },
  { label: 'أخضر', value: 'from-emerald-600 to-teal-700' },
  { label: 'برتقالي', value: 'from-orange-600 to-amber-700' },
  { label: 'وردي', value: 'from-pink-600 to-rose-700' },
  { label: 'سماوي', value: 'from-cyan-600 to-sky-700' },
];

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'خاص', icon: '🔒' },
  { value: 'workspace', label: 'للمساحة', icon: '🏢' },
  { value: 'public', label: 'عام', icon: '🌍' },
];

// ── Board settings panel ──
function BoardSettingsPanel({ board, onClose }: { board: BoardFull; onClose: () => void }) {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const [name, setName] = useState(board.name);
  const [visibility, setVisibility] = useState(board.visibility ?? 'workspace');
  const [background, setBackground] = useState((board as any).background ?? BOARD_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addMemberId, setAddMemberId] = useState('');
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await boardsApi.update(board.id, { name: name.trim(), visibility, background });
      qc.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('تم الحفظ');
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

  async function handleAddMember() {
    if (!addMemberId.trim()) return;
    setAddMemberLoading(true);
    try {
      await boardsApi.addMember(board.id, addMemberId.trim());
      toast.success('تمت الإضافة');
      setAddMemberId('');
    } catch (err: any) { toast.error(err.message ?? 'فشل الإضافة'); }
    finally { setAddMemberLoading(false); }
  }

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 w-72 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">إعدادات اللوحة</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-sm">✕</button>
      </div>

      {/* Name */}
      <div>
        <label className="text-xs text-slate-500 block mb-1">اسم اللوحة</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Visibility */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">الرؤية</label>
        <div className="flex gap-1.5">
          {VISIBILITY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setVisibility(opt.value)}
              className={`flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border text-xs transition-all ${visibility === opt.value ? 'border-blue-500/50 bg-blue-500/10 text-blue-300' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20'}`}>
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">لون الخلفية</label>
        <div className="flex flex-wrap gap-1.5">
          {BOARD_COLORS.map(c => (
            <button key={c.value} onClick={() => setBackground(c.value)}
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.value} transition-all ${background === c.value ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0f172a] scale-110' : 'opacity-70 hover:opacity-100'}`} title={c.label} />
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
        {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
      </button>

      {/* Add member */}
      <div className="pt-2 border-t border-white/[0.06]">
        <label className="text-xs text-slate-500 block mb-1.5">إضافة عضو</label>
        <div className="flex gap-2">
          <input value={addMemberId} onChange={e => setAddMemberId(e.target.value)}
            placeholder="معرف ARID"
            className="flex-1 bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-600 rounded-lg px-3 py-1.5 text-xs"
            onKeyDown={e => { if (e.key === 'Enter') handleAddMember(); }}
          />
          <button onClick={handleAddMember} disabled={addMemberLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">
            إضافة
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="pt-2 border-t border-white/[0.06]">
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            حذف اللوحة
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-400">سيتم حذف اللوحة نهائياً. هل أنت متأكد؟</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-1.5 rounded-lg text-xs transition-colors">إلغاء</button>
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

export default function BoardHeader({ board }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const qc = useQueryClient();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const starMutation = useMutation({
    mutationFn: () => boardsApi.update(board.id, { is_starred: board.is_starred ? 0 : 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', board.id] }),
  });

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await boardsApi.search(board.id, q);
    setSearchResults(res.results);
  };

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-black/25 backdrop-blur-sm border-b border-white/10 text-white" dir="rtl">
      <Link href={`/${locale}/boards`} className="text-white/60 hover:text-white transition-colors shrink-0" title="مساحات العمل">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </Link>
      <div className="h-4 w-px bg-white/10 shrink-0" />

      <h1 className="font-bold text-base truncate max-w-[180px] sm:max-w-xs">{board.name}</h1>

      <span className="hidden sm:inline-flex text-xs bg-white/15 rounded-full px-2.5 py-0.5 shrink-0 items-center gap-1">
        {board.visibility === 'private' ? '🔒 خاص' : board.visibility === 'public' ? '🌍 عام' : '🏢 المساحة'}
      </span>

      <button onClick={() => starMutation.mutate()}
        className={`shrink-0 text-lg hover:scale-110 transition-transform ${board.is_starred ? 'text-yellow-400' : 'text-white/40 hover:text-white/80'}`}
        title={board.is_starred ? 'إلغاء النجمة' : 'وضع نجمة'}>
        {board.is_starred ? '★' : '☆'}
      </button>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <button onClick={() => setSearchOpen(o => !o)}
          className="text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="hidden sm:inline">بحث</span>
        </button>
        {searchOpen && (
          <div className="absolute top-11 end-0 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-80 p-3 z-50">
            <input autoFocus value={searchQuery} onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث في البطاقات..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] focus:border-blue-500/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none mb-2" />
            {searchResults.length > 0 && (
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {(searchResults as any[]).map(r => (
                  <div key={r.id} className="px-3 py-2 hover:bg-white/[0.06] rounded-xl cursor-pointer text-sm text-slate-300 hover:text-white transition-colors truncate">
                    {r.title ?? r.id}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">لا توجد نتائج</p>
            )}
          </div>
        )}
      </div>

      {/* Quick links */}
      <Link href={`/${locale}/board/${board.id}/timeline`}
        className="hidden sm:flex text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        التسلسل
      </Link>
      <Link href={`/${locale}/board/${board.id}/dashboard`}
        className="hidden sm:flex text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        إحصائيات
      </Link>

      {/* Settings */}
      <div className="relative">
        <button onClick={() => setSettingsOpen(o => !o)}
          className={`text-white/70 hover:text-white text-sm border rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${settingsOpen ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-white/10 hover:bg-white/[0.16] border-white/10 hover:border-white/20'}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span className="hidden sm:inline">إعدادات</span>
        </button>
        {settingsOpen && <BoardSettingsPanel board={board} onClose={() => setSettingsOpen(false)} />}
      </div>
    </header>
  );
}

interface Props {
  board: BoardFull;
}

export default function BoardHeader({ board }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const qc = useQueryClient();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'ar';

  const starMutation = useMutation({
    mutationFn: () => boardsApi.update(board.id, { is_starred: board.is_starred ? 0 : 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', board.id] }),
  });

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await boardsApi.search(board.id, q);
    setSearchResults(res.results);
  };

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-black/25 backdrop-blur-sm border-b border-white/10 text-white" dir="rtl">
      {/* رجوع للوحات */}
      <Link
        href={`/${locale}/boards`}
        className="text-white/60 hover:text-white transition-colors shrink-0"
        title="مساحات العمل"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </Link>

      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* اسم اللوحة */}
      <h1 className="font-bold text-base truncate max-w-[180px] sm:max-w-xs">{board.name}</h1>

      {/* الرؤية */}
      <span className="hidden sm:inline-flex text-xs bg-white/15 rounded-full px-2.5 py-0.5 shrink-0 items-center gap-1">
        {board.visibility === 'private' ? (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C8.7 1 6 3.7 6 7v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V11a2 2 0 00-2-2h-2V7c0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4v2H8V7c0-2.2 1.8-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg> خاص</>
        ) : board.visibility === 'public' ? (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> عام</>
        ) : (
          <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg> المساحة</>
        )}
      </span>

      {/* نجمة */}
      <button
        onClick={() => starMutation.mutate()}
        className={`shrink-0 text-lg hover:scale-110 transition-transform ${board.is_starred ? 'text-yellow-400' : 'text-white/40 hover:text-white/80'}`}
        title={board.is_starred ? 'إلغاء النجمة' : 'وضع نجمة'}
      >
        {board.is_starred ? '★' : '☆'}
      </button>

      <div className="flex-1" />

      {/* البحث */}
      <div className="relative">
        <button
          onClick={() => setSearchOpen(o => !o)}
          className="text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="hidden sm:inline">بحث</span>
        </button>
        {searchOpen && (
          <div className="absolute top-11 end-0 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-80 p-3 z-50">
            <input
              autoFocus
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث في البطاقات..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] focus:border-blue-500/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none mb-2"
            />
            {searchResults.length > 0 && (
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {(searchResults as any[]).map(r => (
                  <div
                    key={r.id}
                    className="px-3 py-2 hover:bg-white/[0.06] rounded-xl cursor-pointer text-sm text-slate-300 hover:text-white transition-colors truncate"
                  >
                    {r.title ?? r.id}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">لا توجد نتائج</p>
            )}
          </div>
        )}
      </div>

      {/* روابط سريعة */}
      <Link
        href={`/${locale}/board/${board.id}/timeline`}
        className="hidden sm:flex text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        التسلسل
      </Link>
      <Link
        href={`/${locale}/board/${board.id}/dashboard`}
        className="hidden sm:flex text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/[0.16] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        إحصائيات
      </Link>
    </header>
  );
}
