'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { workspacesApi } from '@/lib/api';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ReferenceManager = dynamic(() => import('@/components/References/ReferenceManager'), { ssr: false });

export default function ReferencesPageClient() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [activeWsId, setActiveWsId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesApi.list(),
  });

  const workspaces = data?.workspaces ?? [];

  // Auto-select first workspace
  if (!activeWsId && workspaces.length > 0 && workspaces[0]) {
    setActiveWsId(workspaces[0].id);
  }

  return (
    <div className="flex flex-col h-screen bg-[#060b18] text-white" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.07] bg-[#0a0f1e] flex-shrink-0">
        <button onClick={() => router.push(`/${locale}/boards`)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          المساحات
        </button>
        <div className="w-px h-5 bg-white/10" />
        <span className="text-base font-bold text-white">📚 إدارة المراجع البحثية</span>

        {/* Workspace tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {workspaces.map(ws => (
            <button key={ws.id} onClick={() => setActiveWsId(ws.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${activeWsId === ws.id ? 'bg-blue-600 text-white' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.09]'}`}>
              {ws.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeWsId ? (
          <ReferenceManager wsId={activeWsId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4 opacity-30">📚</div>
            <p className="text-slate-500">اختر مساحة عمل لعرض مراجعها</p>
          </div>
        )}
      </div>
    </div>
  );
}
