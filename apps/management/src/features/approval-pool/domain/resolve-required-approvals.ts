import { getScreenApprovalCount } from '@/features/system/approval-rules/domain/approval-rules-engine';

/** Bridge payload `screenKey` → 12.2 screen-registry `screenKey` */
const BRIDGE_TO_REGISTRY: Record<string, string> = {
  customer_individual: 'customers.individual.form',
  customer_corporate: 'customers.corporate.form',
  agent_edit: 'agents.form',
  authorized_person: 'agents.authorized',
  wallet_detail: 'wallets.detail',
  customer_fee: 'customers.fees',
  agent_fee: 'agents.fees',
  '5.2': 'transfers.manual',
  transaction_detail: 'transfers.list',
  risk_manual_score: 'risk.scores',
  risk_based_limits: 'risk.limits',
  system_parameters: 'system.parameters',
};

/**
 * 12.2 ekran kuralından onay kademe sayısını çözümler.
 * Kural yok veya 0 ise maker-checker akışları için varsayılan 1.
 */
export function resolveRequiredApprovals(bridgeScreenKey: string): 1 | 2 {
  const registryKey = BRIDGE_TO_REGISTRY[bridgeScreenKey] ?? bridgeScreenKey;
  const count = getScreenApprovalCount(registryKey);
  return count >= 2 ? 2 : 1;
}
