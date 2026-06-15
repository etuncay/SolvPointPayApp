import type { SettlementFrequency } from '@/mocks/agents';
import type { BankAccount, ContactRow, DocumentRow } from '@/mocks/sample-person';
import type {
  AuthorizedPersonRow,
  CorporateLimits,
  ShareholderRow,
} from '@/mocks/sample-corporate';
import type { SampleAgent, AgentAddressRow, AgentWalletRow } from '@/mocks/sample-agent';

import type { EntityLifecycleStatus } from '@epay/domain';

export type AgentFormMode = 'new' | 'edit' | 'view';

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

export type AgentDetail = SampleAgent & {
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
  agentNo?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type DocumentUploadInput = {
  category: string;
  type: string;
  validFrom: string;
  validTo: string;
};

export type AgentFormPermissions = {
  insert: boolean;
  update: boolean;
  view: boolean;
  block: boolean;
  unblock: boolean;
  draft: boolean;
};

export type AgentFormValues = SampleAgent;

export type { AgentAddressRow, AgentWalletRow, BankAccount, ContactRow, DocumentRow, ShareholderRow, AuthorizedPersonRow, CorporateLimits, SettlementFrequency };
