import * as React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../primitives/command';

export type ComboboxOption = { value: string; label: string; keywords?: string[]; disabled?: boolean };

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Seçiniz…',
  searchPlaceholder = 'Ara…',
  emptyText = 'Sonuç yok',
  disabled,
  className,
  triggerClassName,
  contentClassName,
}: {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value != null ? options.find((o) => o.value === value) : undefined;

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="default"
            className={cn('w-full justify-between', triggerClassName)}
            disabled={disabled}
            aria-expanded={open}
          >
            <span className={cn('min-w-0 truncate text-left', selected ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]')}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown size={14} className="shrink-0 text-[var(--fg-muted)]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('p-0 w-[min(420px,calc(100vw-24px))]', contentClassName)} align="start">
          <Command>
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-3 py-2">
              <Search size={14} className="text-[var(--fg-muted)]" />
              <CommandInput placeholder={searchPlaceholder} className="h-8" />
            </div>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => {
                  const isOn = o.value === value;
                  return (
                    <CommandItem
                      key={o.value}
                      value={[o.label, ...(o.keywords ?? [])].join(' ')}
                      disabled={o.disabled}
                      onSelect={() => {
                        onChange(isOn ? undefined : o.value);
                        setOpen(false);
                      }}
                    >
                      <span className="mr-1 flex h-4 w-4 items-center justify-center">
                        {isOn ? <Check size={14} className="text-[var(--accent-fg)]" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

