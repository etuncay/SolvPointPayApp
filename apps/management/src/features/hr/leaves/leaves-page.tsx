import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import { Button, DynamicTable, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getLeavePermissions } from './domain/leave-permissions';
import { LeaveSummaryStrip } from './components/leave-summary-strip';
import { LeaveTypeBadge } from './components/leave-type-badge';
import { LeaveTaskStatusPill } from './components/leave-task-status-pill';
import type { LeaveType, TaskStatus } from './domain/types';
import { useLeaves } from './hooks/use-leaves';
import { buildLeavesTableConfig } from './leaves-table-config';
import '../hr.css';

export function LeavesPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const navigate = useNavigate();
  const { extras, summary, year, truncated, maxRows, scope, bump } =
    useLeaves();
  const perms = getLeavePermissions(extras);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      scope
        ? buildLeavesTableConfig(
            scope,
            role,
            extras.hrPersona === 'hr' || extras.hrPersona === 'ceo',
            translate,
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scope, role, extras.hrPersona, t],
  );

  if (!perms.canViewList || !scope || !tableConfig) return <Navigate to="/" replace />;

  const scopeHintKey =
    scope.mode === 'self'
      ? 'lv_scope_self'
      : scope.mode === 'department'
        ? 'lv_scope_unit'
        : 'lv_scope_all';

  return (
    <div className="hr-layout">
      <PageHead
        title={t('s_hr_leave')}
        subtitle={t('lv_list_subtitle')}
        status={<span className="mono fs-11 t-mute">13.2</span>}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="button" variant="ghost" size="sm" onClick={bump}>
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
            {perms.canCreateLeave ? (
              <Button type="button" variant="primary" size="sm" onClick={() => navigate('/hr/leave/new')}>
                <Plus size={14} /> {t('lv_new_leave')}
              </Button>
            ) : null}
          </div>
        }
      />

      {summary ? <LeaveSummaryStrip summary={summary} year={year} /> : null}

      <p className="hr-scope-hint">
        <strong>{t('hr_scope_label')}</strong> {t(scopeHintKey)}
      </p>

      {truncated ? (
        <p className="banner-warn fs-12">
          {t('lv_max_rows_warn', { max: maxRows })}
        </p>
      ) : null}

      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_hr_leave'),
          subtitle: t('lv_list_subtitle'),
          status: <span className="mono fs-11 t-mute">13.2</span>,
        }}
        permissions={{
          new: perms.canCreateLeave,
          edit: false,
          delete: false,
          view: true,
          export: false,
        }}
        locale="tr"
        t={translate}
        customFunctions={{
          renderLeaveType: (value: unknown) => <LeaveTypeBadge type={value as LeaveType} />,
          renderTaskStatus: (value: unknown) => <LeaveTaskStatusPill status={value as TaskStatus} />,
        }}
        onNew={() => navigate('/hr/leave/new')}
        onRowClick={(row) => {
          const leaveId = String(row.id ?? '');
          const employeeId = String(row.employeeId ?? '');
          const taskStatus = String(row.taskStatus ?? '');
          if (!leaveId) return;
          const extrasEmp = extras.employeeId;
          if (taskStatus === 'Approved' && extrasEmp && employeeId === extrasEmp) {
            navigate(`/hr/leave/${leaveId}`);
            return;
          }
          navigate(`/hr/leave/${leaveId}?view=1`);
        }}
      />
    </div>
  );
}
