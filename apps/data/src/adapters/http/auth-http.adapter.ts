import type { AuthPort } from '../../contracts/auth-port';
import type { AuthOtpResult, AuthResult, AuthUser, RegisterPayload } from '../../types/auth';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function authRoot(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/backoffice/auth`;
}

/**
 * BackOffice kimlik doğrulama HTTP adapter iskeleti.
 * Oturum: HttpOnly cookie (credentials: 'include'). RBAC sunucuda uygulanır.
 */
export function createHttpAuthAdapter(baseUrl: string): AuthPort {
  const root = authRoot(baseUrl);

  async function post<T>(path: string, body?: unknown): Promise<Response> {
    return fetch(`${root}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  return {
    async getSessionUser() {
      const res = await fetch(`${root}/me`, { credentials: 'include' });
      if (res.status === 401) return null;
      const user = await parseJson<AuthUser>(res);
      return user;
    },

    async authenticate(email, password) {
      const res = await post('/login', { email, password });
      if (res.status === 401) return { ok: false, error: 'invalid' };
      if (res.status === 403) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (body.error === 'inactive') return { ok: false, error: 'inactive' };
        return { ok: false, error: 'invalid' };
      }
      return parseJson<AuthResult>(res);
    },

    async verifyOtp(userId, code, kind) {
      const res = await post('/verify-otp', { userId, code, kind });
      if (res.status === 400) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (body.error === 'expired') return { ok: false, error: 'expired' };
        return { ok: false, error: 'otp' };
      }
      return parseJson<AuthOtpResult>(res);
    },

    async getAccountUser(userId) {
      const res = await fetch(`${root}/users/${encodeURIComponent(userId)}`, {
        credentials: 'include',
      });
      if (res.status === 404) return undefined;
      return parseJson<AuthUser>(res);
    },

    async registerAccount(payload: RegisterPayload) {
      const res = await post('/register', payload);
      if (res.status === 403) return { ok: false, error: 'registration_disabled' };
      if (res.status === 409) return { ok: false, error: 'exists' };
      return parseJson<AuthResult>(res);
    },

    async activateAccount(userId) {
      const res = await post('/activate', { userId });
      await parseJson<{ ok: boolean }>(res);
    },

    async resendOtp(userId, kind) {
      const res = await post('/resend-otp', { userId, kind });
      if (!res.ok) return { ok: false };
      return parseJson<{ ok: boolean }>(res);
    },

    async logout() {
      const res = await post('/logout');
      if (!res.ok && res.status !== 401) {
        await parseJson(res);
      }
    },
  };
}
