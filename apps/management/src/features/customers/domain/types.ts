import type { EntityLifecycleStatus } from '@epay/domain';
import type { Customer } from '@/mocks/data';

export type PrimaryContact = 'email' | 'phone';

export type EntityStatus = EntityLifecycleStatus;

export type CustomerListItem = Omit<Customer, 'status'> & {
  status: EntityStatus;
  recordStatus: 0 | 1;
  primaryContact: PrimaryContact;
};

export type EntityStatusFilter = EntityStatus | 'all';

export type CustomerAdvFilters = {
  type: string;
  kyc: string;
  risk: string;
  campaign: string;
  from: string;
  to: string;
};

export type CustomerColumnFilters = {
  id: string;
  name: string;
  contact: string;
  idNo: string;
  type: string;
  campaign: string;
  kyc: string;
  riskScore: string;
  riskSeg: string;
  created: string;
  status: string;
};

export type CustomerFilters = {
  status: EntityStatusFilter;
  query: string;
  advanced: CustomerAdvFilters;
  columns: CustomerColumnFilters;
};

export type PaginationParams = {
  pageIndex: number;
  pageSize: number;
};

export type CustomerListResult = {
  rows: CustomerListItem[];
  total: number;
  counts: Record<EntityStatusFilter, number>;
};

export type CustomerPermissions = {
  list: boolean;
  view: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
};

export const EMPTY_COLUMN_FILTERS: CustomerColumnFilters = {
  id: '',
  name: '',
  contact: '',
  idNo: '',
  type: '',
  campaign: '',
  kyc: '',
  riskScore: '',
  riskSeg: '',
  created: '',
  status: '',
};

export const EMPTY_ADV_FILTERS: CustomerAdvFilters = {
  type: 'any',
  kyc: 'any',
  risk: 'any',
  campaign: 'any',
  from: '',
  to: '',
};

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  status: 'active',
  query: '',
  advanced: EMPTY_ADV_FILTERS,
  columns: EMPTY_COLUMN_FILTERS,
};
