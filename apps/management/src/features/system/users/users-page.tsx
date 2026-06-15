import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { UserStatusPill } from './components/user-status-pill';
import { canAccessUsersModule } from './domain/permissions';
import { buildUsersTableConfig } from './users-table-config';

export function UsersPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildUsersTableConfig(role, translate), [role, t]);

  if (!canAccessUsersModule(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: t('s_sys_users'),
        subtitle: t('usr_page_subtitle'),
      }}
      permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
      customFunctions={{
        renderCreatedAt: (_v, row) => (
          <span className="mono fs-12">
            {new Date(String(row.createdAt ?? '')).toLocaleDateString(
              i18n.language === 'tr' ? 'tr-TR' : 'en-US',
            )}
          </span>
        ),
        renderStatus: (_v, row) => <UserStatusPill status={row.status as 'Active' | 'Inactive'} />,
      }}
      locale={i18n.language}
      t={translate}
      onRowClick={(row) => navigate(`/system/users/${row.id}`)}
    />
  );
}
