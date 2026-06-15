import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/components/icons/Icon';
import { Logo } from '@/components/ui/Logo';
import { useThemeSettings } from '@/app/ThemeProvider';
import { useAuth } from '@/app/AuthProvider';
import type { AppLanguage } from '@/lib/locale';

const LANG_LABEL: Record<AppLanguage, string> = { tr: 'TR', en: 'EN', ar: 'AR' };

const NAV: {
  key: string;
  path: string;
  labelKey: string;
  icon: IconName;
  children?: { key: string; path: string; labelKey: string; descKey: string; icon: IconName }[];
}[] = [
  { key: 'home', path: '/', labelKey: 'nav_home', icon: 'home' },
  { key: 'activity', path: '/activity', labelKey: 'nav_activity', icon: 'activity' },
  { key: 'topup', path: '/topup', labelKey: 'nav_topup', icon: 'topup' },
  {
    key: 'send',
    path: '/send',
    labelKey: 'nav_send',
    icon: 'send',
    children: [
      {
        key: 'recipients',
        path: '/send/recipients',
        labelKey: 'nav_recipients',
        descKey: 'nav_recipients_desc',
        icon: 'users',
      },
      {
        key: 'domestic',
        path: '/send/domestic',
        labelKey: 'nav_domestic',
        descKey: 'nav_domestic_desc',
        icon: 'flag',
      },
      {
        key: 'intl',
        path: '/send/intl',
        labelKey: 'nav_intl',
        descKey: 'nav_intl_desc',
        icon: 'globe',
      },
    ],
  },
  { key: 'receive', path: '/receive', labelKey: 'nav_receive', icon: 'receive' },
  { key: 'complaint', path: '/complaints', labelKey: 'nav_complaint', icon: 'complaint' },
];

function routeKey(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/activity')) return 'activity';
  if (pathname.startsWith('/topup')) return 'topup';
  if (pathname.startsWith('/send/recipients')) return 'recipients';
  if (pathname.startsWith('/send/domestic')) return 'domestic';
  if (pathname.startsWith('/send/intl')) return 'intl';
  if (pathname.startsWith('/send')) return 'send';
  if (pathname.startsWith('/receive')) return 'receive';
  if (pathname.startsWith('/complaints')) return 'complaint';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'home';
}

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme, lang, setLang } = useThemeSettings();
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const active = routeKey(location.pathname);
  const sendActive = ['send', 'recipients', 'domestic', 'intl'].includes(active);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current && !popRef.current.contains(t)) setOpen(null);
      if (langRef.current && !langRef.current.contains(t)) setLangOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <Link to="/" className="brand">
          <Logo />
          <span className="brand-name">
            e<span>pay</span>
          </span>
        </Link>

        <nav className="nav" ref={popRef}>
          {NAV.map((item) => {
            const isActive = item.key === 'send' ? sendActive : active === item.key;
            if (item.children) {
              return (
                <div key={item.key} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={`nav-item${isActive ? ' active' : ''}${open === item.key ? ' open' : ''}`}
                    onClick={() => setOpen(open === item.key ? null : item.key)}
                  >
                    <Icon name={item.icon} /> {t(item.labelKey)}
                    <Icon name="chevron" className="nav-caret" />
                  </button>
                  {open === item.key && (
                    <div className="nav-pop">
                      {item.children.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          className="pop-item"
                          onClick={() => {
                            navigate(c.path);
                            setOpen(null);
                          }}
                        >
                          <span className="pi">
                            <Icon name={c.icon} />
                          </span>
                          <span>
                            <h5>{t(c.labelKey)}</h5>
                            <p>{t(c.descKey)}</p>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`nav-item${isActive ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Icon name={item.icon} /> {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="hdr-actions">
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-btn hdr-lang-btn"
              aria-label={t('lang_tr')}
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}
            >
              <Icon name="globe" style={{ width: 17, height: 17 }} />
              {LANG_LABEL[lang]}
            </button>
            {langOpen && (
              <div className="nav-pop" style={{ right: 0, left: 'auto', minWidth: 140 }}>
                {(['tr', 'en', 'ar'] as AppLanguage[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    className="pop-item"
                    style={{ fontWeight: lang === code ? 700 : 500 }}
                    onClick={() => {
                      setLang(code);
                      setLangOpen(false);
                    }}
                  >
                    <span>
                      <h5>{LANG_LABEL[code]}</h5>
                      <p>{t(`lang_${code}`)}</p>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Tema">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button type="button" className="icon-btn" aria-label="Bildirimler">
            <Icon name="bell" />
            <span className="dot" />
          </button>
          <Link to="/settings" className="icon-btn" aria-label={t('nav_settings')}>
            <Icon name="settings" />
          </Link>
          <Link
            to="/settings"
            className="avatar hdr-avatar"
            title={profile?.name}
            aria-label={profile?.name}
          >
            {profile?.initials ?? '??'}
          </Link>
        </div>
      </div>
    </header>
  );
}
