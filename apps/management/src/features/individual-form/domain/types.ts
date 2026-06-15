import type {
  AddressRow,
  BankAccount,
  ContactRow,
  DocumentRow,
  SamplePerson,
  WalletRow,
} from '@/mocks/sample-person';

import type { EntityLifecycleStatusWithProspect } from '@epay/domain';

export type IndividualFormMode = 'new' | 'edit' | 'view';

export type EntityStatus = EntityLifecycleStatusWithProspect;

/** Spec §10 — bireysel müşteri detay DTO */
export type IndividualCustomerDetail = SamplePerson & {
  id: number;
  blockEndDate?: string | null;
};

export type KpsIdentityPayload = Pick<
  SamplePerson,
  | 'birthPlace'
  | 'maritalStatus'
  | 'serialNo'
  | 'issueDate'
  | 'issuingAuthority'
  | 'validityDate'
  | 'motherName'
  | 'fatherName'
  | 'gender'
  | 'firstName'
  | 'lastName'
>;

export type BackgroundCheckStatus = {
  kps: 'ok' | 'pending' | 'error';
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

export type IndividualCustomerPermissions = {
  insert: boolean;
  update: boolean;
  view: boolean;
  block: boolean;
  unblock: boolean;
  draft: boolean;
};

/** react-hook-form değerleri — fullName üst şeritte birleşik */
export type IndividualFormValues = Omit<
  SamplePerson,
  'banks' | 'addresses' | 'contacts' | 'documents' | 'wallets'
> & {
  fullName: string;
  banks: BankAccount[];
  addresses: AddressRow[];
  contacts: ContactRow[];
  documents: DocumentRow[];
  wallets: WalletRow[];
};

export type { BankAccount, AddressRow, ContactRow, DocumentRow, WalletRow };
