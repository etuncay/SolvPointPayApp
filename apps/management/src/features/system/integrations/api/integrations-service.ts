import type { BackOfficeRole } from '@epay/ui';
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

export type IntegrationsService = {
  list(role: BackOfficeRole, filters: IntegrationFilters): IntegrationDefinition[];
  getById(role: BackOfficeRole, id: string): IntegrationDefinition | null;
  create(
    role: BackOfficeRole,
    userId: string,
    input: CreateIntegrationInput,
  ): { ok: true; integration: IntegrationDefinition } | { ok: false; errorCode: string };
  update(
    role: BackOfficeRole,
    userId: string,
    id: string,
    payload: UpdateIntegrationPayload,
  ): { ok: true; integration: IntegrationDefinition } | { ok: false; errorCode: string };
  rotateCredential(
    role: BackOfficeRole,
    userId: string,
    id: string,
  ): { ok: true } | { ok: false; errorCode: string };
  getLogs(
    role: BackOfficeRole,
    integrationId: string,
    correlationId?: string,
  ): IntegrationLogEntry[];
  getAuditLog(integrationId?: string): IntegrationAuditEntry[];
};

export type { IntegrationConfigSnapshot };
