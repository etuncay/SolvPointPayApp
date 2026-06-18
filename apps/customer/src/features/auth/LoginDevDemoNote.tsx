import { getDemoCustomerPassword } from '@epay/data';
import { Icon } from '@/components/icons/Icon';
import {
  CUSTOMER_AUTH_SESSION_KEY,
  DEMO_CUSTOMER_IDENTITY,
} from '@/config/auth-keys';
import { DEMO_OTP_CODE } from '@/config/demo-otp';
import { isDemoMode } from '@/lib/data-layer';
import { useTranslation } from 'react-i18next';

type Props = {
  onPickDemo?: () => void;
};

/** Mock giriş — demo ortamı ve geliştirici oturum uyarısı (dexie sürücü). */
export function LoginDevDemoNote({ onPickDemo }: Props) {
  const { t } = useTranslation();
  if (!isDemoMode()) return null;

  return (
    <div className="login-dev-demo" role="note">
      <div className="login-dev-demo-banner">
        <Icon name="shield" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
        <span>{t('login_demo_env_banner')}</span>
      </div>
      <p className="login-dev-demo-session">
        <Icon name="info" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} />
        <span>{t('login_demo_dev_session', { sessionKey: CUSTOMER_AUTH_SESSION_KEY })}</span>
      </p>
      <div className="login-demo-credentials">
        <div className="login-demo-credentials-title">{t('login_demo_credentials_title')}</div>
        <div className="login-demo-credentials-body">
          <div className="login-demo-credentials-row">
            <span className="login-demo-credentials-label">{t('login_identity')}</span>
            <button type="button" className="login-demo-credentials-value" onClick={onPickDemo}>
              {DEMO_CUSTOMER_IDENTITY}
            </button>
          </div>
          <div className="login-demo-credentials-row">
            <span className="login-demo-credentials-label">{t('login_password')}</span>
            <span className="login-demo-credentials-value mono">{getDemoCustomerPassword()}</span>
          </div>
          <div className="login-demo-credentials-row">
            <span className="login-demo-credentials-label">{t('login_demo_otp_label')}</span>
            <span className="login-demo-credentials-value mono">{DEMO_OTP_CODE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
