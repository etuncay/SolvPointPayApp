import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import type { KycVerifyInput } from '../domain/types';

type ApproverUserId = (typeof MOCK_USER_IDS)[keyof typeof MOCK_USER_IDS];

type Props = {
  open: boolean;
  defaultScore?: number;
  onClose: () => void;
  onConfirm: (input: KycVerifyInput) => void;
};

export function VerifyModal({ open, defaultScore, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [riskScore, setRiskScore] = useState(String(defaultScore ?? 40));
  const [approverUserId, setApproverUserId] = useState<ApproverUserId>(MOCK_USER_IDS.management);

  if (!open) return null;

  const submit = () => {
    onConfirm({
      evaluationNote: note.trim(),
      riskScore: Number(riskScore),
      approverUserId,
    });
    setNote('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('kyc_modal_verify_title')}</h2>
          <p>{t('kyc_modal_verify_desc')}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('scr_col_risk')} required>
            <input
              className="input mono"
              type="number"
              min={0}
              max={100}
              value={riskScore}
              onChange={(e) => setRiskScore(e.target.value)}
            />
          </Field>
          <Field label={t('kyc_approver')} required>
            <select
              className="select"
              value={approverUserId}
              onChange={(e) => setApproverUserId(e.target.value as ApproverUserId)}
            >
              <option value={MOCK_USER_IDS.management}>{t('kyc_approver_mgmt')}</option>
            </select>
          </Field>
          <Field label={t('kyc_eval_note')} required>
            <textarea
              className="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('kyc_eval_note_ph')}
            />
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" onClick={onClose}>{t('cancel')}</Button>
          <Button type="button" variant="primary" onClick={submit}>{t('confirm')}</Button>
        </div>
      </div>
    </div>
  );
}
