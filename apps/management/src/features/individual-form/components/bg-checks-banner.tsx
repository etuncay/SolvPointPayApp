import { Shield, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BackgroundCheckStatus } from '../domain/types';

type Props = {
  checks: BackgroundCheckStatus | null;
  open: boolean;
  onDismiss: () => void;
};

export function BgChecksBanner({ checks, open, onDismiss }: Props) {
  const { t } = useTranslation();

  if (!open || !checks) return null;

  const kpsLabel =
    checks.kps === 'ok'
      ? t('if_kps_synced')
      : checks.kps === 'pending'
        ? t('if_kps_pending')
        : t('if_kps_error');

  const sanctionLabel =
    checks.sanction === 'clean'
      ? t('if_sanction_clean')
      : checks.sanction === 'hit'
        ? t('if_sanction_hit_label')
        : t('if_sanction_pending');

  return (
    <div className="ins-banner">
      <div className="ic">
        <Shield size={14} />
      </div>
      <div style={{ flex: 1 }}>
        <strong>{t('if_bg_checks')}</strong> {kpsLabel} · {sanctionLabel} · IBAN {checks.ibanVerified}/
        {checks.ibanTotal} ✓
      </div>
      <button
        type="button"
        className="x"
        onClick={onDismiss}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}
        aria-label="close"
      >
        <X size={14} />
      </button>
    </div>
  );
}
