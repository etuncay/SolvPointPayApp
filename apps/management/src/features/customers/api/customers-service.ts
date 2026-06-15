import type { CustomerFilters, CustomerListItem, CustomerListResult } from '../domain/types';
import { mockCustomersAdapter } from './mock-customers-adapter';

export type CustomersService = {
  list(filters: CustomerFilters): CustomerListResult;
  exportRows(filters: CustomerFilters): CustomerListItem[];
  softDelete(id: number): void;
  restoreInactive(id: number): void;
};

export const customersService: CustomersService = mockCustomersAdapter;
