/**
 * Geriye dönük export — yeni kod `customersApi` veya `CustomersApi` portunu kullanmalı.
 */
import type { ListQueryInput } from '../contracts/list-query';
import type { PaginatedListResponse } from '../contracts/api-response';
import { customersApi } from '../services/customers.service';
import { customerToFormValues } from '../domain/customer-mapper';

export type { PaginatedListResponse } from '../contracts/api-response';
export { customerToFormValues };

export const fetchCustomersList = (params: ListQueryInput): Promise<PaginatedListResponse> =>
  customersApi.list(params);

export const getCustomerById = (id: string) => customersApi.getById(id);

export const createCustomer = (values: Record<string, unknown>) => customersApi.create(values);

export const updateCustomer = (id: string, values: Record<string, unknown>) =>
  customersApi.update(id, values);

export const deleteCustomer = (id: string) => customersApi.delete(id);
