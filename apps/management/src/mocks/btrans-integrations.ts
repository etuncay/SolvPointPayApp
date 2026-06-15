import type {
  IntegrationActionLog,
  IntegrationRecordBase,
  IntegrationStatus,
} from '@/features/operational-processes/shared/integration-types';
import type { BtransReportName } from '@/features/operational-processes/btrans/domain/btrans-report-catalog';

export type BtransIntegrationRecord = IntegrationRecordBase & {
  reportName: BtransReportName;
  reportDate: string;
};

function submitPayload(reportCode: BtransReportName, reportDate: string, id: string) {
  return {
    submissionRef: `SUB-${id}`,
    reportCode,
    reportPeriod: reportDate,
    institutionCode: 'EPAY',
    recordCount: reportCode === 'EPAY_SUSPICIOUS' ? 1 : 128,
  };
}

function buildRecord(
  id: string,
  reportName: BtransReportName,
  reportDate: string,
  status: IntegrationStatus,
  overrides: Partial<BtransIntegrationRecord> = {},
): BtransIntegrationRecord {
  const seq = id.replace('BTR-', '');
  const base: BtransIntegrationRecord = {
    id,
    integrationDefinitionId: 'int-002',
    integrationType: 'BTrans',
    referenceNo: `BTR-${reportDate.replace(/-/g, '')}-${seq}`,
    reportName,
    reportDate,
    transactionId: '',
    transactionType: reportName,
    senderName: '—',
    senderNo: '—',
    receiverName: '—',
    receiverNo: '—',
    amount: 0,
    currency: 'TRY',
    status,
    requestJson: submitPayload(reportName, reportDate, id),
    responseJson:
      status === 'Completed'
        ? { result: 'OK', gibRef: `GIB-${id}` }
        : status.startsWith('Error')
          ? { result: 'ERROR', code: status, message: 'BTRANS gateway hatası (mock)' }
          : { result: 'PENDING' },
    serviceOutput:
      status === 'Completed'
        ? `Report ${id} accepted by GİB`
        : status.startsWith('Error')
          ? `BTRANS error: ${status} — submission rejected`
          : status === 'OnHold'
            ? 'Manually held — awaiting compliance review'
            : 'Awaiting BTRANS pipeline',
    lastSentAt: status === 'Pending' ? null : `${reportDate}T10:00:00Z`,
    attemptCount: status.startsWith('Error') ? 2 : status === 'Completed' ? 1 : 0,
    externalRefId: null,
    correlationId: `COR-${id}`,
  };
  return { ...base, ...overrides };
}

export const BTRANS_INTEGRATIONS_SEED: BtransIntegrationRecord[] = [
  buildRecord('BTR-001', 'EPAY_DAILY_TX', '2026-05-20', 'ErrorSend', {
    attemptCount: 3,
    serviceOutput: 'HTTP 503 from BTRANS gateway on daily report submit',
  }),
  buildRecord('BTR-002', 'EPAY_MONTHLY_AGG', '2026-04-30', 'OnHold', {
    attemptCount: 1,
    serviceOutput: 'Held — monthly aggregate validation pending',
  }),
  buildRecord('BTR-003', 'EPAY_DAILY_TX', '2026-05-19', 'Completed', {
    externalRefId: 'EXT-BTR-003',
    attemptCount: 1,
  }),
  buildRecord('BTR-004', 'EPAY_SUSPICIOUS', '2026-05-18', 'ErrorData', {
    externalRefId: 'EXT-BTR-004',
    attemptCount: 2,
    serviceOutput: 'Validation failed: duplicate submission ref',
  }),
  buildRecord('BTR-005', 'EPAY_DAILY_TX', '2026-05-17', 'Pending', {
    lastSentAt: null,
    attemptCount: 0,
    serviceOutput: 'Queued for next batch window',
  }),
  buildRecord('BTR-006', 'EPAY_MONTHLY_AGG', '2026-03-31', 'ErrorPrepare', { attemptCount: 2 }),
  buildRecord('BTR-007', 'EPAY_DAILY_TX', '2026-05-16', 'Sending', { attemptCount: 1 }),
  buildRecord('BTR-008', 'EPAY_DAILY_TX', '2026-05-15', 'Sent', { attemptCount: 1 }),
  buildRecord('BTR-009', 'EPAY_SUSPICIOUS', '2026-05-14', 'Completed', { externalRefId: 'EXT-BTR-009' }),
  buildRecord('BTR-010', 'EPAY_DAILY_TX', '2026-05-13', 'ErrorData', { attemptCount: 4 }),
  buildRecord('BTR-011', 'EPAY_MONTHLY_AGG', '2026-02-28', 'OnHold', { attemptCount: 2 }),
  buildRecord('BTR-012', 'EPAY_DAILY_TX', '2026-05-12', 'Completed', { externalRefId: 'EXT-BTR-012' }),
  buildRecord('BTR-013', 'EPAY_DAILY_TX', '2026-05-11', 'ErrorSend', { attemptCount: 5 }),
  buildRecord('BTR-014', 'EPAY_SUSPICIOUS', '2026-05-10', 'Canceled', { attemptCount: 1 }),
];

export const BTRANS_AUDIT_SEED: Record<string, IntegrationActionLog[]> = {
  'BTR-001': [
    {
      action: 'retry',
      performedBy: 'Fatma Kaya',
      correlationId: 'COR-BTR-001',
      beforeStatus: 'ErrorSend',
      afterStatus: 'Retrying',
      at: '2026-05-23T10:00:00Z',
    },
  ],
  'BTR-002': [
    {
      action: 'hold',
      performedBy: 'Ayşe Demir',
      correlationId: 'COR-BTR-002',
      beforeStatus: 'ErrorSend',
      afterStatus: 'OnHold',
      at: '2026-05-22T14:30:00Z',
    },
  ],
};
