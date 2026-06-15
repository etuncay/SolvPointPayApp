import type { AddressRow, ContactRow, DocumentRow } from '@/mocks/sample-person';

import type { EntityLifecycleStatus } from '@epay/domain';

export type AuthorizedPersonFormMode = 'new' | 'edit' | 'view';

export type EntityStatus = EntityLifecycleStatus;

export type AuthorizedPersonDetail = {
  id: number;
  personNo: string;
  firstName: string;
  lastName: string;
  idType: string;
  idCountry: string;
  idNo: string;
  birthDate: string;
  kycLevel: string;
  riskScore: number;
  riskSegment: string;
  createdAt: string;
  status: string;
  statusReason: string | null;
  blockEndDate?: string | null;
  lastLogin: string;
  failedAttempts: number;
  device: string;
  ipLocation: string;
  birthPlace: string;
  maritalStatus: string;
  serialNo: string;
  issueDate: string;
  issuingAuthority: string;
  validityDate: string;
  motherName: string;
  fatherName: string;
  gender: string;
  maidenName: string;
  taxCountry: string;
  education: string;
  employment: string;
  occupation: string;
  employer: string;
  language: string;
  notes: string;
  visaType: string | null;
  visaEndDate: string | null;
  residencePermit: string | null;
  residencePermitEnd: string | null;
  birthCountry: string;
  residentCountry: string;
  addresses: AddressRow[];
  contacts: ContactRow[];
  documents: DocumentRow[];
};

export type KpsIdentityPayload = Pick<
  AuthorizedPersonDetail,
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
  personNo?: string;
  error?: string;
};

export type DocumentUploadInput = {
  category: string;
  type: string;
  validFrom: string;
  validTo: string;
};

export type AuthorizedPersonPermissions = {
  insert: boolean;
  update: boolean;
  view: boolean;
  block: boolean;
  unblock: boolean;
  draft: boolean;
};

export type AuthorizedPersonFormValues = Omit<
  AuthorizedPersonDetail,
  'id' | 'addresses' | 'contacts' | 'documents'
> & {
  fullName: string;
  addresses: AddressRow[];
  contacts: ContactRow[];
  documents: DocumentRow[];
};

export type { AddressRow, ContactRow, DocumentRow };
