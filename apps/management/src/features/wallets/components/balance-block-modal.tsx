import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { BalanceBlockInput } from '../domain/detail-types';

type Props = {
  open: boolean;
  currentBlocked: number;
  onClose: () => void;
  onConfirm: (input: BalanceBlockInput) => void;
};

export function BalanceBlockModal({ open, currentBlocked, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(String(currentBlocked || 0));
  const [fullBlock, setFullBlock] = useState(currentBlocked === -1);
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  if (!open) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  const submit = () => {
    if (!reason.trim()) return;
    const blockedAmount = fullBlock ? -1 : Number(amount);
    if (!fullBlock && (Number.isNaN(blockedAmount) || blockedAmount < 0)) return;
    if (endDate && endDate < minDate) return;
    onConfirm({
      blockedAmount,
      blockEndDate: endDate || null,
      reason: reason.trim(),
    });
    setReason('');
    setEndDate('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2 style={{ color: 'var(--danger-fg)' }}>{t('wd_balance_block')}</h2>
          <p>{t('wd_block_modal_sub')}</p>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
          <Field label={t('wd_block_amount')} required>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={fullBlock}
                onChange={(e) => setFullBlock(e.target.checked)}
              />
              {t('wd_block_full')}
            </label>
            <input
              className="input mono"
              type="number"
              min={0}
              disabled={fullBlock}
              value={fullBlock ? '-1' : amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label={t('wd_block_end')} hint={t('wd_block_end_hint')}>
            <input
              className="input"
              type="date"
              min={minDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
          <Field label={t('sj_manual_reason')} required>
            <textarea
              className="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button type="button" variant="danger" onClick={submit} disabled={!reason.trim()}>
            {t('wd_block_submit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
