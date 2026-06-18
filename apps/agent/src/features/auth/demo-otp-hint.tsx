import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@epay/ui';

type Props = {
  code: string;
  onUseCode?: (code: string) => void;
};

/** Mock auth — demo OTP'yi belirgin gösterir ve panoya kopyalar. */
export function DemoOtpHint({ code, onUseCode }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t('auth_otp_copied'));
      onUseCode?.(code);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('auth_otp_copy_failed'));
    }
  };

  return (
    <div
      role="note"
      className="demo-otp-hint"
      style={{
        marginBottom: 14,
        padding: '12px 14px',
        borderRadius: 'var(--r-sm)',
        background: 'color-mix(in srgb, var(--warn, #d97706) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--warn, #d97706) 32%, transparent)',
      }}
    >
      <p className="fs-11" style={{ fontWeight: 600, margin: 0, textAlign: 'center' }}>
        {t('auth_otp_demo_title')}
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginTop: 10,
        }}
      >
        <span
          className="mono"
          aria-label={t('auth_otp_demo')}
          style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.22em' }}
        >
          {code}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => void copy()}>
          <Copy size={14} /> {copied ? t('dd_copied') : t('dd_copy')}
        </Button>
      </div>
      <p className="fs-11 t-mute" style={{ margin: '8px 0 0', textAlign: 'center', lineHeight: 1.45 }}>
        {t('auth_otp_demo_hint')}
      </p>
    </div>
  );
}
