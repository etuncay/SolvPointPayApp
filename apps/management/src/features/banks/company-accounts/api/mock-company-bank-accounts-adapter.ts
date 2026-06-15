import { integratedBanksService } from '@/features/banks/integrated/api';
import { COMPANY_BANK_ACCOUNTS_SEED } from '@/mocks/company-bank-accounts';
import { hasDuplicateActiveIban } from '../domain/duplicate-rules';
import { validateCompanyBankAccountInput } from '../domain/validation';
import type {
  CompanyBankAccount,
  CompanyBankAccountFilters,
  CompanyBankAccountInput,
  CompanyBankAccountUpdateInput,
  SaveCompanyBankAccountResult,
} from '../domain/types';
import type {
  CompanyBankAccountChangeLogEntry,
  CompanyBankAccountsService,
} from './company-bank-accounts-service';

let store: CompanyBankAccount[] = COMPANY_BANK_ACCOUNTS_SEED.map((a) => ({ ...a }));
let nextId = 100;
let nextLogId = 1;
let changeLog: CompanyBankAccountChangeLogEntry[] = [];

function nowTs(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function appendLog(
  action: CompanyBankAccountChangeLogEntry['action'],
  entityId: number,
  previous: unknown,
  next: unknown,
) {
  changeLog = [
    ...changeLog,
    {
      id: nextLogId++,
      action,
      entityId,
      previous,
      next,
      at: new Date().toISOString(),
      by: 'current.user',
    },
  ];
}

function resolveBank(bankId: number): { ok: true; bankName: string } | { ok: false; error: string } {
  const bank = integratedBanksService
    .list({ query: '', status: 'any' })
    .find((b) => b.id === bankId && b.recordStatus === 1);
  if (!bank || bank.status !== 'Active') {
    return { ok: false, error: 'cba_bank_inactive' };
  }
  return { ok: true, bankName: bank.bankName };
}

function enrichRow(row: CompanyBankAccount): CompanyBankAccount {
  const bank = integratedBanksService
    .list({ query: '', status: 'any' })
    .find((b) => b.id === row.bankId);
  return { ...row, bankName: bank?.bankName ?? row.bankName };
}

function sortRows(rows: CompanyBankAccount[]): CompanyBankAccount[] {
  return [...rows].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'Active') return -1;
      if (b.status === 'Active') return 1;
    }
    return a.bankName.localeCompare(b.bankName, 'tr') || a.iban.localeCompare(b.iban);
  });
}

function applyFilters(rows: CompanyBankAccount[], filters: CompanyBankAccountFilters): CompanyBankAccount[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((a) => {
    if (a.recordStatus !== 1) return false;
    if (filters.accountType !== 'any' && a.accountType !== filters.accountType) return false;
    if (filters.currency !== 'any' && a.currency !== filters.currency) return false;
    if (filters.status !== 'any' && a.status !== filters.status) return false;
    if (!q) return true;
    return (
      a.iban.toLowerCase().includes(q) ||
      a.bankName.toLowerCase().includes(q) ||
      a.accountNo.toLowerCase().includes(q) ||
      a.branchCode.toLowerCase().includes(q)
    );
  });
}

function mockBalanceJitter(id: number, current: number): number {
  const pct = ((id * 17) % 200) / 10000 - 0.01;
  const next = current * (1 + pct);
  return Math.round(next * 100) / 100;
}

function buildRow(
  id: number,
  input: CompanyBankAccountInput,
  bankName: string,
  existing?: CompanyBankAccount,
): CompanyBankAccount {
  return {
    id,
    bankId: input.bankId,
    bankName,
    accountType: input.accountType,
    iban: input.iban,
    currency: input.currency,
    balance: existing?.balance ?? 0,
    branchCode: input.branchCode,
    accountNo: input.accountNo,
    suffix: input.suffix,
    lastUpdatedAt: existing?.lastUpdatedAt ?? nowTs(),
    status: existing?.status ?? 'Active',
    recordStatus: 1,
  };
}

export const mockCompanyBankAccountsAdapter: CompanyBankAccountsService = {
  list(filters = { query: '', accountType: 'any', currency: 'any', status: 'any' }) {
    const enriched = store.filter((a) => a.recordStatus === 1).map(enrichRow);
    return sortRows(applyFilters(enriched, filters));
  },

  create(input: CompanyBankAccountInput): SaveCompanyBankAccountResult {
    const validated = validateCompanyBankAccountInput(input);
    if (!validated.ok) return { ok: false, error: validated.error };

    const bank = resolveBank(validated.data.bankId);
    if (!bank.ok) return { ok: false, error: bank.error };

    if (hasDuplicateActiveIban(validated.data.iban, store)) {
      return { ok: false, error: 'cba_iban_duplicate' };
    }

    const id = nextId++;
    const row = buildRow(id, validated.data, bank.bankName);
    row.lastUpdatedAt = nowTs();
    store = [...store, row];
    appendLog('create', id, null, row);
    return { ok: true, id };
  },

  update(id: number, input: CompanyBankAccountUpdateInput): SaveCompanyBankAccountResult {
    const existing = store.find((a) => a.id === id && a.recordStatus === 1);
    if (!existing) return { ok: false, error: 'cba_not_found' };
    if (existing.status === 'Inactive') return { ok: false, error: 'cba_inactive_locked' };

    const validated = validateCompanyBankAccountInput(input);
    if (!validated.ok) return { ok: false, error: validated.error };

    const bank = resolveBank(validated.data.bankId);
    if (!bank.ok) return { ok: false, error: bank.error };

    if (hasDuplicateActiveIban(validated.data.iban, store, id)) {
      return { ok: false, error: 'cba_iban_duplicate' };
    }

    const row = buildRow(id, validated.data, bank.bankName, existing);
    store = store.map((a) => (a.id === id ? row : a));
    appendLog('update', id, existing, row);
    return { ok: true, id };
  },

  deactivate(id: number): SaveCompanyBankAccountResult {
    const existing = store.find((a) => a.id === id && a.recordStatus === 1);
    if (!existing) return { ok: false, error: 'cba_not_found' };
    if (existing.status === 'Inactive') return { ok: true, id };

    const row: CompanyBankAccount = { ...existing, status: 'Inactive' };
    store = store.map((a) => (a.id === id ? row : a));
    appendLog('deactivate', id, existing, row);
    return { ok: true, id };
  },

  fetchBalance(id: number): SaveCompanyBankAccountResult {
    const existing = store.find((a) => a.id === id && a.recordStatus === 1);
    if (!existing) return { ok: false, error: 'cba_not_found' };

    const balance = mockBalanceJitter(id, existing.balance);
    const row: CompanyBankAccount = {
      ...existing,
      balance,
      lastUpdatedAt: nowTs(),
    };
    store = store.map((a) => (a.id === id ? row : a));
    appendLog('fetchBalance', id, existing, row);
    return { ok: true, id };
  },

  getChangeLog() {
    return [...changeLog];
  },
};

export function resetCompanyBankAccountsStore() {
  store = COMPANY_BANK_ACCOUNTS_SEED.map((a) => ({ ...a }));
  nextId = 100;
  nextLogId = 1;
  changeLog = [];
}

export function getCompanyBankAccountsStoreSnapshot(): CompanyBankAccount[] {
  return store.map((a) => ({ ...a }));
}

/** 6.3 / mutabakat — aktif firma hesapları */
export function getActiveCompanyAccounts(): CompanyBankAccount[] {
  return mockCompanyBankAccountsAdapter
    .list({ query: '', accountType: 'any', currency: 'any', status: 'Active' })
    .filter((a) => a.status === 'Active');
}
