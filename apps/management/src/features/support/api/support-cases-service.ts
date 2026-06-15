import type { BackOfficeRole } from '@epay/ui';
import type {
  SupportCaseActionResult,
  SupportCaseCreateResult,
  SupportCaseDetail,
  SupportCaseFilters,
  SupportCaseFormValues,
  SupportCaseListRow,
} from '../domain/types';
import type { ActionApplyInput } from '../form/domain/transitions';

/** Adapter oturum kullanıcısını performedBy alanlarına yazar. */
export type SupportCasePostActionInput = Omit<ActionApplyInput, 'performedBy' | 'performedByName'>;

type ListAccessLogEntry = {
  at: string;
  role: BackOfficeRole;
  userId: string;
  filterSnapshot: string;
  resultCount: number;
};

export type SupportCasesService = {
  list(role: BackOfficeRole, userId: string, filters: SupportCaseFilters): SupportCaseListRow[];
  getDetail(role: BackOfficeRole, userId: string, id: number): SupportCaseDetail | null;
  create(
    role: BackOfficeRole,
    userId: string,
    userName: string,
    values: SupportCaseFormValues,
  ): SupportCaseCreateResult;
  postAction(
    role: BackOfficeRole,
    userId: string,
    userName: string,
    caseId: number,
    input: SupportCasePostActionInput,
  ): SupportCaseActionResult;
  attachDocument(caseId: number, documentId: string): void;
  closeFromReconciliation(caseId: number): void;
  getListAccessLog(): ListAccessLogEntry[];
  resetListAccessLogForTests(): void;
};
