import * as React from 'react';
import { cn } from '../lib/utils';

export type RailSection = { id: string; no: string; label: string; hidden?: boolean; disabled?: boolean };

/** Bölüm sekmelerini yatay, yapışkan (sticky) bir çubukta gösterir. */
export function SectionTopBar({
  sections,
  activeId,
  onNavigate,
}: {
  sections: RailSection[];
  activeId: string;
  onNavigate?: (id: string) => void;
}) {
  const navRef = React.useRef<HTMLElement | null>(null);
  const activeRef = React.useRef<HTMLAnchorElement | null>(null);

  const visible = sections.filter((s) => !s.hidden);

  // Aktif sekme görünür bölgeye kaydırılır.
  React.useEffect(() => {
    const el = activeRef.current;
    const nav = navRef.current;
    if (!el || !nav) return;
    const elLeft = el.offsetLeft;
    const elRight = elLeft + el.offsetWidth;
    const navScrollLeft = nav.scrollLeft;
    const navRight = navScrollLeft + nav.offsetWidth;
    if (elLeft < navScrollLeft) {
      nav.scrollTo({ left: elLeft - 12, behavior: 'smooth' });
    } else if (elRight > navRight) {
      nav.scrollTo({ left: elRight - nav.offsetWidth + 12, behavior: 'smooth' });
    }
  }, [activeId]);

  if (visible.length === 0) return null;

  return (
    <nav className="section-topbar" ref={navRef}>
      {visible.map((s) => {
        const isCur = activeId === s.id;
        return (
          <a
            key={s.id}
            href={`#sec-${s.id}`}
            ref={isCur ? activeRef : undefined}
            className={cn(isCur && 'cur', s.disabled && 'disabled')}
            aria-disabled={s.disabled || undefined}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate(s.id);
              }
            }}
          >
            <span className="topbar-no">{s.no}</span>
            <span>{s.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function SectionRail({
  sections,
  activeId,
  title,
  onNavigate,
}: {
  sections: RailSection[];
  activeId: string;
  title: string;
  onNavigate?: (id: string) => void;
}) {
  const visible = sections.filter((s) => !s.hidden);
  return (
    <nav className="section-rail">
      <div className="rail-section">{title}</div>
      {visible.map((s) => (
        <a
          key={s.id}
          href={`#sec-${s.id}`}
          className={cn(activeId === s.id && 'cur', s.disabled && 'disabled')}
          aria-disabled={s.disabled || undefined}
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate(s.id);
            }
          }}
        >
          <span className="rail-no">{s.no}</span>
          <span>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function FormLayout({
  rail,
  children,
}: {
  /** Yoksa tek sütun — aksi halde içerik 200px rail sütununa sıkışır */
  rail?: React.ReactNode | null;
  children: React.ReactNode;
}) {
  const hasRail = rail != null && rail !== false;
  return (
    <div className={cn('form-layout', !hasRail && 'form-layout--no-rail')}>
      {hasRail ? rail : null}
      <div className="form-stack">{children}</div>
    </div>
  );
}
