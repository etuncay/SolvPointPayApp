import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@epay/ui';
import { isDemoMode } from '@/lib/data-layer';
import { DEMO_APPROVAL_OTP } from '../domain/demo-approval-otp';

type Props = {
  onUseCode?: (code: string) => void;
};

/** Onay modu — demo OTP ipucu (123456 veya herhangi 6 hane). */
export function ApprovalOtpDemoHint({ onUseCode }: Props) {
  const { t } = useTranslation();
  if (!isDemoMode()) return null;

  const fillDemoCode = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_APPROVAL_OTP);
      onUseCode?.(DEMO_APPROVAL_OTP);
      toast.success(t('ag_cf_otp_copied'));
    } catch {
      onUseCode?.(DEMO_APPROVAL_OTP);
      toast.success(t('ag_cf_otp_filled'));
    }
  };

  return (
    <div
      role="note"
      className="approval-otp-demo-hint"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--r-sm)',
        background: 'color-mix(in srgb, var(--warn, #d97706) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--warn, #d97706) 32%, transparent)',
      }}
    >
      <p className="fs-11" style={{ fontWeight: 600, margin: 0 }}>
        {t('ag_cf_otp_demo_title')}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <span className="mono" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em' }}>
          {DEMO_APPROVAL_OTP}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => void fillDemoCode()}>
          <Copy size={14} /> {t('ag_cf_otp_demo_use')}
        </Button>
      </div>
      <p className="fs-11 t-mute" style={{ margin: '6px 0 0', lineHeight: 1.45 }}>
        {t('ag_cf_otp_demo_hint')}
      </p>
    </div>
  );
}
