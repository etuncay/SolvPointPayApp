import { userNameById } from '@/features/approval-pool/domain/current-user';
import { calcAvailable as calcWalletAvailable } from '@/features/wallets/domain/calc-available';
import { getCaseDetailProfile } from '@/mocks/case-detail-profiles';
import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import { FRAUD_RULES } from '@/mocks/fraud-rules';
import { TRANSACTIONS, maskIban } from '@/mocks/transactions';
import { getWallets } from '@/lib/wallets-store';
import { CLOSED_CASE_STATUSES } from '../../domain/case-status-groups';
import type { FraudCaseRecord } from '../../domain/types';
import type { CaseDetail } from '../domain/types';

function customerName(id: number | null): string {
  if (id == null) return '—';
  return CUSTOMERS.find((c) => c.id === id)?.name ?? `#${id}`;
}

export function buildCaseDetail(rec: FraudCaseRecord, actionLog: CaseDetail['actionLog']): CaseDetail | null {
  const tx = TRANSACTIONS.find((t) => t.id === rec.transactionId && t.recordStatus === 1);
  if (!tx) return null;

  const profile = getCaseDetailProfile(rec.id);
  const primaryCustomerId = tx.senderCustomerId ?? tx.receiverCustomerId;
  const customer = primaryCustomerId
    ? CUSTOMERS.find((c) => c.id === primaryCustomerId)
    : undefined;

  let transactionNo = tx.txNo;
  if (rec.id === 'C-1001') transactionNo = 'TX-AML-001';

  const rule = FRAUD_RULES.find((r) => r.id === rec.ruleId);
  const agentId = tx.senderAgentId ?? tx.receiverAgentId;
  const agent = agentId && !profile.hideAgentPanel ? AGENTS.find((a) => a.id === agentId) : undefined;

  const accounts = getWallets().filter(
    (w) => w.recordStatus === 1 && w.customerId === primaryCustomerId,
  ).map((w) => ({
    walletId: w.id,
    currency: w.ccy,
    available: calcWalletAvailable(w.balance, w.blocked),
    blocked: w.blocked,
    status: w.type,
  }));

  const iban = tx.receiverIban ?? tx.senderIban;

  return {
    header: {
      id: rec.id,
      caseStatus: rec.caseStatus,
      priority: rec.priority,
      slaDueAt: rec.slaDueAt,
      createdAt: rec.createdAt,
      channel: rec.channel,
      transactionId: tx.id,
      transactionNo,
      riskScore: rec.riskScore,
      assignedUserId: rec.assignedUserId,
      assignedUserName: rec.assignedUserId ? userNameById(rec.assignedUserId) : null,
      assignedToManager: profile.assignedToManager,
      isClosed: CLOSED_CASE_STATUSES.includes(rec.caseStatus),
      ruleId: rec.ruleId,
    },
    customer: customer
      ? {
          customerId: customer.id,
          name: customer.name,
          type: customer.type,
          email: customer.email,
          phone: customer.phone,
          idNo: customer.idNo,
          kyc: customer.kyc,
          riskScore: customer.riskScore,
          status: customer.status,
          ...profile.customerProfile,
        }
      : {
          customerId: 0,
          name: '—',
          type: '—',
          email: '—',
          phone: '—',
          idNo: '—',
          kyc: '—',
          riskScore: 0,
          status: '—',
          ...profile.customerProfile,
        },
    accounts,
    txMetrics: profile.txMetrics,
    accessSignals: profile.accessSignals,
    agent: agent
      ? {
          agentId: agent.id,
          name: agent.name,
          groupCode: agent.group.key,
          city: agent.city,
          status: agent.status,
          riskCategory: profile.agentProfile.riskCategory,
          country: profile.agentProfile.country,
        }
      : null,
    agentMetrics: agent ? profile.agentMetrics : [],
    transaction: {
      txNo: transactionNo,
      type: tx.type,
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency,
      createdAt: tx.createdAt,
      channel: rec.channel,
      senderName: customerName(tx.senderCustomerId),
      receiverName: customerName(tx.receiverCustomerId),
      iban: iban ? maskIban(iban) : null,
    },
    sharedContact:
      profile.linkedCustomersCount > 0
        ? {
            sharedEmails: profile.sharedEmails ?? [],
            sharedPhones: profile.sharedPhones ?? [],
            disclaimer: true,
          }
        : null,
    relatedCustomers: profile.relatedCustomers,
    rule: {
      ruleId: rec.ruleId,
      title: rule?.title ?? rec.ruleId,
      scope: rule?.scope ?? '—',
      priority: rule?.priority ?? rec.priority,
      dslSummary: rule?.conditionDsl?.slice(0, 120) ?? '—',
      regulationReference: rule?.regulationReference ?? '—',
    },
    actionLog,
    linkedCustomersCount: profile.linkedCustomersCount,
  };
}
