import { Shield, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BackgroundCheckStatus } from '../domain/types';

type Props = {
  checks: BackgroundCheckStatus | null;
  open: boolean;
  onDismiss: () => void;
};

export function BgChecksBanner({ checks, open, onDismiss }: Props) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  if (!open || !checks) return null;

  const vknLabel =
    checks.vkn === 'ok'
      ? tr
        ? 'VKN doğrulandı'
        : 'VKN verified'
      : checks.vkn === 'pending'
        ? tr
          ? 'VKN beklemede'
          : 'VKN pending'
        : tr
          ? 'VKN hata'
          : 'VKN error';

  const sanctionLabel =
    checks.sanction === 'clean'
      ? tr
        ? 'Sanction temiz'
        : 'Sanction clean'
      : checks.sanction === 'hit'
        ? tr
          ? 'Sanction eşleşme'
          : 'Sanction hit'
        : tr
          ? 'Sanction beklemede'
          : 'Sanction pending';

  return (
    <div className="ins-banner">
      <div className="ic">
        <Shield size={14} />
      </div>
      <div style={{ flex: 1 }}>
        <strong>{tr ? 'Arka plan kontrolleri:' : 'Background checks:'}</strong>{' '}
        {vknLabel} · {sanctionLabel} · IBAN {checks.ibanVerified}/{checks.ibanTotal} ✓
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
