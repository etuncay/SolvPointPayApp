import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { IconButton } from './icon-button';
import { Input } from './input';

export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  className,
  inputClassName,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const clamp = (n: number) => {
    let x = n;
    if (min != null) x = Math.max(min, x);
    if (max != null) x = Math.min(max, x);
    return x;
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        type="number"
        value={value ?? ''}
        disabled={disabled}
        className={cn(inputClassName)}
        style={{ paddingLeft: 34, paddingRight: 34 }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return onChange(undefined);
          const next = Number(raw);
          if (Number.isNaN(next)) return;
          onChange(clamp(next));
        }}
      />
      <IconButton
        className="absolute left-1 top-1"
        style={{ width: 30, height: 30 }}
        disabled={disabled || value == null || (min != null && value <= min)}
        onClick={() => onChange(clamp((value ?? 0) - step))}
        aria-label="Azalt"
      >
        <Minus size={16} />
      </IconButton>
      <IconButton
        className="absolute right-1 top-1"
        style={{ width: 30, height: 30 }}
        disabled={disabled || value == null || (max != null && value >= max)}
        onClick={() => onChange(clamp((value ?? 0) + step))}
        aria-label="Artır"
      >
        <Plus size={16} />
      </IconButton>
    </div>
  );
}

