import { useTranslation } from 'react-i18next';
import { Database, Server } from 'lucide-react';
import { getDemoCustomerPassword } from '@epay/data';
import { getSettingsEnvironmentKind } from '@/lib/data-layer';

/** Ayarlar — demo (mock) veya staging ortam etiketi + demo parola ipucu. */
export function SettingsEnvironmentBanner() {
  const { t } = useTranslation();
  const kind = getSettingsEnvironmentKind();
  if (!kind) return null;

  const isDemo = kind === 'demo';
  const Icon = isDemo ? Database : Server;

  return (
    <div
      role="status"
      className={`settings-env-banner settings-env-banner--${kind}`}
    >
      <div className="settings-env-banner-head">
        <Icon size={18} aria-hidden style={{ flexShrink: 0 }} />
        <span className="settings-env-badge">
          {t(isDemo ? 'settings_env_demo_badge' : 'settings_env_staging_badge')}
        </span>
        <p className="settings-env-banner-title">
          {t(isDemo ? 'settings_env_demo_title' : 'settings_env_staging_title')}
        </p>
      </div>
      <p className="settings-env-banner-body">
        {t(isDemo ? 'settings_env_demo_body' : 'settings_env_staging_body')}
      </p>
      {isDemo ? (
        <p className="settings-env-banner-foot mono">
          {t('settings_env_demo_password', { pw: getDemoCustomerPassword() })}
        </p>
      ) : null}
    </div>
  );
}
