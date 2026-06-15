import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEmployee } from './hooks/use-employee';
import { EmployeeProvider } from './context/employee-context';
import { EmployeeForm } from './employee-form';

export function EmployeeFormPage() {
  const { t } = useTranslation();
  const api = useEmployee();

  if (!api.canAccess) return <Navigate to="/hr/employees" replace />;

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
        <h3>{t('ef_not_found')}</h3>
      </div>
    );
  }

  return (
    <EmployeeProvider value={api}>
      <EmployeeForm />
    </EmployeeProvider>
  );
}
