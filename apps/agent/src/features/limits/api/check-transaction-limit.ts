import { DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
import { agentRemainingLimitApi } from './agent-remaining-limit.service';
import { isAmountWithinLimit } from '../domain/assert-amount-within-limit';
import type { AgentLimitChannel } from '../contracts/agent-remaining-limit-port';

export type TransactionLimitCheckInput = {
  operationType: string;
  currency: string;
  amount: number;
  customerId: number;
  walletId?: number;
  agentId?: number | string;
  agentAuthorizedPersonId?: string;
  corporateAuthorizedPersonId?: string;
  channel?: AgentLimitChannel;
};

/** İşlem öncesi limit doğrulama — production'da sunucu hesaplar. */
export async function checkTransactionLimit(
  input: TransactionLimitCheckInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await agentRemainingLimitApi.getRemainingLimit({
    asOf: new Date().toISOString(),
    operationType: input.operationType,
    channel: input.channel ?? 'Agent',
    currency: input.currency,
    customerId: String(input.customerId),
    agentId: String(input.agentId ?? DEMO_AGENT_ID),
    agentAuthorizedPersonId: input.agentAuthorizedPersonId ?? '1',
    walletId: input.walletId != null ? String(input.walletId) : undefined,
    corporateAuthorizedPersonId: input.corporateAuthorizedPersonId,
  });

  if (!res.ok) {
    return { ok: false, message: 'ag_limit_unavailable' };
  }

  if (!isAmountWithinLimit(input.amount, res.data)) {
    if (res.data.nextTxMaxAmount === 0) {
      return { ok: false, message: 'ag_limit_closed' };
    }
    return { ok: false, message: 'ag_limit_exceeded' };
  }

  return { ok: true };
}
