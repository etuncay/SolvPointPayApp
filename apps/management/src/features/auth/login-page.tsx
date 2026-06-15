import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Field, Input, PasswordInput } from '@epay/ui';
import { useAuth } from '@/domain/auth-context';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@epay/data';
import { AuthLayout, AuthError, authButtonStyle } from './auth-layout';
import { OtpStep } from './otp-step';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `${phone.slice(0, phone.length - 4).replace(/\d/g, '•')}${phone.slice(-2)}`;
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const { user, pending, startLogin, verifyOtp, resendOtp, cancelPending } = useAuth();

  const redirectTo = location.state?.from ?? '/';

  React.useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; form?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = t('auth_err_required', 'Bu alan zorunludur');
    else if (!EMAIL_RE.test(email.trim())) next.email = t('auth_err_email', 'Geçerli bir e-posta girin');
    if (!password) next.password = t('auth_err_required', 'Bu alan zorunludur');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const r = startLogin(email, password);
    if (!r.ok) {
      setErrors({
        form:
          r.error === 'inactive'
            ? t('auth_err_inactive', 'Hesap henüz aktif değil')
            : t('auth_err_invalid', 'E-posta veya parola hatalı'),
      });
    }
  };

  if (pending?.kind === 'login') {
    return (
      <OtpStep
        title={t('auth_otp_title', 'Doğrulama kodu')}
        subtitle={t('auth_otp_subtitle', 'Telefonunuza gönderilen 6 haneli kodu girin')}
        destination={maskPhone(pending.phone)}
        demoCode={pending.code}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onCancel={cancelPending}
      />
    );
  }

  const fillDemo = (emailValue: string) => {
    setEmail(emailValue);
    setPassword(DEMO_PASSWORD);
    setErrors({});
  };

  return (
    <AuthLayout
      title={t('auth_login_title', 'Giriş yap')}
      subtitle={t('auth_login_subtitle', 'BackOffice hesabınızla devam edin')}
      footer={
        <>
          {t('auth_no_account', 'Hesabın yok mu?')}{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>
            {t('auth_register_link', 'Kayıt ol')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <AuthError message={errors.form} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label={t('auth_email', 'E-posta')} htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@epay.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t('auth_password', 'Parola')} htmlFor="password" error={errors.password}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit" variant="primary" style={{ ...authButtonStyle, marginTop: 14 }}>
          {t('auth_login_btn', 'Giriş yap')}
        </Button>
      </form>

      <div
        style={{
          marginTop: 16,
          padding: '10px 12px',
          borderRadius: 'var(--r-sm)',
          background: 'var(--bg-sunken)',
          border: '1px solid var(--line)',
        }}
      >
        <div className="fs-11" style={{ fontWeight: 600, marginBottom: 6 }}>
          {t('auth_demo_title', 'Demo hesaplar')}
        </div>
        <div className="fs-11 t-mute" style={{ lineHeight: 1.8 }}>
          {DEMO_ACCOUNTS.map((a) => (
            <div key={a.email} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button
                type="button"
                onClick={() => fillDemo(a.email)}
                className="mono"
                style={{ background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit' }}
              >
                {a.email}
              </button>
              <span>{t(`auth_role_${a.role}`, a.role)}</span>
            </div>
          ))}
          <div style={{ marginTop: 6 }}>
            {t('auth_demo_pass', 'Parola')}: <span className="mono">{DEMO_PASSWORD}</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
