import * as React from 'react';
import { Bell, Menu, Moon, Search, Settings, Sun } from 'lucide-react';
import { IconButton } from '../primitives/icon-button';
import { Kbd } from '../primitives/kbd';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import type { BackOfficeRole } from './types';

export type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  time: string;
  level: 'warn' | 'info' | 'danger' | 'ok';
  icon: React.ReactNode;
};

/** İsimden avatar baş harfleri (ör. "Ahmet Yılmaz" → "AY"). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function Topbar({
  brand,
  env,
  searchPlaceholder,
  roleLabel,
  roleCycleTitle,
  roleBadge,
  role,
  onCycleRole,
  onLogout,
  theme,
  onToggleTheme,
  notificationsLabel,
  markAllReadLabel,
  notifications,
  settingsLabel,
  onOpenSettings,
  userName,
  userRoleLabel,
  userBadge,
  logoutLabel,
  logoutDesc,
  settingsDesc,
  lang,
  onLangChange,
  langAriaLabel,
  langOptions,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  brand: string;
  env: string;
  searchPlaceholder: string;
  roleLabel: string;
  /** Rol chip tooltip — Risk menüsü gibi rol kısıtları için ipucu */
  roleCycleTitle?: string;
  /** Örn. alltest süper test rozeti */
  roleBadge?: React.ReactNode;
  role: BackOfficeRole;
  /** Verilmezse rol chip'i statik gösterilir (rol hesaptan gelir) */
  onCycleRole?: () => void;
  /** Kullanıcı menüsündeki çıkış aksiyonu */
  onLogout?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notificationsLabel: string;
  markAllReadLabel: string;
  notifications: NotificationItem[];
  settingsLabel: string;
  onOpenSettings: () => void;
  userName: string;
  userRoleLabel: string;
  /** Kullanıcı adı yanında rozet (örn. alltest hesabı) */
  userBadge?: React.ReactNode;
  logoutLabel: string;
  logoutDesc: string;
  settingsDesc: string;
  lang: string;
  onLangChange: (lang: string) => void;
  langAriaLabel: string;
  langOptions: { value: string; label: string }[];
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const [userOpen, setUserOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const levelTone: Record<string, { bg: string; fg: string }> = {
    warn: { bg: 'var(--warn-soft)', fg: 'var(--warn-fg)' },
    info: { bg: 'var(--info-soft)', fg: 'var(--info-fg)' },
    danger: { bg: 'var(--danger-soft)', fg: 'var(--danger-fg)' },
    ok: { bg: 'var(--ok-soft)', fg: 'var(--ok-fg)' },
  };

  return (
    <header className="topbar" ref={wrapRef}>
      <IconButton onClick={onToggleSidebar} aria-label="Menu">
        <Menu size={16} />
      </IconButton>
      <div className="brand">
        <div className="brand-mark">€</div>
        <span>{brand}</span>
        <span className="t-mute fs-11" style={{ fontWeight: 400 }}>
          BackOffice
        </span>
        <span className="brand-env">{env}</span>
      </div>
      <div className="tb-divider" />
      <div className="tb-search">
        <Search size={14} />
        <input type="text" placeholder={searchPlaceholder} />
        <Kbd>⌘K</Kbd>
      </div>
      <div className="tb-spacer" />
      <div className="tb-actions">
        <span
          className="role-chip"
          onClick={onCycleRole}
          style={{ cursor: onCycleRole ? 'pointer' : 'default', marginRight: 6 }}
          title={onCycleRole ? (roleCycleTitle ?? 'Rolü değiştir') : roleLabel}
        >
          <span className="role-chip-dot" />
          {roleLabel}
        </span>
        {roleBadge}
        <IconButton onClick={onToggleTheme} aria-label="Tema">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <select
          className="tb-lang-select"
          value={lang}
          aria-label={langAriaLabel}
          onChange={(e) => onLangChange(e.target.value)}
        >
          {langOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Popover>
          <PopoverTrigger asChild>
            <IconButton aria-label={notificationsLabel} dot>
              <Bell size={16} />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent style={{ width: 320 }}>
            <div className="popover-h">
              <b>{notificationsLabel}</b>
              <button type="button" className="btn ghost" style={{ padding: '2px 8px', fontSize: 11.5 }}>
                {markAllReadLabel}
              </button>
            </div>
            <div className="popover-list">
              {notifications.map((n) => (
                <div key={n.id} className="notif">
                  <div
                    className="notif-icon"
                    style={{ background: levelTone[n.level].bg, color: levelTone[n.level].fg }}
                  >
                    {n.icon}
                  </div>
                  <div className="notif-body">
                    <b>{n.title}</b>
                    <p>{n.desc}</p>
                    <time>{n.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <IconButton onClick={onOpenSettings} aria-label={settingsLabel}>
          <Settings size={16} />
        </IconButton>
        <div className="tb-divider" />
        <div
          className="user-chip"
          onClick={() => setUserOpen(!userOpen)}
          style={{ position: 'relative' }}
        >
          <div className="user-avatar">{initials(userName)}</div>
          <div className="user-meta">
            <b style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {userName}
              {userBadge}
            </b>
            <span>{userRoleLabel}</span>
          </div>
          {userOpen && (
            <div className="popover" style={{ width: 240, right: 0, top: '100%', position: 'absolute' }}>
              <div className="popover-list">
                <div className="notif" onClick={onOpenSettings} style={{ cursor: 'pointer' }}>
                  <div className="notif-icon" style={{ background: 'var(--bg-sunken)', color: 'var(--fg-soft)' }}>
                    <Settings size={14} />
                  </div>
                  <div className="notif-body">
                    <b>{settingsLabel}</b>
                    <p>{settingsDesc}</p>
                  </div>
                </div>
                <div className="notif" style={{ cursor: 'pointer' }} onClick={onLogout}>
                  <div className="notif-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger-fg)' }}>
                    <span>↪</span>
                  </div>
                  <div className="notif-body">
                    <b>{logoutLabel}</b>
                    <p>{logoutDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
