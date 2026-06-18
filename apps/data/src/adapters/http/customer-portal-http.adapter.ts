import type { CustomerPortalApi } from '../../contracts/customer-portal-api';
import type { CustomerLoginResult, CustomerProfile } from '../../types/customer-portal';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function portalRoot(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/customer-portal`;
}

/**
 * Müşteri self-servis HTTP adapter.
 * Oturum: HttpOnly cookie (`credentials: 'include'`). OTP ve parola doğrulama sunucuda.
 */
export function createHttpCustomerPortalAdapter(baseUrl: string): CustomerPortalApi {
  const root = portalRoot(baseUrl);

  async function post(path: string, body?: unknown): Promise<Response> {
    return fetch(`${root}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  async function postJson<T>(path: string, body?: unknown): Promise<T> {
    return parseJson<T>(await post(path, body));
  }

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${root}${path}`, { credentials: 'include' });
    return parseJson<T>(res);
  }

  async function patchJson<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${root}${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return parseJson<T>(res);
  }

  return {
    async login(input) {
      const res = await post('/auth/login', input);
      if (res.status === 401) return { ok: false, errorCode: 'invalid_credentials' };
      if (res.status === 403) {
        const body = (await res.json().catch(() => ({}))) as { errorCode?: string };
        if (body.errorCode === 'no_persistent_wallet') {
          return { ok: false, errorCode: 'no_persistent_wallet' };
        }
        return { ok: false, errorCode: 'invalid_credentials' };
      }
      return parseJson<CustomerLoginResult>(res);
    },

    async verifyOtp(input) {
      const res = await post('/auth/verify-otp', input);
      if (res.status === 401) return { ok: false, errorCode: 'invalid_credentials' };
      return parseJson<CustomerLoginResult>(res);
    },

    async getSessionProfile() {
      const res = await fetch(`${root}/auth/me`, { credentials: 'include' });
      if (res.status === 401) return null;
      return parseJson<CustomerProfile>(res);
    },

    async logout() {
      const res = await post('/auth/logout');
      if (!res.ok && res.status !== 401) {
        await parseJson(res);
      }
    },

    requestPasswordReset: (email) => postJson('/auth/password-reset', { email }),

    async getProfile() {
      const res = await fetch(`${root}/profile`, { credentials: 'include' });
      if (res.status === 401) return null;
      return parseJson<CustomerProfile>(res);
    },
    listWallets: () => get('/wallets'),
    listTransactions: (query) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v != null && v !== '') q.set(k, String(v));
      }
      return get(`/transactions?${q.toString()}`);
    },
    getTransactionById: (id) => get(`/transactions/${encodeURIComponent(id)}`),
    recentTransactions: (limit) => get(`/transactions/recent?limit=${limit ?? 7}`),

    listRecipients: () => get('/recipients'),
    createRecipient: (input) => postJson('/recipients', input),
    updateRecipient: (id, input) => patchJson(`/recipients/${encodeURIComponent(id)}`, input),
    deleteRecipient: async (id) => {
      const res = await fetch(`${root}/recipients/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return res.ok;
    },

    listIbans: () => get('/ibans'),
    listFees: () => get('/fees'),
    getFxQuote: (src, dst) => get(`/fx/quote?src=${src}&dst=${dst}`),

    getSettings: () => get('/settings'),
    updateSettings: (settingsPatch) => patchJson('/settings', settingsPatch),
    changePassword: (currentPassword, newPassword) =>
      postJson('/settings/change-password', { currentPassword, newPassword }),
    listReceipts: () => get('/receipts'),

    listContacts: () => get('/contacts'),
    addContact: (input) => postJson('/contacts', input),
    updateContact: (id, value) => patchJson(`/contacts/${encodeURIComponent(id)}`, { value }),
    deleteContact: async (id) => {
      const res = await fetch(`${root}/contacts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return res.ok;
    },
    setPrimaryContact: (id) => postJson(`/contacts/${encodeURIComponent(id)}/primary`),
    resendContactVerification: (id) => postJson(`/contacts/${encodeURIComponent(id)}/resend`),
    verifyContact: (id, code) => postJson(`/contacts/${encodeURIComponent(id)}/verify`, { code }),

    getTopupInstructions: () => get('/topup/instructions'),
    createSupportCase: (input) => postJson('/support-cases', input),
    listSupportCases: () => get('/support-cases'),

    createTransferDraft: (draft) => postJson('/transfers/draft', draft),
    approveTransfer: (transactionId, otp, idempotencyKey, declaration) =>
      postJson('/transfers/approve', { transactionId, otp, idempotencyKey, declaration }),
    cancelTransfer: async (transactionId) => {
      const res = await fetch(`${root}/transfers/${encodeURIComponent(transactionId)}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    },
    getReceipt: (transactionId) => get(`/receipts/${encodeURIComponent(transactionId)}`),
    getPendingTransfer: async () => null,
    clearPendingTransfer: async () => undefined,
  };
}
