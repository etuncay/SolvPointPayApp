import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_CUSTOMER_PASSWORD } from './seed-customer-portal';
import {
  getDemoCustomerPassword,
  resetDemoCustomerPassword,
  setDemoCustomerPassword,
} from './demo-customer-password';

describe('demo-customer-password', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
    });
    resetDemoCustomerPassword();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns seed password by default', () => {
    expect(getDemoCustomerPassword()).toBe(DEMO_CUSTOMER_PASSWORD);
  });

  it('persists password override in localStorage', () => {
    setDemoCustomerPassword('NewPass99!');
    expect(getDemoCustomerPassword()).toBe('NewPass99!');
  });

  it('reset restores seed password', () => {
    setDemoCustomerPassword('NewPass99!');
    resetDemoCustomerPassword();
    expect(getDemoCustomerPassword()).toBe(DEMO_CUSTOMER_PASSWORD);
  });
});
