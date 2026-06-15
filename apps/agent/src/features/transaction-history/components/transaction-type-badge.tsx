import { useTranslation } from 'react-i18next';
import type { TransactionType } from '@/features/transaction-confirmation/domain/transaction-types';
import { transactionTypeSpec } from '../domain/transaction-type-spec';

/** İşlem türü — menü kodu + etiket (6.1, 6.2 …). */
export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const { t } = useTranslation();
  const spec = transactionTypeSpec(type);
  return (
    <span className="kyc-pill" style={{ borderColor: 'var(--line)' }}>
      <span className="t-mute" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
        {spec.no}
      </span>
      {t(spec.labelKey)}
    </span>
  );
}
