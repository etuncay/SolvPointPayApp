import { describe, expect, it } from 'vitest';
import {
  getCurrentUser,
  resolveCurrentUser,
  resolveLegacyAppUserId,
  userIdsMatch,
} from './current-user';
import { MOCK_USER_IDS } from './types';

describe('resolveCurrentUser', () => {
  it('uses session id and displayName with navigation role capabilities', () => {
    const user = resolveCurrentUser(
      { id: 'usr-comp', fullName: 'Ayşe Demir', role: 'compliance' },
      'compliance',
    );
    expect(user.id).toBe('usr-comp');
    expect(user.displayName).toBe('Ayşe Demir');
    expect(user.role).toBe('compliance');
    expect(user.canFirstApprove).toBe(true);
    expect(user.canSecondApprove).toBe(false);
  });

  it('demo override: session ops, navigation compliance → compliance persona', () => {
    const user = resolveCurrentUser(
      { id: 'usr-ops', fullName: 'Ahmet Yılmaz', role: 'ops' },
      'compliance',
    );
    expect(user.id).toBe('usr-ops');
    expect(user.role).toBe('compliance');
    expect(user.canFirstApprove).toBe(true);
  });

  it('falls back to getCurrentUser when auth is null', () => {
    const legacy = getCurrentUser('management');
    const resolved = resolveCurrentUser(null, 'management');
    expect(resolved).toEqual(legacy);
  });
});

describe('userIdsMatch', () => {
  it('matches auth seed id to legacy mock id', () => {
    expect(userIdsMatch('usr-ops', MOCK_USER_IDS.ops)).toBe(true);
    expect(userIdsMatch('usr-comp', MOCK_USER_IDS.compliance)).toBe(true);
    expect(resolveLegacyAppUserId('usr-mgmt')).toBe(MOCK_USER_IDS.management);
  });

  it('does not match unrelated ids', () => {
    expect(userIdsMatch('usr-ops', MOCK_USER_IDS.compliance)).toBe(false);
  });
});
