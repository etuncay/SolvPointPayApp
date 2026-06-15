import * as React from 'react';
import { cn } from '../lib/utils';

export function Spinner({
  className,
  size = 16,
  'aria-label': ariaLabel = 'Yükleniyor',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { size?: number }) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn('inline-block animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]', className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

