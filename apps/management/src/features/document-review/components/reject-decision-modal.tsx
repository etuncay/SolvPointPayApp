import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { KycStatus, RejectPayload, ReviewCustomerSummary } from '../domain/types';

type Props = {
  open: boolean;
  customer: ReviewCustomerSummary;
  onClose: () => void;
  onConfirm: (payload: RejectPayload) => void;
};

export function RejectDecisionModal({ open, customer, onClose, onConfirm }: Props) {
  const { t } = useTranslation();

  const [kycStatus, setKycStatus] = useState<Exclude<KycStatus, null> | 'unchanged'>('unchanged');
  const [kycLevel, setKycLevel] = useState(customer.kycLevel ?? 'L1');
  const [comment, setComment] = useState('');

  if (!open) return null;

  const isIndividual = customer.customerType === 'individual';
  const levels = ['L0', 'L1', 'L2', 'L3'];
  const currentIdx = levels.indexOf(customer.kycLevel ?? 'L1');

  const submit = () => {
    if (!comment.trim()) return;
    onConfirm({
      kycStatus,
      kycLevel: isIndividual ? kycLevel : undefined,
      comment: comment.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2 style={{ color: 'var(--danger-fg)' }}>{t('dr_modal_reject_title')}</h2>
          <p>{t('dr_modal_reject_sub')}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('dr_kyc_status')}>
            <select
              className="select"
              value={kycStatus}
              onChange={(e) => setKycStatus(e.target.value as Exclude<KycStatus, null> | 'unchanged')}
            >
              <option value="unchanged">{t('dr_no_change')}</option>
              <option value="Rejected">{t('dr_kyc_rejected')}</option>
            </select>
          </Field>
          {isIndividual && (
            <Field label={t('dr_kyc_level')}>
              <select className="select" value={kycLevel} onChange={(e) => setKycLevel(e.target.value)}>
                {levels.map((lv, i) => (
                  <option key={lv} value={lv} disabled={i > currentIdx}>
                    {lv}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label={t('dr_comment')} required>
            <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" onClick={onClose}>{t('dr_cancel')}</Button>
          <Button type="button" variant="danger" onClick={submit}>{t('scf_btn_reject')}</Button>
        </div>
      </div>
    </div>
  );
}
