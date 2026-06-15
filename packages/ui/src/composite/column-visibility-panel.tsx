import * as React from 'react';
import { Checkbox } from '../primitives/checkbox';
import { cn } from '../lib/utils';

export type ColumnToggle = { id: string; label: string };

/** Grid kolon görünürlüğü paneli */
export function ColumnVisibilityPanel({
  columns,
  visibility,
  onChange,
  className,
}: {
  columns: ColumnToggle[];
  visibility: Record<string, boolean | undefined>;
  onChange: (id: string, visible: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn('adv-filters adv-filters--flat', className)}>
      {columns.map((col) => (
        <label
          key={col.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Checkbox
            checked={visibility[col.id] ?? true}
            onCheckedChange={(v) => onChange(col.id, v === true)}
          />
          {col.label}
        </label>
      ))}
    </div>
  );
}
