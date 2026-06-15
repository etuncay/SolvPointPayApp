import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHttpCustomerPortalAdapter } from './customer-portal-http.adapter';

const BASE = 'http://api.test';

describe('createHttpCustomerPortalAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('login POST /customer-portal/auth/login', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, requiresOtp: true }), { status: 200 }),
    );

    const api = createHttpCustomerPortalAdapter(BASE);
    await api.login({ identity: 'CUS-4827193', password: 'Demo123!' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/customer-portal/auth/login`,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('verifyOtp POST /customer-portal/auth/verify-otp', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const api = createHttpCustomerPortalAdapter(BASE);
    await api.verifyOtp({ identity: 'CUS-4827193', otp: '123456' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/customer-portal/auth/verify-otp`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('listWallets GET /customer-portal/wallets', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    const api = createHttpCustomerPortalAdapter(BASE);
    await api.listWallets();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/customer-portal/wallets`,
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('listTransactions query string', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], total: 0, page: 1, pageSize: 10 }), { status: 200 }),
    );

    const api = createHttpCustomerPortalAdapter(BASE);
    await api.listTransactions({ page: 1, pageSize: 10 });

    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain('/customer-portal/transactions?');
    expect(url).toContain('page=1');
    expect(url).toContain('pageSize=10');
  });
});
