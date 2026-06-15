/**
 * Geriye dönük import — master store: support-cases-store
 */
export {
  appendSupportCaseLog,
  createReconciliationCase,
  findOpenReconciliationCase,
  getSupportCaseById,
  getSupportCasesSnapshot,
  resetSupportCasesStore,
  resolveSupportCase,
} from '@/mocks/support-cases-store';

export type { SupportCase } from '@/features/support/domain/types';
