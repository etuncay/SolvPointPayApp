import { useTranslation } from 'react-i18next';
import { ALLOWED_PLACEHOLDERS } from '../../domain/placeholder-catalog';
import type { NotificationTemplate, UpdateTemplatePayload } from '../../domain/types';

type Props = {
  template: NotificationTemplate;
  draft: UpdateTemplatePayload;
  canEdit: boolean;
  onPatch: (patch: Partial<UpdateTemplatePayload>) => void;
};

export function DefinitionTab({ template, draft, canEdit, onPatch }: Props) {
  const { t } = useTranslation();
  const type = draft.notificationType ?? template.notificationType;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>
      <div className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
        <label className="fs-12">
          <span className="t-mute">{t('nt_col_name')}</span>
          <input
            className="input"
            disabled={!canEdit}
            value={draft.name ?? ''}
            onChange={(e) => onPatch({ name: e.target.value })}
          />
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('nt_col_type')}</span>
          <select
            className="select"
            disabled={!canEdit}
            value={type}
            onChange={(e) =>
              onPatch({ notificationType: e.target.value as NotificationTemplate['notificationType'] })
            }
          >
            <option value="SMS">{t('nt_type_SMS')}</option>
            <option value="Email">{t('fcd_customer_email')}</option>
            <option value="Push">{t('nt_type_Push')}</option>
          </select>
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('sc_col_subject')}</span>
          <input
            className="input"
            disabled={!canEdit}
            value={draft.subject ?? ''}
            onChange={(e) => onPatch({ subject: e.target.value })}
          />
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('nt_field_content')}</span>
          <textarea
            className="input mono fs-12"
            rows={8}
            disabled={!canEdit}
            value={draft.content ?? ''}
            onChange={(e) => onPatch({ content: e.target.value })}
          />
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('rpt_col_desc')}</span>
          <textarea
            className="input"
            rows={2}
            disabled={!canEdit}
            value={draft.description ?? ''}
            onChange={(e) => onPatch({ description: e.target.value })}
          />
        </label>
      </div>
      <aside className="card" style={{ padding: 12 }}>
        <p className="fs-11 fw-600">{t('nt_placeholders_title')}</p>
        <ul className="fs-11 t-mute" style={{ margin: '8px 0 0', paddingLeft: 16 }}>
          {ALLOWED_PLACEHOLDERS.map((p) => (
            <li key={p}>
              <code>{`{${p}}`}</code>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
