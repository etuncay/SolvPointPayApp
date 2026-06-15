import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { Button } from '@epay/ui';
import type { NotificationTemplate } from '../../domain/types';

type Props = {
  template: NotificationTemplate;
  canEdit: boolean;
  onTrigger: (input: {
    recipientAddress: string;
    recipientDisplayName?: string;
    params: Record<string, string>;
    reason: string;
    scheduledAt?: string;
  }) => Promise<{ ok: boolean; errorCode?: string }>;
};

export function ManualTriggerTab({ template, canEdit, onTrigger }: Props) {
  const { t } = useTranslation();
  const [address, setAddress] = useState(
    template.notificationType === 'Email' ? 'ops@epay.local' : '05551234567',
  );
  const [paramsJson, setParamsJson] = useState('{\n  "kullanici_adi": "Test Kullanıcı"\n}');
  const [reason, setReason] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [running, setRunning] = useState(false);

  const submit = async () => {
    let params: Record<string, string> = {};
    try {
      params = JSON.parse(paramsJson) as Record<string, string>;
    } catch {
      return { ok: false, errorCode: 'nt_params_invalid' };
    }
    setRunning(true);
    const result = await onTrigger({
      recipientAddress: address,
      params,
      reason,
      scheduledAt: scheduledAt || undefined,
    });
    setRunning(false);
    return result;
  };

  return (
    <div className="card" style={{ padding: 20, maxWidth: 520, display: 'grid', gap: 12 }}>
      <label className="fs-12">
        <span className="t-mute">{t('nt_manual_template')}</span>
        <input className="input" readOnly value={template.name} />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('nt_manual_address')}</span>
        <input
          className="input"
          disabled={!canEdit}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('nt_manual_params')}</span>
        <textarea
          className="input mono fs-12"
          rows={5}
          disabled={!canEdit}
          value={paramsJson}
          onChange={(e) => setParamsJson(e.target.value)}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_col_cron')}</span>
        <input
          className="input"
          type="datetime-local"
          disabled={!canEdit}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_manual_reason')}</span>
        <textarea
          className="input"
          rows={2}
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
          disabled={running || !reason.trim() || !address.trim()}
          onClick={submit}
        >
          <Play size={14} /> {t('nt_manual_send')}
        </Button>
      ) : null}
    </div>
  );
}
