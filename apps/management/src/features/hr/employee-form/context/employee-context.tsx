import * as React from 'react';
import type { useEmployee } from '../hooks/use-employee';

export type EmployeeFormApi = ReturnType<typeof useEmployee>;

const Ctx = React.createContext<EmployeeFormApi | null>(null);

export function EmployeeProvider({ value, children }: { value: EmployeeFormApi; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEmployeeForm() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useEmployeeForm EmployeeProvider içinde kullanılmalı');
  return ctx;
}
