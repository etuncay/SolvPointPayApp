import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { ApprovePayload, EntityStatus, KycStatus, ReviewCustomerSummary } from '../domain/types';
import { canSelectKycLevel } from '../domain/decision-validation';

type Props = {
  open: boolean;
  customer: ReviewCustomerSummary;
  onClose: () => void;
  onConfirm: (payload: ApprovePayload) => void;
};

export function ApproveDecisionModal({ open, customer, onClose, onConfirm }: Props) {
  const { t } = useTranslation();

  const [kycStatus, setKycStatus] = useState<Exclude<KycStatus, null> | 'unchanged'>('unchanged');
  const [entityStatus, setEntityStatus] = useState<EntityStatus>('active');
  const [kycLevel, setKycLevel] = useState(customer.kycLevel ?? 'L1');
  const [statusReason, setStatusReason] = useState('');
  const [comment, setComment] = useState('');

  if (!open) return null;

  const needsReason = entityStatus === 'blocked' || entityStatus === 'closed';
  const isIndividual = customer.customerType === 'individual';

  const submit = () => {
    if (needsReason && !statusReason.trim()) return;
    if (!comment.trim()) return;
    onConfirm({
      kycStatus,
      entityStatus,
      kycLevel: isIndividual ? kycLevel : undefined,
      statusReason: needsReason ? statusReason : null,
      comment: comment.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('dr_modal_approve_title')}</h2>
          <p>{t('dr_modal_approve_sub')}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('dr_kyc_status')}>
            <select
              className="select"
              value={kycStatus}
              onChange={(e) => setKycStatus(e.target.value as Exclude<KycStatus, null> | 'unchanged')}
            >
              <option value="unchanged">{t('dr_no_change')}</option>
              <option value="Approved">{t('dr_kyc_approved')}</option>
              <option value="Pending">{t('bm_status_Pending')}</option>
            </select>
          </Field>
          <Field label={t('dr_entity_status')}>
            <select className="select" value={entityStatus} onChange={(e) => setEntityStatus(e.target.value as EntityStatus)}>
              <option value="active">{t('ib_status_Active')}</option>
              <option value="inactive">{t('ib_status_Inactive')}</option>
              <option value="blocked">{t('fcd_blocked')}</option>
              <option value="closed">{t('rl_closed')}</option>
            </select>
          </Field>
          {needsReason && (
            <Field label={t('dr_reason')} required>
              <input className="input" value={statusReason} onChange={(e) => setStatusReason(e.target.value)} />
            </Field>
          )}
          {isIndividual && (
            <Field label={t('dr_kyc_level')}>
              <select className="select" value={kycLevel} onChange={(e) => setKycLevel(e.target.value)}>
                {['L0', 'L1', 'L2', 'L3'].map((lv) => (
                  <option key={lv} value={lv} disabled={!canSelectKycLevel(customer, lv)}>
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
          <Button type="button" variant="primary" onClick={submit}>{t('fcd_action_approve')}</Button>
        </div>
      </div>
    </div>
  );
}
