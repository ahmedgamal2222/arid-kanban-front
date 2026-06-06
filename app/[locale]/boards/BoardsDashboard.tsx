'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { workspacesApi, boardsApi, authApi, session } from '@/lib/api';
import type { Workspace, Board } from '@/lib/types';
import NotificationBell from '@/components/Notifications/Bell';

// ── Logout helper ──
function useLogout() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  return () => {
    session.clear();
    router.replace(`/${locale}/login`);
  };
}

// ── Icons ──
function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".45" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".95" />
    </svg>
  );
}

// ── Create workspace modal ──
function CreateWorkspaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: (ws: Workspace) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await workspacesApi.create({ name: name.trim(), description: desc.trim() || undefined });
      onCreated(res.workspace);
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-4">مساحة عمل جديدة</h2>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text" required autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="اسم مساحة العمل"
            className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm"
          />
          <input
            type="text" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="وصف اختياري"
            className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm"
          />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2.5 rounded-xl text-sm transition-colors">إلغاء</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create board modal ──
function CreateBoardModal({ workspace, onClose, onCreated }: { workspace: Workspace; onClose: () => void; onCreated: (b: Board) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await boardsApi.create({ workspace_id: workspace.id, name: name.trim() });
      onCreated(res.board);
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-slate-500 mb-1">مساحة العمل: <span className="text-slate-400">{workspace.name}</span></p>
        <h2 className="text-lg font-bold text-white mb-4">لوحة جديدة</h2>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text" required autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="اسم اللوحة"
            className="w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm"
          />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2.5 rounded-xl text-sm transition-colors">إلغاء</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Board colors palette ──
const BOARD_COLORS = [
  'linear-gradient(135deg,#2563eb,#4338ca)',
  'linear-gradient(135deg,#7c3aed,#7e22ce)',
  'linear-gradient(135deg,#059669,#0f766e)',
  'linear-gradient(135deg,#ea580c,#b45309)',
  'linear-gradient(135deg,#db2777,#be123c)',
  'linear-gradient(135deg,#0891b2,#0369a1)',
];
function getBoardColor(id: string) {
  const idx = id.charCodeAt(0) % BOARD_COLORS.length;
  return BOARD_COLORS[idx];
}

// ── Main component ──
export default function BoardsDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const logout = useLogout();

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [boardsMap, setBoardsMap] = useState<Record<string, Board[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateWs, setShowCreateWs] = useState(false);
  const [createBoardFor, setCreateBoardFor] = useState<Workspace | null>(null);

  // Auth guard
  useEffect(() => {
    if (!session.getToken()) {
      router.replace(`/${locale}/login`);
    }
  }, [router, locale]);

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [meRes, wsRes] = await Promise.all([
          authApi.me(),
          workspacesApi.list(),
        ]);
        setUser({ name: meRes.name, email: meRes.email });
        const wsList = wsRes.workspaces;
        setWorkspaces(wsList);

        // Load boards for each workspace in parallel
        const entries = await Promise.all(
          wsList.map(ws =>
            workspacesApi.boards(ws.id)
              .then(r => [ws.id, r.boards] as [string, Board[]])
              .catch(() => [ws.id, []] as [string, Board[]])
          )
        );
        setBoardsMap(Object.fromEntries(entries));
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('مصادقة')) {
          session.clear();
          router.replace(`/${locale}/login`);
        } else {
          setError(err.message ?? 'فشل تحميل البيانات');
        }
      } finally {
        setLoading(false);
      }
    }
    if (session.getToken()) load();
  }, [router]);

  function handleWorkspaceCreated(ws: Workspace) {
    setWorkspaces(prev => [ws, ...prev]);
    setBoardsMap(prev => ({ ...prev, [ws.id]: [] }));
    setShowCreateWs(false);
  }

  function handleBoardCreated(board: Board) {
    setBoardsMap(prev => ({
      ...prev,
      [board.workspace_id]: [board, ...(prev[board.workspace_id] ?? [])],
    }));
    setCreateBoardFor(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <LogoIcon />
          </div>
          <p className="text-slate-500 text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCreateWs && (
        <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} onCreated={handleWorkspaceCreated} />
      )}
      {createBoardFor && (
        <CreateBoardModal workspace={createBoardFor} onClose={() => setCreateBoardFor(null)} onCreated={handleBoardCreated} />
      )}

      <div dir="rtl" className="min-h-screen bg-[#060b18] text-white">

        {/* Background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full bg-blue-700/10 blur-[140px]" />
        </div>

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-3.5 border-b border-white/[0.06] bg-[#060b18]/80 backdrop-blur-sm sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <LogoIcon />
            </div>
            <span className="font-bold text-[16px] tracking-tight text-white">ARID <span className="text-blue-400">Kanban</span></span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm text-slate-300 hidden sm:block">{user.name}</span>
              </div>
            )}
            <NotificationBell />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.07] px-3 py-2 rounded-xl transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              خروج
            </button>
          </div>
        </nav>

        {/* Content */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">

          {/* Header row */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold text-white">مساحات العمل</h1>
              <p className="text-slate-500 text-sm mt-1">إدارة لوحاتك ومشاريعك البحثية</p>
            </div>
            <button
              onClick={() => setShowCreateWs(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-900/40"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              مساحة عمل جديدة
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-5 py-4 mb-8 text-sm">{error}</div>
          )}

          {/* Empty state */}
          {workspaces.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">لا توجد مساحات عمل بعد</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">أنشئ مساحة عملك الأولى وابدأ في تنظيم مشاريعك البحثية</p>
              <button
                onClick={() => setShowCreateWs(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                إنشاء مساحة عمل
              </button>
            </div>
          )}

          {/* Workspaces list */}
          <div className="space-y-10">
            {workspaces.map(ws => {
              const boards = boardsMap[ws.id] ?? [];
              return (
                <section key={ws.id}>
                  {/* Workspace header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-sm font-bold">
                        {ws.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-semibold text-white text-[15px]">{ws.name}</h2>
                        {ws.description && <p className="text-xs text-slate-500 mt-0.5">{ws.description}</p>}
                      </div>
                      <span className="text-xs text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                        {boards.length} لوحة
                      </span>
                    </div>
                    <button
                      onClick={() => setCreateBoardFor(ws)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] px-3 py-1.5 rounded-lg transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      لوحة جديدة
                    </button>
                  </div>

                  {/* Boards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {boards.map(board => (
                      <Link
                        key={board.id}
                        href={`/${locale}/board/${board.id}`}
                        className="group relative rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/15 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40"
                      >
                        {/* Color band */}
                        <div className="h-20 opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: getBoardColor(board.id) }} />
                        <div className="bg-[#0d1425] px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-white text-sm leading-snug">{board.name}</h3>
                            {board.is_starred === 1 && (
                              <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            )}
                          </div>
                          <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full ${board.visibility === 'public' ? 'bg-green-500/15 text-green-400' : board.visibility === 'workspace' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-500/15 text-slate-400'}`}>
                            {board.visibility === 'public' ? 'عام' : board.visibility === 'workspace' ? 'للمساحة' : 'خاص'}
                          </span>
                        </div>
                      </Link>
                    ))}

                    {/* Add board button */}
                    <button
                      onClick={() => setCreateBoardFor(ws)}
                      className="group h-[calc(20px+72px)] rounded-2xl border border-dashed border-white/[0.07] hover:border-blue-500/30 hover:bg-blue-500/[0.04] flex flex-col items-center justify-center gap-2 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-blue-500/10 border border-white/[0.08] group-hover:border-blue-500/20 flex items-center justify-center transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-500 group-hover:text-blue-400 transition-colors"><path d="M12 5v14M5 12h14"/></svg>
                      </div>
                      <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">لوحة جديدة</span>
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
