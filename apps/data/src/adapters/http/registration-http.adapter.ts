import type { AgentRegistrationApi } from '../../contracts/registration-api';
import type { AgentRegistrationRecord, AgentRegistrationSaveResult } from '../../types/registration';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Gerçek backend adapter iskeleti — OCR/sanction/lookup uçları .NET API'ye bağlanır.
 */
export function createHttpAgentRegistrationAdapter(baseUrl: string): AgentRegistrationApi {
  const root = baseUrl.replace(/\/$/, '');

  return {
    async getById(id: string): Promise<AgentRegistrationRecord | undefined> {
      const res = await fetch(`${root}/agent/customers/${encodeURIComponent(id)}`, {
        credentials: 'include',
      });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data?: AgentRegistrationRecord } | AgentRegistrationRecord>(res);
      return 'data' in body && body.data ? body.data : (body as AgentRegistrationRecord);
    },

    async lookupByIdentityNo(idNo: string): Promise<AgentRegistrationRecord | undefined> {
      const res = await fetch(`${root}/agent/customers?idNo=${encodeURIComponent(idNo)}`, {
        credentials: 'include',
      });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data?: AgentRegistrationRecord }>(res);
      return body.data;
    },

    async hasPendingTransfer(idNo: string): Promise<boolean> {
      const res = await fetch(
        `${root}/agent/customers/${encodeURIComponent(idNo)}/pending-transfer`,
        { credentials: 'include' },
      );
      if (res.status === 404) return false;
      const body = await parseJson<{ pending?: boolean }>(res);
      return Boolean(body.pending);
    },

    async save(
      values: Record<string, unknown>,
      opts: { draft: boolean },
    ): Promise<AgentRegistrationSaveResult> {
      const res = await fetch(`${root}/agent/customers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, draft: opts.draft }),
      });
      return parseJson(res);
    },
  };
}
