import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { mockUserPreferencesAdapter } from './mock-user-preferences-adapter';

describe('mockUserPreferencesAdapter', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
  });

  it('seed tercihleri döner', () => {
    const prefs = mockUserPreferencesAdapter.getPreferences(MOCK_USER_IDS.ops);
    expect(prefs.welcomeMessage.length).toBeGreaterThan(0);
  });

  it('geçersiz karşılama mesajını reddeder', () => {
    const result = mockUserPreferencesAdapter.updatePreferences(MOCK_USER_IDS.ops, {
      welcomeMessage: '<script>',
    });
    expect(result.ok).toBe(false);
  });

  it('parola değişikliğinde oturum revoke bayrağı set eder', () => {
    const result = mockUserPreferencesAdapter.changePassword(MOCK_USER_IDS.ops, {
      oldPassword: 'OldPass123!@#',
      newPassword: 'NewPass123!@#',
      confirmPassword: 'NewPass123!@#',
      frequency: '3',
    });
    expect(result.ok).toBe(true);
    if (result.ok && typeof sessionStorage !== 'undefined') {
      expect(sessionStorage.getItem('epay-session-revoked')).toBe('1');
    }
  });
});
