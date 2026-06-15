import type { BackOfficeRole } from '@epay/ui';
import type {
  BankAccountMovement,
  BankMovementFilters,
  BankMovementIngestInput,
  BankMovementIngestResult,
} from '../domain/types';

export type BankMovementAccessLogEntry = {
  id: number;
  action: 'list' | 'export' | 'ingest' | 'ingest_duplicate';
  count?: number;
  movementId?: number;
  at: string;
  by: string;
};

export type BankMovementsService = {
  list(filters: BankMovementFilters, role: BackOfficeRole): BankAccountMovement[];
  exportRows(filters: BankMovementFilters, role: BackOfficeRole): BankAccountMovement[];
  ingest(payload: BankMovementIngestInput): BankMovementIngestResult;
  getAccessLog(): BankMovementAccessLogEntry[];
};
