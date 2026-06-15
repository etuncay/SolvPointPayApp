import type { AgentActivityRecord, AgentBalanceRow } from '../types/account';
import { getDb } from './dexie';

/** Deterministik mock üretimi için seed'li PRNG. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Temsilci cüzdanları — avans (TRY/USD) + komisyon (TRY/EUR). */
const BALANCES: AgentBalanceRow[] = [
  { walletId: 9001, walletNo: 'CZ-0009001', accountType: 'agent_advance', currency: 'TRY', balance: 1_850_000, blocked: 120_000, availableBalance: 1_730_000 },
  { walletId: 9002, walletNo: 'CZ-0009002', accountType: 'agent_advance', currency: 'USD', balance: 42_000, blocked: 0, availableBalance: 42_000 },
  { walletId: 9003, walletNo: 'CZ-0009003', accountType: 'agent_commission', currency: 'TRY', balance: 96_500, blocked: 0, availableBalance: 96_500 },
  { walletId: 9004, walletNo: 'CZ-0009004', accountType: 'agent_commission', currency: 'EUR', balance: 5_400, blocked: 200, availableBalance: 5_200 },
];

const TX_TYPES = [
  'WalletToPerson',
  'WalletToBankAccount',
  'WalletTopUp',
  'WalletWithdrawal',
  'WalletDeposit',
  'InternalTransfer',
  'InternationalTransfer',
] as const;

const STATUSES = ['Completed', 'Sent', 'Pending', 'OnHold', 'ErrorComplete', 'Canceled'] as const;

const NAMES = [
  'Ahmet Yılmaz', 'Ayşe Kaya', 'Mehmet Demir', 'Fatma Çelik', 'Ali Şahin',
  'Zeynep Arslan', 'Hasan Doğan', 'Elif Koç', 'Mustafa Aydın', 'Merve Öztürk',
  'Caner Avcı', 'Selin Polat', 'Burak Aksoy', 'Derya Güneş', 'Emre Korkmaz',
];

function isInflowType(type: string): boolean {
  return type === 'WalletDeposit' || type === 'WalletTopUp';
}

function iban(rand: () => number): string {
  let digits = '';
  for (let i = 0; i < 22; i += 1) digits += Math.floor(rand() * 10);
  return `TR${digits}`;
}

/** Deterministik hesap hareketi listesi — bakiye perspektifinden postBalance. */
export function generateAgentActivities(count = 80): AgentActivityRecord[] {
  const rand = rng(20260530);
  const running: Record<number, number> = Object.fromEntries(BALANCES.map((b) => [b.walletId, b.balance]));
  const base = new Date('2026-05-29T17:30:00Z').getTime();
  const rows: AgentActivityRecord[] = [];

  for (let i = 0; i < count; i += 1) {
    const wallet = BALANCES[Math.floor(rand() * BALANCES.length)];
    const type = TX_TYPES[Math.floor(rand() * TX_TYPES.length)];
    const direction = isInflowType(type) ? 'Inflow' : rand() < 0.25 ? 'Inflow' : 'Outflow';
    const amount = Math.round(500 + rand() * 45_000);
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const createdAt = new Date(base - i * 3.2 * 3_600_000 - Math.floor(rand() * 3_600_000)).toISOString();
    const name = NAMES[Math.floor(rand() * NAMES.length)];
    const cpNo = `MUS-${String(10_000 + Math.floor(rand() * 8_999)).padStart(7, '0')}`;

    const post = running[wallet.walletId];
    running[wallet.walletId] = post - (direction === 'Inflow' ? amount : -amount);
    const settled = status === 'Completed' || status === 'Sent';

    rows.push({
      id: `act-${i + 1}`,
      transactionId: 50_000 + i,
      transactionNo: `TRX-${String(700_000 + i)}`,
      createdAt,
      direction,
      walletId: wallet.walletId,
      walletNo: wallet.walletNo,
      accountType: wallet.accountType,
      counterpartyNo: cpNo,
      counterpartyName: name,
      counterpartyAccount: type === 'WalletToBankAccount' || type === 'InternationalTransfer' ? iban(rand) : `CZ-${String(8_000_000 + Math.floor(rand() * 999_999)).padStart(7, '0')}`,
      referenceNo: `REF-${String(900_000 + i)}`,
      transactionType: type,
      currency: wallet.currency,
      amount,
      postBalance: settled ? Math.max(0, post) : null,
      status,
      description: null,
    });
  }

  return rows;
}

/** Tarayıcı IndexedDB — boşsa temsilci bakiye + hareket seed'i üretir. */
export async function ensureAgentAccountsSeeded(): Promise<void> {
  const db = getDb();
  const balCount = await db.agentBalances.count();
  if (balCount === 0) {
    await db.agentBalances.bulkPut(BALANCES.map((b) => ({ ...b })));
  }
  const actCount = await db.agentActivities.count();
  if (actCount === 0) {
    await db.agentActivities.bulkPut(generateAgentActivities());
  }
}
