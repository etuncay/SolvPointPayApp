import type { TransactionsApi } from '../../contracts/transactions-api';
import type { BackOfficeTransaction } from '../../types/transaction';
import type {
  BackOfficeTransactionBlock,
  BackOfficeTransactionDocument,
  BackOfficeTransactionNote,
} from '../../types/transaction-detail';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Backoffice işlem HTTP adapter iskeleti */
export function createHttpTransactionsAdapter(baseUrl: string): TransactionsApi {
  const root = `${baseUrl.replace(/\/$/, '')}/transactions`;

  return {
    async list() {
      const res = await fetch(root, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeTransaction[] }>(res);
      return body.data ?? (body as unknown as BackOfficeTransaction[]);
    },

    async listAll() {
      const res = await fetch(`${root}?includeDeleted=1`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeTransaction[] }>(res);
      return body.data ?? (body as unknown as BackOfficeTransaction[]);
    },

    async getById(id) {
      const res = await fetch(`${root}/${id}`, { credentials: 'include' });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data?: BackOfficeTransaction } | BackOfficeTransaction>(res);
      return 'data' in body && body.data ? body.data : (body as BackOfficeTransaction);
    },

    async update(id, patch) {
      const res = await fetch(`${root}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data: BackOfficeTransaction }>(res);
      return body.data;
    },

    async upsert(row) {
      const res = await fetch(`${root}/${row.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });
      const body = await parseJson<{ data: BackOfficeTransaction }>(res);
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

    async listNotes(transactionId) {
      const suffix = transactionId != null ? `/${transactionId}/notes` : '/notes';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeTransactionNote[] }>(res);
      return body.data ?? [];
    },

    async listDocuments(transactionId) {
      const suffix = transactionId != null ? `/${transactionId}/documents` : '/documents';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeTransactionDocument[] }>(res);
      return body.data ?? [];
    },

    async listBlocks(transactionId) {
      const suffix = transactionId != null ? `/${transactionId}/blocks` : '/blocks';
      const res = await fetch(`${root}${suffix}`, { credentials: 'include' });
      const body = await parseJson<{ data: BackOfficeTransactionBlock[] }>(res);
      return body.data ?? [];
    },

    async getActiveBlock(transactionId) {
      const res = await fetch(`${root}/${transactionId}/blocks/active`, { credentials: 'include' });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data?: BackOfficeTransactionBlock } | BackOfficeTransactionBlock>(
        res,
      );
      return 'data' in body && body.data ? body.data : (body as BackOfficeTransactionBlock);
    },

    async upsertNote(note) {
      const res = await fetch(`${root}/${note.transactionId}/notes/${note.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      const body = await parseJson<{ data: BackOfficeTransactionNote }>(res);
      return body.data ?? note;
    },

    async upsertBlock(block) {
      const res = await fetch(`${root}/${block.transactionId}/blocks/${block.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
      });
      const body = await parseJson<{ data: BackOfficeTransactionBlock }>(res);
      return body.data ?? block;
    },
  };
}
