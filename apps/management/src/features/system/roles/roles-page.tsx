import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { RoleStatusPill } from './components/role-status-pill';
import { canAccessRolesModule } from './domain/permissions';
import { buildRolesTableConfig } from './roles-table-config';

export function RolesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildRolesTableConfig(role, translate), [role, t]);

  if (!canAccessRolesModule(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: t('s_sys_roles'),
        subtitle: t('rol_page_subtitle'),
      }}
      permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
      customFunctions={{
        renderStatus: (_v, row) => <RoleStatusPill status={row.status as 'Active' | 'Passive'} />,
        renderCreatedAt: (_v, row) => (
          <span className="mono fs-12">
            {new Date(String(row.createdAt ?? '')).toLocaleDateString(
              i18n.language === 'tr' ? 'tr-TR' : 'en-US',
            )}
          </span>
        ),
        renderUpdatedAt: (_v, row) => (
          <span className="mono fs-12">
            {new Date(String(row.updatedAt ?? '')).toLocaleDateString(
              i18n.language === 'tr' ? 'tr-TR' : 'en-US',
            )}
          </span>
        ),
      }}
      locale={i18n.language}
      t={translate}
      onNew={() => navigate('/system/roles/new')}
      onRowClick={(row) => navigate(`/system/roles/${row.id}`)}
    />
  );
}
