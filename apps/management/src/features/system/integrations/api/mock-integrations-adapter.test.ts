import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { resetCredentialVault } from '@/mocks/credential-vault';
import { resetIntegrationDefinitionsStore } from '@/mocks/integration-definitions';
import { resetIntegrationLogs } from '@/mocks/integration-logs';
import {
  getIntegrationConfig,
  integrationsService,
  resetIntegrationsAuditLog,
} from './mock-integrations-adapter';

describe('integrationsService', () => {
  beforeEach(() => {
    resetCredentialVault();
    resetIntegrationDefinitionsStore();
    resetIntegrationLogs();
    resetIntegrationsAuditLog();
  });

  it('lists seed integrations', () => {
    const rows = integrationsService.list('management', {
      query: '',
      type: 'any',
      status: 'any',
    });
    expect(rows.length).toBeGreaterThanOrEqual(7);
  });

  it('exports config snapshot', () => {
    const cfg = getIntegrationConfig('int-001');
    expect(cfg?.integrationType).toBe('Accounting');
    expect(cfg?.baseUrl).toContain('erp-mock');
  });

  it('rotates credential with audit', () => {
    const result = integrationsService.rotateCredential(
      'management',
      MOCK_USER_IDS.management,
      'int-001',
    );
    expect(result.ok).toBe(true);
    const audit = integrationsService.getAuditLog('int-001');
    expect(audit.some((e) => e.action === 'credential_rotate')).toBe(true);
  });
});
