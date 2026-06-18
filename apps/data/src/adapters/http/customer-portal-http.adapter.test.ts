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

  it('login returns invalid_credentials on 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401 }));
    const api = createHttpCustomerPortalAdapter(BASE);
    const res = await api.login({ identity: 'x', password: 'y' });
    expect(res).toEqual({ ok: false, errorCode: 'invalid_credentials' });
  });

  it('getSessionProfile GET /auth/me — 200 profile', async () => {
    const profile = { customerId: 'CUS-1', displayName: 'Test' };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(profile), { status: 200 }),
    );
    const api = createHttpCustomerPortalAdapter(BASE);
    await expect(api.getSessionProfile()).resolves.toEqual(profile);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/customer-portal/auth/me`,
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('getSessionProfile returns null on 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401 }));
    const api = createHttpCustomerPortalAdapter(BASE);
    await expect(api.getSessionProfile()).resolves.toBeNull();
  });

  it('getProfile returns null on 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401 }));
    const api = createHttpCustomerPortalAdapter(BASE);
    await expect(api.getProfile()).resolves.toBeNull();
  });

  it('logout POST /auth/logout', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }));
    const api = createHttpCustomerPortalAdapter(BASE);
    await api.logout();
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/customer-portal/auth/logout`,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
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
