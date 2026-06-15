import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTransferDraft } from '@/app/TransferDraftContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/icons/Icon';
import { StatusPill } from '@/components/ui/StatusPill';
import { fmtMoney } from '@/lib/format';
import { useTranslation } from 'react-i18next';
import { customerPortalApi } from '@epay/data';
import type { TransactionStatus } from '@epay/data';

function SuccessRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="kv">
      <span className="k">{label}</span>
      <span className="v">{value}</span>
    </div>
  );
}

export function SuccessPage() {
  const { t } = useTranslation();
  const { draft, result, clear } = useTransferDraft();

  async function download() {
    if (!result) return;
    const r = await customerPortalApi.getReceipt(result.transactionId);
    if (r) alert(t('activity_receipt_downloading', { file: r.fileName }));
  }

  if (!draft || !result) {
    return (
      <div className="page">
        <div className="container empty">{t('success_empty')}</div>
      </div>
    );
  }

  const refNo = result.referenceNo;
  const isReceive = draft.kind === 'receive';
  const isIntl = draft.kind === 'intl';
  const status = result.status as TransactionStatus;

  return (
    <div className="page success-page">
      <div className="container">
        <div className="card success-card">
          <div className="success-card-accent" />
          <span className="success-icon">
            <Icon name="check" style={{ width: 40, height: 40, strokeWidth: 2.6 }} />
          </span>
          <h1 className="success-title">
            {isIntl ? t('success_title_started') : t('success_title')}
          </h1>
          <p className="success-lead">
            <strong className="tnum">{fmtMoney(draft.amount, draft.symbol)}</strong>{' '}
            {isReceive
              ? t('success_receive_body', { name: draft.recipientName })
              : isIntl
                ? t('success_send_body_intl', { name: draft.recipientName })
                : t('success_send_body', { name: draft.recipientName })}
          </p>
          {isIntl ? (
            <div style={{ margin: '10px 0 4px' }}>
              <StatusPill status="Sent" />
            </div>
          ) : null}
          <div className="success-summary">
            <SuccessRow
              label={t('confirm_reference')}
              value={<span className="tnum">{refNo}</span>}
            />
            <SuccessRow
              label={t('confirm_payable_total')}
              value={<span className="tnum">{fmtMoney(draft.total, draft.symbol)}</span>}
            />
            <SuccessRow label={t('success_status')} value={<StatusPill status={status} />} />
          </div>
          <div className="success-actions">
            {result.receiptAvailable ? (
              <Button variant="ghost" className="btn-block" onClick={() => void download()}>
                <Icon name="download" /> {t('download_receipt')}
              </Button>
            ) : null}
            <Link to="/" onClick={clear}>
              <Button variant="primary" className="btn-block">
                {t('success_home')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
