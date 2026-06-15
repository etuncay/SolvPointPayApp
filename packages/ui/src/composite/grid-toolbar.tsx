import * as React from 'react';
import { cn } from '../lib/utils';
import { ToggleGroup, ToggleGroupItem } from '../primitives/toggle-group';
import { ToolbarButtonBar } from './toolbar-button-bar';

export type GridDensity = 'compact' | 'normal' | 'comfortable';

export function GridToolbar({
  title,
  bulkActions,
  rightExtra,
  onExportCsv,
  onRefresh,
  density,
  onDensityChange,
  columnsPanel,
  className,
}: {
  title?: React.ReactNode;
  bulkActions?: React.ReactNode;
  rightExtra?: React.ReactNode;
  onExportCsv?: () => void;
  onRefresh?: () => void;
  density?: GridDensity;
  onDensityChange?: (density: GridDensity) => void;
  columnsPanel?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-10 border-b border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-10">
        {bulkActions ? <div className="min-w-0">{bulkActions}</div> : null}
        {title ? <div className="min-w-0 truncate text-[13px] font-semibold tracking-[-0.01em]">{title}</div> : null}
      </div>

      <div className="flex items-center gap-8">
        {onDensityChange && (
          <ToggleGroup
            type="single"
            value={density ?? 'normal'}
            onValueChange={(v) => {
              if (!v) return;
              onDensityChange(v as GridDensity);
            }}
          >
            <ToggleGroupItem value="compact" size="sm" aria-label="Sıkı">
              Sıkı
            </ToggleGroupItem>
            <ToggleGroupItem value="normal" size="sm" aria-label="Normal">
              Normal
            </ToggleGroupItem>
            <ToggleGroupItem value="comfortable" size="sm" aria-label="Rahat">
              Rahat
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {rightExtra}

        <ToolbarButtonBar onExportCsv={onExportCsv} onRefresh={onRefresh} columnsPanel={columnsPanel} />
      </div>
    </div>
  );
}

