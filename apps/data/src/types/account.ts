/** Temsilci (agent) hesap modeli — Hesaplarım ekranı için. */

export const AGENT_ACCOUNT_TYPES = ['agent_advance', 'agent_commission'] as const;
export type AgentAccountType = (typeof AGENT_ACCOUNT_TYPES)[number];

export type AgentActivityDirection = 'Inflow' | 'Outflow';

/** Bakiye paneli satırı — temsilci cüzdanı (avans / komisyon) × para birimi. */
export interface AgentBalanceRow {
  walletId: number;
  walletNo: string;
  accountType: AgentAccountType;
  currency: string;
  balance: number;
  blocked: number;
  availableBalance: number;
}

/** Hesap hareketi — tabloya doğrudan beslenen düz kayıt. */
export interface AgentActivityRecord {
  id: string;
  transactionId: number;
  transactionNo: string;
  createdAt: string;
  direction: AgentActivityDirection;
  walletId: number;
  walletNo: string;
  accountType: AgentAccountType;
  counterpartyNo: string | null;
  counterpartyName: string | null;
  counterpartyAccount: string | null;
  referenceNo: string;
  transactionType: string;
  currency: string;
  amount: number;
  postBalance: number | null;
  status: string;
  description: string | null;
}
