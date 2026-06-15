import * as React from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

export type FileUploadValue = File[];

export function FileUpload({
  value,
  onChange,
  accept,
  multiple = false,
  disabled,
  className,
  label = 'Dosya seçin veya sürükleyin',
  helperText,
}: {
  value: FileUploadValue;
  onChange: (files: FileUploadValue) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: React.ReactNode;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex items-center justify-between gap-3 rounded-[var(--r-lg)] border border-dashed border-[var(--line-strong)] bg-[var(--bg-elev)] p-3',
          !disabled && 'hover:bg-[var(--bg-hover)]',
          disabled && 'opacity-60',
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (disabled) return;
          const files = Array.from(e.dataTransfer.files);
          if (!multiple) onChange(files.slice(0, 1));
          else onChange([...value, ...files]);
        }}
        aria-disabled={disabled}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-[var(--bg-sunken)] text-[var(--fg-soft)]">
            <UploadCloud size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium">{label}</div>
            {helperText && <div className="mt-0.5 text-[11.5px] text-[var(--fg-muted)]">{helperText}</div>}
          </div>
        </div>
        <Button type="button" variant="default" size="sm" disabled={disabled}>
          Seç
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (!multiple) onChange(files.slice(0, 1));
            else onChange(files);
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="space-y-1">
          {value.map((f) => (
            <div
              key={`${f.name}-${f.size}-${f.lastModified}`}
              className="flex items-center justify-between gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--bg-elev)] px-2 py-1.5 text-[12px]"
            >
              <span className="min-w-0 truncate">
                {f.name} <span className="text-[var(--fg-muted)]">({Math.ceil(f.size / 1024)} KB)</span>
              </span>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                onClick={() => onChange(value.filter((x) => x !== f))}
                aria-label="Dosyayı kaldır"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

