import type {
  IntegratedBank,
  IntegratedBankFilters,
  IntegratedBankInput,
  IntegratedBankUpdateInput,
  SaveIntegratedBankResult,
} from '../domain/types';

export type IntegratedBankChangeLogEntry = {
  id: number;
  action: 'create' | 'update' | 'deactivate';
  entityId: number;
  previous: unknown;
  next: unknown;
  at: string;
  by: string;
};

export interface IntegratedBanksService {
  list(filters?: IntegratedBankFilters): IntegratedBank[];
  create(input: IntegratedBankInput): SaveIntegratedBankResult;
  update(id: number, input: IntegratedBankUpdateInput): SaveIntegratedBankResult;
  deactivate(id: number): SaveIntegratedBankResult;
  getChangeLog(): IntegratedBankChangeLogEntry[];
}
