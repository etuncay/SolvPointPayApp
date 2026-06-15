import * as React from 'react';
import { Columns3, Download, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { IconButton } from '../primitives/icon-button';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';

export function ToolbarButtonBar({
  onExportCsv,
  onRefresh,
  columnsPanel,
  className,
}: {
  onExportCsv?: () => void;
  onRefresh?: () => void;
  columnsPanel?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onRefresh && (
        <IconButton onClick={onRefresh} aria-label="Yenile">
          <RefreshCw size={16} />
        </IconButton>
      )}
      {onExportCsv && (
        <IconButton onClick={onExportCsv} aria-label="CSV dışa aktar">
          <Download size={16} />
        </IconButton>
      )}
      {columnsPanel && (
        <Popover>
          <PopoverTrigger asChild>
            <IconButton aria-label="Kolonlar">
              <Columns3 size={16} />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[260px]">
            {columnsPanel}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

