import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from './input';

export function TagsInput({
  value,
  onChange,
  placeholder = 'Etiket ekle…',
  disabled,
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = React.useState('');

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--bg-elev)] px-2 py-2',
        disabled && 'opacity-60',
        className,
      )}
      aria-disabled={disabled}
    >
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-sunken)] px-2 py-1 text-[11.5px] text-[var(--fg-soft)]"
        >
          {t}
          <button
            type="button"
            className="icon-btn"
            style={{ width: 20, height: 20 }}
            onClick={() => onChange(value.filter((x) => x !== t))}
            disabled={disabled}
            aria-label="Etiketi kaldır"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <div className="min-w-[160px] flex-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
              e.preventDefault();
              add(draft);
              setDraft('');
            }
            if (e.key === 'Backspace' && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
        />
      </div>
    </div>
  );
}

