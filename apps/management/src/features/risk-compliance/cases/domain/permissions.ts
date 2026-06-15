import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type FraudCasesPermissions = {
  list: boolean;
  export: boolean;
  fraudReport: boolean;
  viewDetail: boolean;
};

/** Operatör/Yönetici ayrımı 7.5.2 — liste compliance */
export function getFraudCasesPermissions(role: BackOfficeRole): FraudCasesPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, export: true, fraudReport: true, viewDetail: true };
  }
  const isCompliance = role === 'compliance';
  return {
    list: isCompliance,
    export: isCompliance,
    fraudReport: isCompliance,
    viewDetail: isCompliance,
  };
}
