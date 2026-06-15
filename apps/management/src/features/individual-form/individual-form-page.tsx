import { useTranslation } from 'react-i18next';
import { useIndividualCustomer } from './hooks/use-individual-customer';
import { IndividualCustomerProvider } from './context/individual-customer-context';
import { IndividualCustomerForm } from './individual-customer-form';

export function IndividualFormPage({ mode: routeMode = 'new' }: { mode?: 'new' | 'edit' | 'view' }) {
  const { t } = useTranslation();
  const api = useIndividualCustomer();

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
        <h3>{t('if_not_found')}</h3>
      </div>
    );
  }

  return (
    <IndividualCustomerProvider value={api}>
      <IndividualCustomerForm routeMode={routeMode} />
    </IndividualCustomerProvider>
  );
}
