import { AGENTS } from '@/mocks/agents';
import { CUSTOMERS } from '@/mocks/data';
import { TRANSACTIONS, type Transaction } from '@/mocks/transactions';
import type {
  IntegrationActionLog,
  IntegrationRecordBase,
  IntegrationStatus,
} from '@/features/operational-processes/shared/integration-types';

export type AccountingIntegrationRecord = IntegrationRecordBase & {
  transactionAt: string;
};

function party(tx: Transaction, side: 'sender' | 'receiver'): { name: string; no: string } {
  if (side === 'sender') {
    if (tx.senderCustomerId) {
      const c = CUSTOMERS.find((x) => x.id === tx.senderCustomerId);
      return { name: c?.name ?? '—', no: String(tx.senderCustomerId) };
    }
    if (tx.senderAgentId) {
      const a = AGENTS.find((x) => x.id === tx.senderAgentId);
      return { name: a?.name ?? '—', no: String(tx.senderAgentId) };
    }
  } else {
    if (tx.receiverCustomerId) {
      const c = CUSTOMERS.find((x) => x.id === tx.receiverCustomerId);
      return { name: c?.name ?? '—', no: String(tx.receiverCustomerId) };
    }
    if (tx.receiverAgentId) {
      const a = AGENTS.find((x) => x.id === tx.receiverAgentId);
      return { name: a?.name ?? '—', no: String(tx.receiverAgentId) };
    }
    if (tx.receiverIban) return { name: 'Banka Hesabı', no: tx.receiverIban.slice(-8) };
  }
  return { name: '—', no: '—' };
}

function voucherPayload(tx: Transaction) {
  return {
    voucherType: 'PaymentVoucher',
    amount: tx.amount,
    currency: tx.currency,
    accounts: [
      { code: '120.01', debit: tx.amount, credit: 0 },
      { code: '102.01', debit: 0, credit: tx.amount },
    ],
    transactionNo: tx.txNo,
  };
}

function buildRecord(
  id: string,
  tx: Transaction,
  status: IntegrationStatus,
  overrides: Partial<AccountingIntegrationRecord> = {},
): AccountingIntegrationRecord {
  const sender = party(tx, 'sender');
  const receiver = party(tx, 'receiver');
  const base: AccountingIntegrationRecord = {
    id,
    integrationDefinitionId: 'int-001',
    integrationType: 'Accounting',
    referenceNo: `ACC-REF-${id.replace('ACC-', '')}`,
    transactionId: String(tx.id),
    transactionType: tx.type,
    senderName: sender.name,
    senderNo: sender.no,
    receiverName: receiver.name,
    receiverNo: receiver.no,
    amount: tx.amount,
    currency: tx.currency,
    status,
    requestJson: voucherPayload(tx),
    responseJson:
      status === 'Completed'
        ? { result: 'OK', voucherId: `VCH-${id}` }
        : status.startsWith('Error')
          ? { result: 'ERROR', code: status, message: 'ERP bağlantı hatası (mock)' }
          : { result: 'PENDING' },
    serviceOutput:
      status === 'Completed'
        ? `Voucher ${id} posted successfully`
        : status.startsWith('Error')
          ? `ERP error: ${status} — connection timeout on send`
          : status === 'OnHold'
            ? 'Manually held — awaiting finance review'
            : 'Awaiting integration pipeline',
    lastSentAt: status === 'Pending' ? null : tx.createdAt.replace(' ', 'T') + 'Z',
    attemptCount: status.startsWith('Error') ? 2 : status === 'Completed' ? 1 : 0,
    externalRefId: null,
    correlationId: `COR-${id}`,
    transactionAt: tx.createdAt,
  };
  return { ...base, ...overrides };
}

const txPool = TRANSACTIONS.filter((t) => t.recordStatus === 1).slice(0, 18);

export const ACCOUNTING_INTEGRATIONS_SEED: AccountingIntegrationRecord[] = [
  buildRecord('ACC-001', txPool[0]!, 'ErrorSend', {
    attemptCount: 3,
    serviceOutput: 'HTTP 503 from ERP gateway on voucher post',
  }),
  buildRecord('ACC-002', txPool[1]!, 'OnHold', {
    attemptCount: 1,
    serviceOutput: 'Held by finance — duplicate amount check',
  }),
  buildRecord('ACC-003', txPool[2]!, 'Completed', {
    externalRefId: 'EXT-ACC-003',
    attemptCount: 1,
  }),
  buildRecord('ACC-004', txPool[3]!, 'ErrorData', {
    externalRefId: 'EXT-ACC-004',
    attemptCount: 2,
    serviceOutput: 'Validation failed: account code mismatch',
  }),
  buildRecord('ACC-005', txPool[4]!, 'Pending', {
    lastSentAt: null,
    attemptCount: 0,
    serviceOutput: 'Queued for next batch window',
  }),
  buildRecord('ACC-006', txPool[5]!, 'ErrorPrepare', { attemptCount: 2 }),
  buildRecord('ACC-007', txPool[6]!, 'Sending', { attemptCount: 1 }),
  buildRecord('ACC-008', txPool[7]!, 'Sent', { attemptCount: 1 }),
  buildRecord('ACC-009', txPool[8]!, 'Completed', { externalRefId: 'EXT-ACC-009' }),
  buildRecord('ACC-010', txPool[9]!, 'ErrorData', { attemptCount: 4 }),
  buildRecord('ACC-011', txPool[10]!, 'OnHold', { attemptCount: 2 }),
  buildRecord('ACC-012', txPool[11]!, 'Completed', { externalRefId: 'EXT-ACC-012' }),
  buildRecord('ACC-013', txPool[12]!, 'ErrorSend', { attemptCount: 5 }),
  buildRecord('ACC-014', txPool[13]!, 'Canceled', { attemptCount: 1 }),
  buildRecord('ACC-015', txPool[14]!, 'Retrying', { attemptCount: 3 }),
  buildRecord('ACC-016', txPool[15]!, 'Completed', { externalRefId: 'EXT-ACC-016' }),
  buildRecord('ACC-017', txPool[16]!, 'ErrorPrepare', { attemptCount: 1 }),
  buildRecord('ACC-018', txPool[17]!, 'Completed', { externalRefId: 'EXT-ACC-018' }),
];

export const ACCOUNTING_AUDIT_SEED: Record<string, IntegrationActionLog[]> = {
  'ACC-001': [
    {
      action: 'retry',
      performedBy: 'Fatma Kaya',
      correlationId: 'COR-ACC-001',
      beforeStatus: 'ErrorSend',
      afterStatus: 'Retrying',
      at: '2026-05-23T10:00:00Z',
    },
  ],
  'ACC-002': [
    {
      action: 'hold',
      performedBy: 'Mehmet Şahin',
      correlationId: 'COR-ACC-002',
      beforeStatus: 'ErrorSend',
      afterStatus: 'OnHold',
      at: '2026-05-22T14:30:00Z',
    },
  ],
};
