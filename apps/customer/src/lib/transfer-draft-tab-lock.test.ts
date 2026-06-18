import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTabId,
  hasTransferDraftTabConflict,
  isForeignTransferDraftLockHeld,
  isTransferDraftLockStale,
  readActiveTransferDraftLock,
  releaseTransferDraftLock,
  writeTransferDraftLock,
  TRANSFER_DRAFT_LOCK_STORAGE_KEY,
} from './transfer-draft-tab-lock';

describe('transfer-draft-tab-lock', () => {
  const session = new Map<string, string>();
  const local = new Map<string, string>();

  beforeEach(() => {
    session.clear();
    local.clear();
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => {
        session.set(k, v);
      },
      removeItem: (k: string) => {
        session.delete(k);
      },
    });
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => local.get(k) ?? null,
      setItem: (k: string, v: string) => {
        local.set(k, v);
      },
      removeItem: (k: string) => {
        local.delete(k);
      },
    });
    session.set('epay.customer.tab-id', 'tab-a');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes and reads active lock for current tab', () => {
    writeTransferDraftLock('TRX-1');
    expect(readActiveTransferDraftLock()).toEqual({
      tabId: 'tab-a',
      transactionId: 'TRX-1',
      updatedAt: expect.any(Number),
    });
    expect(isForeignTransferDraftLockHeld()).toBe(false);
  });

  it('detects foreign tab lock', () => {
    local.set(
      TRANSFER_DRAFT_LOCK_STORAGE_KEY,
      JSON.stringify({ tabId: 'tab-b', transactionId: 'TRX-2', updatedAt: Date.now() }),
    );
    expect(isForeignTransferDraftLockHeld()).toBe(true);
    expect(hasTransferDraftTabConflict('TRX-1')).toBe(true);
    expect(hasTransferDraftTabConflict('TRX-2')).toBe(false);
  });

  it('ignores stale lock', () => {
    local.set(
      TRANSFER_DRAFT_LOCK_STORAGE_KEY,
      JSON.stringify({ tabId: 'tab-b', transactionId: 'TRX-2', updatedAt: Date.now() - 60_000 }),
    );
    expect(isTransferDraftLockStale(JSON.parse(local.get(TRANSFER_DRAFT_LOCK_STORAGE_KEY)!))).toBe(
      true,
    );
    expect(readActiveTransferDraftLock()).toBeNull();
    expect(isForeignTransferDraftLockHeld()).toBe(false);
  });

  it('release only clears own lock', () => {
    writeTransferDraftLock('TRX-1');
    releaseTransferDraftLock();
    expect(readActiveTransferDraftLock()).toBeNull();

    local.set(
      TRANSFER_DRAFT_LOCK_STORAGE_KEY,
      JSON.stringify({ tabId: 'tab-b', transactionId: 'TRX-2', updatedAt: Date.now() }),
    );
    releaseTransferDraftLock();
    expect(readActiveTransferDraftLock()).not.toBeNull();
  });

  it('getTabId is stable per tab session', () => {
    expect(getTabId()).toBe('tab-a');
    expect(getTabId()).toBe('tab-a');
  });
});
