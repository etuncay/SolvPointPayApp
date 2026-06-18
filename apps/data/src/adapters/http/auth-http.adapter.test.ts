import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHttpAuthAdapter } from './auth-http.adapter';

const BASE = 'https://api.example.com';

describe('createHttpAuthAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getSessionUser returns null on 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));
    const auth = createHttpAuthAdapter(BASE);
    await expect(auth.getSessionUser()).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledWith(`${BASE}/backoffice/auth/me`, { credentials: 'include' });
  });

  it('authenticate posts credentials with cookies', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, userId: 'u1', requiresOtp: true }), { status: 200 }),
    );
    const auth = createHttpAuthAdapter(BASE);
    const res = await auth.authenticate('ops@epay.demo', 'secret');
    expect(res.ok).toBe(true);
    expect(res.requiresOtp).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/backoffice/auth/login`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'ops@epay.demo', password: 'secret' }),
      }),
    );
  });

  it('registerAccount maps 403 to registration_disabled', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 403 }));
    const auth = createHttpAuthAdapter(BASE);
    const res = await auth.registerAccount({
      fullName: 'X',
      email: 'x@epay.demo',
      phone: '+90',
      password: 'Test123!',
      role: 'ops',
    });
    expect(res).toEqual({ ok: false, error: 'registration_disabled' });
  });
});
