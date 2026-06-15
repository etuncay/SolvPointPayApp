import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Tarih seç…',
  disabled,
  className,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="default"
          className={cn('w-[240px] justify-start', className)}
          disabled={disabled}
        >
          <CalendarIcon size={14} className="text-[var(--fg-muted)]" />
          <span className={cn('truncate', value ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]')}>
            {value ? value.toLocaleDateString('tr-TR') : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}

