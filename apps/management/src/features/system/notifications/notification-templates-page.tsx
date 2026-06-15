import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { NotificationTypeBadge } from './components/notification-type-badge';
import { canAccessNotifications } from './domain/permissions';
import { buildNotificationTemplatesTableConfig } from './notification-templates-table-config';

export function NotificationTemplatesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = buildNotificationTemplatesTableConfig(role, translate);

  if (!canAccessNotifications(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: t('s_sys_notifications'),
        subtitle: t('nt_page_subtitle'),
      }}
      permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
      customFunctions={{
        renderType: (_v, row) => (
          <NotificationTypeBadge type={row.notificationType as 'SMS' | 'Email' | 'Push'} />
        ),
        renderLastTriggered: (_v, row) => {
          const value = row.lastTriggeredAt as string | null;
          return (
            <span className="mono fs-12">
              {value
                ? new Date(value).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : '—'}
            </span>
          );
        },
      }}
      locale={i18n.language}
      t={translate}
      onNew={() => navigate('/system/notifications/new')}
      onRowClick={(row) => navigate(`/system/notifications/${row.id}`)}
    />
  );
}
