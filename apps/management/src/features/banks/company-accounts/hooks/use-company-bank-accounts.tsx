import { useCallback, useMemo, useState } from 'react';
import { integratedBanksService } from '@/features/banks/integrated/api';
import { companyBankAccountsService } from '../api';
import {
  DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS,
  type CompanyBankAccountFilters,
  type CompanyBankAccountInput,
  type CompanyBankAccountUpdateInput,
} from '../domain/types';

export function useCompanyBankAccounts() {
  const [filters, setFilters] = useState<CompanyBankAccountFilters>(DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => companyBankAccountsService.list(filters),
    [filters, version],
  );

  const bankOptions = useMemo(
    () =>
      integratedBanksService.list({ query: '', status: 'Active' }).map((b) => ({
        value: b.id,
        label: b.bankName,
      })),
    [version],
  );

  const updateFilters = useCallback((patch: Partial<CompanyBankAccountFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: CompanyBankAccountInput) => {
      const result = companyBankAccountsService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: CompanyBankAccountUpdateInput) => {
      const result = companyBankAccountsService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const deactivate = useCallback(
    (id: number) => {
      const result = companyBankAccountsService.deactivate(id);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const fetchBalance = useCallback(
    (id: number) => {
      const result = companyBankAccountsService.fetchBalance(id);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return {
    filters,
    updateFilters,
    rows,
    bankOptions,
    create,
    update,
    deactivate,
    fetchBalance,
    refresh,
  };
}
