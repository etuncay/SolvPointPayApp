import * as React from 'react';
import { cn } from '../lib/utils';

/** Gelişmiş filtre paneli — grid altında genişletilebilir satır */
export function AdvancedFilters({
  children,
  actions,
  className,
}: {
  children: React.ReactNode;
  /** Alt satır: Temizle vb. — input hizasında sağda */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('adv-filters', className)}>
      <div className="adv-filters__grid">{children}</div>
      {actions ? <div className="adv-filters__actions">{actions}</div> : null}
    </div>
  );
}

export function AdvFilterRow({ children }: { children: React.ReactNode }) {
  return <div className="adv-filters__row">{children}</div>;
}

export function AdvFilterGroup({
  label,
  children,
  span,
  breakBefore,
  className,
}: {
  label: string;
  children: React.ReactNode;
  /** 12 kolon grid genişliği (yalnızca AdvFilterRow içinde) */
  span?: 3 | 4 | 6 | 12;
  /** Yeni satırın başından başla */
  breakBefore?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'form-grp',
        span && `adv-col-${span}`,
        breakBefore && 'adv-col-break',
        className,
      )}
    >
      <label>{label}</label>
      {children}
    </div>
  );
}
