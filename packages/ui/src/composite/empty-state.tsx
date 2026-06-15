import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../primitives/button';

export function EmptyState({
  title = 'Kayıt bulunamadı',
  description,
  icon,
  actionLabel,
  onAction,
  secondaryAction,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('py-10 text-center', className)}>
      {icon && <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--bg-sunken)]">{icon}</div>}
      <div className="text-[13px] font-semibold tracking-[-0.01em]">{title}</div>
      {description && <div className="mx-auto mt-1 max-w-[46ch] text-[12.5px] text-[var(--fg-muted)]">{description}</div>}
      {(onAction || secondaryAction) && (
        <div className="mt-4 flex items-center justify-center gap-8">
          {onAction && actionLabel && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

