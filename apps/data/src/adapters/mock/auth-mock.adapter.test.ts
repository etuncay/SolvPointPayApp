import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_PASSWORD } from '../../db/seed-auth';
import { clearMockRegisteredAccounts, createMockAuthAdapter } from './auth-mock.adapter';

describe('createMockAuthAdapter', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
    clearMockRegisteredAccounts();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('authenticates seed demo account with OTP step', async () => {
    const auth = createMockAuthAdapter();
    const res = await auth.authenticate('ops@epay.demo', DEMO_PASSWORD);
    expect(res.ok).toBe(true);
    expect(res.userId).toBe('usr-ops');
    expect(res.requiresOtp).toBe(true);
    expect(res.demoOtp).toMatch(/^\d{6}$/);

    const verified = await auth.verifyOtp('usr-ops', res.demoOtp!, 'login');
    expect(verified.ok).toBe(true);
    expect(verified.user?.email).toBe('ops@epay.demo');

    const session = await auth.getSessionUser();
    expect(session?.id).toBe('usr-ops');
  });

  it('rejects wrong password', async () => {
    const auth = createMockAuthAdapter();
    expect((await auth.authenticate('ops@epay.demo', 'wrong')).ok).toBe(false);
  });

  it('registers and activates pending account via OTP', async () => {
    const auth = createMockAuthAdapter();
    const reg = await auth.registerAccount({
      fullName: 'Test User',
      email: 'test@epay.demo',
      phone: '+90 532 000 0000',
      password: 'Test123!',
      role: 'ops',
    });
    expect(reg.ok).toBe(true);
    expect(reg.demoOtp).toMatch(/^\d{6}$/);

    expect((await auth.authenticate('test@epay.demo', 'Test123!')).error).toBe('inactive');

    const activated = await auth.verifyOtp(reg.userId!, reg.demoOtp!, 'register');
    expect(activated.ok).toBe(true);

    expect((await auth.authenticate('test@epay.demo', 'Test123!')).ok).toBe(true);

    const user = await auth.getAccountUser(reg.userId!);
    expect(user?.email).toBe('test@epay.demo');
  });
});
