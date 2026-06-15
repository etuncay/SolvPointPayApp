import { createContext, useContext } from 'react';
import type { IndividualCustomerApi } from '../hooks/use-individual-customer';

const IndividualCustomerContext = createContext<IndividualCustomerApi | null>(null);

export function IndividualCustomerProvider({
  value,
  children,
}: {
  value: IndividualCustomerApi;
  children: React.ReactNode;
}) {
  return <IndividualCustomerContext.Provider value={value}>{children}</IndividualCustomerContext.Provider>;
}

export function useIndividualCustomerForm() {
  const ctx = useContext(IndividualCustomerContext);
  if (!ctx) throw new Error('useIndividualCustomerForm must be used within IndividualCustomerProvider');
  return ctx;
}
