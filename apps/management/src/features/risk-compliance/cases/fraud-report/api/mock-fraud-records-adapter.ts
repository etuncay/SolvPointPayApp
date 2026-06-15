import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { FRAUD_TX_ALIASES, FRAUD_RECORDS } from '@/mocks/fraud-records';
import { FRAUD_CASES } from '@/mocks/fraud-cases';
import { TRANSACTIONS } from '@/mocks/transactions';
import { validateFraudRecordInput } from '../domain/validation';
import type {
  FraudDetectionSource,
  FraudRecord,
  FraudRecordInput,
  FraudRecordLookup,
  FraudRecordSaveResult,
  FraudType,
  FraudVerdict,
} from '../domain/types';
import {
  createCaseFromFraudReport,
  findCaseByTransactionId,
} from '../../api/mock-fraud-cases-adapter';
import type { FraudRecordAccessLogEntry, FraudRecordsService } from './fraud-records-service';

let recordStore: FraudRecord[] = FRAUD_RECORDS.map((r) => ({ ...r }));
let nextRecordId = 100;
let nextLogId = 1;
let accessLog: FraudRecordAccessLogEntry[] = [];

function now(): string {
  return new Date('2026-05-24T12:00:00Z').toISOString();
}

function appendLog(
  action: FraudRecordAccessLogEntry['action'],
  transactionNo?: string,
): void {
  accessLog = [
    ...accessLog,
    { id: nextLogId++, action, transactionNo, at: now() },
  ];
}

function resolveTransactionId(txNo: string): number | null {
  const q = txNo.trim();
  if (!q) return null;
  if (FRAUD_TX_ALIASES[q] != null) return FRAUD_TX_ALIASES[q]!;
  if (q === 'TX-AML-001') {
    const c = FRAUD_CASES.find((x) => x.id === 'C-1001');
    if (c) return c.transactionId;
  }
  const tx = TRANSACTIONS.find((t) => t.recordStatus === 1 && t.txNo === q);
  return tx?.id ?? null;
}

function resolveTransaction(txNo: string): {
  id: number;
  txNo: string;
  createdAt: string;
} | null {
  const id = resolveTransactionId(txNo);
  if (id == null) return null;
  const tx = TRANSACTIONS.find((t) => t.id === id && t.recordStatus === 1);
  if (!tx) return null;
  let displayNo = tx.txNo;
  if (txNo.trim() === 'TX-AML-001' || FRAUD_TX_ALIASES[txNo.trim()] === FRAUD_CASES.find((c) => c.id === 'C-1001')?.transactionId) {
    if (FRAUD_CASES.some((c) => c.id === 'C-1001' && c.transactionId === id)) {
      displayNo = 'TX-AML-001';
    }
  }
  const alias = txNo.trim();
  if (FRAUD_TX_ALIASES[alias] === id) displayNo = alias;
  return { id: tx.id, txNo: displayNo, createdAt: tx.createdAt };
}

function linkedCaseId(transactionId: number): string | null {
  return findCaseByTransactionId(transactionId)?.id ?? null;
}

function upsertRecord(
  tx: { id: number; txNo: string; createdAt: string },
  input: FraudRecordInput,
  caseId: string | null,
): FraudRecord {
  const idx = recordStore.findIndex((r) => r.transactionId === tx.id);
  const fraudType =
    input.fraudType != null && String(input.fraudType).trim() !== ''
      ? (input.fraudType as FraudType)
      : null;
  const payload: FraudRecord = {
    id: idx >= 0 ? recordStore[idx]!.id : `FREC-${nextRecordId++}`,
    transactionId: tx.id,
    transactionNo: input.transactionNo.trim() || tx.txNo,
    fraudType,
    detectionSource: input.detectionSource as FraudDetectionSource,
    verdict: input.verdict as FraudVerdict,
    discoveryAt: new Date(input.discoveryAt).toISOString(),
    lossAmount: input.lossAmount,
    recoveredAmount: input.recoveredAmount,
    linkedCaseId: caseId ?? linkedCaseId(tx.id),
    notes: input.notes.trim(),
    labelerUserId: MOCK_USER_IDS.compliance,
    updatedAt: now(),
  };
  if (idx >= 0) recordStore[idx] = payload;
  else recordStore.push(payload);
  return payload;
}

function validateAndResolve(
  input: FraudRecordInput,
): { ok: true; tx: { id: number; txNo: string; createdAt: string } } | { ok: false; error: string } {
  const tx = resolveTransaction(input.transactionNo);
  if (!tx) return { ok: false, error: 'frp_tx_not_found' };
  const v = validateFraudRecordInput(input, { transactionDate: tx.createdAt });
  if (!v.ok) return v;
  return { ok: true, tx };
}

export const mockFraudRecordsAdapter: FraudRecordsService = {
  getByTransactionNo(txNo) {
    const tx = resolveTransaction(txNo);
    if (!tx) return null;
    appendLog('lookup', txNo.trim());
    const record = recordStore.find((r) => r.transactionId === tx.id) ?? null;
    const caseId = linkedCaseId(tx.id);
    const lookup: FraudRecordLookup = {
      transactionId: tx.id,
      transactionNo: record?.transactionNo ?? tx.txNo,
      transactionDate: tx.createdAt,
      record,
      linkedCaseId: caseId,
    };
    return lookup;
  },

  save(input) {
    const step = validateAndResolve(input);
    if (!step.ok) return { ok: false, error: step.error };
    const caseId = linkedCaseId(step.tx.id);
    const rec = upsertRecord(step.tx, input, caseId);
    appendLog('save', input.transactionNo.trim());
    return { ok: true, recordId: rec.id };
  },

  saveWithCase(input, skipCaseIfLinked = false) {
    const step = validateAndResolve(input);
    if (!step.ok) return { ok: false, error: step.error };
    const existing = findCaseByTransactionId(step.tx.id);
    if (existing && !skipCaseIfLinked) {
      return { ok: false, error: 'frp_linked_case_warn' };
    }
    if (existing && skipCaseIfLinked) {
      const rec = upsertRecord(step.tx, input, existing.id);
      appendLog('save', input.transactionNo.trim());
      return { ok: true, recordId: rec.id, caseSkipped: true };
    }
    const created = createCaseFromFraudReport(step.tx.id);
    const rec = upsertRecord(step.tx, input, created.id);
    appendLog('save_with_case', input.transactionNo.trim());
    return { ok: true, recordId: rec.id, caseId: created.id };
  },
};

export function __resetFraudRecordsStoreForTest(): void {
  recordStore = FRAUD_RECORDS.map((r) => ({ ...r }));
  nextRecordId = 100;
  accessLog = [];
  nextLogId = 1;
}

export function __getFraudRecordsStore(): FraudRecord[] {
  return recordStore;
}

export function __getFraudRecordsAccessLog(): FraudRecordAccessLogEntry[] {
  return accessLog;
}
