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
  iconBg = 'bg-primary-50 text-primary-600',
  description,
  href,
  trendText,
  className,
}: StatCardProps) {
  const content = (
    <Card className={cn('p-5 hover:shadow-md transition-all group', className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            {title}
          </span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {value}
          </span>
          {description && (
            <span className="text-xs text-gray-400 mt-0.5 block">
              {description}
            </span>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
      {trendText && (
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1 group-hover:text-primary-600 transition-colors">
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
