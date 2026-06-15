import { describe, expect, it } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { resolveUserCapabilities } from './resolve-user-capabilities';

describe('resolveUserCapabilities', () => {
  it('compliance user has canFirstApprove from matrix', () => {
    const caps = resolveUserCapabilities(MOCK_USER_IDS.compliance);
    expect(caps?.canFirstApprove).toBe(true);
    expect(caps?.canSecondApprove).toBe(false);
  });

  it('management user has canSecondApprove on approvals pool', () => {
    const caps = resolveUserCapabilities(MOCK_USER_IDS.management);
    expect(caps?.canSecondApprove).toBe(true);
  });
});
