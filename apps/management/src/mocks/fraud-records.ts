import { FRAUD_CASES } from './fraud-cases';
import { TRANSACTIONS } from './transactions';
import type { FraudRecord } from '@/features/risk-compliance/cases/fraud-report/domain/types';

function pickTxsWithoutCase(count: number): { id: number; txNo: string }[] {
  const used = new Set(FRAUD_CASES.map((c) => c.transactionId));
  return TRANSACTIONS.filter((t) => t.recordStatus === 1 && !used.has(t.id))
    .slice(0, count)
    .map((t) => ({ id: t.id, txNo: t.txNo }));
}

const [existTx, noCaseTx] = pickTxsWithoutCase(2);
const withCaseTx = FRAUD_CASES.find((c) => c.id === 'C-1003')!;
const amlCase = FRAUD_CASES.find((c) => c.id === 'C-1001')!;

export const FRAUD_RECORDS: FraudRecord[] = [
  {
    id: 'FREC-001',
    transactionId: existTx?.id ?? TRANSACTIONS[0]!.id,
    transactionNo: 'TX-EXIST-001',
    fraudType: 'PhishingScam',
    detectionSource: 'ManualReview',
    verdict: 'ConfirmedFraud',
    discoveryAt: '2026-05-23T15:00:00Z',
    lossAmount: 5000,
    recoveredAmount: 1200,
    linkedCaseId: null,
    notes: 'Mevcut kayıt — upsert testi',
    labelerUserId: 'u.comp',
    updatedAt: '2026-05-23T16:00:00Z',
  },
];

/** Alias → gerçek işlem çözümlemesi (test + demo) */
export const FRAUD_TX_ALIASES: Record<string, number> = {
  'TX-EXIST-001': existTx?.id ?? TRANSACTIONS[0]!.id,
  'TX-NO-CASE': noCaseTx?.id ?? TRANSACTIONS[1]!.id,
  'TX-WITH-CASE': withCaseTx.transactionId,
  'TX-AML-001': amlCase.transactionId,
};
