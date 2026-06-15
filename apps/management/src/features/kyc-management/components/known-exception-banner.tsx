import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

type Props = { show: boolean };

export function KnownExceptionBanner({ show }: Props) {
  const { t } = useTranslation();
  if (!show) return null;
  return (
    <div
      className="banner warn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 'var(--r-md)',
        marginTop: 12,
        background: 'color-mix(in srgb, var(--warn, #d97706) 14%, transparent)',
      }}
    >
      <AlertTriangle size={16} />
      <span className="fs-12">{t('kyc_known_exception_banner')}</span>
    </div>
  );
}
