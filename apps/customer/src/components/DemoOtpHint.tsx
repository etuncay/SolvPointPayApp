import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { DEMO_OTP_CODE } from '@/config/demo-otp';
import { isDemoMode } from '@/lib/data-layer';

type Props = {
  onUseCode?: (code: string) => void;
  className?: string;
};

/** Mock — login, transfer onay ve iletişim doğrulamada tutarlı sabit OTP ipucu. */
export function DemoOtpHint({ onUseCode, className }: Props) {
  const { t } = useTranslation();
  const [applied, setApplied] = useState(false);

  if (!isDemoMode()) return null;

  const apply = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_OTP_CODE);
    } catch {
      /* panoya erişim yoksa yine alanı doldur */
    }
    onUseCode?.(DEMO_OTP_CODE);
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className={className ? `demo-otp-hint ${className}` : 'demo-otp-hint'} role="note">
      <p className="demo-otp-hint-title">{t('demo_otp_title')}</p>
      <p
        className="demo-otp-hint-code mono"
        aria-label={t('demo_otp_code_label')}
      >
        {DEMO_OTP_CODE}
      </p>
      <Button
        type="button"
        variant="primary"
        block
        className="demo-otp-hint-use-btn"
        onClick={() => void apply()}
        aria-label={t('demo_otp_use_button', { code: DEMO_OTP_CODE })}
      >
        {applied
          ? t('demo_otp_applied')
          : t('demo_otp_use_button', { code: DEMO_OTP_CODE })}
      </Button>
      <p className="demo-otp-hint-foot">{t('demo_otp_hint')}</p>
    </div>
  );
}
