import type { TransactionStatus, TransactionType } from '@epay/domain';
import { mulberry32 } from '../lib/mulberry32';
import type { BackOfficeTransaction } from '../types/transaction';

/** İşlem seed — cüzdan satırı (management/agent mock ile uyumlu minimum alan seti) */
export type TransactionSeedWallet = {
  id: number;
  walletNo: string;
  ccy: string;
  customerId: number | null;
  agentId: number | string | null;
  cat: 'customer' | 'agent' | 'system';
  recordStatus: 0 | 1;
};

export type TransactionSeedCustomer = {
  id: number;
  status: string;
  type: string;
};

export type TransactionSeedAgent = {
  id: number | string;
};

export type BuildBackOfficeTransactionsInput = {
  wallets: readonly TransactionSeedWallet[];
  customers: readonly TransactionSeedCustomer[];
  agents: readonly TransactionSeedAgent[];
  /** mulberry32 seed — varsayılan 42 */
  rngSeed?: number;
  /** Demo yoğunluk cüzdanı — varsayılan MS-9901-01 */
  demoWalletNo?: string;
};

const TX_TYPES: TransactionType[] = [
  'WalletToPerson',
  'InternationalTransfer',
  'WalletToBankAccount',
  'WalletTopUp',
  'WalletWithdrawal',
  'WalletDeposit',
  'InternalTransfer',
];

const STATUSES: TransactionStatus[] = [
  'Completed',
  'Pending',
  'OnHold',
  'Sent',
  'ErrorComplete',
  'Canceled',
  'ErrorSend',
  'ErrorReceive',
  'Retrying',
];

function maskIbanSeed(rand: () => number): string {
  const tail = String(Math.floor(rand() * 10000)).padStart(4, '0');
  return `TR33 0006 1005 1978 6457 8413 ${tail.slice(0, 2)} ${tail.slice(2)}`;
}

function pushTx(
  txs: BackOfficeTransaction[],
  txId: number,
  input: Omit<BackOfficeTransaction, 'id' | 'txNo' | 'referenceNo'>,
): number {
  txs.push({
    id: txId,
    txNo: `TX-${String(2026050000 + txId)}`,
    referenceNo: `REF-${String(880000 + txId)}`,
    ...input,
  });
  return txId + 1;
}

function resolveAgentId(
  agent: TransactionSeedAgent | undefined,
  wallets: TransactionSeedWallet[],
): number | string | null {
  if (!agent) return null;
  return agent.id;
}

/** Management/agent mock cüzdan+müşteri fixture'larından ~100 işlem üretir */
export function buildBackOfficeTransactions(
  input: BuildBackOfficeTransactionsInput,
): BackOfficeTransaction[] {
  const rand = mulberry32(input.rngSeed ?? 42);
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)]!;

  const dateTime = (daysAgo: number, hour = 10): string => {
    const d = new Date(2026, 4, 23, hour, Math.floor(rand() * 59), 0);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const { wallets: allWallets, customers: allCustomers, agents } = input;
  const demoWalletNo = input.demoWalletNo ?? 'MS-9901-01';
  const wallets = allWallets.filter((w) => w.recordStatus === 1);
  const customers = allCustomers.filter((c) => c.status === 'active' && c.type !== 'prospective');

  const txs: BackOfficeTransaction[] = [];
  let txId = 1;
  const demoWallet = wallets.find((w) => w.walletNo === demoWalletNo);
  const demoCount = 24;

  for (let i = 0; i < 55; i++) {
    const isDemo = demoWallet && i < demoCount;
    const ccy = isDemo ? pick(['TRY', 'TRY', 'USD', 'EUR']) : pick(['TRY', 'USD', 'EUR', 'GBP']);
    const pool = wallets.filter((w) => w.ccy === ccy);
    if (pool.length < 2 && !isDemo) continue;

    const sender = isDemo ? demoWallet! : pick(pool);
    const receiver = pick(pool.filter((w) => w.id !== sender.id));
    const bankOnly = rand() < 0.12 && sender.cat === 'customer';
    if (!receiver && !bankOnly) continue;

    const amount = Math.max(50, Math.floor(rand() * (isDemo ? 45_000 : 18_000)));
    const type = isDemo
      ? pick(['WalletTopUp', 'WalletToPerson', 'WalletToBankAccount', 'InternalTransfer'] as TransactionType[])
      : pick(TX_TYPES);
    const status = isDemo
      ? pick(['Completed', 'Completed', 'Pending', 'OnHold', 'Sent'] as TransactionStatus[])
      : pick(STATUSES);

    txId = pushTx(txs, txId, {
      senderCustomerId: sender.customerId,
      senderAgentId: sender.agentId,
      receiverCustomerId: receiver?.customerId ?? null,
      receiverAgentId: receiver?.agentId ?? null,
      senderWalletId: sender.id,
      receiverWalletId: bankOnly ? null : (receiver?.id ?? null),
      senderIban: null,
      receiverIban: bankOnly ? maskIbanSeed(rand) : null,
      type,
      currency: ccy,
      amount,
      status,
      recordStatus: 1,
      createdAt: dateTime(isDemo ? Math.floor(i / 2) : Math.floor(rand() * 90), 8 + (i % 12)),
    });
  }

  for (let j = 0; j < 12; j++) {
    const custWallet = pick(wallets.filter((w) => w.cat === 'customer' && w.ccy === 'TRY'));
    const agentWallet = pick(wallets.filter((w) => w.cat === 'agent' && w.ccy === 'TRY'));
    if (!custWallet || !agentWallet) continue;
    txId = pushTx(txs, txId, {
      senderCustomerId: custWallet.customerId,
      senderAgentId: null,
      receiverCustomerId: null,
      receiverAgentId: agentWallet.agentId,
      senderWalletId: custWallet.id,
      receiverWalletId: agentWallet.id,
      senderIban: null,
      receiverIban: null,
      type: 'InternalTransfer',
      currency: 'TRY',
      amount: Math.floor(rand() * 8000) + 100,
      status: pick(STATUSES),
      recordStatus: 1,
      createdAt: dateTime(Math.floor(rand() * 60)),
    });
  }

  const dashboardStatuses: TransactionStatus[] = [
    'Pending',
    'Pending',
    'Pending',
    'Pending',
    'Pending',
    'OnHold',
    'OnHold',
    'OnHold',
    'Canceled',
    'Canceled',
  ];

  for (const status of dashboardStatuses) {
    const sender = pick(wallets.filter((w) => w.cat === 'customer'));
    const receiver = pick(wallets.filter((w) => w.id !== sender.id && w.ccy === sender.ccy));
    if (!receiver) continue;
    txId = pushTx(txs, txId, {
      senderCustomerId: sender.customerId,
      senderAgentId: null,
      receiverCustomerId: receiver.customerId,
      receiverAgentId: null,
      senderWalletId: sender.id,
      receiverWalletId: receiver.id,
      senderIban: null,
      receiverIban: null,
      type: 'WalletToPerson',
      currency: sender.ccy,
      amount: Math.floor(rand() * 12_000) + 200,
      status,
      recordStatus: 1,
      createdAt: dateTime(Math.floor(rand() * 14)),
    });
  }

  for (let k = 0; k < 15; k++) {
    const sender = pick(wallets.filter((w) => w.cat === 'customer'));
    const type = k % 2 === 0 ? 'WalletToBankAccount' : 'InternationalTransfer';
    txId = pushTx(txs, txId, {
      senderCustomerId: sender.customerId,
      senderAgentId: null,
      receiverCustomerId: null,
      receiverAgentId: null,
      senderWalletId: sender.id,
      receiverWalletId: null,
      senderIban: null,
      receiverIban: maskIbanSeed(rand),
      type,
      currency: sender.ccy,
      targetCurrency: type === 'InternationalTransfer' ? pick(['USD', 'EUR']) : sender.ccy,
      amount: Math.floor(rand() * 25_000) + 500,
      status: pick(STATUSES),
      recordStatus: 1,
      createdAt: dateTime(Math.floor(rand() * 45)),
    });
  }

  while (txs.filter((t) => t.recordStatus === 1).length < 100) {
    const ccy = pick(['TRY', 'USD', 'EUR', 'GBP']);
    const pool = wallets.filter((w) => w.ccy === ccy);
    if (pool.length < 2) break;
    const sender = pick(pool);
    const receiver = pick(pool.filter((w) => w.id !== sender.id));
    txId = pushTx(txs, txId, {
      senderCustomerId: sender.customerId,
      senderAgentId: sender.agentId,
      receiverCustomerId: receiver.customerId,
      receiverAgentId: receiver.agentId,
      senderWalletId: sender.id,
      receiverWalletId: receiver.id,
      senderIban: null,
      receiverIban: null,
      type: pick(TX_TYPES),
      currency: ccy,
      amount: Math.floor(rand() * 20_000) + 100,
      status: pick(STATUSES),
      recordStatus: 1,
      createdAt: dateTime(Math.floor(rand() * 120)),
    });
  }

  txId = pushTx(txs, txId, {
    senderCustomerId: customers[0]?.id ?? null,
    senderAgentId: null,
    receiverCustomerId: null,
    receiverAgentId: resolveAgentId(agents[0], wallets),
    senderWalletId: wallets.find((w) => w.customerId === customers[0]?.id)?.id ?? null,
    receiverWalletId: wallets.find((w) => w.agentId === agents[0]?.id)?.id ?? null,
    senderIban: null,
    receiverIban: null,
    type: 'WalletToPerson',
    currency: 'TRY',
    amount: 500,
    status: 'Canceled',
    recordStatus: 0,
    createdAt: dateTime(120),
  });

  txId = pushTx(txs, txId, {
    senderCustomerId: customers[0]?.id ?? null,
    senderAgentId: null,
    receiverCustomerId: customers[1]?.id ?? null,
    receiverAgentId: null,
    senderWalletId: wallets.find((w) => w.customerId === customers[0]?.id)?.id ?? null,
    receiverWalletId: wallets.find((w) => w.customerId === customers[1]?.id)?.id ?? null,
    senderIban: maskIbanSeed(rand),
    receiverIban: maskIbanSeed(rand),
    type: 'InternationalTransfer',
    currency: 'EUR',
    amount: 12_500,
    status: 'Completed',
    recordStatus: 1,
    createdAt: dateTime(2, 14),
  });
  const demoTx = txs[txs.length - 1]!;
  demoTx.txNo = 'TX-2024-001';
  demoTx.referenceNo = 'REF-2024-001';

  txs.push({
    id: txId,
    txNo: 'TX-DELETED-002',
    referenceNo: 'REF-DELETED-002',
    senderCustomerId: customers[1]?.id ?? null,
    senderAgentId: null,
    receiverCustomerId: customers[2]?.id ?? null,
    receiverAgentId: null,
    senderWalletId: wallets.find((w) => w.customerId === customers[1]?.id)?.id ?? null,
    receiverWalletId: wallets.find((w) => w.customerId === customers[2]?.id)?.id ?? null,
    senderIban: null,
    receiverIban: null,
    type: 'InternalTransfer',
    currency: 'TRY',
    amount: 1200,
    status: 'ErrorComplete',
    recordStatus: 0,
    createdAt: dateTime(100),
  });

  return txs;
}
