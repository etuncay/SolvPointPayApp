import { useTranslation } from 'react-i18next';
import type { IntegrationDefinition } from '../../domain/types';

type Props = { integration: IntegrationDefinition };

export function GeneralTab({ integration }: Props) {
  const { t, i18n } = useTranslation();
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US');
  return (
    <div className="card" style={{ padding: 20, display: 'grid', gap: 8, maxWidth: 640 }}>
      <p className="fs-12">
        <span className="t-mute">{t('int_field_name')}: </span>
        {integration.name}
      </p>
      <p className="fs-12">
        <span className="t-mute">{t('rpt_col_type')}: </span>
        {t(`int_type_${integration.integrationType}`)}
      </p>
      <p className="fs-12">
        <span className="t-mute">{t('int_field_system')}: </span>
        {integration.systemName}
      </p>
      <p className="fs-12">
        <span className="t-mute">{t('rpt_col_status')}: </span>
        {t(`int_entity_${integration.status}`)}
      </p>
      <p className="fs-12 t-mute">
        {t('sc_col_created')}: {fmt(integration.createdAt)} — {integration.createdBy}
      </p>
      <p className="fs-12 t-mute">
        {t('int_updated')}: {fmt(integration.updatedAt)} — {integration.updatedBy}
      </p>
      <p className="fs-12">{integration.description || '—'}</p>
    </div>
  );
}
