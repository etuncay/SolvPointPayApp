import { WALLET_LIMIT_GROUPS, WALLET_LIMIT_TYPES } from '@epay/domain';
import type { LedgerDirection } from '@epay/domain';
import { mulberry32 } from '../lib/mulberry32';
import type { BackOfficeWallet } from '../types/mock-wallet';
import type {
  BackOfficeWalletDetailSeed,
  BackOfficeWalletLimit,
  BackOfficeWalletLimitHistory,
  BackOfficeWalletMovement,
  BackOfficeWalletNote,
  BuildBackOfficeWalletDetailsInput,
} from '../types/wallet-detail';

const DEFAULT_LIMITS: Record<
  (typeof WALLET_LIMIT_GROUPS)[number],
  Record<(typeof WALLET_LIMIT_TYPES)[number], number>
> = {
  Withdrawal: {
    Single: 50_000,
    DailyCount: 5,
    DailyAmount: 100_000,
    MonthlyCount: 50,
    MonthlyAmount: 500_000,
  },
  Transfer: {
    Single: 100_000,
    DailyCount: 10,
    DailyAmount: 250_000,
    MonthlyCount: 100,
    MonthlyAmount: 1_000_000,
  },
  International: {
    Single: 25_000,
    DailyCount: 3,
    DailyAmount: 50_000,
    MonthlyCount: 20,
    MonthlyAmount: 200_000,
  },
};

function buildNotes(): BackOfficeWalletNote[] {
  return [
    {
      id: 1,
      walletId: 11,
      action: 'Not Ekle',
      text: 'Müşteri telefon ile bilgilendirildi.',
      createdBy: 'Ayşe Demir',
      createdAt: '2026-05-18T09:15:00.000Z',
    },
    {
      id: 2,
      walletId: 11,
      action: 'Bakiye Blokesi',
      text: 'Şüpheli işlem incelemesi.',
      createdBy: 'Mehmet Kaya',
      createdAt: '2026-05-20T14:40:00.000Z',
    },
  ];
}

function buildLimits(wallets: readonly BackOfficeWallet[]): BackOfficeWalletLimit[] {
  const rows: BackOfficeWalletLimit[] = [];
  let id = 1;
  const start = '2026-01-01';

  for (const w of wallets) {
    if (w.cat === 'system') continue;

    for (const group of WALLET_LIMIT_GROUPS) {
      for (const type of WALLET_LIMIT_TYPES) {
        let amount = DEFAULT_LIMITS[group][type];
        if (w.id === 11 && group === 'Withdrawal' && type === 'Single') amount = -1;
        if (w.id === 12 && group === 'Transfer' && type === 'DailyAmount') amount = 0;
        rows.push({
          id: id++,
          walletId: w.id,
          limitGroup: group,
          limitType: type,
          amount,
          startDate: start,
          endDate: null,
          changedBy: 'system.seed',
          approvedBy: 'auto',
        });
      }
    }
  }

  return rows;
}

function buildLimitHistory(): BackOfficeWalletLimitHistory[] {
  return [
    {
      id: 1,
      walletId: 11,
      limitGroup: 'Withdrawal',
      limitType: 'Single',
      amount: 25_000,
      startDate: '2025-06-01',
      endDate: '2026-01-01',
      changedBy: 'Ops User',
      approvedBy: 'auto',
    },
    {
      id: 2,
      walletId: 11,
      limitGroup: 'Withdrawal',
      limitType: 'Single',
      amount: -1,
      startDate: '2026-01-01',
      endDate: null,
      changedBy: 'Compliance User',
      approvedBy: 'auto',
    },
    {
      id: 3,
      walletId: 12,
      limitGroup: 'Transfer',
      limitType: 'DailyAmount',
      amount: 100_000,
      startDate: '2025-12-01',
      endDate: '2026-03-01',
      changedBy: 'Ops User',
      approvedBy: 'auto',
    },
  ];
}

function buildMovements(input: BuildBackOfficeWalletDetailsInput): BackOfficeWalletMovement[] {
  const rand = mulberry32(input.rngSeed ?? 77);
  const movements: BackOfficeWalletMovement[] = [];
  let movId = 1;

  for (const tx of input.transactions) {
    if (tx.recordStatus !== 1) continue;

    if (tx.senderWalletId != null) {
      movements.push({
        id: movId++,
        walletId: tx.senderWalletId,
        transactionId: tx.id,
        direction: 'Outflow',
        amount: tx.amount,
        postBalance: 0,
        createdAt: tx.createdAt,
        recordStatus: 1,
      });
    }

    if (tx.receiverWalletId != null) {
      movements.push({
        id: movId++,
        walletId: tx.receiverWalletId,
        transactionId: tx.id,
        direction: 'Inflow',
        amount: tx.amount,
        postBalance: 0,
        createdAt: tx.createdAt,
        recordStatus: 1,
      });
    }
  }

  const activeWallets = input.wallets.filter((w) => w.recordStatus === 1);
  for (const wallet of activeWallets) {
    const existing = movements.filter((m) => m.walletId === wallet.id).length;
    const target = Math.max(0, 3 - existing);
    for (let i = 0; i < target; i++) {
      const amount = Math.floor(rand() * 5000) + 100;
      const direction: LedgerDirection = i % 2 === 0 ? 'Inflow' : 'Outflow';
      const daysAgo = Math.floor(rand() * 120) + existing + i;
      const d = new Date(2026, 4, 23 - daysAgo, 12, 0, 0);
      movements.push({
        id: movId++,
        walletId: wallet.id,
        transactionId: -movId,
        direction,
        amount,
        postBalance: 0,
        createdAt: d.toISOString().slice(0, 19).replace('T', ' '),
        recordStatus: 1,
      });
    }
  }

  const demoWallet = activeWallets.find((w) => w.walletNo === 'MS-9901-01');
  if (demoWallet && !movements.some((m) => m.walletId === demoWallet.id && m.direction === 'Inflow')) {
    movements.push({
      id: movId++,
      walletId: demoWallet.id,
      transactionId: -movId,
      direction: 'Inflow',
      amount: 2500,
      postBalance: 0,
      createdAt: '2026-05-23 12:00:00',
      recordStatus: 1,
    });
  }

  const byWallet = new Map<number, BackOfficeWalletMovement[]>();
  for (const m of movements) {
    const list = byWallet.get(m.walletId) ?? [];
    list.push(m);
    byWallet.set(m.walletId, list);
  }

  for (const wallet of activeWallets) {
    const list = (byWallet.get(wallet.id) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    let balance = wallet.balance;
    for (const m of list) {
      m.postBalance = balance;
      if (m.direction === 'Inflow') balance -= m.amount;
      else balance += m.amount;
    }
  }

  return movements;
}

/** Cüzdan detay mock seed — not, limit, hareket */
export function buildBackOfficeWalletDetails(
  input: BuildBackOfficeWalletDetailsInput,
): BackOfficeWalletDetailSeed {
  return {
    notes: buildNotes(),
    limits: buildLimits(input.wallets),
    limitHistory: buildLimitHistory(),
    movements: buildMovements(input),
  };
}
