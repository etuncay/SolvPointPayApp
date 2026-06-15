import type { BackOfficeRole } from '@epay/ui';
import { getCredentialDisplay, rotateCredential } from '@/mocks/credential-vault';
import {
  appendIntegrationDefinition,
  getIntegrationByType,
  getIntegrationDefinitionById,
  getIntegrationDefinitionsStore,
  updateIntegrationDefinitionRecord,
} from '@/mocks/integration-definitions';
import { getIntegrationLogs } from '@/mocks/integration-logs';
import { filterLogsByCorrelation } from '../domain/correlation-log';
import { canAccessIntegrations, canMutateIntegrations } from '../domain/permissions';
import {
  validateBaseUrl,
  validateCircuitBreakerFields,
  validateIntegrationName,
} from '../domain/validation';
import type {
  CreateIntegrationInput,
  IntegrationAuditEntry,
  IntegrationConfigSnapshot,
  IntegrationDefinition,
  IntegrationFilters,
  IntegrationLogEntry,
  IntegrationType,
  UpdateIntegrationPayload,
} from '../domain/types';
import type { IntegrationsService } from './integrations-service';

let auditLog: IntegrationAuditEntry[] = [];

function audit(entry: Omit<IntegrationAuditEntry, 'at'>) {
  auditLog = [{ at: new Date('2026-05-25T12:00:00Z').toISOString(), ...entry }, ...auditLog];
}

export function resetIntegrationsAuditLog(): void {
  auditLog = [];
}

export function getIntegrationConfig(integrationId: string): IntegrationConfigSnapshot | null {
  const row = getIntegrationDefinitionById(integrationId);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    integrationType: row.integrationType,
    baseUrl: row.baseUrl,
    authType: row.authType,
    timeoutMs: row.timeoutMs,
    rateLimitPerMin: row.rateLimitPerMin,
    retryPolicy: row.retryPolicy,
    maxRetry: row.maxRetry,
    fixedDelayMs: row.fixedDelayMs,
    circuitBreakerEnabled: row.circuitBreakerEnabled,
    errorRateThresholdPct: row.errorRateThresholdPct,
    windowSeconds: row.windowSeconds,
    minRequestCount: row.minRequestCount,
    openDurationSeconds: row.openDurationSeconds,
    apiVersion: row.apiVersion,
    webhookUrl: row.webhookUrl,
  };
}

export { getIntegrationByType };

export function getCredentialMasked(): string {
  return getCredentialDisplay();
}

export const integrationsService: IntegrationsService = {
  list(role, filters) {
    if (!canAccessIntegrations(role)) return [];
    let rows = getIntegrationDefinitionsStore();
    if (filters.type !== 'any') rows = rows.filter((r) => r.integrationType === filters.type);
    if (filters.status !== 'any') rows = rows.filter((r) => r.status === filters.status);
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.systemName.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(role, id) {
    if (!canAccessIntegrations(role)) return null;
    return getIntegrationDefinitionById(id) ?? null;
  },

  create(role, userId, input: CreateIntegrationInput) {
    if (!canMutateIntegrations(role)) return { ok: false, errorCode: 'int_forbidden' };
    const nameErr = validateIntegrationName(input.name);
    if (nameErr) return { ok: false, errorCode: nameErr };
    const urlErr = validateBaseUrl(input.baseUrl);
    if (urlErr) return { ok: false, errorCode: urlErr };
    const cbErr = validateCircuitBreakerFields(input);
    if (cbErr) return { ok: false, errorCode: cbErr };
    const created = appendIntegrationDefinition(input, userId);
    audit({ integrationId: created.id, action: 'create', userId });
    return { ok: true, integration: created };
  },

  update(role, userId, id, payload: UpdateIntegrationPayload) {
    if (!canMutateIntegrations(role)) return { ok: false, errorCode: 'int_forbidden' };
    const before = getIntegrationDefinitionById(id);
    if (!before) return { ok: false, errorCode: 'finrec_not_found' };
    const merged = { ...before, ...payload };
    if (payload.name != null) {
      const nameErr = validateIntegrationName(payload.name);
      if (nameErr) return { ok: false, errorCode: nameErr };
    }
    if (payload.baseUrl != null) {
      const urlErr = validateBaseUrl(payload.baseUrl);
      if (urlErr) return { ok: false, errorCode: urlErr };
    }
    const cbErr = validateCircuitBreakerFields(merged);
    if (cbErr) return { ok: false, errorCode: cbErr };
    const updated = updateIntegrationDefinitionRecord(id, payload, userId);
    if (!updated) return { ok: false, errorCode: 'finrec_not_found' };
    audit({ integrationId: id, action: 'update', userId });
    return { ok: true, integration: updated };
  },

  rotateCredential(role, userId, id) {
    if (!canMutateIntegrations(role)) return { ok: false, errorCode: 'int_forbidden' };
    const row = getIntegrationDefinitionById(id);
    if (!row) return { ok: false, errorCode: 'finrec_not_found' };
    rotateCredential(row.credentialRef);
    audit({ integrationId: id, action: 'credential_rotate', userId });
    return { ok: true };
  },

  getLogs(role, integrationId, correlationId) {
    if (!canAccessIntegrations(role)) return [];
    return filterLogsByCorrelation(getIntegrationLogs(integrationId), correlationId ?? null);
  },

  getAuditLog(integrationId) {
    if (integrationId) return auditLog.filter((e) => e.integrationId === integrationId);
    return [...auditLog];
  },
};
