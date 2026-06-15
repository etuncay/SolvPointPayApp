import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { JobRecordStatusPill } from './components/job-record-status-pill';
import { JobTypeBadge } from './components/job-type-badge';
import { canAccessScheduledJobs } from './domain/permissions';
import { buildScheduledJobsTableConfig } from './scheduled-jobs-table-config';

export function ScheduledJobsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = buildScheduledJobsTableConfig(role, translate);

  if (!canAccessScheduledJobs(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: t('s_sys_scheduled'),
        subtitle: t('sj_page_subtitle'),
      }}
      permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
      customFunctions={{
        renderJobType: (_v, row) => <JobTypeBadge jobType={row.jobType as 'Once' | 'Recurring'} />,
        renderStatus: (_v, row) => (
          <JobRecordStatusPill status={row.status as 'Active' | 'Passive'} />
        ),
        renderDate: (_v, row) => (
          <span className="mono fs-12">
            {new Date(String(row.updatedAt ?? '')).toLocaleDateString(
              i18n.language === 'tr' ? 'tr-TR' : 'en-US',
            )}
          </span>
        ),
      }}
      locale={i18n.language}
      t={translate}
      onNew={() => navigate('/system/jobs/new')}
      onRowClick={(row) => navigate(`/system/jobs/${row.id}`)}
    />
  );
}
