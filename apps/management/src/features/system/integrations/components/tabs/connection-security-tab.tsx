import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@epay/ui';
import { getCredentialMasked } from '../../api/mock-integrations-adapter';
import type { IntegrationDefinition, UpdateIntegrationPayload } from '../../domain/types';

type Props = {
  draft: UpdateIntegrationPayload;
  integration: IntegrationDefinition;
  canEdit: boolean;
  onPatch: (p: Partial<UpdateIntegrationPayload>) => void;
  onRotate: () => void;
};

export function ConnectionSecurityTab({ draft, integration, canEdit, onPatch, onRotate }: Props) {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ padding: 20, display: 'grid', gap: 12, maxWidth: 720 }}>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_base_url')}</span>
        <input
          className="input mono"
          disabled={!canEdit}
          value={draft.baseUrl ?? ''}
          onChange={(e) => onPatch({ baseUrl: e.target.value })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_auth_type')}</span>
        <select
          className="select"
          disabled={!canEdit}
          value={draft.authType ?? integration.authType}
          onChange={(e) => onPatch({ authType: e.target.value as IntegrationDefinition['authType'] })}
        >
          <option value="None">None</option>
          <option value="ApiKey">ApiKey</option>
          <option value="OAuth2">OAuth2</option>
          <option value="MutualTls">MutualTls</option>
          <option value="BasicAuth">BasicAuth</option>
          <option value="Certificate">Certificate</option>
        </select>
      </label>
      <label className="fs-12" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          disabled={!canEdit}
          checked={draft.keyRotationRequired ?? false}
          onChange={(e) => onPatch({ keyRotationRequired: e.target.checked })}
        />
        {t('int_field_key_rotation')}
      </label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label className="fs-12">
          <span className="t-mute">{t('int_field_timeout')}</span>
          <input
            className="input"
            type="number"
            disabled={!canEdit}
            value={draft.timeoutMs ?? 0}
            onChange={(e) => onPatch({ timeoutMs: Number(e.target.value) })}
          />
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('int_field_conn_timeout')}</span>
          <input
            className="input"
            type="number"
            disabled={!canEdit}
            value={draft.connectionTimeoutMs ?? 0}
            onChange={(e) => onPatch({ connectionTimeoutMs: Number(e.target.value) })}
          />
        </label>
      </div>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_ip_allowlist')}</span>
        <textarea
          className="input mono fs-12"
          rows={3}
          disabled={!canEdit}
          value={draft.ipAllowlist ?? ''}
          onChange={(e) => onPatch({ ipAllowlist: e.target.value })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('int_field_tls')}</span>
        <textarea
          className="input fs-12"
          rows={2}
          disabled={!canEdit}
          value={draft.tlsInfo ?? ''}
          onChange={(e) => onPatch({ tlsInfo: e.target.value })}
        />
      </label>
      <div>
        <span className="t-mute fs-12">{t('int_field_credential')}</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          <input className="input mono" readOnly value={getCredentialMasked()} />
          <span className="fs-11 t-mute mono">{integration.credentialRef}</span>
          {canEdit ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRotate}>
              <RefreshCw size={12} /> {t('int_rotate_credential')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
