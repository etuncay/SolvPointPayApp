import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button, DynamicTable, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { usersService } from './api/mock-users-adapter';
import { canAccessUsersModule } from './domain/permissions';
import { buildUserActivitiesTableConfig } from './user-activities-table-config';

export function UserActivitiesPage() {
  const { t, i18n } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();

  const detail = userId ? usersService.getById(role, userId) : null;
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(
    () => (userId ? buildUserActivitiesTableConfig(userId, translate) : null),
    [userId, t],
  );

  if (!canAccessUsersModule(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageHead
        title={t('usr_activities_title')}
        subtitle={detail?.fullName ?? userId ?? '—'}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(userId ? `/system/users/${userId}` : '/system/users')}
          >
            <ArrowLeft size={14} /> {t('fr_back_list')}
          </Button>
        }
      />
      {tableConfig && (
        <DynamicTable
          config={tableConfig}
          header={{ title: '', subtitle: '' }}
          permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
          customFunctions={{
            renderDateTime: (_v, row) => (
              <span className="mono fs-12">
                {new Date(String(row.at)).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}
              </span>
            ),
            renderMono: (_v, row) => <span className="mono fs-12">{String(row.ip ?? '')}</span>,
          }}
          locale={i18n.language}
          t={translate}
        />
      )}
    </>
  );
}
