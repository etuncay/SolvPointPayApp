import type { CustomerPortalApi } from '../../contracts/customer-portal-api';

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
 * Müşteri self-servis HTTP adapter iskeleti.
 * .NET API uçları sözleşmeye göre güncellenir.
 */
export function createHttpCustomerPortalAdapter(baseUrl: string): CustomerPortalApi {
  const root = portalRoot(baseUrl);

  async function post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${root}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    return parseJson<T>(res);
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
    login: (input) => post('/auth/login', input),
    verifyOtp: (input) => post('/auth/verify-otp', input),
    requestPasswordReset: (email) => post('/auth/password-reset', { email }),

    getProfile: () => get('/profile'),
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
    createRecipient: (input) => post('/recipients', input),
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
      post('/settings/change-password', { currentPassword, newPassword }),
    listReceipts: () => get('/receipts'),

    listContacts: () => get('/contacts'),
    addContact: (input) => post('/contacts', input),
    updateContact: (id, value) => patchJson(`/contacts/${encodeURIComponent(id)}`, { value }),
    deleteContact: async (id) => {
      const res = await fetch(`${root}/contacts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return res.ok;
    },
    setPrimaryContact: (id) => post(`/contacts/${encodeURIComponent(id)}/primary`),
    resendContactVerification: (id) => post(`/contacts/${encodeURIComponent(id)}/resend`),
    verifyContact: (id, code) => post(`/contacts/${encodeURIComponent(id)}/verify`, { code }),

    getTopupInstructions: () => get('/topup/instructions'),
    createSupportCase: (input) => post('/support-cases', input),

    createTransferDraft: (draft) => post('/transfers/draft', draft),
    approveTransfer: (transactionId, otp, idempotencyKey, declaration) =>
      post('/transfers/approve', { transactionId, otp, idempotencyKey, declaration }),
    cancelTransfer: async (transactionId) => {
      const res = await fetch(`${root}/transfers/${encodeURIComponent(transactionId)}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    },
    getReceipt: (transactionId) => get(`/receipts/${encodeURIComponent(transactionId)}`),
  };
}
