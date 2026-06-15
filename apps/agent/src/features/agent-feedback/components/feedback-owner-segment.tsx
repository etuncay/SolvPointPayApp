import { useTranslation } from 'react-i18next';
import type { RequesterOwner } from '../domain/types';

interface Props {
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
}

/** Talep sahibi — referans dso-page seg kontrolü. */
export function FeedbackOwnerSegment({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const owner = (value === 'Customer' ? 'Customer' : 'Self') as RequesterOwner;

  return (
    <div className="seg" style={{ alignSelf: 'flex-start' }}>
      <button
        type="button"
        className={owner === 'Self' ? 'on' : ''}
        disabled={disabled}
        onClick={() => onChange?.('Self')}
      >
        {t('ag_fb_owner_self')}
      </button>
      <button
        type="button"
        className={owner === 'Customer' ? 'on' : ''}
        disabled={disabled}
        onClick={() => onChange?.('Customer')}
      >
        {t('ag_fb_owner_customer')}
      </button>
    </div>
  );
}
