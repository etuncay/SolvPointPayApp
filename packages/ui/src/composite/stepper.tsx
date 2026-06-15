import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export type Step = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export function Stepper({
  steps,
  activeId,
  onStepClick,
  className,
}: {
  steps: Step[];
  activeId: string;
  onStepClick?: (id: string) => void;
  className?: string;
}) {
  const activeIndex = Math.max(0, steps.findIndex((s) => s.id === activeId));

  return (
    <div className={cn('rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--bg-elev)] p-4', className)}>
      <ol className="grid gap-3">
        {steps.map((s, idx) => {
          const state = idx < activeIndex ? 'done' : idx === activeIndex ? 'active' : 'todo';
          return (
            <li
              key={s.id}
              className={cn(
                'flex items-start gap-3 rounded-[var(--r-md)] p-2',
                onStepClick && 'cursor-pointer hover:bg-[var(--bg-hover)]',
              )}
              onClick={() => onStepClick?.(s.id)}
            >
              <div
                className={cn(
                  'mt-[1px] grid h-7 w-7 place-items-center rounded-full border text-[12px] font-semibold',
                  state === 'done' && 'border-transparent bg-[var(--ok-soft)] text-[var(--ok-fg)]',
                  state === 'active' && 'border-transparent bg-[var(--accent)] text-[var(--accent-on)]',
                  state === 'todo' && 'border-[var(--line)] bg-[var(--bg-sunken)] text-[var(--fg-muted)]',
                )}
              >
                {state === 'done' ? <Check size={14} /> : idx + 1}
              </div>
              <div className="min-w-0">
                <div className={cn('text-[12.5px] font-semibold', state === 'todo' && 'text-[var(--fg-muted)]')}>
                  {s.title}
                </div>
                {s.description && <div className="mt-0.5 text-[11.5px] text-[var(--fg-muted)]">{s.description}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

