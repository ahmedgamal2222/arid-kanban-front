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
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
        💬 التعليقات {comments.length > 0 && <span className="bg-gray-200 dark:bg-gray-600 rounded-full text-xs px-2">{comments.length}</span>}
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
            placeholder="اكتب تعليقاً... (يدعم Markdown)"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none dark:text-white"
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
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {comment.arid_researcher_id}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.created_at * 1000), { addSuffix: true, locale: ar })}
          </span>
          {!!comment.is_edited && <span className="text-xs text-gray-400">(معدَّل)</span>}
        </div>

        {editing ? (
          <div>
            <textarea
              autoFocus
              rows={3}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full rounded-lg border border-blue-400 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none resize-none dark:text-white"
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg"
              >
                حفظ
              </button>
              <button onClick={() => setEditing(false)} className="text-gray-500 text-xs">إلغاء</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.body}</p>
        )}

        {!editing && (
          <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => { setBody(comment.body); setEditing(true); }} className="text-xs text-gray-400 hover:text-gray-600">تعديل</button>
            <button onClick={() => deleteMutation.mutate()} className="text-xs text-red-400 hover:text-red-600">حذف</button>
          </div>
        )}
      </div>
    </div>
  );
}
