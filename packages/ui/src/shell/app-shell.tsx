import * as React from 'react';
import { cn } from '../lib/utils';
import { Sidebar } from './sidebar';
import { Topbar, type NotificationItem } from './topbar';
import type { BackOfficeRole, NavItem, NavSection } from './types';

export function AppShell({
  collapsed,
  onToggleCollapsed,
  sections,
  menuById,
  activeNav,
  activeSub,
  breadcrumb,
  children,
  topbarProps,
  sidebarLabels,
  LinkComponent,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  sections: NavSection[];
  menuById: Record<string, NavItem>;
  activeNav: string;
  activeSub?: string | null;
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
  topbarProps: Omit<React.ComponentProps<typeof Topbar>, 'sidebarCollapsed' | 'onToggleSidebar'>;
  sidebarLabels: {
    comingSoon: string;
    collapse: string;
    expand: string;
    version: string;
    buildDate: string;
  };
  LinkComponent: React.ElementType<Record<string, unknown>>;
}) {
  return (
    <div className={cn('app', collapsed && 'collapsed')}>
      <Topbar {...topbarProps} sidebarCollapsed={collapsed} onToggleSidebar={onToggleCollapsed} />
      <Sidebar
        sections={sections}
        menuById={menuById}
        activeNav={activeNav}
        activeSub={activeSub}
        comingSoonLabel={sidebarLabels.comingSoon}
        collapseLabel={sidebarLabels.collapse}
        expandLabel={sidebarLabels.expand}
        version={sidebarLabels.version}
        buildDate={sidebarLabels.buildDate}
        LinkComponent={LinkComponent}
      />
      <main className="main">
        {breadcrumb}
        {children}
      </main>
    </div>
  );
}

export type { NotificationItem, NavItem, NavSection, BackOfficeRole };
