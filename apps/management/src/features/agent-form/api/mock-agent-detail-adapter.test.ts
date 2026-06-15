import { describe, expect, it, beforeEach } from 'vitest';
import { resetAgentGroupsStore } from '@/features/agent-groups/api/mock-agent-groups-adapter';
import { SAMPLE_AGENT } from '@/mocks/sample-agent';
import {
  createEmptyFormValues,
  mockAgentDetailAdapter,
  resetAgentDetailStore,
} from './mock-agent-detail-adapter';
import {
  getAgentsStoreSnapshot,
  resetAgentsStore,
} from '@/features/agents/api/mock-agents-adapter';

describe('mockAgentDetailAdapter', () => {
  beforeEach(() => {
    resetAgentDetailStore();
    resetAgentsStore();
    resetAgentGroupsStore();
  });

  it('create varsayılan grup standard olur', () => {
    const payload = { ...SAMPLE_AGENT, groupKey: '', agentNo: '' };
    const result = mockAgentDetailAdapter.create(payload, { draft: true });
    expect(result.ok).toBe(true);
    const detail = mockAgentDetailAdapter.getById(String(result.id));
    expect(detail?.groupKey).toBe('standard');
  });

  it('draft inactive status ile kaydeder', () => {
    const payload = { ...createEmptyFormValues(), name: 'Taslak A.Ş.', taxNo: '1234567890' };
    const result = mockAgentDetailAdapter.create(payload, { draft: true });
    expect(result.ok).toBe(true);
    const detail = mockAgentDetailAdapter.getById(String(result.id));
    expect(detail?.status).toBe('inactive');
  });

  it('yetkili L1 ile save fail', () => {
    const payload = {
      ...SAMPLE_AGENT,
      taxNo: '1111111111',
      authorizedPersons: [{ ...SAMPLE_AGENT.authorizedPersons[0]!, kycLevel: 'L1' }],
    };
    const result = mockAgentDetailAdapter.create(payload);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('af_auth_kyc_low');
  });

  it('UBO eksikse save fail', () => {
    const payload = {
      ...SAMPLE_AGENT,
      taxNo: '2222222222',
      shareholders: [{ ...SAMPLE_AGENT.shareholders[0]!, isUbo: false, description: '' }],
    };
    const result = mockAgentDetailAdapter.create(payload);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('af_ubo_missing');
  });

  it('block liste status günceller', () => {
    const detail = mockAgentDetailAdapter.getById('99901');
    expect(detail).toBeTruthy();
    const result = mockAgentDetailAdapter.block('99901', 'Test bloke');
    expect(result.ok).toBe(true);
    const listRow = getAgentsStoreSnapshot().find((a) => a.id === 99901);
    expect(listRow?.status).toBe('blocked');
  });

  it('VKN lookup mevcut kayıt döner', () => {
    const found = mockAgentDetailAdapter.lookupByVkn(SAMPLE_AGENT.taxNo);
    expect(found?.id).toBe(99901);
    expect(found?.name).toBe(SAMPLE_AGENT.name);
  });
});
