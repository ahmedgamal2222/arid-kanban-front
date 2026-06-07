'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api';
import type { Comment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Props {
  comments: Comment[];
  cardId: string;
  boardId: string;
}

export default function CommentSection({ comments, cardId, boardId }: Props) {
  const [body, setBody] = useState('');
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => commentsApi.create(cardId, { body }),
    onSuccess: () => {
      setBody('');
      qc.invalidateQueries({ queryKey: ['card', cardId] });
    },
    onError: () => toast.error('فشل إرسال التعليق'),
  });

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2">
        💬 التعليقات {comments.length > 0 && <span className="bg-white/[0.08] text-slate-400 rounded-full text-[10px] px-2 py-0.5">{comments.length}</span>}
      </h3>

      {/* قائمة التعليقات */}
      <div className="space-y-3 mb-4">
        {comments.map(c => (
          <CommentItem key={c.id} comment={c} cardId={cardId} />
        ))}
      </div>

      {/* نموذج تعليق جديد */}
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full bg-blue-400 text-white flex items-center justify-center text-sm font-semibold shrink-0">م</div>
        <div className="flex-1">
          <textarea
            rows={2}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="w-full rounded-xl border border-white/[0.10] bg-white/[0.06] hover:border-white/[0.18] focus:border-blue-500/60 focus:bg-white/[0.08] focus:outline-none px-3 py-2 text-sm text-white placeholder-slate-500 resize-none transition-all"
          />
          {body.trim() && (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="mt-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg transition"
            >
              {createMutation.isPending ? 'جارٍ...' : 'حفظ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, cardId }: { comment: Comment; cardId: string }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => commentsApi.update(comment.id, { body }),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ['card', cardId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentsApi.delete(comment.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', cardId] }),
  });

  return (
    <div className="flex gap-3 group">
      <div className="w-7 h-7 rounded-full bg-blue-400 text-white flex items-center justify-center text-sm font-semibold shrink-0">
        {comment.arid_researcher_id.slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-300">
            {comment.arid_researcher_id}
          </span>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(comment.created_at * 1000), { addSuffix: true, locale: ar })}
          </span>
          {!!comment.is_edited && <span className="text-xs text-slate-600">(معدَّل)</span>}
        </div>

        {editing ? (
          <div>
            <textarea
              autoFocus
              rows={3}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full rounded-xl border border-blue-500/60 bg-white/[0.06] focus:outline-none px-3 py-2 text-sm text-white resize-none"
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                حفظ
              </button>
              <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">إلغاء</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.body}</p>
        )}

        {!editing && (
          <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => { setBody(comment.body); setEditing(true); }} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">تعديل</button>
            <button onClick={() => deleteMutation.mutate()} className="text-xs text-red-500 hover:text-red-400 transition-colors">حذف</button>
          </div>
        )}
      </div>
    </div>
  );
}
