import type { AgentFee } from '@/features/agent-fees/domain/types';
import { AGENT_GROUP_MASTER_SEED } from '@/mocks/agent-groups';

let nextId = 3001;

function baseFee(groupCode: string, commission: number): AgentFee {
  return {
    id: nextId++,
    groupCode,
    transactionType: 'WalletToPerson',
    currency: 'TRY',
    lowerLimit: 0,
    fixedFee: 0,
    variableFeePct: commission,
    startDate: '2025-01-01',
    endDate: null,
    status: 'Active',
    changedBy: 'finance.admin',
    changedAt: '2025-01-01T09:00:00',
    recordStatus: 1,
  };
}

const groupBaseFees: AgentFee[] = AGENT_GROUP_MASTER_SEED.filter(
  (g) => g.recordStatus === 1 && g.status === 'Active',
).map((g) => baseFee(g.groupCode, g.commission));

/** agent_fee mock seed */
export const AGENT_FEES: AgentFee[] = [
  ...groupBaseFees,
  // PLATINUM kademeler (§20: 15.000 TRY → %0.2 kademe)
  {
    id: nextId++,
    groupCode: 'PLATINUM',
    transactionType: 'WalletToPerson',
    currency: 'TRY',
    lowerLimit: 10000,
    fixedFee: 0,
    variableFeePct: 0.25,
    startDate: '2025-01-01',
    endDate: null,
    status: 'Active',
    changedBy: 'finance.admin',
    changedAt: '2025-01-01T09:00:00',
    recordStatus: 1,
  },
  {
    id: nextId++,
    groupCode: 'PLATINUM',
    transactionType: 'WalletToPerson',
    currency: 'TRY',
    lowerLimit: 50000,
    fixedFee: 0,
    variableFeePct: 0.2,
    startDate: '2025-01-01',
    endDate: null,
    status: 'Active',
    changedBy: 'finance.admin',
    changedAt: '2025-01-01T09:00:00',
    recordStatus: 1,
  },
  // InternationalTransfer + USD örnek
  {
    id: nextId++,
    groupCode: 'GOLD',
    transactionType: 'InternationalTransfer',
    currency: 'USD',
    lowerLimit: 0,
    fixedFee: 1.5,
    variableFeePct: 0.4,
    startDate: '2025-01-01',
    endDate: null,
    status: 'Active',
    changedBy: 'finance.admin',
    changedAt: '2025-01-01T09:00:00',
    recordStatus: 1,
  },
  // Pasif grup (LEGACY_TIER) tarihsel kayıt
  {
    id: nextId++,
    groupCode: 'LEGACY_TIER',
    transactionType: 'WalletToPerson',
    currency: 'TRY',
    lowerLimit: 0,
    fixedFee: 0,
    variableFeePct: 1.5,
    startDate: '2023-01-01',
    endDate: '2025-12-01',
    status: 'Passive',
    changedBy: 'finance.admin',
    changedAt: '2023-01-01T09:00:00',
    recordStatus: 1,
  },
  // Batch test: geçmiş bitiş tarihi
  {
    id: nextId++,
    groupCode: 'SILVER',
    transactionType: 'WalletToBankAccount',
    currency: 'TRY',
    lowerLimit: 0,
    fixedFee: 2,
    variableFeePct: 0.5,
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    status: 'Active',
    changedBy: 'finance.admin',
    changedAt: '2024-06-01T09:00:00',
    recordStatus: 1,
  },
  // Batch test: gelecek başlangıç
  {
    id: nextId++,
    groupCode: 'STANDARD',
    transactionType: 'WalletTopUp',
    currency: 'USD',
    lowerLimit: 0,
    fixedFee: 0.5,
    variableFeePct: 0.2,
    startDate: '2099-01-01',
    endDate: null,
    status: 'Active',
    changedBy: 'finance.admin',
    changedAt: '2025-06-01T09:00:00',
    recordStatus: 1,
  },
];
