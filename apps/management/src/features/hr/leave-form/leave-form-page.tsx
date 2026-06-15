import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHead } from '@epay/ui';
import { useLeaveForm } from './hooks/use-leave-form';
import { LeaveForm, LeaveFormActions } from './leave-form';

export function LeaveFormPage() {
  const { t } = useTranslation();
  const api = useLeaveForm();

  if (!api.canAccess) return <Navigate to="/hr/leave" replace />;

  if (api.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (api.notFound) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('lf_not_found')}</h3>
      </div>
    );
  }

  const title = api.isCreate
    ? t('lv_new_leave')
    : api.isCancel
      ? t('lf_cancel_title')
      : t('lf_view_title');

  return (
    <>
      <PageHead
        title={title}
        subtitle={t('lf_page_subtitle')}
        status={<span className="mono fs-11 t-mute">{api.isCreate ? '13.3' : '13.2'}</span>}
        actions={<LeaveFormActions api={api} />}
      />
      <LeaveForm api={api} />
    </>
  );
}
