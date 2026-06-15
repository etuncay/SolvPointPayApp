import { mockTransferAdapter, type TransferService } from './mock-transfer-adapter';

export const transferService: TransferService = mockTransferAdapter;

export type { TransferService };
