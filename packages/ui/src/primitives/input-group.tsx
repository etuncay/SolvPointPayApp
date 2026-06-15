import * as React from 'react';
import { cn } from '../lib/utils';

export function InputGroup({
  className,
  prefix,
  suffix,
  children,
}: {
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn('flex items-center gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--bg-elev)] px-2', className)}
    >
      {prefix && <div className="text-[var(--fg-muted)]">{prefix}</div>}
      <div className="min-w-0 flex-1 [&_input]:border-none [&_input]:bg-transparent [&_input]:px-0 [&_input]:shadow-none">
        {children}
      </div>
      {suffix && <div className="text-[var(--fg-muted)]">{suffix}</div>}
    </div>
  );
}

