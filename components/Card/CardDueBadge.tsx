'use client';

import { formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  dueDate: number; // Unix seconds
  complete: boolean;
}

export default function CardDueBadge({ dueDate, complete }: Props) {
  const date = new Date(dueDate * 1000);
  const overdue = !complete && isPast(date);
  const dueToday = !complete && isToday(date);
  const dueSoon = !complete && !overdue && differenceInDays(date, new Date()) <= 2;

  const label = formatDistanceToNow(date, { addSuffix: true, locale: ar });

  return (
    <span
      className={`text-xs rounded px-1.5 py-0.5 flex items-center gap-1 ${
        complete
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : overdue
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : dueToday
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              : dueSoon
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-300'
      }`}
      title={date.toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
    >
      🕐 {label}
    </span>
  );
}
