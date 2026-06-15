/** Tab2 işlem adı combobox — 12.2 field rules ile uyumlu */
export const ROLE_OPERATIONS = [
  'customer.fee.update',
  'agent.commission.update',
  'wallet.limit.update',
  'approval.rule.update',
  'risk.score.manual',
  'document.type.update',
] as const;

export type RoleOperationName = (typeof ROLE_OPERATIONS)[number];
