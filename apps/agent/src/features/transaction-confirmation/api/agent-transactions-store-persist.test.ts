import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AGENT_TX_STORE_KEY_PREFIX } from '@/config/app';
import {
  agentTxStorageKey,
  clearPersistedAgentTxStore,
  fromPersisted,
  loadPersistedAgentTxStore,
  savePersistedAgentTxStore,
  toPersisted,
  AGENT_TX_STORE_VERSION,
} from './agent-transactions-store-persist';
import {
  agentTransactionsStore,
  DEMO_AGENT_ID,
  resetAgentTransactionsStoreForTests,
} from './agent-transactions-store';

const memStorage = new Map<string, string>();

function installSessionStorageMock(): void {
  vi.stubGlobal('sessionStorage', {
    get length() {
      return memStorage.size;
    },
    clear: () => memStorage.clear(),
    getItem: (key: string) => memStorage.get(key) ?? null,
    key: (index: number) => [...memStorage.keys()][index] ?? null,
    removeItem: (key: string) => {
      memStorage.delete(key);
    },
    setItem: (key: string, value: string) => {
      memStorage.set(key, value);
    },
  });
}

describe('agent-transactions-store-persist', () => {
  beforeEach(() => {
    memStorage.clear();
    installSessionStorageMock();
    resetAgentTransactionsStoreForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses versioned sessionStorage key per agent', () => {
    expect(agentTxStorageKey(99901)).toBe(`${AGENT_TX_STORE_KEY_PREFIX}:99901`);
  });

  it('round-trips snapshot through sessionStorage', () => {
    const snapshot = toPersisted(DEMO_AGENT_ID, {
      records: agentTransactionsStore.list(),
      nextRecordId: 95001,
      security: new Map(),
      declarations: new Map(),
      receipts: new Map(),
    });
    savePersistedAgentTxStore(DEMO_AGENT_ID, snapshot);
    const loaded = loadPersistedAgentTxStore(DEMO_AGENT_ID);
    expect(loaded).toMatchObject({ v: AGENT_TX_STORE_VERSION, agentId: DEMO_AGENT_ID, nextRecordId: 95001 });
    expect(fromPersisted(loaded!).records).toHaveLength(snapshot.records.length);
  });

  it('rejects stale store version', () => {
    savePersistedAgentTxStore(DEMO_AGENT_ID, {
      v: 0,
      agentId: DEMO_AGENT_ID,
      records: [],
      nextRecordId: 1,
      security: [],
      declarations: [],
      receipts: [],
    });
    expect(loadPersistedAgentTxStore(DEMO_AGENT_ID)).toBeNull();
  });
});

describe('agentTransactionsStore persistence', () => {
  beforeEach(() => {
    memStorage.clear();
    installSessionStorageMock();
    resetAgentTransactionsStoreForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists new records to sessionStorage', () => {
    const before = agentTransactionsStore.list().length;
    agentTransactionsStore.addRecord({
      txNo: 'TX-TEST-1',
      referenceNo: 'REF-PERSIST-1',
      senderCustomerId: 99901,
      receiverCustomerId: null,
      senderAgentId: DEMO_AGENT_ID,
      receiverAgentId: null,
      senderWalletId: 1,
      receiverWalletId: null,
      senderIban: null,
      receiverIban: null,
      type: 'WalletToPerson',
      currency: 'TRY',
      amount: 100,
      feeFixed: 0,
      feeVariable: 0,
      status: 'Pending',
      createdAt: '2026-06-18 10:00:00',
      paymentPurpose: 'Test',
      description: 'Persist test',
      recordStatus: 1,
    });
    expect(agentTransactionsStore.list()).toHaveLength(before + 1);
    const loaded = loadPersistedAgentTxStore(DEMO_AGENT_ID);
    expect(loaded?.records.some((r) => r.referenceNo === 'REF-PERSIST-1')).toBe(true);
  });

  it('persists approval status across reload simulation', () => {
    agentTransactionsStore.recordCancel(90001);
    expect(agentTransactionsStore.get(90001)?.status).toBe('Canceled');

    const loaded = loadPersistedAgentTxStore(DEMO_AGENT_ID);
    expect(loaded?.records.find((r) => r.id === 90001)?.status).toBe('Canceled');
  });

  it('reset clears sessionStorage overlay', () => {
    agentTransactionsStore.recordCancel(90002);
    resetAgentTransactionsStoreForTests();
    expect(loadPersistedAgentTxStore(DEMO_AGENT_ID)).toBeNull();
    expect(agentTransactionsStore.get(90002)?.status).toBe('Pending');
  });
});
