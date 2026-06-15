import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { useTranslation } from 'react-i18next';
import { fmtMoney } from '@/lib/format';

export function SourceWalletPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const { t } = useTranslation();
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });
  const persistent = wallets.filter((w) => w.type === 'CustomerPersistent' && w.editable);

  return (
    <div>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: 'var(--ink-2)',
          marginBottom: 10,
        }}
      >
        {label ?? t('transfer_source_wallet')}
        <span style={{ color: 'var(--neg)' }}> *</span>
      </div>
      <div className="source-wallet-grid">
        {persistent.map((w) => {
          const selected = value === w.id;
          return (
            <button
              key={w.id}
              type="button"
              className={`source-wallet-option${selected ? ' selected' : ''}`}
              onClick={() => onChange(w.id)}
            >
              <div className="source-wallet-option-label">
                {w.label} · {w.currency}
              </div>
              <div className="source-wallet-option-balance tnum">
                {fmtMoney(w.balance, w.symbol)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
