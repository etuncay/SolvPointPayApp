export type IntegrationStatus =
  | 'Pending'
  | 'Preparing'
  | 'Prepared'
  | 'Sending'
  | 'Sent'
  | 'Completed'
  | 'ErrorPrepare'
  | 'ErrorSend'
  | 'ErrorData'
  | 'OnHold'
  | 'Retrying'
  | 'Canceled';

export type IntegrationType = 'Accounting' | 'BTrans';

export type IntegrationActionLog = {
  action: string;
  performedBy: string;
  correlationId: string;
  beforeStatus: IntegrationStatus;
  afterStatus: IntegrationStatus;
  at: string;
};

export type IntegrationRecordBase = {
  id: string;
  /** 12.7 entegrasyon tanımı FK — konfigürasyon detayına köprü */
  integrationDefinitionId?: string;
  integrationType: IntegrationType;
  referenceNo: string;
  transactionId: string;
  transactionType: string;
  senderName: string;
  senderNo: string;
  receiverName: string;
  receiverNo: string;
  amount: number;
  currency: string;
  status: IntegrationStatus;
  requestJson: Record<string, unknown>;
  responseJson: Record<string, unknown>;
  serviceOutput: string;
  lastSentAt: string | null;
  attemptCount: number;
  externalRefId: string | null;
  correlationId: string;
};

export type IntegrationActionResult = {
  ok: boolean;
  error?: string;
  deduplicated?: boolean;
  status?: IntegrationStatus;
};

export type IntegrationStatusFilter = 'all' | 'error' | 'OnHold' | 'Completed';
