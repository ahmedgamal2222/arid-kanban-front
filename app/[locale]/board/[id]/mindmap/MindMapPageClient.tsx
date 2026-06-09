'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { mindMapsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const MindMapEditor = dynamic(() => import('@/components/MindMap/MindMapEditor'), { ssr: false });

export default function MindMapPageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const boardId = pathname.split('/board/')[1]?.split('/')[0] ?? '';
  const qc = useQueryClient();

  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: mapsData, isLoading } = useQuery({
    queryKey: ['mind-maps', boardId],
    queryFn: () => mindMapsApi.list(boardId),
    enabled: !!boardId,
  });

  const { data: mapData } = useQuery({
    queryKey: ['mind-map', activeMapId],
    queryFn: () => mindMapsApi.get(activeMapId!),
    enabled: !!activeMapId,
  });

  const maps = mapsData?.mind_maps ?? [];
  const currentMap = mapData?.mind_map;

  async function handleCreateMap() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await mindMapsApi.create(boardId, { title: newTitle.trim() });
      qc.invalidateQueries({ queryKey: ['mind-maps', boardId] });
      setActiveMapId(res.mind_map.id);
      setShowCreate(false);
      setNewTitle('');
      toast.success('تم إنشاء الخريطة');
    } catch { toast.error('فشل الإنشاء'); }
    finally { setCreating(false); }
  }

  async function handleDeleteMap(id: string) {
    if (!confirm('حذف هذه الخريطة؟')) return;
    try {
      await mindMapsApi.delete(id);
      qc.invalidateQueries({ queryKey: ['mind-maps', boardId] });
      if (activeMapId === id) setActiveMapId(null);
      toast.success('تم الحذف');
    } catch { toast.error('فشل الحذف'); }
  }

  return (
    <div className="flex flex-col h-screen bg-[#060b18] text-white" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.07] bg-[#0a0f1e] flex-shrink-0">
        <button onClick={() => router.push(`/${locale}/board/${boardId}`)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          العودة للوحة
        </button>
        <div className="w-px h-5 bg-white/10" />
        <span className="text-base font-bold text-white">🧠 الخرائط الذهنية</span>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {maps.map(m => (
            <div key={m.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setActiveMapId(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeMapId === m.id ? 'bg-blue-600 text-white' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.09]'}`}>
                {m.title}
              </button>
              <button onClick={() => handleDeleteMap(m.id)} className="text-slate-600 hover:text-red-400 transition-colors text-xs p-1">✕</button>
            </div>
          ))}
        </div>

        {showCreate ? (
          <div className="flex items-center gap-2">
            <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateMap()}
              placeholder="اسم الخريطة..."
              className="bg-white/[0.06] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white text-xs rounded-lg px-3 py-1.5 w-40" />
            <button onClick={handleCreateMap} disabled={creating}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              {creating ? '...' : 'إنشاء'}
            </button>
            <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white text-xs">إلغاء</button>
          </div>
        ) : (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            خريطة جديدة
          </button>
        )}
      </div>

      {/* Content */}
      {!activeMapId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          {isLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          ) : maps.length === 0 ? (
            <>
              <div className="text-6xl mb-5 opacity-40">🧠</div>
              <h2 className="text-xl font-bold text-white mb-2">لا توجد خرائط ذهنية</h2>
              <p className="text-slate-500 text-sm mb-6">أنشئ خريطة ذهنية لتنظيم أفكارك البحثية بشكل بصري</p>
              <button onClick={() => setShowCreate(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                إنشاء خريطة ذهنية
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full">
              {maps.map(m => (
                <button key={m.id} onClick={() => setActiveMapId(m.id)}
                  className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-blue-500/30 rounded-2xl p-5 text-start transition-all">
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="font-semibold text-white text-sm">{m.title}</h3>
                  {m.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : currentMap ? (
        <div className="flex-1 overflow-hidden">
          <MindMapEditor
            mapId={activeMapId}
            initialNodes={(currentMap as any).nodes ?? []}
            initialEdges={(currentMap as any).edges ?? []}
            onSave={async (nodes) => { await mindMapsApi.bulkUpdate(activeMapId, nodes); }}
            onCreateNode={async (data) => {
              const res = await mindMapsApi.createNode(activeMapId, data);
              qc.invalidateQueries({ queryKey: ['mind-map', activeMapId] });
              return res.node;
            }}
            onUpdateNode={async (id, data) => { await mindMapsApi.updateNode(id, data); }}
            onDeleteNode={async (id) => {
              await mindMapsApi.deleteNode(id);
              qc.invalidateQueries({ queryKey: ['mind-map', activeMapId] });
            }}
            onDeleteEdge={async (id) => { await mindMapsApi.deleteEdge(id); }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
