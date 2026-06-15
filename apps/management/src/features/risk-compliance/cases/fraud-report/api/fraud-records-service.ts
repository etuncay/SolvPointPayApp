import type {
  FraudRecordInput,
  FraudRecordLookup,
  FraudRecordSaveResult,
} from '../domain/types';

export type FraudRecordAccessLogEntry = {
  id: number;
  action: 'lookup' | 'save' | 'save_with_case';
  transactionNo?: string;
  at: string;
};

export type FraudRecordsService = {
  getByTransactionNo(txNo: string): FraudRecordLookup | null;
  save(input: FraudRecordInput): FraudRecordSaveResult;
  saveWithCase(input: FraudRecordInput, skipCaseIfLinked?: boolean): FraudRecordSaveResult;
};

let port: FraudRecordsService | null = null;

export function setFraudRecordsPort(next: FraudRecordsService): void {
  port = next;
}

export const fraudRecordsService: FraudRecordsService = {
  getByTransactionNo(txNo) {
    if (!port) throw new Error('FraudRecordsService port not configured');
    return port.getByTransactionNo(txNo);
  },
  save(input) {
    if (!port) throw new Error('FraudRecordsService port not configured');
    return port.save(input);
  },
  saveWithCase(input, skipCaseIfLinked) {
    if (!port) throw new Error('FraudRecordsService port not configured');
    return port.saveWithCase(input, skipCaseIfLinked);
  },
};
