import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { Button } from '@epay/ui';
import type { ScheduledJob } from '../../domain/types';

type Props = {
  job: ScheduledJob;
  canEdit: boolean;
  onRun: (input: {
    reason: string;
    scheduledAt?: string;
    feedbackEmail?: string;
  }) => Promise<{ ok: boolean; errorCode?: string }>;
};

export function ManualRunTab({ job, canEdit, onRun }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState(job.feedbackEmail ?? '');
  const [running, setRunning] = useState(false);

  const submit = async () => {
    setRunning(true);
    const result = await onRun({
      reason,
      scheduledAt: scheduledAt || undefined,
      feedbackEmail: feedbackEmail || undefined,
    });
    setRunning(false);
    return result;
  };

  return (
    <div className="card" style={{ padding: 20, maxWidth: 520, display: 'grid', gap: 12 }}>
      <label className="fs-12">
        <span className="t-mute">{t('sj_manual_job')}</span>
        <input className="input" readOnly value={job.name} />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_sched_col_at')}</span>
        <input
          className="input"
          type="datetime-local"
          disabled={!canEdit}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_field_feedback_email')}</span>
        <input
          className="input"
          type="email"
          disabled={!canEdit}
          value={feedbackEmail}
          onChange={(e) => setFeedbackEmail(e.target.value)}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_manual_reason')}</span>
        <textarea
          className="input"
          rows={3}
          disabled={!canEdit}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      {canEdit ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={running || !reason.trim()}
          onClick={submit}
        >
          <Play size={14} /> {t('sj_manual_run_btn')}
        </Button>
      ) : null}
    </div>
  );
}
