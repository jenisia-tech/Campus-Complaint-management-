import React from 'react';
import Link from 'next/link';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  description?: string;
  href?: string;
  trendText?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBg = 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300',
  description,
  href,
  trendText,
  className,
}: StatCardProps) {
  const content = (
    <Card className={cn('p-5 hover:shadow-xs transition-all group', className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
            {title}
          </span>
          <span className="text-2xl font-extrabold text-navy-900 dark:text-slate-100 mt-1 block">
            {value}
          </span>
          {description && (
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 block">
              {description}
            </span>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex items-center justify-center shrink-0 border border-notepad-border dark:border-notepad-darkBorder', iconBg)}>
          {icon}
        </div>
      </div>
      {trendText && (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          <span>{trendText}</span>
          <span>&rarr;</span>
        </div>
      )}
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
