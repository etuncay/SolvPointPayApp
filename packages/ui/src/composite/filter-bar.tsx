import * as React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { cn } from '../lib/utils';

export type ChipOption = { value: string; label: string; count?: number };
export type ActiveFilter = { id: string; label: React.ReactNode; onRemove: () => void };

/** FilterBar meta alanındaki select grupları — /system/users referans düzeni */
export function FilterBarSelects({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('filter-bar-selects', className)}>{children}</div>;
}

export function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: ChipOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="chips">
      {options.map((c) => (
        <button
          key={c.value}
          type="button"
          className={cn('chip', value === c.value && 'on')}
          onClick={() => onChange(c.value)}
        >
          {c.label}
          {c.count != null && <span className="chip-count">{c.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({
  chips,
  chipValue,
  onChipChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showAdvanced,
  onToggleAdvanced,
  advancedLabel,
  advancedCloseLabel,
  meta,
  activeFilters,
  filterCount,
  onClearAllFilters,
  dateRangeSlot,
  /** Gelişmiş filtre toggle yanında (ör. Temizle) */
  advancedToolbarSlot,
  className,
}: {
  chips?: ChipOption[];
  chipValue?: string;
  onChipChange?: (v: string) => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  advancedLabel?: string;
  advancedCloseLabel?: string;
  meta?: React.ReactNode;
  /** Aktif filtre pill'leri */
  activeFilters?: ActiveFilter[];
  /** Filtre sayısı badge'i (opsiyonel) */
  filterCount?: number;
  /** Tüm filtreleri temizle */
  onClearAllFilters?: () => void;
  /** Tarih aralığı gibi özel slot */
  dateRangeSlot?: React.ReactNode;
  advancedToolbarSlot?: React.ReactNode;
  className?: string;
}) {
  const hasActive = (activeFilters?.length ?? 0) > 0;

  return (
    <div className={cn('filter-bar', className)}>
      {chips && chipValue != null && onChipChange && (
        <ChipGroup options={chips} value={chipValue} onChange={onChipChange} />
      )}
      {onSearchChange != null && (
        <div className="search">
          <Search size={14} style={{ position: 'absolute', left: 10, top: 9 }} className="s-icon" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
          {searchValue && (
            <button type="button" className="clear" onClick={() => onSearchChange('')} aria-label="clear">
              <X size={12} />
            </button>
          )}
        </div>
      )}
      {dateRangeSlot}
      {onToggleAdvanced && (
        <div className="filter-bar-advanced-tools">
          <Button variant={showAdvanced ? 'primary' : 'default'} onClick={onToggleAdvanced}>
            <Filter size={13} />
            {showAdvanced ? advancedCloseLabel : advancedLabel}
            {filterCount != null && filterCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  padding: '1px 6px',
                  borderRadius: 999,
                  background: showAdvanced ? 'rgba(255,255,255,0.18)' : 'var(--bg-sunken)',
                  border: showAdvanced ? '1px solid rgba(255,255,255,0.22)' : '1px solid var(--line)',
                }}
              >
                {filterCount}
              </span>
            )}
          </Button>
          {advancedToolbarSlot}
        </div>
      )}
      {meta && <div className="filter-meta">{meta}</div>}

      {hasActive && (
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          {activeFilters!.map((f) => (
            <span
              key={f.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--bg-sunken)',
                border: '1px solid var(--line)',
                fontSize: 11.5,
                color: 'var(--fg-soft)',
              }}
            >
              {f.label}
              <button
                type="button"
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={f.onRemove}
                aria-label="Filtreyi kaldır"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {onClearAllFilters && (
            <Button variant="ghost" size="sm" onClick={onClearAllFilters}>
              Tümünü temizle
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
