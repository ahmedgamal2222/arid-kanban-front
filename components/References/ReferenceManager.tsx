'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referencesApi, workspacesApi } from '@/lib/api';
import toast from 'react-hot-toast';

const REF_TYPES = [
  { id: 'article',    label: 'مقالة', icon: '📄' },
  { id: 'book',       label: 'كتاب',  icon: '📚' },
  { id: 'conference', label: 'مؤتمر', icon: '🎤' },
  { id: 'thesis',     label: 'رسالة', icon: '🎓' },
  { id: 'report',     label: 'تقرير', icon: '📊' },
  { id: 'webpage',    label: 'موقع',  icon: '🌐' },
  { id: 'other',      label: 'أخرى',  icon: '📎' },
];

function cite(ref: any, style: 'apa' | 'mla' | 'bibtex'): string {
  const authors: string[] = JSON.parse(ref.authors ?? '[]');
  const authStr = authors.join(', ') || 'مؤلف مجهول';
  if (style === 'bibtex') {
    if (ref.raw_bibtex) return ref.raw_bibtex;
    const type = ref.type === 'article' ? 'article' : ref.type === 'book' ? 'book' : 'misc';
    const lines = [
      `@${type}{${ref.bibtex_key ?? 'ref' + ref.id.slice(0,4)},`,
      `  author = {${authStr}},`,
      `  title = {${ref.title}},`,
      ref.year ? `  year = {${ref.year}},` : '',
      ref.journal ? `  journal = {${ref.journal}},` : '',
      ref.volume ? `  volume = {${ref.volume}},` : '',
      ref.pages ? `  pages = {${ref.pages}},` : '',
      ref.doi ? `  doi = {${ref.doi}},` : '',
      `}`,
    ].filter(Boolean);
    return lines.join('\n');
  }
  if (style === 'mla') {
    const parts = [authStr, `"${ref.title}"`, ref.journal ?? ref.publisher ?? '', ref.year ? String(ref.year) : ''].filter(Boolean);
    return parts.join('. ') + '.';
  }
  // APA
  const parts = [
    `${authStr} (${ref.year ?? 'n.d.'}).`,
    `${ref.title}.`,
    ref.journal ? `*${ref.journal}*,` : '',
    ref.volume ? `${ref.volume}(${ref.issue ?? ''}),` : '',
    ref.pages ? `${ref.pages}.` : '',
    ref.doi ? `https://doi.org/${ref.doi}` : ref.url ?? '',
  ].filter(Boolean);
  return parts.join(' ');
}

function AddReferenceModal({ wsId, onClose, onAdded }: { wsId: string; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    type: 'article', title: '', authors: '', year: '', journal: '', volume: '',
    issue: '', pages: '', publisher: '', doi: '', url: '', abstract: '', keywords: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [doiLoading, setDoiLoading] = useState(false);
  const [tab, setTab] = useState<'form' | 'bibtex'>('form');
  const [bibtexText, setBibtexText] = useState('');

  async function fetchDOI() {
    if (!form.doi.trim()) return;
    setDoiLoading(true);
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(form.doi.trim())}`);
      if (!res.ok) throw new Error();
      const data = await res.json() as any;
      const item = data.message;
      const authors = (item.author ?? []).map((a: any) => `${a.family ?? ''} ${a.given ?? ''}`.trim());
      setForm(f => ({
        ...f,
        title: item.title?.[0] ?? f.title,
        authors: authors.join('; '),
        year: String(item.published?.['date-parts']?.[0]?.[0] ?? f.year),
        journal: item['container-title']?.[0] ?? item['publisher'] ?? f.journal,
        volume: item.volume ?? f.volume,
        issue: item.issue ?? f.issue,
        pages: item.page ?? f.pages,
        publisher: item.publisher ?? f.publisher,
      }));
      toast.success('تم جلب البيانات من DOI');
    } catch { toast.error('تعذّر جلب بيانات DOI'); }
    finally { setDoiLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('العنوان مطلوب');
    setLoading(true);
    try {
      if (tab === 'bibtex') {
        await referencesApi.importBibtex(wsId, bibtexText);
        toast.success('تم الاستيراد');
      } else {
        await referencesApi.create(wsId, {
          ...form,
          authors: form.authors.split(';').map(a => a.trim()).filter(Boolean),
          year: form.year ? parseInt(form.year) : undefined,
          keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        });
        toast.success('تمت الإضافة');
      }
      onAdded();
      onClose();
    } catch (err: any) { toast.error(err.message ?? 'فشل'); }
    finally { setLoading(false); }
  }

  const inp = 'w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="sticky top-0 bg-[#111827] border-b border-white/[0.07] px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">إضافة مرجع جديد</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-5">
          <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-5">
            {(['form', 'bibtex'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'form' ? 'إدخال يدوي' : 'استيراد BibTeX'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'bibtex' ? (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">أدخل كود BibTeX</label>
                <textarea value={bibtexText} onChange={e => setBibtexText(e.target.value)} rows={10}
                  placeholder={'@article{key,\n  author = {Last, First},\n  title = {Title},\n  year = {2024},\n  ...}'}
                  className={`${inp} font-mono text-xs resize-y`} dir="ltr" />
              </div>
            ) : (
              <>
                {/* Type selector - full width */}
                <div>
                  <label className="text-xs text-slate-400 block mb-2">نوع المرجع</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {REF_TYPES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t.id }))}
                        className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                          form.type === t.id
                            ? 'bg-blue-600/25 border-blue-500/60 text-blue-200 shadow-sm'
                            : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 hover:border-white/[0.16]'
                        }`}
                      >
                        <span className="text-lg leading-none">{t.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">DOI <span className="text-slate-600">(اختياري)</span></label>
                    <div className="flex gap-2">
                      <input value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))}
                        placeholder="10.xxxx/..." className={`${inp} flex-1`} dir="ltr" />
                      <button type="button" onClick={fetchDOI} disabled={doiLoading}
                        className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs px-3 rounded-xl transition-all whitespace-nowrap disabled:opacity-50">
                        {doiLoading ? '...' : 'جلب'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">العنوان *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="عنوان البحث أو الكتاب" className={inp} />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">المؤلفون <span className="text-slate-600">(مفصولون بـ ;)</span></label>
                  <input value={form.authors} onChange={e => setForm(f => ({ ...f, authors: e.target.value }))}
                    placeholder="الشمري، أحمد; السعيد، محمد" className={inp} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-slate-400 block mb-1">السنة</label>
                    <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                      placeholder="2024" className={inp} /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">المجلة/الناشر</label>
                    <input value={form.journal} onChange={e => setForm(f => ({ ...f, journal: e.target.value }))}
                      placeholder="اسم المجلة" className={inp} /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">المجلد/الصفحات</label>
                    <input value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                      placeholder="12 (3), 45-67" className={inp} /></div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">الملخص</label>
                  <textarea value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} rows={3}
                    placeholder="ملخص الورقة البحثية..." className={`${inp} resize-y`} />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">الكلمات المفتاحية <span className="text-slate-600">(مفصولة بـ ,)</span></label>
                  <input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                    placeholder="تعلم آلي, شبكات عصبية" className={inp} />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 bg-white/[0.05] border border-white/10 text-slate-300 py-2.5 rounded-xl text-sm">إلغاء</button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                {loading ? 'جارٍ الحفظ...' : tab === 'bibtex' ? 'استيراد' : 'إضافة المرجع'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ReferenceManager({ wsId }: { wsId: string }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [citeStyle, setCiteStyle] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['references', wsId, query, typeFilter],
    queryFn: () => referencesApi.list(wsId, query, typeFilter),
    enabled: !!wsId,
  });

  const refs = data?.references ?? [];

  function handleCopy(ref: any) {
    navigator.clipboard.writeText(cite(ref, citeStyle));
    toast.success('تم النسخ');
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا المرجع؟')) return;
    try {
      await referencesApi.delete(id);
      qc.invalidateQueries({ queryKey: ['references', wsId] });
      if (selected?.id === id) setSelected(null);
      toast.success('تم الحذف');
    } catch { toast.error('فشل الحذف'); }
  }

  return (
    <div className="flex h-full" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col border-l border-white/[0.07] bg-[#0a0f1e]">
        <div className="p-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2 mb-3">
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="بحث في المراجع..."
              className="flex-1 bg-white/[0.05] border border-white/10 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm" />
            <button onClick={() => setShowAdd(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-xl transition-colors font-medium flex-shrink-0">
              + إضافة
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setTypeFilter('')}
              className={`text-[10px] px-2 py-1 rounded-lg transition-all ${!typeFilter ? 'bg-blue-600/20 text-blue-300' : 'bg-white/[0.04] text-slate-500 hover:text-slate-300'}`}>
              الكل
            </button>
            {REF_TYPES.map(t => (
              <button key={t.id} onClick={() => setTypeFilter(typeFilter === t.id ? '' : t.id)}
                className={`text-[10px] px-2 py-1 rounded-lg transition-all ${typeFilter === t.id ? 'bg-blue-600/20 text-blue-300' : 'bg-white/[0.04] text-slate-500 hover:text-slate-300'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" /></div>
          ) : refs.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-sm px-4">
              {query ? 'لا نتائج' : 'لا توجد مراجع بعد'}
            </div>
          ) : refs.map((ref: any) => {
            const typeInfo = REF_TYPES.find(t => t.id === ref.type) ?? REF_TYPES[REF_TYPES.length - 1]!;
            const authors: string[] = JSON.parse(ref.authors ?? '[]');
            const isSelected = selected?.id === ref.id;
            return (
              <button key={ref.id} onClick={() => setSelected(isSelected ? null : ref)}
                className={`w-full flex gap-3 items-start px-4 py-3.5 text-start transition-all ${isSelected ? 'bg-blue-500/[0.08]' : 'hover:bg-white/[0.03]'}`}>
                <span className="text-xl mt-0.5 flex-shrink-0">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-snug ${isSelected ? 'text-blue-200' : 'text-slate-200'} line-clamp-2`}>{ref.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{authors.slice(0, 2).join(', ')}{authors.length > 2 ? ' وآخرون' : ''}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {ref.year && <span className="text-[10px] text-slate-600">{ref.year}</span>}
                    {ref.doi && <span className="text-[10px] text-blue-500 truncate max-w-[120px]">DOI</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-4 py-2 border-t border-white/[0.07] text-[10px] text-slate-600">
          {refs.length} مرجع
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4 opacity-20">📚</div>
            <p className="text-slate-500 text-sm">اختر مرجعاً لعرض تفاصيله</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{REF_TYPES.find(t => t.id === selected.type)?.icon ?? '📎'}</span>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                    {REF_TYPES.find(t => t.id === selected.type)?.label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">{selected.title}</h2>
              </div>
              <button onClick={() => handleDelete(selected.id)}
                className="text-red-500 hover:text-red-400 transition-colors text-sm flex-shrink-0 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
                حذف
              </button>
            </div>

            <div className="space-y-4">
              {JSON.parse(selected.authors ?? '[]').length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">المؤلفون</p>
                  <p className="text-sm text-slate-200">{JSON.parse(selected.authors).join(' • ')}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                {selected.year && <div><p className="text-[10px] text-slate-500">السنة</p><p className="text-sm text-white">{selected.year}</p></div>}
                {selected.journal && <div><p className="text-[10px] text-slate-500">المجلة</p><p className="text-sm text-white">{selected.journal}</p></div>}
                {selected.volume && <div><p className="text-[10px] text-slate-500">المجلد</p><p className="text-sm text-white">{selected.volume}</p></div>}
                {selected.pages && <div><p className="text-[10px] text-slate-500">الصفحات</p><p className="text-sm text-white">{selected.pages}</p></div>}
              </div>
              {selected.doi && (
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">DOI</p>
                  <a href={`https://doi.org/${selected.doi}`} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline" dir="ltr">{selected.doi}</a>
                </div>
              )}
              {selected.abstract && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">الملخص</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{selected.abstract}</p>
                </div>
              )}
              {JSON.parse(selected.keywords ?? '[]').length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">الكلمات المفتاحية</p>
                  <div className="flex flex-wrap gap-1.5">
                    {JSON.parse(selected.keywords).map((k: string) => (
                      <span key={k} className="text-[11px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Citation section */}
              <div className="border-t border-white/[0.07] pt-4">
                <p className="text-xs font-semibold text-slate-300 mb-3">📋 الاستشهاد المرجعي</p>
                <div className="flex gap-1 mb-3">
                  {(['apa', 'mla', 'bibtex'] as const).map(s => (
                    <button key={s} onClick={() => setCiteStyle(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${citeStyle === s ? 'bg-blue-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:text-white'}`}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 relative">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{cite(selected, citeStyle)}</pre>
                  <button onClick={() => handleCopy(selected)}
                    className="absolute top-2 left-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-slate-300 text-[10px] px-2 py-1 rounded-lg transition-all">
                    نسخ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddReferenceModal wsId={wsId} onClose={() => setShowAdd(false)} onAdded={() => qc.invalidateQueries({ queryKey: ['references', wsId] })} />}
    </div>
  );
}
