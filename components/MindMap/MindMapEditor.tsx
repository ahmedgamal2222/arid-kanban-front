'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface MMNode {
  id: string; label: string; note?: string;
  color: string; shape: string;
  x: number; y: number; width: number; collapsed: number;
  parent_id?: string | null;
}
export interface MMEdge {
  id: string; source_id: string; target_id: string;
  style: string; label?: string; color: string;
}
interface Props {
  mapId: string;
  initialNodes: MMNode[];
  initialEdges: MMEdge[];
  onSave: (nodes: { id: string; x: number; y: number }[]) => Promise<void>;
  onCreateNode: (data: Partial<MMNode>) => Promise<MMNode>;
  onUpdateNode: (id: string, data: Partial<MMNode>) => Promise<void>;
  onDeleteNode: (id: string) => Promise<void>;
  onDeleteEdge: (id: string) => Promise<void>;
  readOnly?: boolean;
}

const NODE_H = 44;
const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#6366f1','#84cc16'];
const SHAPES = [
  { id: 'rounded', label: 'مستطيل' },
  { id: 'circle',  label: 'دائرة' },
  { id: 'diamond', label: 'معين' },
];

function getNodePath(node: MMNode): string {
  const w = Math.max(node.width ?? 160, node.label.length * 10 + 32);
  const h = NODE_H;
  const cx = node.x, cy = node.y;
  if (node.shape === 'circle') {
    const r = Math.max(w, h) / 2;
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
  }
  if (node.shape === 'diamond') {
    const hw = w / 2, hh = h * 0.8;
    return `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`;
  }
  // rounded rect
  const r = 10;
  return `M ${cx - w / 2 + r} ${cy - h / 2}
    H ${cx + w / 2 - r} Q ${cx + w / 2} ${cy - h / 2} ${cx + w / 2} ${cy - h / 2 + r}
    V ${cy + h / 2 - r} Q ${cx + w / 2} ${cy + h / 2} ${cx + w / 2 - r} ${cy + h / 2}
    H ${cx - w / 2 + r} Q ${cx - w / 2} ${cy + h / 2} ${cx - w / 2} ${cy + h / 2 - r}
    V ${cy - h / 2 + r} Q ${cx - w / 2} ${cy - h / 2} ${cx - w / 2 + r} ${cy - h / 2} Z`;
}

function edgePath(src: MMNode, tgt: MMNode): string {
  const dx = tgt.x - src.x, dy = tgt.y - src.y;
  const mx = src.x + dx / 2, my = src.y + dy / 2;
  return `M ${src.x} ${src.y} C ${mx} ${src.y} ${mx} ${tgt.y} ${tgt.x} ${tgt.y}`;
}

export default function MindMapEditor({
  mapId, initialNodes, initialEdges,
  onSave, onCreateNode, onUpdateNode, onDeleteNode, onDeleteEdge, readOnly,
}: Props) {
  const [nodes, setNodes] = useState<MMNode[]>(initialNodes);
  const [edges, setEdges] = useState<MMEdge[]>(initialEdges);
  const [selected, setSelected] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<MMNode | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panStart, setPanStart] = useState<{ mx: number; my: number; px: number; py: number } | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { setNodes(initialNodes); }, [initialNodes]);
  useEffect(() => { setEdges(initialEdges); }, [initialEdges]);

  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top  - pan.y) / zoom,
    };
  }, [pan, zoom]);

  function handleNodePointerDown(e: React.PointerEvent, nodeId: string) {
    if (readOnly) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    const n = nodes.find(n => n.id === nodeId)!;
    setDragging({ id: nodeId, ox: x - n.x, oy: y - n.y });
    setSelected(nodeId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragging) {
      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      setNodes(prev => prev.map(n =>
        n.id === dragging.id ? { ...n, x: x - dragging.ox, y: y - dragging.oy } : n
      ));
    } else if (panStart) {
      setPan({ x: panStart.px + e.clientX - panStart.mx, y: panStart.py + e.clientY - panStart.my });
    }
  }

  async function handlePointerUp() {
    if (dragging && !readOnly) {
      const n = nodes.find(n => n.id === dragging.id);
      if (n) await onUpdateNode(n.id, { x: n.x, y: n.y });
    }
    setDragging(null);
    setPanStart(null);
  }

  function handleSvgPointerDown(e: React.PointerEvent) {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'svg') {
      setSelected(null);
      setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
    }
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.2, Math.min(3, z * delta)));
  }

  async function handleAddChild() {
    if (!selected) return toast.error('اختر عقدة أولاً');
    const parent = nodes.find(n => n.id === selected)!;
    const newNode = await onCreateNode({
      parent_id: selected,
      x: parent.x + 200,
      y: parent.y + 80 * (nodes.filter(n => n.parent_id === selected).length),
      color: parent.color,
      shape: parent.shape,
    });
    setNodes(prev => [...prev, newNode]);
    setEdges(prev => [...prev, {
      id: `e-${newNode.id}`,
      source_id: selected, target_id: newNode.id,
      style: 'bezier', color: '#64748b',
    }]);
    setSelected(newNode.id);
  }

  async function handleAddRoot() {
    const newNode = await onCreateNode({ x: 400, y: 300, color: '#3b82f6', shape: 'rounded' });
    setNodes(prev => [...prev, newNode]);
    setSelected(newNode.id);
  }

  async function handleDeleteSelected() {
    if (!selected) return;
    const n = nodes.find(n => n.id === selected);
    if (!n) return;
    if (!confirm(`حذف "${n.label}"؟`)) return;
    await onDeleteNode(selected);
    setNodes(prev => prev.filter(n => n.id !== selected));
    setEdges(prev => prev.filter(e => e.source_id !== selected && e.target_id !== selected));
    setSelected(null);
  }

  function openEdit(node: MMNode) {
    setEditNode(node);
    setEditLabel(node.label);
  }

  async function saveEdit() {
    if (!editNode) return;
    await onUpdateNode(editNode.id, {
      label: editLabel,
      note: editNode.note,
      color: editNode.color,
      shape: editNode.shape,
    });
    setNodes(prev => prev.map(n => n.id === editNode.id ? { ...n, ...editNode, label: editLabel } : n));
    setEditNode(null);
  }

  async function handleSavePositions() {
    setSaving(true);
    try {
      await onSave(nodes.map(n => ({ id: n.id, x: n.x, y: n.y })));
      toast.success('تم الحفظ');
    } catch { toast.error('فشل الحفظ'); }
    finally { setSaving(false); }
  }

  const selNode = nodes.find(n => n.id === selected);

  return (
    <div className="flex h-full" dir="rtl">
      {/* Toolbar */}
      <div className="w-56 flex-shrink-0 bg-[#0a0f1e] border-l border-white/[0.08] flex flex-col gap-2 p-3 overflow-y-auto">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">أدوات</p>

        <button onClick={handleAddRoot}
          className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 text-xs px-3 py-2 rounded-xl transition-all">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          عقدة جديدة
        </button>

        <button onClick={handleAddChild} disabled={!selected}
          className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 disabled:opacity-40 text-xs px-3 py-2 rounded-xl transition-all">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          إضافة فرع
        </button>

        {selNode && (
          <button onClick={() => openEdit(selNode)}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 text-xs px-3 py-2 rounded-xl transition-all">
            ✏️ تعديل العقدة
          </button>
        )}

        <button onClick={handleDeleteSelected} disabled={!selected}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 disabled:opacity-40 text-xs px-3 py-2 rounded-xl transition-all">
          🗑 حذف المحدد
        </button>

        <div className="border-t border-white/[0.07] pt-2 mt-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">التكبير</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="w-7 h-7 flex items-center justify-center bg-white/[0.05] rounded-lg text-white text-sm">−</button>
            <span className="text-xs text-slate-400 flex-1 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="w-7 h-7 flex items-center justify-center bg-white/[0.05] rounded-lg text-white text-sm">+</button>
          </div>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-full mt-1 text-[11px] text-slate-500 hover:text-slate-300 bg-white/[0.03] rounded-lg py-1.5 transition-colors">
            إعادة ضبط
          </button>
        </div>

        <div className="border-t border-white/[0.07] pt-2 mt-1">
          <button onClick={handleSavePositions} disabled={saving || readOnly}
            className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 disabled:opacity-50 text-xs px-3 py-2 rounded-xl transition-all">
            {saving ? 'جارٍ الحفظ...' : '💾 حفظ التخطيط'}
          </button>
        </div>

        {selNode && (
          <div className="border-t border-white/[0.07] pt-2 mt-1">
            <p className="text-[10px] text-slate-500 mb-2">العقدة المحددة</p>
            <div className="bg-white/[0.04] rounded-xl p-2.5 space-y-1.5">
              <p className="text-xs text-white font-medium truncate">{selNode.label}</p>
              <p className="text-[10px] text-slate-500">الشكل: {SHAPES.find(s => s.id === selNode.shape)?.label}</p>
              <div className="flex gap-1">
                {COLORS.slice(0, 5).map(c => (
                  <button key={c} onClick={async () => {
                    await onUpdateNode(selNode.id, { color: c });
                    setNodes(prev => prev.map(n => n.id === selNode.id ? { ...n, color: c } : n));
                  }} className={`w-5 h-5 rounded-full border-2 transition-all ${selNode.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#060b18]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handleSvgPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map(e => {
              const src = nodes.find(n => n.id === e.source_id);
              const tgt = nodes.find(n => n.id === e.target_id);
              if (!src || !tgt) return null;
              return (
                <g key={e.id}>
                  <path d={edgePath(src, tgt)} fill="none" stroke={e.color} strokeWidth={2} strokeOpacity={0.6} />
                  {e.label && (
                    <text x={(src.x + tgt.x) / 2} y={(src.y + tgt.y) / 2 - 6}
                      textAnchor="middle" fill="#94a3b8" fontSize={11}>{e.label}</text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = selected === node.id;
              const w = Math.max(node.width ?? 160, node.label.length * 10 + 32);
              return (
                <g key={node.id}
                  onPointerDown={e => handleNodePointerDown(e, node.id)}
                  onDoubleClick={() => !readOnly && openEdit(node)}
                  style={{ cursor: readOnly ? 'default' : 'pointer' }}>
                  <path
                    d={getNodePath(node)}
                    fill={node.color + '22'}
                    stroke={node.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter={isSelected ? 'drop-shadow(0 0 8px ' + node.color + '88)' : undefined}
                  />
                  <foreignObject
                    x={node.x - w / 2 + 8}
                    y={node.y - NODE_H / 2 + 4}
                    width={w - 16}
                    height={NODE_H - 8}
                    style={{ pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{
                        color: 'white', fontSize: 13, fontWeight: 500,
                        textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.3,
                      }}>{node.label}</span>
                    </div>
                  </foreignObject>
                  {node.note && (
                    <circle cx={node.x + w / 2 - 8} cy={node.y - NODE_H / 2 + 8} r={5}
                      fill="#f59e0b" opacity={0.8} />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="text-5xl mb-4 opacity-30">🧠</div>
            <p className="text-slate-500 text-sm">انقر "عقدة جديدة" لبدء الخريطة الذهنية</p>
          </div>
        )}
      </div>

      {/* Edit Node Modal */}
      {editNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditNode(null)}>
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()} dir="rtl">
            <h3 className="text-sm font-bold text-white mb-4">تعديل العقدة</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">العنوان</label>
                <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  className="w-full bg-white/[0.06] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">ملاحظة</label>
                <textarea value={editNode.note ?? ''} rows={2}
                  onChange={e => setEditNode(n => n ? { ...n, note: e.target.value } : n)}
                  className="w-full bg-white/[0.06] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اللون</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setEditNode(n => n ? { ...n, color: c } : n)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${editNode.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">الشكل</label>
                <div className="flex gap-2">
                  {SHAPES.map(s => (
                    <button key={s.id} onClick={() => setEditNode(n => n ? { ...n, shape: s.id } : n)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${editNode.shape === s.id ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-white/[0.04] border-white/[0.08] text-slate-400'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditNode(null)} className="flex-1 bg-white/[0.05] border border-white/10 text-slate-300 py-2 rounded-xl text-sm">إلغاء</button>
              <button onClick={saveEdit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl text-sm transition-colors">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
