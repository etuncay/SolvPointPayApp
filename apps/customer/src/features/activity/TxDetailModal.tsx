import type { ReactNode } from 'react';
import type { CustomerTransaction } from '@epay/data';
import { customerPortalApi } from '@epay/data';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { DirBadge } from '@/components/ui/DirBadge';
import { Icon } from '@/components/icons/Icon';
import { fmtMoney } from '@/lib/format';
import { paymentPurposeI18nKey } from '@/lib/enums';

function counterpartyAccount(tx: CustomerTransaction): string {
  if (tx.iban && tx.iban !== '—') return tx.iban;
  return tx.account ?? '—';
}

function canDownloadReceipt(status: CustomerTransaction['status']): boolean {
  return status === 'Completed' || status === 'Sent';
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="tx-detail-row">
      <span className="tx-detail-k">{label}</span>
      <span className="tx-detail-v">{value}</span>
    </div>
  );
}

export function TxDetailModal({
  tx,
  onClose,
}: {
  tx: CustomerTransaction;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  async function downloadReceipt() {
    const r = await customerPortalApi.getReceipt(tx.id);
    if (r) alert(t('activity_receipt_downloading', { file: r.fileName }));
  }

  const amountClass =
    tx.direction === 'in' ? 'tx-detail-amount tx-detail-amount--in' : 'tx-detail-amount';
  const amountPrefix = tx.direction === 'in' ? '+' : '−';

  return (
    <Modal onClose={onClose} max={560}>
      <div className="tx-detail-header">
        <div className="tx-detail-header-main">
          <DirBadge dir={tx.direction} />
          <div>
            <h3 className="tx-detail-type">{tx.type}</h3>
            <div className="tx-detail-id tnum">{tx.id}</div>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('activity_close')}>
          <Icon name="close" />
        </button>
      </div>

      <div className="tx-detail-hero">
        <div className={`tnum ${amountClass}`}>
          {amountPrefix}
          {fmtMoney(tx.amount, tx.symbol)}
        </div>
        <div className="tx-detail-status">
          <StatusPill status={tx.status} />
        </div>
      </div>

      <div className="tx-detail-panel">
        <DetailRow label={t('activity_detail_date')} value={<span className="tnum">{tx.date}</span>} />
        <DetailRow
          label={t('activity_detail_direction')}
          value={tx.direction === 'in' ? t('activity_dir_in') : t('activity_dir_out')}
        />
        <DetailRow label={t('activity_detail_counterparty')} value={tx.counterparty} />
        <DetailRow
          label={t('activity_detail_counterparty_no')}
          value={<span className="tnum">{tx.counterpartyNo ?? '—'}</span>}
        />
        <DetailRow
          label={t('activity_detail_account')}
          value={<span className="tnum">{counterpartyAccount(tx)}</span>}
        />
        {tx.country ? (
          <DetailRow label={t('activity_detail_country')} value={tx.country} />
        ) : null}
        {tx.fxRate ? (
          <DetailRow
            label={t('activity_detail_fx')}
            value={<span className="tnum">{tx.fxRate}</span>}
          />
        ) : null}
        <DetailRow
          label={t('activity_detail_purpose')}
          value={tx.purpose ? t(paymentPurposeI18nKey(tx.purpose), { defaultValue: tx.purpose }) : '—'}
        />
        <DetailRow
          label={t('activity_detail_reference')}
          value={<span className="tnum">{tx.referenceNo}</span>}
        />
        <DetailRow
          label={t('activity_detail_balance_after')}
          value={
            <span className="tnum">{fmtMoney(tx.balanceAfter, tx.symbol)}</span>
          }
        />
        <DetailRow
          label={t('activity_detail_description')}
          value={tx.description ?? '—'}
        />
      </div>

      <div className="tx-detail-footer">
        <Button variant="ghost" className="btn-block" onClick={onClose}>
          <Icon name="left" style={{ width: 16, height: 16 }} /> {t('activity_back')}
        </Button>
        <Button
          variant="primary"
          className="btn-block"
          onClick={downloadReceipt}
          disabled={!canDownloadReceipt(tx.status)}
        >
          <Icon name="download" /> {t('activity_receipt_download')}
        </Button>
      </div>
    </Modal>
  );
}
