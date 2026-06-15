import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PenLine, Send } from 'lucide-react';
import { Button, Field, FormCard } from '@epay/ui';
import type { RiskScoreDetail } from '../domain/types';

export function ManualChangePanel({
  detail,
  disabled,
  submitting,
  onSubmit,
}: {
  detail: RiskScoreDetail;
  disabled: boolean;
  submitting: boolean;
  onSubmit: (newScore: number, reason: string) => void;
}) {
  const { t } = useTranslation();
  const [newScore, setNewScore] = useState('');
  const [reason, setReason] = useState('');

  const pending = detail.pendingApprovalId != null;
  const formDisabled = disabled || pending || submitting;

  const handleSubmit = () => {
    const score = Number(newScore);
    onSubmit(score, reason);
  };

  return (
    <FormCard title={t('rsc_panel_change')} icon={<PenLine size={13} />} id="sec-change">
      {pending && detail.pendingApprovalRef && (
        <div className="rsc-pending-banner">
          {t('rsc_pending_banner', { ref: detail.pendingApprovalRef })}{' '}
          <Link to={`/approvals/${detail.pendingApprovalId}`} className="link">
            {t('rsc_pending_link')}
          </Link>
        </div>
      )}

      <div className="rsc-change-form">
        <Field label={t('rsc_new_score')}>
          <input
            className="input mono"
            type="number"
            min={0}
            max={100}
            value={newScore}
            disabled={formDisabled}
            onChange={(e) => setNewScore(e.target.value)}
          />
        </Field>
        <Field label={t('rsc_reason')}>
          <textarea
            className="input"
            rows={4}
            value={reason}
            disabled={formDisabled}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="button" variant="primary" disabled={formDisabled} onClick={handleSubmit}>
            <Send size={14} /> {t('rsc_submit')}
          </Button>
        </div>
      </div>
    </FormCard>
  );
}
