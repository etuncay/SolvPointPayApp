import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Tarih aralığı…',
  disabled,
  className,
}: {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const label =
    value?.from && value?.to
      ? `${value.from.toLocaleDateString('tr-TR')} – ${value.to.toLocaleDateString('tr-TR')}`
      : value?.from
        ? `${value.from.toLocaleDateString('tr-TR')} – …`
        : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="default"
          className={cn('w-[260px] justify-start', className)}
          disabled={disabled}
        >
          <CalendarIcon size={14} className="text-[var(--fg-muted)]" />
          <span className={cn('truncate', label ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]')}>
            {label ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(next) => onChange(next)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

