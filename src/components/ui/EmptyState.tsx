import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  actionLabel,
  actionHref,
  onAction,
  icon = <Inbox className="w-12 h-12 text-gray-400" />
}: EmptyStateProps) {
  const btnLabel = actionLabel || actionText;

  return (
    <div className="py-12 px-4 text-center max-w-sm mx-auto flex flex-col items-center">
      <div className="mb-4 p-3 bg-teal-50 dark:bg-campus-darkSurface text-teal-700 dark:text-teal-300 rounded-2xl">{icon}</div>
      <h3 className="text-base font-semibold text-navy-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {(btnLabel && actionHref) && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button size="sm">{btnLabel}</Button>
          </Link>
        </div>
      )}
      {(btnLabel && onAction && !actionHref) && (
        <div className="mt-6">
          <Button size="sm" onClick={onAction}>
            {btnLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
