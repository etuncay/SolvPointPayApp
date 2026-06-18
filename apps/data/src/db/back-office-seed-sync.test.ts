import { describe, expect, it } from 'vitest';
import {
  BACK_OFFICE_AGENT_TRANSACTION_SEED,
  BACK_OFFICE_AGENT_WALLET_SEED,
  BACK_OFFICE_TRANSACTION_SEED,
  BACK_OFFICE_WALLET_SEED,
  buildBackOfficeTransactionSeed,
} from '../index';

function walletIdSet(wallets: typeof BACK_OFFICE_WALLET_SEED): Set<number> {
  return new Set(wallets.filter((w) => w.recordStatus === 1).map((w) => w.id));
}

function assertTxWalletRefs(
  txs: typeof BACK_OFFICE_TRANSACTION_SEED,
  wallets: typeof BACK_OFFICE_WALLET_SEED,
): void {
  const ids = walletIdSet(wallets);
  for (const tx of txs) {
    if (tx.senderWalletId != null) expect(ids.has(tx.senderWalletId)).toBe(true);
    if (tx.receiverWalletId != null) expect(ids.has(tx.receiverWalletId)).toBe(true);
  }
}

describe('back-office seed sync', () => {
  it('management transaction seed derives from wallet seed', () => {
    expect(BACK_OFFICE_TRANSACTION_SEED).toEqual(
      buildBackOfficeTransactionSeed(BACK_OFFICE_WALLET_SEED),
    );
    assertTxWalletRefs(BACK_OFFICE_TRANSACTION_SEED, BACK_OFFICE_WALLET_SEED);
  });

  it('agent transaction seed derives from agent wallet seed', () => {
    expect(BACK_OFFICE_AGENT_TRANSACTION_SEED).toEqual(
      buildBackOfficeTransactionSeed(BACK_OFFICE_AGENT_WALLET_SEED),
    );
    assertTxWalletRefs(BACK_OFFICE_AGENT_TRANSACTION_SEED, BACK_OFFICE_AGENT_WALLET_SEED);
  });

  it('agent wallet seed includes transactional wallets', () => {
    const mgmtIds = new Set(BACK_OFFICE_WALLET_SEED.map((w) => w.walletNo));
    const agentOnly = BACK_OFFICE_AGENT_WALLET_SEED.filter((w) => !mgmtIds.has(w.walletNo));
    expect(agentOnly.some((w) => w.walletKind === 'CustomerTransactional')).toBe(true);
  });

  it('seeds are non-empty and deterministic length', () => {
    expect(BACK_OFFICE_WALLET_SEED.length).toBeGreaterThan(20);
    expect(BACK_OFFICE_TRANSACTION_SEED.length).toBeGreaterThan(50);
    expect(BACK_OFFICE_AGENT_WALLET_SEED.length).toBeGreaterThan(BACK_OFFICE_WALLET_SEED.length);
  });
});
