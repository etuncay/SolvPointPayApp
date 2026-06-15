import type { ActivationStatus } from '@epay/domain';

export type IntegrationType =
  | 'Accounting'
  | 'Btrans'
  | 'FxRate'
  | 'Banking'
  | 'Kyc'
  | 'Sms'
  | 'Email'
  | 'Other';

export type EntityStatus = ActivationStatus;
export type AuthType = 'None' | 'ApiKey' | 'OAuth2' | 'MutualTls' | 'BasicAuth' | 'Certificate';
export type RetryPolicy = 'FixedDelay' | 'ExponentialBackoff';
export type LogLevel = 'Error' | 'Warning' | 'Info' | 'Debug';
export type RequestOutcome = 'Success' | 'Failure' | 'Timeout';

export interface IntegrationDefinition {
  id: string;
  code: string;
  name: string;
  integrationType: IntegrationType;
  systemName: string;
  status: EntityStatus;
  description: string;
  baseUrl: string;
  authType: AuthType;
  keyRotationRequired: boolean;
  timeoutMs: number;
  connectionTimeoutMs: number;
  ipAllowlist: string;
  tlsInfo: string;
  credentialRef: string;
  rateLimitPerMin: number;
  retryPolicy: RetryPolicy;
  maxRetry: number;
  fixedDelayMs: number;
  useSignature: boolean;
  webhookUrl: string | null;
  apiVersion: string;
  circuitBreakerEnabled: boolean;
  errorRateThresholdPct: number | null;
  windowSeconds: number | null;
  minRequestCount: number | null;
  openDurationSeconds: number | null;
  logLevel: LogLevel;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IntegrationLogEntry {
  id: string;
  integrationId: string;
  correlationId: string;
  operation: string;
  requestTime: string;
  responseTime: string | null;
  durationMs: number;
  outcome: RequestOutcome;
  retryCount: number;
  requestPath: string;
  requestMasked: string;
  responseMasked: string;
  requestFull: string;
  responseFull: string;
  logSource: string;
}

export interface IntegrationConfigSnapshot {
  id: string;
  name: string;
  integrationType: IntegrationType;
  baseUrl: string;
  authType: AuthType;
  timeoutMs: number;
  rateLimitPerMin: number;
  retryPolicy: RetryPolicy;
  maxRetry: number;
  fixedDelayMs: number;
  circuitBreakerEnabled: boolean;
  errorRateThresholdPct: number | null;
  windowSeconds: number | null;
  minRequestCount: number | null;
  openDurationSeconds: number | null;
  apiVersion: string;
  webhookUrl: string | null;
}

export interface IntegrationFilters {
  query: string;
  type: 'any' | IntegrationType;
  status: 'any' | EntityStatus;
}

export type CreateIntegrationInput = Omit<
  IntegrationDefinition,
  'id' | 'code' | 'credentialRef' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;

export type UpdateIntegrationPayload = Partial<CreateIntegrationInput>;

export interface IntegrationAuditEntry {
  at: string;
  integrationId: string;
  action: 'create' | 'update' | 'credential_rotate';
  userId: string;
}
