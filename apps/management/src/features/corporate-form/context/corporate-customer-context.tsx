import { createContext, useContext } from 'react';
import type { CorporateCustomerApi } from '../hooks/use-corporate-customer';

const CorporateCustomerContext = createContext<CorporateCustomerApi | null>(null);

export function CorporateCustomerProvider({
  value,
  children,
}: {
  value: CorporateCustomerApi;
  children: React.ReactNode;
}) {
  return <CorporateCustomerContext.Provider value={value}>{children}</CorporateCustomerContext.Provider>;
}

export function useCorporateCustomerForm() {
  const ctx = useContext(CorporateCustomerContext);
  if (!ctx) throw new Error('useCorporateCustomerForm must be used within CorporateCustomerProvider');
  return ctx;
}
