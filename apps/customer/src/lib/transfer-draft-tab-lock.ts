const TAB_ID_KEY = 'epay.customer.tab-id';
const LOCK_KEY = 'epay.customer.transfer-draft-lock';
const LOCK_STALE_MS = 45_000;

export interface TransferDraftLock {
  tabId: string;
  transactionId: string;
  updatedAt: number;
}

export function getTabId(): string {
  try {
    if (typeof sessionStorage === 'undefined') return 'server';
    let id = sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      id = `tab-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    return `tab-${Date.now()}`;
  }
}

export function readTransferDraftLock(): TransferDraftLock | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TransferDraftLock;
  } catch {
    return null;
  }
}

export function isTransferDraftLockStale(
  lock: TransferDraftLock,
  now = Date.now(),
  maxAgeMs = LOCK_STALE_MS,
): boolean {
  return now - lock.updatedAt > maxAgeMs;
}

export function readActiveTransferDraftLock(now = Date.now()): TransferDraftLock | null {
  const lock = readTransferDraftLock();
  if (!lock || isTransferDraftLockStale(lock, now)) return null;
  return lock;
}

export function writeTransferDraftLock(transactionId: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const lock: TransferDraftLock = {
      tabId: getTabId(),
      transactionId,
      updatedAt: Date.now(),
    };
    localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
  } catch {
    /* private mode */
  }
}

export function touchTransferDraftLock(transactionId: string): void {
  const lock = readTransferDraftLock();
  if (!lock || lock.tabId !== getTabId() || lock.transactionId !== transactionId) return;
  writeTransferDraftLock(transactionId);
}

export function releaseTransferDraftLock(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const lock = readTransferDraftLock();
    if (lock?.tabId === getTabId()) {
      localStorage.removeItem(LOCK_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Başka sekme aktif (taze) draft kilidi tutuyor mu? */
export function isForeignTransferDraftLockHeld(now = Date.now()): boolean {
  const lock = readActiveTransferDraftLock(now);
  if (!lock) return false;
  return lock.tabId !== getTabId();
}

/** Bu sekmenin onay bekleyen işlemi başka sekme tarafından geçersiz kılındı mı? */
export function hasTransferDraftTabConflict(
  localTransactionId: string | null | undefined,
  now = Date.now(),
): boolean {
  const lock = readActiveTransferDraftLock(now);
  if (!lock) return false;
  if (lock.tabId === getTabId()) return false;
  if (localTransactionId && lock.transactionId === localTransactionId) return false;
  return true;
}

export const TRANSFER_DRAFT_LOCK_STORAGE_KEY = LOCK_KEY;
