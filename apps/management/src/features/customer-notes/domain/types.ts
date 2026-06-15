import type { CustomerNoteRow } from '@/mocks/customer-notes';

export type TargetEntityType = CustomerNoteRow['targetEntityType'];
export type PriorityLevel = CustomerNoteRow['priorityLevel'];

export type CustomerNote = CustomerNoteRow;

export type CustomerNoteInput = {
  customerNo: string;
  noteText: string;
  targetEntityType: TargetEntityType;
  priorityLevel: PriorityLevel;
  displayLimit: number | null;
  endDate: string | null;
};

export type CustomerNotePermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
};

export type SaveNoteResult = {
  ok: boolean;
  id?: number;
  error?: string;
};

export type NoteFilters = {
  query: string;
  targetEntityType: string;
  priorityLevel: string;
};

export const DEFAULT_NOTE_FILTERS: NoteFilters = {
  query: '',
  targetEntityType: 'any',
  priorityLevel: 'any',
};

export const TARGET_ENTITY_OPTIONS: TargetEntityType[] = [
  'IndividualCustomer',
  'CorporateCustomer',
  'Agent',
];

export const PRIORITY_OPTIONS: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
