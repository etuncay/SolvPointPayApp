import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { EntityStatusPill } from './components/entity-status-pill';
import { IntegrationTypeBadge } from './components/integration-type-badge';
import { canAccessIntegrations } from './domain/permissions';
import type { IntegrationType } from './domain/types';
import { buildIntegrationsTableConfig } from './integrations-table-config';

export function IntegrationsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = buildIntegrationsTableConfig(role, translate);

  if (!canAccessIntegrations(role)) return <Navigate to="/" replace />;

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: t('s_sys_integrations'),
        subtitle: t('int_page_subtitle'),
      }}
      permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
      customFunctions={{
        renderType: (_v, row) => <IntegrationTypeBadge type={row.integrationType as IntegrationType} />,
        renderStatus: (_v, row) => <EntityStatusPill status={row.status as 'Active' | 'Inactive'} />,
      }}
      locale={i18n.language}
      t={translate}
      onNew={() => navigate('/system/integrations/new')}
      onRowClick={(row) => navigate(`/system/integrations/${row.id}`)}
    />
  );
}
