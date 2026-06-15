import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type FraudRulesPermissions = {
  list: boolean;
  view: boolean;
  export: boolean;
};

/** Yalnızca compliance — plan 7.4 §5 */
export function getFraudRulesPermissions(role: BackOfficeRole): FraudRulesPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, export: true };
  }
  const isCompliance = role === 'compliance';
  return {
    list: isCompliance,
    view: isCompliance,
    export: isCompliance,
  };
}
