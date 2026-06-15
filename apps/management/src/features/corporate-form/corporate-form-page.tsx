import { useCorporateCustomer } from './hooks/use-corporate-customer';
import { CorporateCustomerProvider } from './context/corporate-customer-context';
import { CorporateCustomerForm } from './corporate-customer-form';

export function CorporateFormPage({ mode: routeMode = 'new' }: { mode?: 'new' | 'edit' | 'view' }) {
  const api = useCorporateCustomer();

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
        <h3>{routeMode === 'view' ? 'Müşteri bulunamadı' : 'Müşteri bulunamadı'}</h3>
      </div>
    );
  }

  return (
    <CorporateCustomerProvider value={api}>
      <CorporateCustomerForm />
    </CorporateCustomerProvider>
  );
}
