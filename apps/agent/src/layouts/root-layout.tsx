import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppShell,
  Breadcrumb,
  type AppLanguage,
  ThemeProvider,
  useThemeSettings,
  type NavItem,
  type NavSection,
} from '@epay/ui';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  ThumbsUp,
} from 'lucide-react';
import { BREADCRUMB_MAP, MENU_ITEMS, NAV_SECTIONS } from '@/config/navigation';
import { filterMenuForRole, filterNavSections } from '@/config/filter-menu';
import {
  resolveActiveNav,
  resolveActiveSub,
  resolveNavHref,
  resolvePlaygroundCrumb,
  resolveSubCrumbLabel,
  resolveTransactionCrumb,
} from '@/config/nav-resolver';
import { useRole } from '@/domain/role-context';
import { useAuth } from '@/domain/auth-context';
import { SettingsProvider, type SettingsTab } from '@/domain/settings-context';
import { UserPreferencesProvider } from '@/domain/user-preferences';
import { NOTIFS } from '@/mocks/data';
import { SettingsDrawer } from '@/components/settings-drawer';
import { I18nThemeSync } from '@/providers/i18n-theme-sync';
import { APP_PRODUCT } from '@/config/app';

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  shield: <Shield size={14} />,
  approve: <ThumbsUp size={14} />,
  warning: <AlertTriangle size={14} />,
  check: <CheckCircle size={14} />,
  info: <Info size={14} />,
};

function LayoutInner() {
  const { t } = useTranslation();
  const { role } = useRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useThemeSettings();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('app');

  const openSettings = (tab: SettingsTab = 'app') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const activeNav = resolveActiveNav(location.pathname);
  const activeSub = resolveActiveSub(location.pathname);
  const filteredMenuItems = filterMenuForRole(MENU_ITEMS, role);

  const translateMenu = (items: NavItem[]): Record<string, NavItem> => {
    const map: Record<string, NavItem> = {};
    for (const item of items) {
      map[item.id] = {
        ...item,
        label: t(item.label),
        kids: item.kids?.map((k) => ({ ...k, label: t(k.label) })),
      };
    }
    return map;
  };

  const menuById = translateMenu(filteredMenuItems);
  const sections: NavSection[] = filterNavSections(
    NAV_SECTIONS.map((s) => ({
      ...s,
      title: t(s.title),
    })),
    menuById,
  );

  const bc = BREADCRUMB_MAP[activeNav];
  const subCrumb = resolveSubCrumbLabel(activeNav, activeSub, t);
  const playgroundCrumb =
    activeNav === 'playground' ? resolvePlaygroundCrumb(location.pathname, t) : null;
  const transactionCrumb =
    activeNav === 'transactions' ? resolveTransactionCrumb(location.pathname, t) : null;
  const navHref = resolveNavHref(activeNav);

  const breadcrumb =
    activeNav !== 'home' && bc ? (
      <Breadcrumb
        homeLabel={t('page_title')}
        homeHref="/"
        crumbs={[
          { label: t(bc.section) },
          { label: t(bc.label), href: navHref },
          ...(subCrumb ? [{ label: subCrumb }] : []),
          ...(transactionCrumb ? [{ label: transactionCrumb }] : []),
          ...(playgroundCrumb && location.pathname !== '/playground'
            ? [{ label: playgroundCrumb }]
            : []),
        ]}
        LinkComponent={Link as React.ElementType}
      />
    ) : null;

  const roleKey = `role_${role}` as 'nav_ops';

  return (
    <SettingsProvider openSettings={openSettings}>
      <AppShell
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
        sections={sections}
        menuById={menuById}
        activeNav={activeNav}
        activeSub={activeSub}
        breadcrumb={breadcrumb}
        LinkComponent={Link as React.ElementType}
        sidebarLabels={{
          comingSoon: t('coming_soon'),
          collapse: t('collapse_menu'),
          expand: t('expand_menu'),
          version: 'v2.14.0',
          buildDate: new Date().toISOString().slice(0, 10),
        }}
        topbarProps={{
          brand: `${t('brand')} ${APP_PRODUCT}`,
          env: t('env'),
          searchPlaceholder: t('search_ph'),
          roleLabel: t(roleKey),
          roleCycleTitle: t('role_cycle_hint'),
          role,
          onLogout: () => {
            logout();
            navigate('/login', { replace: true });
          },
          theme,
          onToggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
          notificationsLabel: t('notifications'),
          markAllReadLabel: lang === 'tr' ? 'Tümünü işaretle' : 'Mark all read',
          notifications: NOTIFS.map((n) => ({
            id: String(n.id),
            title: n.title,
            desc: n.desc,
            time: n.time,
            level: n.level as 'warn' | 'info' | 'danger' | 'ok',
            icon: NOTIF_ICONS[n.icon] ?? <Info size={14} />,
          })),
          settingsLabel: t('settings'),
          onOpenSettings: () => openSettings('app'),
          userName: user?.fullName ?? '—',
          userRoleLabel: t(roleKey),
          logoutLabel: t('logout'),
          logoutDesc: lang === 'tr' ? 'Oturumu sonlandır' : 'End session',
          settingsDesc: lang === 'tr' ? 'Parola, tema, dil…' : 'Password, theme, language…',
          lang,
          onLangChange: (value) => setLang(value as AppLanguage),
          langAriaLabel: t('s_language'),
          langOptions: [
            { value: 'tr', label: 'TR' },
            { value: 'en', label: 'EN' },
            { value: 'ar', label: 'AR' },
          ],
        }}
      >
        <Outlet />
      </AppShell>
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </SettingsProvider>
  );
}

export function RootLayout() {
  return (
    <ThemeProvider>
      <I18nThemeSync>
        <ThemeAwarePreferences>
          <LayoutInner />
        </ThemeAwarePreferences>
      </I18nThemeSync>
    </ThemeProvider>
  );
}

function ThemeAwarePreferences({ children }: { children: React.ReactNode }) {
  const { lang } = useThemeSettings();
  const { user } = useAuth();
  const userId = user?.id ?? 'guest';

  return (
    <UserPreferencesProvider lang={lang} userId={userId}>
      {children}
    </UserPreferencesProvider>
  );
}
