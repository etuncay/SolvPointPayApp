import type {
  AddressRow,
  BankAccount,
  ContactRow,
  DocumentRow,
  WalletRow,
} from '@/mocks/sample-person';
import type {
  AuthorizedPersonRow,
  CorporateLimits,
  SampleCorporate,
  ShareholderRow,
} from '@/mocks/sample-corporate';

import type { EntityLifecycleStatus } from '@epay/domain';

export type CorporateFormMode = 'new' | 'edit' | 'view';

export type EntityStatus = EntityLifecycleStatus;

export type OrganizationType =
  | 'AnonimCompany'
  | 'LimitedCompany'
  | 'LimitedPartnership'
  | 'CollectiveCompany'
  | 'SoleProprietorship'
  | 'Cooperative'
  | 'CapitalCompany'
  | 'EconomicPublicInstitution'
  | 'OrdinaryPartnership'
  | 'ApartmentSiteManagement'
  | 'Association'
  | 'Foundation'
  | 'PoliticalParty'
  | 'UnionConfederation'
  | 'ForeignLegalEntity'
  | 'NonLegalEntityOrganization'
  | 'PublicInstitution';

/** Spec §10 — tüzel müşteri detay DTO */
export type CorporateCustomerDetail = SampleCorporate & {
  id: number;
  blockEndDate?: string | null;
};

export type BackgroundCheckStatus = {
  vkn: 'ok' | 'pending' | 'error';
  sanction: 'clean' | 'hit' | 'pending';
  ibanVerified: number;
  ibanTotal: number;
  lastRunAt?: string;
};

export type SaveResult = {
  ok: boolean;
  id?: number;
  customerNo?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type DocumentUploadInput = {
  category: string;
  type: string;
  validFrom: string;
  validTo: string;
};

export type CorporateCustomerPermissions = {
  insert: boolean;
  update: boolean;
  view: boolean;
  block: boolean;
  unblock: boolean;
  draft: boolean;
};

/** react-hook-form değerleri */
export type CorporateFormValues = SampleCorporate & {
  shareholders: ShareholderRow[];
  authorizedPersons: AuthorizedPersonRow[];
  banks: BankAccount[];
  addresses: AddressRow[];
  contacts: ContactRow[];
  documents: DocumentRow[];
  wallets: WalletRow[];
  limits: CorporateLimits;
};

export type {
  BankAccount,
  AddressRow,
  ContactRow,
  DocumentRow,
  WalletRow,
  ShareholderRow,
  AuthorizedPersonRow,
  CorporateLimits,
};
