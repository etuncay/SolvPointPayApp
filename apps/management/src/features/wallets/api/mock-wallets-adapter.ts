import { WALLETS } from '@/mocks/wallets';
import { __resetManagementWalletsCacheForTest } from '@/lib/wallets-store';
import type { Wallet } from '../domain/types';
import { walletsApi } from '@epay/data';
import { WALLET_ACCOUNT_MOVEMENTS, type WalletAccountMovement } from '@/mocks/wallet-account-movements';
import { WALLET_LIMITS } from '@/mocks/wallet-limits';
import { WALLET_LIMIT_HISTORY } from '@/mocks/wallet-limit-history';
import { WALLET_NOTES } from '@/mocks/wallet-notes';
import { calcAvailable } from '../domain/calc-available';
import { canViewWalletCategory, getWalletDetailPermissions } from '../domain/detail-permissions';
import { applyWalletFilters } from '../domain/apply-wallet-filters';
import { applyActivityFilters } from '../domain/apply-activity-filters';
import { getWalletActivityPermissions } from '../domain/activity-permissions';
import { buildWalletActivity } from '../domain/build-wallet-activity';
import type { WalletActivityFilters } from '../domain/activity-types';
import {
  emptyLimitSet,
  LIMIT_GROUPS,
  LIMIT_TYPES,
  type LimitHistoryEntry,
  type WalletDetail,
  type WalletLimit,
  type WalletLimitSet,
  type WalletNote,
} from '../domain/detail-types';
import { formatWalletNote, joinWalletNotes } from '../domain/format-wallet-note';
import {
  validateAddNote,
  validateBalanceBlock,
  validateLimitSet,
} from '../domain/detail-validation';
import { registerWalletLimitApprovalApply } from './wallet-approval-bridge';
import type { BackOfficeRole } from '@epay/ui';
import type { WalletChangeLogEntry, WalletAccessLogEntry, WalletsService } from './wallets-service';
import type { WalletFilters, WalletListStats } from '../domain/types';

const CURRENT_USER = 'current.user';

let walletStore: Wallet[] = [];
let storeLoaded = false;
let storeLoadPromise: Promise<void> | null = null;
let movementStore: WalletAccountMovement[] = [];
let limitStore: WalletLimit[] = [];
let noteStore: WalletNote[] = [];
let historyStore: LimitHistoryEntry[] = [];
let nextLimitId = 10_000;
let nextNoteId = 100;
let nextHistoryId = 100;
let nextLogId = 1;
let nextAccessLogId = 1;
let changeLog: WalletChangeLogEntry[] = [];
let accessLog: WalletAccessLogEntry[] = [];

function mapSeedWalletNote(n: (typeof WALLET_NOTES)[number]): WalletNote {
  return {
    ...n,
    formatted: formatWalletNote({
      authorName: n.createdBy,
      createdAt: n.createdAt,
      action: n.action,
      text: n.text,
    }),
  };
}

function syncDetailStoresFromFallback(): void {
  movementStore = WALLET_ACCOUNT_MOVEMENTS.map((m) => ({ ...m }));
  limitStore = WALLET_LIMITS.map((l) => ({ ...l }));
  noteStore = WALLET_NOTES.map(mapSeedWalletNote);
  historyStore = WALLET_LIMIT_HISTORY.map((h) => ({ ...h }));
}

function syncWalletStoreFromRows(rows: Wallet[]): void {
  walletStore = rows.map((w) => ({ ...w }));
  storeLoaded = true;
  void import('@/lib/wallets-store').then(({ syncManagementWalletsCache }) => {
    syncManagementWalletsCache(walletStore);
  });
}

/** Bootstrap sonrası güncel cüzdan satırları */
export function getWalletRows(): readonly Wallet[] {
  return walletStore.length > 0 ? walletStore : WALLETS;
}

/** Bootstrap sonrası @epay/data walletsApi'den yükler */
export async function ensureWalletsStoreReady(): Promise<void> {
  if (storeLoaded) return;
  if (storeLoadPromise) {
    await storeLoadPromise;
    return;
  }
  storeLoadPromise = (async () => {
    try {
      const rows = await walletsApi.listAll();
      syncWalletStoreFromRows(rows.length > 0 ? rows : WALLETS);
      const [apiNotes, apiLimits, apiHistory, apiMovements] = await Promise.all([
        walletsApi.listNotes(),
        walletsApi.listLimits(),
        walletsApi.listLimitHistory(),
        walletsApi.listMovements(),
      ]);
      if (apiNotes.length > 0) noteStore = apiNotes.map(mapSeedWalletNote);
      else noteStore = WALLET_NOTES.map(mapSeedWalletNote);
      if (apiLimits.length > 0) limitStore = apiLimits.map((l) => ({ ...l }));
      else limitStore = WALLET_LIMITS.map((l) => ({ ...l }));
      if (apiHistory.length > 0) historyStore = apiHistory.map((h) => ({ ...h }));
      else historyStore = WALLET_LIMIT_HISTORY.map((h) => ({ ...h }));
      if (apiMovements.length > 0) movementStore = apiMovements.map((m) => ({ ...m }));
      else movementStore = WALLET_ACCOUNT_MOVEMENTS.map((m) => ({ ...m }));
    } catch {
      syncWalletStoreFromRows(WALLETS);
      syncDetailStoresFromFallback();
    }
  })();
  await storeLoadPromise;
}

function persistWalletRow(row: Wallet): void {
  void walletsApi.upsert(row).catch(() => undefined);
}

function persistWalletNote(note: Omit<WalletNote, 'formatted'>): void {
  void walletsApi
    .upsertNote({
      id: note.id,
      walletId: note.walletId,
      action: note.action,
      text: note.text,
      createdBy: note.createdBy,
      createdAt: note.createdAt,
    })
    .catch(() => undefined);
}

function persistWalletLimit(limit: WalletLimit): void {
  void walletsApi.upsertLimit(limit).catch(() => undefined);
}

function persistLimitHistory(entry: LimitHistoryEntry): void {
  void walletsApi.appendLimitHistory(entry).catch(() => undefined);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function appendLog(
  action: WalletChangeLogEntry['action'],
  walletId: number,
  detail: string,
) {
  changeLog = [
    ...changeLog,
    { id: nextLogId++, action, walletId, at: nowIso(), by: CURRENT_USER, detail },
  ];
}

function syncAvailable(w: Wallet): Wallet {
  return { ...w, available: calcAvailable(w.balance, w.blocked) };
}

function activeLimits(walletId: number): WalletLimit[] {
  return limitStore.filter((l) => l.walletId === walletId && l.endDate == null);
}

function limitsToSet(rows: WalletLimit[]): WalletLimitSet {
  const set = emptyLimitSet();
  for (const row of rows) {
    set[row.limitGroup][row.limitType] = row.amount;
  }
  return set;
}

function buildDetail(wallet: Wallet): WalletDetail {
  const notes = noteStore
    .filter((n) => n.walletId === wallet.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return {
    ...wallet,
    blockEndDate: wallet.blockEndDate ?? null,
    lastTxAt: wallet.lastTxAt ?? null,
    lastTxAmount: wallet.lastTxAmount ?? null,
    notes,
    notesDisplay: joinWalletNotes(notes),
    limits: limitsToSet(activeLimits(wallet.id)),
    isSystemWallet: wallet.cat === 'system',
  };
}

function findWallet(id: number): Wallet | null {
  return walletStore.find((w) => w.id === id) ?? null;
}

function updateWalletRow(id: number, patch: Partial<Wallet>): Wallet | null {
  const idx = walletStore.findIndex((w) => w.id === id);
  if (idx < 0) return null;
  const next = syncAvailable({ ...walletStore[idx]!, ...patch });
  walletStore = walletStore.map((w, i) => (i === idx ? next : w));
  persistWalletRow(next);
  return next;
}

function appendAccessLog(action: WalletAccessLogEntry['action'], count?: number, walletId?: number) {
  accessLog = [
    ...accessLog,
    {
      id: nextAccessLogId++,
      action,
      count,
      walletId,
      at: nowIso(),
      by: CURRENT_USER,
    },
  ];
}

function roleVisibleRows(role: BackOfficeRole): Wallet[] {
  return walletStore
    .filter((w) => w.recordStatus === 1 && canViewWalletCategory(role, w.cat))
    .map(syncAvailable);
}

function computeStats(rows: Wallet[]): WalletListStats {
  const totalsByCcy: Record<string, number> = {};
  for (const w of rows) totalsByCcy[w.ccy] = (totalsByCcy[w.ccy] ?? 0) + w.balance;
  return {
    totalCount: rows.length,
    customerCount: rows.filter((w) => w.cat === 'customer').length,
    agentCount: rows.filter((w) => w.cat === 'agent').length,
    systemCount: rows.filter((w) => w.cat === 'system').length,
    blockedFullCount: rows.filter((w) => w.blocked === -1).length,
    blockedPartialCount: rows.filter((w) => w.blocked > 0 && w.blocked !== -1).length,
    txTodayTotal: rows.reduce((s, w) => s + (w.txToday ?? 0), 0),
    totalsByCcy,
  };
}

function permissionDenied(role: BackOfficeRole, key: keyof ReturnType<typeof getWalletDetailPermissions>): string | null {
  const p = getWalletDetailPermissions(role);
  if (!p[key]) return 'ag_perm_denied';
  return null;
}

function guardWalletActivities(walletId: number, role: BackOfficeRole) {
  const wallet = findWallet(walletId);
  if (!wallet || wallet.recordStatus !== 1) return { error: 'wa_not_found' as const };
  if (!getWalletActivityPermissions(role).list || !canViewWalletCategory(role, wallet.cat)) {
    return { error: 'wa_wallet_forbidden' as const };
  }
  return { wallet };
}

function activitiesForWallet(wallet: Wallet, filters: WalletActivityFilters) {
  const movements = movementStore
    .filter((m) => m.walletId === wallet.id && m.recordStatus === 1)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const rows = movements.map((m, idx) => {
    const prev = movements[idx + 1]?.postBalance ?? null;
    return buildWalletActivity(wallet, m, prev);
  });

  return applyActivityFilters(rows, filters);
}

export const mockWalletsAdapter: WalletsService = {
  list(filters, role) {
    const visible = roleVisibleRows(role);
    appendAccessLog('list', visible.length);
    return applyWalletFilters(visible, filters).map(syncAvailable);
  },

  getStats(role) {
    return computeStats(roleVisibleRows(role));
  },

  exportRows(filters, role) {
    const rows = applyWalletFilters(roleVisibleRows(role), filters);
    appendAccessLog('export', rows.length);
    return rows;
  },

  getById(id, role) {
    const wallet = findWallet(id);
    if (!wallet || wallet.recordStatus !== 1) return null;
    if (!canViewWalletCategory(role, wallet.cat)) return null;
    appendAccessLog('view', undefined, id);
    return syncAvailable(wallet);
  },

  getDetail(id, role) {
    const wallet = findWallet(id);
    if (!wallet || wallet.recordStatus !== 1) return null;
    if (!canViewWalletCategory(role, wallet.cat)) return null;
    if (!getWalletDetailPermissions(role).view) return null;
    return buildDetail(syncAvailable(wallet));
  },

  updateLimits(id, limits, role) {
    const err = permissionDenied(role, 'editLimits');
    if (err) return { ok: false, error: err };
    const wallet = findWallet(id);
    if (!wallet) return { ok: false, error: 'wd_not_found' };
    if (wallet.cat === 'system') return { ok: false, error: 'wd_system_readonly' };

    const validation = validateLimitSet(limits);
    if (validation) return { ok: false, error: validation };

    const ts = today();
    const historyBefore = historyStore.length;
    for (const group of LIMIT_GROUPS) {
      for (const type of LIMIT_TYPES) {
        const amount = limits[group][type];
        const active = activeLimits(id).find((l) => l.limitGroup === group && l.limitType === type);
        if (active && active.amount === amount) continue;

        if (active) {
          limitStore = limitStore.map((l) =>
            l.id === active.id ? { ...l, endDate: ts, changedBy: CURRENT_USER } : l,
          );
          historyStore = [
            ...historyStore,
            {
              id: nextHistoryId++,
              walletId: id,
              limitGroup: group,
              limitType: type,
              amount: active.amount,
              startDate: active.startDate,
              endDate: ts,
              changedBy: active.changedBy,
              approvedBy: active.approvedBy,
            },
          ];
        }

        limitStore = [
          ...limitStore,
          {
            id: nextLimitId++,
            walletId: id,
            limitGroup: group,
            limitType: type,
            amount,
            startDate: ts,
            endDate: null,
            changedBy: CURRENT_USER,
            approvedBy: 'auto',
          },
        ];
        historyStore = [
          ...historyStore,
          {
            id: nextHistoryId++,
            walletId: id,
            limitGroup: group,
            limitType: type,
            amount,
            startDate: ts,
            endDate: null,
            changedBy: CURRENT_USER,
            approvedBy: 'auto',
          },
        ];
      }
    }

    for (const l of limitStore.filter((row) => row.walletId === id)) {
      persistWalletLimit(l);
    }
    for (const h of historyStore.slice(historyBefore)) {
      if (h.walletId === id) persistLimitHistory(h);
    }

    appendLog('update_limits', id, 'limits updated');
    return { ok: true };
  },

  applyBalanceBlock(id, input, role) {
    const err = permissionDenied(role, 'balanceBlock');
    if (err) return { ok: false, error: err };
    const wallet = findWallet(id);
    if (!wallet) return { ok: false, error: 'wd_not_found' };
    if (wallet.cat === 'system') return { ok: false, error: 'wd_system_readonly' };

    const validation = validateBalanceBlock(input, today());
    if (validation) return { ok: false, error: validation };

    updateWalletRow(id, {
      blocked: input.blockedAmount,
      blockEndDate: input.blockEndDate,
    });

    const formatted = formatWalletNote({
      authorName: CURRENT_USER,
      createdAt: nowIso(),
      action: 'Bakiye Blokesi',
      text: input.reason.trim(),
    });
    const blockNote = {
      id: nextNoteId++,
      walletId: id,
      action: 'Bakiye Blokesi',
      text: input.reason.trim(),
      createdBy: CURRENT_USER,
      createdAt: nowIso(),
    };
    noteStore = [...noteStore, { ...blockNote, formatted }];
    persistWalletNote(blockNote);

    appendLog('balance_block', id, `blocked=${input.blockedAmount}`);
    return { ok: true };
  },

  addNote(id, input, role) {
    const err = permissionDenied(role, 'addNote');
    if (err) return { ok: false, error: err };
    if (!findWallet(id)) return { ok: false, error: 'wd_not_found' };

    const validation = validateAddNote(input.text);
    if (validation) return { ok: false, error: validation };

    const at = nowIso();
    const row = {
      id: nextNoteId++,
      walletId: id,
      action: 'Not Ekle',
      text: input.text.trim(),
      createdBy: CURRENT_USER,
      createdAt: at,
    };
    noteStore = [
      ...noteStore,
      {
        ...row,
        formatted: formatWalletNote({
          authorName: CURRENT_USER,
          createdAt: at,
          action: 'Not Ekle',
          text: input.text.trim(),
        }),
      },
    ];
    persistWalletNote(row);

    appendLog('add_note', id, input.text.trim());
    return { ok: true };
  },

  getLimitHistory(id) {
    return historyStore
      .filter((h) => h.walletId === id)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  runBatchUnblock() {
    const ts = today();
    let count = 0;
    walletStore = walletStore.map((w) => {
      if (!w.blockEndDate || w.blockEndDate > ts || w.blocked === 0) return w;
      count += 1;
      appendLog('batch_unblock', w.id, `blockEndDate=${w.blockEndDate}`);
      const next = syncAvailable({ ...w, blocked: 0, blockEndDate: null });
      persistWalletRow(next);
      return next;
    });
    return count;
  },

  listActivities(walletId, filters, role) {
    const guard = guardWalletActivities(walletId, role);
    if ('error' in guard)
      return {
        ok: false,
        error: guard.error as 'wa_wallet_forbidden' | 'wa_not_found',
      };
    return { ok: true, rows: activitiesForWallet(guard.wallet, filters) };
  },

  exportActivities(walletId, filters, role) {
    const guard = guardWalletActivities(walletId, role);
    if ('error' in guard)
      return { error: guard.error as 'wa_wallet_forbidden' | 'wa_not_found' };
    const rows = activitiesForWallet(guard.wallet, filters);
    appendAccessLog('activities_export', rows.length, walletId);
    return rows;
  },
};

export const walletsService: WalletsService = mockWalletsAdapter;

registerWalletLimitApprovalApply((meta) => {
  mockWalletsAdapter.updateLimits(meta.walletId, meta.limits, meta.role);
});

export function __resetWalletStoresForTest() {
  syncWalletStoreFromRows(WALLETS.map((w) => ({ ...w })));
  storeLoadPromise = null;
  syncDetailStoresFromFallback();
  __resetManagementWalletsCacheForTest();
  nextLimitId = 10_000;
  nextNoteId = 100;
  nextHistoryId = 100;
  nextLogId = 1;
  nextAccessLogId = 1;
  changeLog = [];
  accessLog = [];
}

export function __getAccessLog() {
  return accessLog;
}
