import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from '@epay/ui';
import { getHrPermissions } from './domain/permissions';
import { EmploymentStatusPill } from './components/employment-status-pill';
import type { EmploymentStatus } from './domain/types';
import { useEmployees } from './hooks/use-employees';
import { buildEmployeesTableConfig } from './employees-table-config';
import './hr.css';

export function EmployeesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hrPersona, scope } = useEmployees();
  const perms = getHrPermissions(hrPersona);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildEmployeesTableConfig(scope, translate), [scope, t]);

  if (!perms.list) return <Navigate to="/" replace />;

  const scopeHintKey =
    hrPersona === 'unit_manager'
      ? 'hr_scope_unit'
      : hrPersona === 'ceo'
        ? 'hr_scope_ceo'
        : 'hr_scope_hr';

  return (
    <div className="hr-layout">
      <p className="hr-scope-hint">
        <strong>{t('hr_scope_label')}</strong> {t(scopeHintKey)}
      </p>
      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_hr_employees'),
          subtitle: t('hr_list_subtitle'),
          status: <span className="mono fs-11 t-mute">13</span>,
        }}
        permissions={{
          new: perms.insert,
          edit: false,
          delete: false,
          view: perms.view,
          export: false,
        }}
        locale="tr"
        t={translate}
        customFunctions={{
          renderEmploymentStatus: (value: unknown) => (
            <EmploymentStatusPill status={value as EmploymentStatus} />
          ),
        }}
        onNew={() => navigate('/hr/employees/new')}
        onRowClick={(row) => {
          const employeeId = String(row.employeeId ?? '');
          if (!employeeId) return;
          const path =
            hrPersona === 'ceo' || hrPersona === 'unit_manager'
              ? `/hr/employees/${employeeId}?mode=view`
              : `/hr/employees/${employeeId}`;
          navigate(path);
        }}
      />
    </div>
  );
}
