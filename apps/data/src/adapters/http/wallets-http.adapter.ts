import type { WalletsApi } from '../../contracts/wallets-api';
import type { BackOfficeWallet } from '../../types/mock-wallet';
import type {
  BackOfficeWalletLimit,
  BackOfficeWalletLimitHistory,
  BackOfficeWalletMovement,
  BackOfficeWalletNote,
} from '../../types/wallet-detail';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Backoffice cüzdan HTTP adapter iskeleti */
export function createHttpWalletsAdapter(baseUrl: string): WalletsApi {
  const root = `${baseUrl.replace(/\/$/, '')}/wallets`;

  return {
    async list() {
      const res = await fetch(root, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeWallet[] }>(res);
      return body.data ?? (body as unknown as BackOfficeWallet[]);
    },

    async listAll() {
      const res = await fetch(`${root}?includeDeleted=1`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeWallet[] }>(res);
      return body.data ?? (body as unknown as BackOfficeWallet[]);
    },

    async getById(id) {
      const res = await fetch(`${root}/${id}`, { credentials: 'include' });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data?: BackOfficeWallet } | BackOfficeWallet>(res);
      return 'data' in body && body.data ? body.data : (body as BackOfficeWallet);
    },

    async upsert(row) {
      const res = await fetch(`${root}/${row.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });
      const body = await parseJson<{ data: BackOfficeWallet }>(res);
      return body.data ?? row;
    },

    async replaceAll(rows) {
      const res = await fetch(`${root}/bulk`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rows }),
      });
      await parseJson(res);
    },

    async listNotes(walletId) {
      const suffix = walletId != null ? `/${walletId}/notes` : '/notes';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeWalletNote[] }>(res);
      return body.data ?? [];
    },

    async listLimits(walletId) {
      const suffix = walletId != null ? `/${walletId}/limits` : '/limits';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeWalletLimit[] }>(res);
      return body.data ?? [];
    },

    async listLimitHistory(walletId) {
      const suffix = walletId != null ? `/${walletId}/limit-history` : '/limit-history';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeWalletLimitHistory[] }>(res);
      return body.data ?? [];
    },

    async listMovements(walletId) {
      const suffix = walletId != null ? `/${walletId}/movements` : '/movements';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeWalletMovement[] }>(res);
      return body.data ?? [];
    },

    async upsertNote(note) {
      const res = await fetch(`${root}/${note.walletId}/notes/${note.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      const body = await parseJson<{ data: BackOfficeWalletNote }>(res);
      return body.data ?? note;
    },

    async upsertLimit(limit) {
      const res = await fetch(`${root}/${limit.walletId}/limits/${limit.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limit),
      });
      const body = await parseJson<{ data: BackOfficeWalletLimit }>(res);
      return body.data ?? limit;
    },

    async appendLimitHistory(entry) {
      const res = await fetch(`${root}/${entry.walletId}/limit-history`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      const body = await parseJson<{ data: BackOfficeWalletLimitHistory }>(res);
      return body.data ?? entry;
    },
  };
}
