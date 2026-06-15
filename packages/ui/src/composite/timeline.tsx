import * as React from 'react';
import { cn } from '../lib/utils';

export type TimelineItem = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'default' | 'info' | 'warn' | 'danger' | 'success';
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <div className={cn('rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--bg-elev)] p-4', className)}>
      <ol className="space-y-3">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          const tone =
            it.tone === 'success'
              ? 'bg-[var(--ok-soft)] text-[var(--ok-fg)]'
              : it.tone === 'danger'
                ? 'bg-[var(--danger-soft)] text-[var(--danger-fg)]'
                : it.tone === 'warn'
                  ? 'bg-[var(--warn-soft)] text-[var(--warn-fg)]'
                  : it.tone === 'info'
                    ? 'bg-[var(--info-soft)] text-[var(--info-fg)]'
                    : 'bg-[var(--bg-sunken)] text-[var(--fg-soft)]';

          return (
            <li key={it.id} className="relative flex gap-3">
              <div className="relative">
                <div className={cn('grid h-9 w-9 place-items-center rounded-[12px] border border-[var(--line)]', tone)}>
                  {it.icon ?? <span className="text-[12px] font-semibold">{idx + 1}</span>}
                </div>
                {!isLast && (
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-9 h-[calc(100%-36px)] w-px -translate-x-1/2 bg-[var(--line)]"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold">{it.title}</div>
                    {it.description && (
                      <div className="mt-0.5 text-[12px] text-[var(--fg-muted)]">{it.description}</div>
                    )}
                  </div>
                  {it.meta && <div className="shrink-0 text-[11.5px] text-[var(--fg-muted)]">{it.meta}</div>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

