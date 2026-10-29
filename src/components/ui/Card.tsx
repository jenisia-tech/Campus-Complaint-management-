import React from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-notepad-darkCard rounded-xl border border-notepad-border dark:border-notepad-darkBorder shadow-xs transition-colors overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-notepad-border dark:border-notepad-darkBorder',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-bold text-slate-900 dark:text-slate-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export const CardContent = CardBody;

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-6 py-4 bg-slate-50/60 dark:bg-slate-900/40 border-t border-notepad-border dark:border-notepad-darkBorder flex items-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
