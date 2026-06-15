import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerPortalApi, DEMO_CUSTOMER_PASSWORD } from '@epay/data';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Logo } from '@/components/ui/Logo';
import { OtpInput } from '@/components/ui/OtpInput';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon } from '@/components/icons/Icon';
import { useTranslation } from 'react-i18next';

const REMEMBER_KEY = 'epay.customer.rememberIdentity';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last = digits.slice(-2);
  return `+90 *** *** ** ${last}`;
}

function LoginAside() {
  const { t } = useTranslation();
  const features = [
    { icon: 'send' as const, titleKey: 'login_feature_send_title', descKey: 'login_feature_send_desc' },
    { icon: 'globe' as const, titleKey: 'login_feature_fx_title', descKey: 'login_feature_fx_desc' },
    { icon: 'shield' as const, titleKey: 'login_feature_safe_title', descKey: 'login_feature_safe_desc' },
  ];

  return (
    <aside className="login-aside" aria-label={t('login_aside_label')}>
      <div className="login-deco login-deco--1" aria-hidden />
      <div className="login-deco login-deco--2" aria-hidden />
      <div className="brand">
        <Logo size={42} />
        <span className="brand-name">
          e<span style={{ color: 'var(--accent)' }}>pay</span>
        </span>
      </div>
      <div className="login-aside-body">
        <div className="login-aside-eyebrow">{t('login_eyebrow')}</div>
        <h1 className="login-aside-headline">
          {t('login_headline_line1')}
          <br />
          {t('login_headline_line2')}
        </h1>
        <p className="login-aside-tagline">{t('login_tagline')}</p>
        <ul className="login-aside-features" role="list">
          {features.map((f) => (
            <li key={f.titleKey} className="login-feature">
              <span className="login-feature-icon">
                <Icon name={f.icon} style={{ width: 21, height: 21 }} />
              </span>
              <div>
                <div className="login-feature-title">{t(f.titleKey)}</div>
                <div className="login-feature-desc">{t(f.descKey)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="login-aside-footer">{t('login_copyright')}</p>
    </aside>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login, verifyOtp, pendingOtp } = useAuth();
  const navigate = useNavigate();
  const [identity, setIdentity] = useState(() => {
    if (typeof window === 'undefined') return 'CUS-4827193';
    return localStorage.getItem(REMEMBER_KEY) ?? 'CUS-4827193';
  });
  const [password, setPassword] = useState(DEMO_CUSTOMER_PASSWORD);
  const [taxNo, setTaxNo] = useState('');
  const [showCorporate, setShowCorporate] = useState(false);
  const [remember, setRemember] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem(REMEMBER_KEY));
  });
  const [otp, setOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingOtp) return;
    let cancelled = false;
    customerPortalApi
      .getProfile()
      .then((p) => {
        if (!cancelled) setMaskedPhone(maskPhone(p.phone));
      })
      .catch(() => {
        if (!cancelled) setMaskedPhone('');
      });
    return () => {
      cancelled = true;
    };
  }, [pendingOtp]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (remember) localStorage.setItem(REMEMBER_KEY, identity.trim());
    else localStorage.removeItem(REMEMBER_KEY);
    const err = await login(identity, password, taxNo || undefined);
    if (err) setError(err);
  }

  async function onOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const err = await verifyOtp(otp);
    if (err) setError(err);
    else navigate('/', { replace: true });
  }

  return (
    <div className="login-wrap">
      <LoginAside />
      <div className="login-form-panel">
        <div className="login-form-inner">
          {error && (
            <div style={{ marginBottom: 16 }}>
              <AlertBanner tone="error" icon="warn">
                {error}
              </AlertBanner>
            </div>
          )}

          {!pendingOtp ? (
            <>
              <h2 className="login-form-title">{t('login_form_title')}</h2>
              <p className="login-form-subtitle">{t('login_form_subtitle')}</p>
              <form onSubmit={onLogin} className="login-form-stack">
                <Field label={t('login_identity')} required full>
                  <input
                    className="input"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="CUS-4827193"
                    autoComplete="username"
                  />
                </Field>
                <Field label={t('login_password')} required full>
                  <div className="input-affix">
                    <span className="pre">
                      <Icon name="lock" style={{ width: 16, height: 16 }} />
                    </span>
                    <input
                      className="input"
                      style={{ paddingLeft: 38 }}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </Field>

                {showCorporate ? (
                  <Field label={t('login_tax_no')} full>
                    <input
                      className="input"
                      value={taxNo}
                      onChange={(e) => setTaxNo(e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                ) : (
                  <button
                    type="button"
                    className="login-corporate-toggle"
                    onClick={() => setShowCorporate(true)}
                  >
                    {t('login_corporate_toggle')}
                  </button>
                )}

                <div className="login-form-row">
                  <label className="checkbox" style={{ alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className="checkbox-label">{t('login_remember')}</span>
                  </label>
                  <Link to="/forgot-password" className="login-forgot-link">
                    {t('login_forgot')}
                  </Link>
                </div>

                <Button type="submit" variant="primary" block className="btn-lg">
                  {t('login_continue')}{' '}
                  <Icon name="right" style={{ width: 18, height: 18, marginLeft: 4 }} />
                </Button>

                <p className="login-demo-hint">
                  Demo: <strong>CUS-4827193</strong> / <strong>{DEMO_CUSTOMER_PASSWORD}</strong>
                </p>
              </form>
            </>
          ) : (
            <form onSubmit={onOtp}>
              <div className="login-otp-icon" aria-hidden>
                <Icon name="phone" style={{ width: 26, height: 26 }} />
              </div>
              <h2 className="login-form-title">{t('login_otp_title')}</h2>
              <p className="login-form-subtitle">
                {maskedPhone
                  ? t('login_otp_sent_to', { phone: maskedPhone })
                  : t('login_otp_hint')}
              </p>
              <OtpInput value={otp} onChange={setOtp} />
              <button
                type="button"
                className="btn btn-quiet"
                style={{ marginTop: 12 }}
                onClick={() => setOtp('123456')}
              >
                {t('login_demo_otp')}
              </button>
              <div style={{ marginTop: 26 }}>
                <Button
                  type="submit"
                  variant="primary"
                  block
                  className="btn-lg"
                  disabled={otp.length < 6}
                >
                  <Icon name="check" style={{ width: 18, height: 18, marginRight: 6 }} />
                  {t('login_sign_in')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
