import * as React from 'react';
import {
  Building2,
  ChevronDown,
  Code2,
  FileText,
  Headphones,
  Home,
  Landmark,
  LayoutDashboard,
  Shield,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { NavItem, NavSection } from './types';

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  user: Users,
  building: Building2,
  wallet: Wallet,
  transfer: Workflow,
  bank: Landmark,
  shield: Shield,
  process: Workflow,
  doc: FileText,
  support: Headphones,
  chart: LayoutDashboard,
  settings: LayoutDashboard,
  hr: Users,
  code: Code2,
};

export function Sidebar({
  sections,
  menuById,
  activeNav,
  activeSub,
  comingSoonLabel,
  collapseLabel,
  expandLabel,
  version,
  buildDate,
  LinkComponent,
}: {
  sections: NavSection[];
  menuById: Record<string, NavItem>;
  activeNav: string;
  activeSub?: string | null;
  comingSoonLabel: string;
  collapseLabel: string;
  expandLabel: string;
  version: string;
  buildDate: string;
  LinkComponent: React.ElementType<Record<string, unknown>>;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    if (menuById[activeNav]?.kids) o[activeNav] = true;
    return o;
  });

  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  function renderItem(m: NavItem) {
    const active = m.id === activeNav;
    const isOpen = open[m.id] || active;
    const Icon = ICON_MAP[m.icon] ?? Home;

    const inner = (
      <>
        <span className="nav-icon">
          <Icon size={15} />
        </span>
        <span className="nav-label">{m.label}</span>
        {m.badge != null && (
          <span
            className="nav-badge"
            style={
              m.badgeTone === 'danger'
                ? { background: 'var(--danger-soft)', color: 'var(--danger-fg)', borderColor: 'transparent' }
                : undefined
            }
          >
            {m.badge}
          </span>
        )}
      </>
    );

    if (m.kids?.length) {
      return (
        <React.Fragment key={m.id}>
          {/* href'siz parent'larda div'e tıklamak alt menüyü açar/kapar */}
          <div
            className={cn('nav-parent', active && 'active has-active', isOpen && 'open')}
            onClick={() => toggle(m.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(m.id); }}
          >
            {m.href && !active ? (
              <LinkComponent
                href={m.href}
                to={m.href}
                style={{ display: 'contents', color: 'inherit', textDecoration: 'none' } as never}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {inner}
              </LinkComponent>
            ) : (
              <span style={{ display: 'contents' }}>{inner}</span>
            )}
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label={isOpen ? collapseLabel : expandLabel}
              className="chev"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'grid', placeItems: 'center' }}
            >
              <ChevronDown size={13} />
            </button>
          </div>
          {isOpen && (
            <div className="nav-sub">
              {m.kids.map((k) => {
                const subCls = cn('nav-sub-item', k.id === activeSub && 'active', k.soon && 'soon');
                const subInner = (
                  <>
                    <span className="sub-no">{k.no}</span>
                    <span>{k.label}</span>
                    {k.badge != null && (
                      <span className="nav-badge" style={{ marginLeft: 'auto', fontSize: 10 }}>
                        {k.badge}
                      </span>
                    )}
                    {k.soon && k.badge == null && <span className="soon-pill">{comingSoonLabel}</span>}
                  </>
                );
                if (k.href && !k.soon) {
                  return (
                    <LinkComponent key={k.id} href={k.href} to={k.href} className={subCls}>
                      {subInner}
                    </LinkComponent>
                  );
                }
                return (
                  <span
                    key={k.id}
                    className={subCls}
                    style={k.soon ? { cursor: 'default' } : undefined}
                    role="presentation"
                  >
                    {subInner}
                  </span>
                );
              })}
            </div>
          )}
        </React.Fragment>
      );
    }

    const cls = cn('nav-item', active && 'active');
    if (m.href && !m.soon) {
      return (
        <LinkComponent key={m.id} href={m.href} to={m.href} className={cls} style={{ textDecoration: 'none', color: 'inherit' } as never}>
          {inner}
        </LinkComponent>
      );
    }
    return (
      <div key={m.id} className={cls}>
        {inner}
        {m.soon && <span className="soon-pill">{comingSoonLabel}</span>}
      </div>
    );
  }

  return (
    <aside className="sidebar">
      {sections.map((sec, i) => (
        <React.Fragment key={i}>
          <div className="nav-section">{sec.title}</div>
          {sec.itemIds.map((id) => menuById[id] && renderItem(menuById[id]))}
        </React.Fragment>
      ))}
      <div className="sidebar-foot">
        <span>{version}</span>
        <span className="build-tag">build · {buildDate}</span>
      </div>
    </aside>
  );
}
