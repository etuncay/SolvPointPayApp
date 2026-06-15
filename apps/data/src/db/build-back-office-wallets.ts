import { mulberry32 } from '../lib/mulberry32';
import { calcWalletAvailable } from '../domain/wallet-utils';
import type { BackOfficeWallet } from '../types/mock-wallet';
import type { TransactionSeedCustomer } from './build-back-office-transactions';

export type WalletSeedAgent = {
  id: number | string;
  name: string;
  received: number;
  txCount: number;
};

type WalletSeedCustomer = TransactionSeedCustomer & {
  name: string;
  phone: string;
  idNo: string;
  idKind?: string;
  city: string;
  createdAt: string;
  status: string;
  kyc?: string;
};

export type BuildBackOfficeWalletsInput = {
  customers: readonly WalletSeedCustomer[];
  agents: readonly WalletSeedAgent[];
  rngSeed?: number;
  /** Agent para çekme — L1 transactional cüzdan seed */
  includeTransactionalWallets?: boolean;
};

/** Management/agent mock müşteri+temsilci fixture'larından cüzdan listesi üretir */
export function buildBackOfficeWallets(input: BuildBackOfficeWalletsInput): BackOfficeWallet[] {
  const rand = mulberry32(input.rngSeed ?? 33);
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)]!;

  const dateStr = (daysAgo: number) => {
    const d = new Date(2026, 4, 23);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  const wallets: BackOfficeWallet[] = [];
  let walletId = 1;
  let transactionalSeeded = 0;

  const SYSTEM_FIXED = [
    { code: 'system_reserve', name: 'MERKEZ REZERV TRY', ccy: 'TRY', bal: 18_420_000 },
    { code: 'system_reserve', name: 'MERKEZ REZERV USD', ccy: 'USD', bal: 1_280_400 },
    { code: 'system_reserve', name: 'MERKEZ REZERV EUR', ccy: 'EUR', bal: 920_350 },
    { code: 'system_revenue', name: 'KOMİSYON GELİR HESABI', ccy: 'TRY', bal: 4_823_550 },
    { code: 'system_revenue', name: 'FX MARJ GELİR', ccy: 'TRY', bal: 1_245_800 },
    { code: 'system_suspense', name: 'ŞÜPHELİ HESAP (SUSPENSE)', ccy: 'TRY', bal: 84_220, blocked: 84_220 },
    { code: 'system_suspense', name: 'ŞÜPHELİ FX (SUSPENSE)', ccy: 'USD', bal: 12_400, blocked: 12_400 },
    { code: 'system_settlement', name: 'MUTABAKAT HESABI TRY', ccy: 'TRY', bal: 632_400 },
    { code: 'system_settlement', name: 'MUTABAKAT HESABI USD', ccy: 'USD', bal: 84_220 },
    { code: 'system_settlement', name: 'MUTABAKAT HESABI EUR', ccy: 'EUR', bal: 142_300 },
  ];

  for (const [i, s] of SYSTEM_FIXED.entries()) {
    const row: BackOfficeWallet = {
      id: walletId++,
      ownerNo: null,
      ownerType: 'system',
      customerId: null,
      agentId: null,
      walletNo: `SYS-${String(walletId).padStart(6, '0')}`,
      type: s.code,
      cat: 'system',
      ownerName: s.name,
      phone: null,
      idNo: null,
      city: null,
      balance: s.bal,
      blocked: s.blocked ?? 0,
      ccy: s.ccy,
      txToday: Math.floor(rand() * 240),
      txAmtToday: Math.floor(rand() * 1_800_000),
      createdAt: dateStr(420 + i * 30),
      available: 0,
      recordStatus: 1,
    };
    row.available = calcWalletAvailable(row.balance, row.blocked);
    wallets.push(row);
  }

  for (const c of input.customers) {
    if (c.type === 'prospective') continue;

    const customer = c;

    const main: BackOfficeWallet = {
      id: walletId++,
      ownerNo: customer.id,
      ownerType: 'customer',
      customerId: customer.id,
      agentId: null,
      walletNo: `MS-${String(customer.id).slice(-4)}-01`,
      type: 'customer_main',
      cat: 'customer',
      ...(input.includeTransactionalWallets ? { walletKind: 'CustomerPersistent' as const } : {}),
      ownerName: customer.name,
      phone: customer.phone,
      idNo: customer.idNo,
      idKind: customer.idKind,
      city: customer.city,
      balance: Math.floor(rand() * 250_000),
      blocked: 0,
      ccy: 'TRY',
      txToday: customer.status === 'active' ? Math.floor(rand() * 12) : 0,
      txAmtToday: customer.status === 'active' ? Math.floor(rand() * 35_000) : 0,
      createdAt: customer.createdAt,
      available: 0,
      recordStatus: 1,
    };
    if (rand() < 0.05) main.blocked = -1;
    else if (rand() < 0.18) main.blocked = Math.floor(main.balance * (0.1 + rand() * 0.4));
    main.blockEndDate = main.blocked !== 0 ? dateStr(5 + Math.floor(rand() * 30)) : null;
    main.lastTxAt = customer.status === 'active' ? dateStr(Math.floor(rand() * 3)) : null;
    main.lastTxAmount = main.txAmtToday > 0 ? main.txAmtToday : null;
    main.available = calcWalletAvailable(main.balance, main.blocked);
    wallets.push(main);

    if (
      input.includeTransactionalWallets &&
      customer.type === 'individual' &&
      customer.status === 'active' &&
      customer.kyc === 'L1' &&
      transactionalSeeded < 2
    ) {
      transactionalSeeded += 1;
      const txWallet: BackOfficeWallet = {
        ...main,
        id: walletId++,
        walletNo: `MS-${String(customer.id).slice(-4)}-TX`,
        type: 'customer_transactional',
        walletKind: 'CustomerTransactional',
        balance: transactionalSeeded === 1 ? 12_500 : 8_750,
        blocked: 0,
        blockEndDate: null,
        available: 0,
      };
      txWallet.available = calcWalletAvailable(txWallet.balance, txWallet.blocked);
      wallets.push(txWallet);
    }

    if (rand() < 0.3 && customer.type === 'individual') {
      const ccy = pick(['USD', 'EUR', 'GBP']);
      const savings: BackOfficeWallet = {
        id: walletId++,
        ownerNo: customer.id,
        ownerType: 'customer',
        customerId: customer.id,
        agentId: null,
        walletNo: `MS-${String(customer.id).slice(-4)}-02`,
        type: 'customer_savings',
        cat: 'customer',
        ...(input.includeTransactionalWallets ? { walletKind: 'CustomerPersistent' as const } : {}),
        ownerName: customer.name,
        phone: customer.phone,
        idNo: customer.idNo,
        idKind: customer.idKind,
        city: customer.city,
        balance: Math.floor(rand() * 12_000),
        blocked: 0,
        ccy,
        txToday: Math.floor(rand() * 3),
        txAmtToday: Math.floor(rand() * 4500),
        createdAt: customer.createdAt,
        available: 0,
        recordStatus: 1,
      };
      savings.available = calcWalletAvailable(savings.balance, savings.blocked);
      wallets.push(savings);
    }
  }

  for (const a of input.agents) {
    const agentBalance = {
      TRY: Math.floor(a.received * 0.08 + rand() * 120_000),
      USD: Math.floor(rand() * 18_000),
      EUR: Math.floor(rand() * 14_000),
    };

    const advance: BackOfficeWallet = {
      id: walletId++,
      ownerNo: a.id,
      ownerType: 'agent',
      customerId: null,
      agentId: a.id,
      walletNo: `BY-${String(a.id).slice(-4)}-01`,
      type: 'agent_advance',
      cat: 'agent',
      ownerName: a.name,
      phone: `+90 212 ${100 + Math.floor(rand() * 800)} ${10 + Math.floor(rand() * 80)} ${10 + Math.floor(rand() * 80)}`,
      idNo: String(1000000000 + Math.floor(rand() * 9000000000)).slice(0, 10),
      idKind: 'VKN',
      city: a.name.includes('İzmir') ? 'İzmir' : 'İstanbul',
      balance: agentBalance.TRY,
      blocked: 0,
      ccy: 'TRY',
      txToday: a.txCount,
      txAmtToday: a.txCount * 4200,
      createdAt: dateStr(180 + walletId % 90),
      available: 0,
      recordStatus: 1,
    };
    advance.available = calcWalletAvailable(advance.balance, advance.blocked);
    wallets.push(advance);

    const commission: BackOfficeWallet = {
      ...advance,
      id: walletId++,
      walletNo: `BY-${String(a.id).slice(-4)}-02`,
      type: 'agent_commission',
      balance: Math.floor(agentBalance.TRY * 0.015 + rand() * 20_000),
      txToday: Math.floor(a.txCount * 0.3),
      txAmtToday: Math.floor(a.txCount * 65),
    };
    commission.available = calcWalletAvailable(commission.balance, commission.blocked);
    wallets.push(commission);

    if (rand() < 0.4) {
      const ccy = rand() < 0.5 ? 'USD' : 'EUR';
      const fxAdvance: BackOfficeWallet = {
        ...advance,
        id: walletId++,
        walletNo: `BY-${String(a.id).slice(-4)}-03`,
        type: 'agent_advance',
        balance: agentBalance[ccy],
        ccy,
        txToday: Math.floor(rand() * 12),
        txAmtToday: Math.floor(rand() * 2400),
      };
      fxAdvance.available = calcWalletAvailable(fxAdvance.balance, fxAdvance.blocked);
      wallets.push(fxAdvance);
    }
  }

  if (wallets.length >= 2) {
    wallets.push(
      { ...wallets[10]!, id: walletId++, walletNo: 'DELETED-001', recordStatus: 0 },
      { ...wallets[11]!, id: walletId++, walletNo: 'DELETED-002', recordStatus: 0 },
    );
  }

  return wallets;
}
