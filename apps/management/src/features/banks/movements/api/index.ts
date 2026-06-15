import { mockBankMovementsAdapter } from './mock-bank-movements-adapter';
import type { BankMovementsService } from './bank-movements-service';

export const bankMovementsService: BankMovementsService = mockBankMovementsAdapter;

export type { BankMovementsService, BankMovementAccessLogEntry } from './bank-movements-service';
