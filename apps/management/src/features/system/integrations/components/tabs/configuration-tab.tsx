import { useTranslation } from 'react-i18next';
import type { IntegrationDefinition, UpdateIntegrationPayload } from '../../domain/types';

type Props = {
  draft: UpdateIntegrationPayload;
  integration: IntegrationDefinition;
  canEdit: boolean;
  onPatch: (p: Partial<UpdateIntegrationPayload>) => void;
};

export function ConfigurationTab({ draft, integration, canEdit, onPatch }: Props) {
  const { t } = useTranslation();
  const cbOn = draft.circuitBreakerEnabled ?? integration.circuitBreakerEnabled;
  return (
    <div className="card" style={{ padding: 20, display: 'grid', gap: 12, maxWidth: 720 }}>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_rate_limit')}</span>
        <input
          className="input"
          type="number"
          disabled={!canEdit}
          value={draft.rateLimitPerMin ?? 0}
          onChange={(e) => onPatch({ rateLimitPerMin: Number(e.target.value) })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_retry_policy')}</span>
        <select
          className="select"
          disabled={!canEdit}
          value={draft.retryPolicy ?? integration.retryPolicy}
          onChange={(e) =>
            onPatch({ retryPolicy: e.target.value as IntegrationDefinition['retryPolicy'] })
          }
        >
          <option value="FixedDelay">FixedDelay</option>
          <option value="ExponentialBackoff">ExponentialBackoff</option>
        </select>
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_max_retry')}</span>
        <input
          className="input"
          type="number"
          disabled={!canEdit}
          value={draft.maxRetry ?? 0}
          onChange={(e) => onPatch({ maxRetry: Number(e.target.value) })}
        />
      </label>
      <label className="fs-12" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          disabled={!canEdit}
          checked={draft.useSignature ?? false}
          onChange={(e) => onPatch({ useSignature: e.target.checked })}
        />
        {t('int_field_use_signature')}
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_webhook')}</span>
        <input
          className="input mono"
          disabled={!canEdit}
          value={draft.webhookUrl ?? ''}
          onChange={(e) => onPatch({ webhookUrl: e.target.value || null })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_api_version')}</span>
        <input
          className="input"
          disabled={!canEdit}
          value={draft.apiVersion ?? ''}
          onChange={(e) => onPatch({ apiVersion: e.target.value })}
        />
      </label>
      <label className="fs-12" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          disabled={!canEdit}
          checked={cbOn}
          onChange={(e) => onPatch({ circuitBreakerEnabled: e.target.checked })}
        />
        {t('int_field_cb_enabled')}
      </label>
      {cbOn ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="fs-12">
            <span className="t-mute">{t('int_field_cb_threshold')}</span>
            <input
              className="input"
              type="number"
              disabled={!canEdit}
              value={draft.errorRateThresholdPct ?? ''}
              onChange={(e) => onPatch({ errorRateThresholdPct: Number(e.target.value) })}
            />
          </label>
          <label className="fs-12">
            <span className="t-mute">{t('int_field_cb_window')}</span>
            <input
              className="input"
              type="number"
              disabled={!canEdit}
              value={draft.windowSeconds ?? ''}
              onChange={(e) => onPatch({ windowSeconds: Number(e.target.value) })}
            />
          </label>
          <label className="fs-12">
            <span className="t-mute">{t('int_field_cb_min')}</span>
            <input
              className="input"
              type="number"
              disabled={!canEdit}
              value={draft.minRequestCount ?? ''}
              onChange={(e) => onPatch({ minRequestCount: Number(e.target.value) })}
            />
          </label>
          <label className="fs-12">
            <span className="t-mute">{t('int_field_cb_open')}</span>
            <input
              className="input"
              type="number"
              disabled={!canEdit}
              value={draft.openDurationSeconds ?? ''}
              onChange={(e) => onPatch({ openDurationSeconds: Number(e.target.value) })}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
