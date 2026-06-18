import { AGENTS } from '@/mocks/agents';
import { CUSTOMERS } from '@/mocks/data';
import { getWallets } from '@/lib/wallets-store';
import type { Transaction } from '@/mocks/transactions';
import type {
  DeclarationInput,
  PendingCustomerRow,
  SecurityChecks,
} from '../domain/types';
import {
  clearPersistedAgentTxStore,
  fromPersisted,
  loadPersistedAgentTxStore,
  savePersistedAgentTxStore,
  toPersisted,
  type MutableAgentTxState,
  type ReceiptState,
} from './agent-transactions-store-persist';

/** Mock: oturum açan temsilci. Gerçek API'de oturumdan gelir. */
export const DEMO_AGENT_ID = AGENTS[0]?.id ?? 99901;

function walletOf(customerId: number): number | null {
  return getWallets().find((w) => w.customerId === customerId && w.recordStatus === 1)?.id ?? null;
}

function ago(days: number, hour = 11): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 25, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/** Temsilci kapsamına filtreli deterministik seed — Pending/OnHold/Completed karışık. */
function seedRecords(): Transaction[] {
  const c1 = CUSTOMERS[0]!; // Caner Avcı — bireysel
  const c2 = CUSTOMERS[1]!; // Hatice Acar — bireysel L2
  const c3 = CUSTOMERS.find((c) => c.type === 'corporate') ?? CUSTOMERS[3]!;

  const base = {
    senderAgentId: null as number | null,
    receiverAgentId: null as number | null,
    senderIban: null as string | null,
    receiverIban: null as string | null,
    recordStatus: 1 as const,
  };

  return [
    // Para çekme talebi temsilciye yapılmış — bekleyen
    {
      ...base,
      id: 90001,
      txNo: 'TX-AG-90001',
      referenceNo: 'REF-AG-90001',
      senderCustomerId: c1.id,
      receiverCustomerId: null,
      receiverAgentId: DEMO_AGENT_ID,
      senderWalletId: walletOf(c1.id),
      receiverWalletId: null,
      type: 'WalletWithdrawal',
      currency: 'TRY',
      amount: 8_500,
      feeFixed: 25,
      feeVariable: 42,
      status: 'Pending',
      createdAt: ago(0, 9),
      paymentPurpose: 'Nakit Çekim',
      description: 'Şubeden nakit para çekme talebi',
      withdrawalDate: ago(0, 9).slice(0, 10),
    },
    // Temsilcinin gönderen olduğu banka transferi — bekleyen
    {
      ...base,
      id: 90002,
      txNo: 'TX-AG-90002',
      referenceNo: 'REF-AG-90002',
      senderCustomerId: c2.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: null,
      senderWalletId: walletOf(c2.id),
      receiverWalletId: null,
      receiverIban: 'TR33 0006 1005 1978 6457 8413 26',
      type: 'WalletToBankAccount',
      currency: 'TRY',
      amount: 12_000,
      feeFixed: 30,
      feeVariable: 60,
      status: 'Pending',
      createdAt: ago(0, 10),
      paymentPurpose: 'Bireysel Transfer',
      description: 'Banka hesabına havale',
      withdrawalDate: ago(0, 10).slice(0, 10),
    },
    // Yüksek tutarlı yurt dışı — bekleyen, risk=Kritik (beyan modalı)
    {
      ...base,
      id: 90003,
      txNo: 'TX-AG-90003',
      referenceNo: 'REF-AG-90003',
      foreignReferenceNo: 'RIA-554120',
      senderCustomerId: c3.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: null,
      senderWalletId: walletOf(c3.id),
      receiverWalletId: null,
      receiverIban: 'DE89 3704 0044 0532 0130 00',
      type: 'InternationalTransfer',
      currency: 'TRY',
      targetCurrency: 'EUR',
      fxRate: 35.4,
      targetAmount: Math.round(62_000 / 35.4),
      amount: 62_000,
      feeFixed: 120,
      feeVariable: 310,
      status: 'Pending',
      createdAt: ago(1, 14),
      paymentPurpose: 'Aile Desteği',
      description: 'Yurt dışı aile transferi',
      withdrawalDate: ago(1, 14).slice(0, 10),
    },
    // OnHold — detay modunda açılır
    {
      ...base,
      id: 90004,
      txNo: 'TX-AG-90004',
      referenceNo: 'REF-AG-90004',
      senderCustomerId: c1.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: c2.id,
      senderWalletId: walletOf(c1.id),
      receiverWalletId: walletOf(c2.id),
      type: 'WalletToPerson',
      currency: 'TRY',
      amount: 3_200,
      feeFixed: 15,
      feeVariable: 16,
      status: 'OnHold',
      createdAt: ago(2, 16),
      paymentPurpose: 'Bireysel Transfer',
      description: 'Kişiye transfer — incelemede',
    },
    // Tamamlanmış — dekont mevcut (Dekontlarım + Detay indir)
    {
      ...base,
      id: 90005,
      txNo: 'TX-AG-90005',
      referenceNo: 'REF-AG-90005',
      senderCustomerId: c2.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: c1.id,
      senderWalletId: walletOf(c2.id),
      receiverWalletId: walletOf(c1.id),
      type: 'WalletToPerson',
      currency: 'TRY',
      amount: 5_000,
      feeFixed: 20,
      feeVariable: 25,
      status: 'Completed',
      createdAt: ago(3, 12),
      paymentPurpose: 'Bireysel Transfer',
      description: 'Tamamlanmış kişiye transfer',
    },
    // Tamamlanmış para çekme — temsilciye
    {
      ...base,
      id: 90006,
      txNo: 'TX-AG-90006',
      referenceNo: 'REF-AG-90006',
      senderCustomerId: c1.id,
      receiverAgentId: DEMO_AGENT_ID,
      receiverCustomerId: null,
      senderWalletId: walletOf(c1.id),
      receiverWalletId: null,
      type: 'WalletWithdrawal',
      currency: 'USD',
      amount: 1_200,
      feeFixed: 5,
      feeVariable: 6,
      status: 'Completed',
      createdAt: ago(5, 15),
      paymentPurpose: 'Nakit Çekim',
      description: 'Tamamlanmış döviz çekimi',
      withdrawalDate: ago(5, 15).slice(0, 10),
    },
    // Bugün tamamlanmış kişiye transfer — İşlem Hareketleri varsayılan listesinde gelir hesaplanır
    {
      ...base,
      id: 90007,
      txNo: 'TX-AG-90007',
      referenceNo: 'REF-AG-90007',
      senderCustomerId: c2.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: c1.id,
      senderWalletId: walletOf(c2.id),
      receiverWalletId: walletOf(c1.id),
      type: 'WalletToPerson',
      currency: 'TRY',
      amount: 4_500,
      feeFixed: 18,
      feeVariable: 22,
      status: 'Completed',
      createdAt: ago(0, 11),
      paymentPurpose: 'Bireysel Transfer',
      description: 'Bugün tamamlanan kişiye transfer',
    },
    // Bugün gönderilen banka transferi — gelir hesaplanır (Sent)
    {
      ...base,
      id: 90008,
      txNo: 'TX-AG-90008',
      referenceNo: 'REF-AG-90008',
      senderCustomerId: c1.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: null,
      senderWalletId: walletOf(c1.id),
      receiverWalletId: null,
      receiverIban: 'TR12 0006 1005 1978 6457 8413 88',
      type: 'WalletToBankAccount',
      currency: 'TRY',
      amount: 9_000,
      feeFixed: 30,
      feeVariable: 45,
      status: 'Sent',
      createdAt: ago(0, 13),
      paymentPurpose: 'Bireysel Transfer',
      description: 'Bugün gönderilen banka havalesi',
    },
    // Bugün iptal edilen transfer — gelir "—" (§19)
    {
      ...base,
      id: 90009,
      txNo: 'TX-AG-90009',
      referenceNo: 'REF-AG-90009',
      senderCustomerId: c1.id,
      senderAgentId: DEMO_AGENT_ID,
      receiverCustomerId: c2.id,
      senderWalletId: walletOf(c1.id),
      receiverWalletId: walletOf(c2.id),
      type: 'WalletToPerson',
      currency: 'TRY',
      amount: 2_000,
      feeFixed: 10,
      feeVariable: 10,
      status: 'Canceled',
      createdAt: ago(0, 15),
      paymentPurpose: 'Bireysel Transfer',
      description: 'Bugün iptal edilen transfer',
    },
    // Bugün tamamlanan döviz çekimi — temsilciye (alıcı temsilcisi rolü)
    {
      ...base,
      id: 90010,
      txNo: 'TX-AG-90010',
      referenceNo: 'REF-AG-90010',
      senderCustomerId: c2.id,
      receiverAgentId: DEMO_AGENT_ID,
      receiverCustomerId: null,
      senderWalletId: walletOf(c2.id),
      receiverWalletId: null,
      type: 'WalletWithdrawal',
      currency: 'USD',
      amount: 800,
      feeFixed: 6,
      feeVariable: 8,
      status: 'Completed',
      createdAt: ago(0, 16),
      paymentPurpose: 'Nakit Çekim',
      description: 'Bugün tamamlanan döviz çekimi',
      withdrawalDate: ago(0, 16).slice(0, 10),
    },
  ];
}

/** Bekleyen müşteriler — temsilcinin son 1 ayda girdiği, Active olmayan. */
function seedPendingCustomers(): PendingCustomerRow[] {
  const c1 = CUSTOMERS.find((c) => c.id === 99901)!;
  const c2 = CUSTOMERS.find((c) => c.id === 99904)!;
  const c3 = CUSTOMERS.find((c) => c.id === 99909)!;
  return [
    {
      customerId: c1.id,
      createdAt: ago(2).slice(0, 10),
      customerNo: c1.id,
      idNo: c1.idNo,
      name: c1.name,
      status: 'pending',
    },
    {
      customerId: c2.id,
      createdAt: ago(9).slice(0, 10),
      customerNo: c2.id,
      idNo: c2.idNo,
      name: c2.name,
      status: 'kyc_review',
    },
    {
      customerId: c3.id,
      createdAt: ago(20).slice(0, 10),
      customerNo: c3.id,
      idNo: c3.idNo,
      name: c3.name,
      status: 'on_hold',
    },
  ];
}

type ReceiptStateLocal = ReceiptState;

function seedReceipts(): Map<number, ReceiptStateLocal> {
  return new Map([
    [90005, { generated: true, signedFileName: 'imzali-dekont-90005.pdf' }],
    [90006, { generated: true, signedFileName: 'imzali-dekont-90006.pdf' }],
  ]);
}

function createFreshState(): MutableAgentTxState {
  return {
    records: seedRecords(),
    nextRecordId: 95000,
    security: new Map<number, SecurityChecks>(),
    declarations: new Map<number, DeclarationInput>(),
    receipts: seedReceipts(),
  };
}

function hydrateState(agentId: number): MutableAgentTxState {
  const persisted = loadPersistedAgentTxStore(agentId);
  if (persisted) return fromPersisted(persisted);
  return createFreshState();
}

function persistState(agentId: number, state: MutableAgentTxState): void {
  savePersistedAgentTxStore(agentId, toPersisted(agentId, state));
}

const state = hydrateState(DEMO_AGENT_ID);
const pendingCustomers = seedPendingCustomers();

/** Test / demo sıfırlama — seed'e döner ve sessionStorage'ı temizler. */
export function resetAgentTransactionsStoreForTests(): void {
  clearPersistedAgentTxStore(DEMO_AGENT_ID);
  const fresh = createFreshState();
  state.records.length = 0;
  state.records.push(...fresh.records);
  state.nextRecordId = fresh.nextRecordId;
  state.security.clear();
  state.declarations.clear();
  state.receipts.clear();
  for (const [id, receipt] of fresh.receipts) state.receipts.set(id, receipt);
}

export const agentTransactionsStore = {
  /** Temsilci kapsamındaki tüm seed kayıtlar. */
  list(): Transaction[] {
    return state.records;
  },

  get(id: number): Transaction | null {
    return state.records.find((r) => r.id === id) ?? null;
  },

  /** Yeni işlem kaydı oluşturur (ör. Para Çekme submit) ve onay ekranında erişilebilir kılar. */
  addRecord(input: Omit<Transaction, 'id'>): Transaction {
    const tx = { ...input, id: state.nextRecordId++ } as Transaction;
    state.records.push(tx);
    persistState(DEMO_AGENT_ID, state);
    return tx;
  },

  /** Açık referans no zaten kayıtlı mı (idempotency). */
  hasReference(referenceNo: string): boolean {
    return state.records.some((r) => r.referenceNo === referenceNo);
  },

  listPendingCustomers(): PendingCustomerRow[] {
    return pendingCustomers;
  },

  isAgentScoped(tx: Transaction): boolean {
    return tx.senderAgentId === DEMO_AGENT_ID || tx.receiverAgentId === DEMO_AGENT_ID;
  },

  hasReceipt(id: number): boolean {
    return state.receipts.get(id)?.generated ?? false;
  },

  markReceiptGenerated(id: number): void {
    const prev = state.receipts.get(id);
    state.receipts.set(id, { generated: true, signedFileName: prev?.signedFileName ?? null });
    persistState(DEMO_AGENT_ID, state);
  },

  attachSignedReceipt(id: number, fileName: string): void {
    state.receipts.set(id, { generated: true, signedFileName: fileName });
    persistState(DEMO_AGENT_ID, state);
  },

  signedReceiptName(id: number): string | null {
    return state.receipts.get(id)?.signedFileName ?? null;
  },

  recordApproval(id: number, checks: SecurityChecks, declaration?: DeclarationInput): void {
    const tx = state.records.find((r) => r.id === id);
    if (!tx) return;
    tx.status = 'Completed';
    state.security.set(id, checks);
    if (declaration) state.declarations.set(id, declaration);
    this.markReceiptGenerated(id);
  },

  recordCancel(id: number): void {
    const tx = state.records.find((r) => r.id === id);
    if (tx) tx.status = 'Canceled';
    persistState(DEMO_AGENT_ID, state);
  },
};
