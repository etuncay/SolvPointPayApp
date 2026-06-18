import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from '@epay/ui';
import type { FlowResult } from '@/domain/auth-context';
import { AuthLayout, AuthError, authButtonStyle } from './auth-layout';
import { DemoOtpHint } from './demo-otp-hint';

/** Ortak OTP doğrulama adımı (login 2FA + register doğrulama). */
export function OtpStep({
  title,
  subtitle,
  destination,
  demoCode,
  onVerify,
  onResend,
  onCancel,
}: {
  title: string;
  subtitle: string;
  destination: string;
  demoCode?: string;
  onVerify: (code: string) => FlowResult | Promise<FlowResult>;
  onResend: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string>();
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError(t('auth_err_otp_len', 'Lütfen 6 haneli kodu girin'));
      return;
    }
    setBusy(true);
    try {
      const r = await onVerify(code);
      if (!r.ok) {
        setError(
          r.error === 'expired'
            ? t('auth_err_otp_expired', 'Oturum zaman aşımına uğradı, tekrar deneyin')
            : t('auth_err_otp', 'Kod hatalı'),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      footer={
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', font: 'inherit' }}
        >
          {t('auth_back', 'Geri dön')}
        </button>
      }
    >
      <form onSubmit={submit} noValidate>
        <p className="t-mute fs-12" style={{ textAlign: 'center', marginBottom: 12 }}>
          {destination}
        </p>
        {demoCode ? (
          <DemoOtpHint
            code={demoCode}
            onUseCode={(value) => {
              setCode(value);
              setError(undefined);
            }}
          />
        ) : null}
        <AuthError message={error} />
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
          <InputOTP
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern={REGEXP_ONLY_DIGITS}
            maxLength={6}
            value={code}
            onChange={(v: string) => {
              setCode(v);
              setError(undefined);
            }}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="submit" variant="primary" style={authButtonStyle} disabled={busy}>
          {t('auth_otp_verify', 'Doğrula')}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              void Promise.resolve(onResend()).then(() => {
                setCode('');
                setError(undefined);
              });
            }}
          >
            {t('auth_otp_resend', 'Kodu yeniden gönder')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
