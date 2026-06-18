import { useState } from 'react';
import { Link } from 'react-router-dom';
import { customerPortalApi } from '@epay/data';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { isDemoMode } from '@/lib/data-layer';
import { useTranslation } from 'react-i18next';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const demoMode = isDemoMode();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!demoMode) {
      await customerPortalApi.requestPasswordReset(email);
    }
    setSubmitted(true);
  }

  return (
    <>
      <DemoModeBanner placement="page-top" />
      <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="card card-pad">
          <h1 className="page-title" style={{ fontSize: 22, marginBottom: 12 }}>
            {t('forgot_pw_title')}
          </h1>

          {demoMode && !submitted ? (
            <div style={{ marginBottom: 16 }}>
              <AlertBanner tone="warning" icon="info">
                {t('forgot_pw_demo_notice')}
              </AlertBanner>
            </div>
          ) : null}

          {submitted ? (
            <AlertBanner tone={demoMode ? 'warning' : 'info'} icon={demoMode ? 'info' : 'shield'}>
              {demoMode ? t('forgot_pw_demo_notice') : t('forgot_pw_success')}
            </AlertBanner>
          ) : (
            <form onSubmit={onSubmit}>
              <Field label={t('forgot_pw_email_label')} required>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Button type="submit" variant="primary" block style={{ marginTop: 16 }}>
                {t('forgot_pw_submit')}
              </Button>
            </form>
          )}

          <p style={{ marginTop: 16 }}>
            <Link to="/login">{t('forgot_pw_back_login')}</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
