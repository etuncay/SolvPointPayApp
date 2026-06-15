import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, X } from 'lucide-react';
import { DynamicForm, FormMode, IconButton } from '@epay/ui';
import { agentTransactionsStore } from '@/features/transaction-confirmation/api/agent-transactions-store';
import { buildTransactionDetail } from '@/features/transaction-confirmation/domain/build-transaction-detail';
import { buildTransactionDetailFormConfig } from '../transaction-detail-form-config';
import { rowToDetailFormValues } from '../domain/row-to-detail-form-values';
import type { AgentTransactionRow } from '../domain/types';
import { TransactionStatusBadge } from './transaction-status-badge';

interface Props {
  row: AgentTransactionRow | null;
  onClose: () => void;
}

/** 1.1 Detay Modu — DynamicForm yan panel. */
export function TransactionDetailDrawer({ row, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildTransactionDetailFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const initialValues = useMemo(() => {
    if (!row) return {};
    const tx = agentTransactionsStore.get(row.id);
    const detail = tx ? buildTransactionDetail(tx, [], [], null) : null;
    const feeFixed = detail?.feeFixed ?? Math.max(5, Math.round(row.amount * 0.01));
    const feeVariable = detail?.feeVariable ?? Math.max(0, Math.round(row.amount * 0.005));
    return rowToDetailFormValues(row, lang, t, feeFixed, feeVariable);
  }, [row, lang, t]);

  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [row, onClose]);

  if (!row) return null;

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} role="presentation" />
      <div className="cust-drawer open" role="dialog" style={{ width: 'min(480px, 96vw)' }}>
        <div className="head">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              background: 'var(--accent-soft)',
              color: 'var(--accent-fg)',
            }}
          >
            <ArrowLeftRight size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 15 }}>
              {row.transactionNo}
              <span className="badge muted" style={{ fontSize: 10 }}>
                1.1
              </span>
            </h2>
            <div className="sub">
              <TransactionStatusBadge status={row.status} />
              <span className="t-mute">{t('ag_tx_hist_detail_mode')}</span>
            </div>
          </div>
          <IconButton onClick={onClose} aria-label={t('td_back')}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="body">
          <DynamicForm
            config={formConfig}
            mode={FormMode.View}
            permissions={{ view: true }}
            initialValues={initialValues}
            t={translate}
          />
        </div>
      </div>
    </>
  );
}
