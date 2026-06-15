import { createContext, useContext } from 'react';
import type { AuthorizedPersonApi } from '../hooks/use-authorized-person';

const AuthorizedPersonContext = createContext<AuthorizedPersonApi | null>(null);

export function AuthorizedPersonProvider({
  value,
  children,
}: {
  value: AuthorizedPersonApi;
  children: React.ReactNode;
}) {
  return <AuthorizedPersonContext.Provider value={value}>{children}</AuthorizedPersonContext.Provider>;
}

export function useAuthorizedPersonForm() {
  const ctx = useContext(AuthorizedPersonContext);
  if (!ctx) throw new Error('useAuthorizedPersonForm must be used within AuthorizedPersonProvider');
  return ctx;
}
