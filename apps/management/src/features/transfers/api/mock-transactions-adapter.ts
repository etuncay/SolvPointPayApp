import { TRANSACTIONS, type Transaction } from '@/mocks/transactions';
import { transactionsApi } from '@epay/data';
import { TRANSACTION_BLOCKS } from '@/mocks/transaction-blocks';
import { TRANSACTION_DOCUMENTS } from '@/mocks/transaction-documents';
import { TRANSACTION_NOTES } from '@/mocks/transaction-notes';
import { walletsService } from '@/features/wallets/api';
import type { BackOfficeRole } from '@epay/ui';
import { buildTransactionDetail } from '../domain/build-transaction-detail';
import { applyTransactionFilters } from '../domain/apply-transaction-filters';
import { buildTransactionListItem } from '../domain/build-transaction-list-item';
import { getTransactionDetailPermissions } from '../domain/detail-permissions';
import { validateInterventionReason } from '../domain/detail-validation';
import type {
  TransactionBlock,
  TransactionChangeLogEntry,
  TransactionDocument,
  TransactionNote,
} from '../domain/detail-types';
import { formatTransactionNote } from '../domain/format-transaction-note';
import { getTransactionPermissions } from '../domain/permissions';
import { applyCancel, applyHold, applyUnblock } from '../domain/transitions';
import type { TransactionAccessLogEntry, TransactionsService } from './transactions-service';
import type { TransactionFilters, TransactionListItem } from '../domain/types';
import {
  createTransactionApprovalRequest,
  registerTransactionApprovalApply,
} from './transaction-approval-bridge';

const CURRENT_USER = 'current.user';

function mapSeedNote(n: (typeof TRANSACTION_NOTES)[number]): TransactionNote {
  return {
    ...n,
    formatted: formatTransactionNote({
      authorName: n.createdBy,
      createdAt: n.createdAt,
      action: n.action,
      text: n.text,
    }),
  };
}

let txStore: Transaction[] = [];
let storeLoaded = false;
let storeLoadPromise: Promise<void> | null = null;
let noteStore: TransactionNote[] = TRANSACTION_NOTES.map(mapSeedNote);
let docStore: TransactionDocument[] = TRANSACTION_DOCUMENTS.map((d) => ({ ...d }));
let blockStore: TransactionBlock[] = TRANSACTION_BLOCKS.map((b) => ({ ...b }));
let nextAccessLogId = 1;
let nextNoteId = 10_000;
let nextBlockId = 1_000;
let nextChangeLogId = 1;
let accessLog: TransactionAccessLogEntry[] = [];
let changeLog: TransactionChangeLogEntry[] = [];

function syncTxStoreFromRows(rows: Transaction[]): void {
  txStore = rows.map((t) => ({ ...t }));
  storeLoaded = true;
}

/** Bootstrap sonrası @epay/data transactionsApi'den yükler */
export async function ensureTransactionsStoreReady(): Promise<void> {
  if (storeLoaded) return;
  if (storeLoadPromise) {
    await storeLoadPromise;
    return;
  }
  storeLoadPromise = (async () => {
    try {
      const rows = await transactionsApi.listAll();
      syncTxStoreFromRows(rows.length > 0 ? rows : TRANSACTIONS);
      const [apiNotes, apiDocs, apiBlocks] = await Promise.all([
        transactionsApi.listNotes(),
        transactionsApi.listDocuments(),
        transactionsApi.listBlocks(),
      ]);
      if (apiNotes.length > 0) noteStore = apiNotes.map(mapSeedNote);
      if (apiDocs.length > 0) docStore = apiDocs.map((d) => ({ ...d }));
      if (apiBlocks.length > 0) blockStore = apiBlocks.map((b) => ({ ...b }));
    } catch {
      syncTxStoreFromRows(TRANSACTIONS);
    }
  })();
  await storeLoadPromise;
}

function persistTxPatch(id: number, patch: Partial<Transaction>): void {
  const row = txStore.find((t) => t.id === id);
  if (!row) return;
  void transactionsApi.upsert({ ...row, ...patch }).catch(() => undefined);
}

function nowIso(): string {
  return new Date().toISOString();
}

function appendAccessLog(action: TransactionAccessLogEntry['action'], count?: number, transactionId?: number) {
  accessLog = [
    ...accessLog,
    { id: nextAccessLogId++, action, count, transactionId, at: nowIso(), by: CURRENT_USER },
  ];
}

function appendChangeLog(
  transactionId: number,
  action: TransactionChangeLogEntry['action'],
  fromStatus: Transaction['status'],
  toStatus: Transaction['status'],
  reason: string,
) {
  changeLog = [
    ...changeLog,
    {
      id: nextChangeLogId++,
      transactionId,
      action,
      fromStatus,
      toStatus,
      reason,
      at: nowIso(),
      by: CURRENT_USER,
    },
  ];
}

function appendNote(transactionId: number, action: string, text: string) {
  const at = nowIso();
  noteStore = [
    ...noteStore,
    {
      id: nextNoteId++,
      transactionId,
      action,
      text,
      createdBy: CURRENT_USER,
      createdAt: at,
      formatted: formatTransactionNote({
        authorName: CURRENT_USER,
        createdAt: at,
        action,
        text,
      }),
    },
  ];
}

function calcBlockedAmount(tx: Transaction): number {
  const feeFixed = tx.feeFixed ?? Math.max(5, Math.round(tx.amount * 0.01));
  const feeVariable = tx.feeVariable ?? Math.max(0, Math.round(tx.amount * 0.005));
  return tx.amount + feeFixed + feeVariable;
}

function findTx(id: number): Transaction | null {
  return txStore.find((t) => t.id === id && t.recordStatus === 1) ?? null;
}

function notesFor(id: number): TransactionNote[] {
  return noteStore.filter((n) => n.transactionId === id);
}

function docsFor(id: number): TransactionDocument[] {
  return docStore.filter((d) => d.transactionId === id);
}

function activeBlockFor(id: number): TransactionBlock | null {
  return blockStore.find((b) => b.transactionId === id && b.active) ?? null;
}

function toDetail(tx: Transaction) {
  return buildTransactionDetail(tx, notesFor(tx.id), docsFor(tx.id), activeBlockFor(tx.id));
}

function syncWalletBlockDelta(tx: Transaction, delta: number, reason: string, role: BackOfficeRole) {
  if (!tx.senderWalletId || delta === 0) return;
  const wallet = walletsService.getById(tx.senderWalletId, role);
  if (!wallet) return;
  walletsService.applyBalanceBlock(
    tx.senderWalletId,
    {
      blockedAmount: Math.max(0, wallet.blocked + delta),
      blockEndDate: wallet.blockEndDate ?? null,
      reason,
    },
    role,
  );
}

function canAccess(role: BackOfficeRole): boolean {
  return getTransactionPermissions(role).list;
}

function filtered(filters: TransactionFilters, role: BackOfficeRole): TransactionListItem[] {
  if (!canAccess(role)) return [];
  const rows = txStore
    .filter((t) => t.recordStatus === 1)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(buildTransactionListItem);
  return applyTransactionFilters(rows, filters);
}

function interventionDenied(role: BackOfficeRole, field: 'hold' | 'unblock' | 'cancel'): string | null {
  const p = getTransactionDetailPermissions(role);
  if (!p[field]) return 'td_permission_denied';
  return null;
}

export function getTransactionsStoreSnapshot(): Transaction[] {
  return txStore.map((t) => ({ ...t }));
}

export const mockTransactionsAdapter: TransactionsService = {
  async list(filters, role) {
    await ensureTransactionsStoreReady();
    const rows = filtered(filters, role);
    appendAccessLog('list', rows.length);
    return rows;
  },

  async exportRows(filters, role) {
    await ensureTransactionsStoreReady();
    const rows = filtered(filters, role);
    appendAccessLog('export', rows.length);
    return rows;
  },

  async getById(id, role) {
    await ensureTransactionsStoreReady();
    if (!getTransactionPermissions(role).view) return null;
    const tx = findTx(id);
    if (tx) appendAccessLog('view', undefined, id);
    return tx;
  },

  async getDetail(id, role) {
    await ensureTransactionsStoreReady();
    if (!getTransactionDetailPermissions(role).view) return null;
    const tx = findTx(id);
    if (!tx) return null;
    appendAccessLog('view', undefined, id);
    return toDetail(tx);
  },

  async hold(id, reason, role) {
    await ensureTransactionsStoreReady();
    const denied = interventionDenied(role, 'hold');
    if (denied) return { ok: false, error: denied };

    const reasonErr = validateInterventionReason(reason);
    if (reasonErr) return { ok: false, error: reasonErr };

    const tx = findTx(id);
    if (!tx) return { ok: false, error: 'td_not_found' };
    if (tx.status === 'OnHold') return { ok: true };

    const next = applyHold(tx.status);
    if (!next) return { ok: false, error: 'td_invalid_status_hold' };

    const blockedAmount = calcBlockedAmount(tx);
    txStore = txStore.map((t) => (t.id === id ? { ...t, status: next } : t));
    persistTxPatch(id, { status: next });
    blockStore = [
      ...blockStore.map((b) => (b.transactionId === id && b.active ? { ...b, active: false, releasedAt: nowIso() } : b)),
      {
        id: nextBlockId++,
        transactionId: id,
        blockedAmount,
        active: true,
        reason: reason.trim(),
        createdAt: nowIso(),
        releasedAt: null,
      },
    ];
    appendNote(id, 'Bloke Et', reason.trim());
    appendChangeLog(id, 'hold', tx.status, next, reason.trim());
    syncWalletBlockDelta(tx, blockedAmount, `İşlem bloke: ${reason.trim()}`, role);
    return { ok: true };
  },

  async unblock(id, reason, role) {
    await ensureTransactionsStoreReady();
    const denied = interventionDenied(role, 'unblock');
    if (denied) return { ok: false, error: denied };

    const reasonErr = validateInterventionReason(reason);
    if (reasonErr) return { ok: false, error: reasonErr };

    const tx = findTx(id);
    if (!tx) return { ok: false, error: 'td_not_found' };

    const next = applyUnblock(tx.status);
    if (!next) return { ok: false, error: 'td_invalid_status_unblock' };

    const block = activeBlockFor(id);
    txStore = txStore.map((t) => (t.id === id ? { ...t, status: next } : t));
    persistTxPatch(id, { status: next });
    if (block) {
      blockStore = blockStore.map((b) =>
        b.id === block.id ? { ...b, active: false, releasedAt: nowIso() } : b,
      );
      syncWalletBlockDelta(tx, -block.blockedAmount, `Bloke kaldır: ${reason.trim()}`, role);
    }
    appendNote(id, 'Bloke Kaldır', reason.trim());
    appendChangeLog(id, 'unblock', tx.status, next, reason.trim());
    return { ok: true };
  },

  async cancel(id, reason, role) {
    await ensureTransactionsStoreReady();
    const denied = interventionDenied(role, 'cancel');
    if (denied) return { ok: false, error: denied };

    const reasonErr = validateInterventionReason(reason);
    if (reasonErr) return { ok: false, error: reasonErr };

    const tx = findTx(id);
    if (!tx) return { ok: false, error: 'td_not_found' };

    const next = applyCancel(tx.status);
    if (!next) return { ok: false, error: 'td_invalid_status_cancel' };

    const block = activeBlockFor(id);
    txStore = txStore.map((t) => (t.id === id ? { ...t, status: next } : t));
    persistTxPatch(id, { status: next });
    if (block) {
      blockStore = blockStore.map((b) =>
        b.id === block.id ? { ...b, active: false, releasedAt: nowIso() } : b,
      );
      syncWalletBlockDelta(tx, -block.blockedAmount, `İptal — bloke serbest: ${reason.trim()}`, role);
    }
    appendNote(id, 'İptal Et', reason.trim());
    appendChangeLog(id, 'cancel', tx.status, next, reason.trim());
    return { ok: true };
  },

  async submitApproval(id, role) {
    await ensureTransactionsStoreReady();
    if (!getTransactionDetailPermissions(role, true).submitApproval) {
      return { ok: false, error: 'td_permission_denied' };
    }
    const tx = findTx(id);
    if (!tx) return { ok: false, error: 'td_not_found' };
    const result = createTransactionApprovalRequest(tx, role);
    if (!result.ok) return { ok: false, error: result.error ?? 'fx_approval_failed' };
    appendChangeLog(id, 'submit_approval', tx.status, tx.status, 'Manuel onaya gönderildi');
    return { ok: true, approvalId: result.approvalId };
  },

  async downloadDocument(docId, role) {
    await ensureTransactionsStoreReady();
    if (!getTransactionDetailPermissions(role).view) {
      return { ok: false, error: 'td_permission_denied' };
    }
    const doc = docStore.find((d) => d.id === docId);
    if (!doc) return { ok: false, error: 'dr_not_found' };
    return { ok: true, filename: doc.fileName };
  },

  async getStats(role) {
    await ensureTransactionsStoreReady();
    if (!canAccess(role)) return { pending: 0, onHold: 0, todayCount: 0 };
    const active = txStore.filter((t) => t.recordStatus === 1);
    const todayPrefix = '2026-05-23';
    return {
      pending: active.filter((t) => t.status === 'Pending').length,
      onHold: active.filter((t) => t.status === 'OnHold').length,
      todayCount: active.filter((t) => t.createdAt.startsWith(todayPrefix)).length,
    };
  },
};

export const transactionsService: TransactionsService = mockTransactionsAdapter;

export function __resetTransactionStoresForTest() {
  syncTxStoreFromRows(TRANSACTIONS.map((t) => ({ ...t })));
  storeLoadPromise = null;
  noteStore = TRANSACTION_NOTES.map(mapSeedNote);
  docStore = TRANSACTION_DOCUMENTS.map((d) => ({ ...d }));
  blockStore = TRANSACTION_BLOCKS.map((b) => ({ ...b }));
  nextAccessLogId = 1;
  nextNoteId = 10_000;
  nextBlockId = 1_000;
  nextChangeLogId = 1;
  accessLog = [];
  changeLog = [];
}

export function __getTransactionAccessLog() {
  return accessLog;
}

export function __getTransactionChangeLog() {
  return changeLog;
}

/** 5.2 — manuel düzeltme draft işlemi */
export function insertManualCorrectionTransaction(
  input: Omit<Transaction, 'id' | 'txNo' | 'referenceNo'>,
): Transaction {
  const id = Math.max(0, ...txStore.map((t) => t.id)) + 1;
  const tx: Transaction = {
    id,
    txNo: `TX-${String(2026050000 + id)}`,
    referenceNo: `REF-${String(880000 + id)}`,
    ...input,
  };
  txStore = [...txStore, tx];
  void transactionsApi.upsert(tx).catch(() => undefined);
  appendNote(
    id,
    'Manuel Düzeltme',
    input.description ?? 'Manuel düzeltme taslağı oluşturuldu.',
  );
  return tx;
}

export function isManualCorrectionTransaction(id: number): boolean {
  return txStore.find((t) => t.id === id)?.type === 'ManualCorrection';
}

export function findTransactionByNo(txNo: string): Transaction | null {
  const q = txNo.trim().toUpperCase();
  if (!q) return null;
  return txStore.find((t) => t.recordStatus === 1 && t.txNo.toUpperCase() === q) ?? null;
}

export function updateManualCorrectionTransaction(id: number, patch: Partial<Transaction>): void {
  txStore = txStore.map((t) => (t.id === id ? { ...t, ...patch } : t));
  persistTxPatch(id, patch);
}

registerTransactionApprovalApply((meta) => {
  const tx = txStore.find((t) => t.id === meta.transactionId);
  if (!tx) return;
  appendChangeLog(meta.transactionId, 'approval_completed', tx.status, tx.status, 'Onay tamamlandı');
});
