import * as React from 'react';
import { cn } from '../lib/utils';

/** Çoklu seçim aktifken grid üstü aksiyon çubuğu */
export function BulkBar({
  count,
  label,
  actions,
  className,
}: {
  count: number;
  label: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <div className={cn('bulk-bar', className)}>
      <span>{label}</span>
      <div className="bulk-actions">{actions}</div>
    </div>
  );
}
