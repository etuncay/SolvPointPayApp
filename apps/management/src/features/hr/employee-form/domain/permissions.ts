import type { HrPersona } from '@/features/hr/domain/types';
import type { EmployeeFormMode, EmployeeFormPermissions } from './types';

export function getEmployeeFormPermissions(
  persona: HrPersona | null,
  mode: EmployeeFormMode,
): EmployeeFormPermissions {
  if (persona === 'hr') {
    return {
      insert: mode === 'insert',
      update: mode === 'update',
      view: mode === 'view',
    };
  }
  if (persona === 'ceo' || persona === 'unit_manager') {
    return { insert: false, update: false, view: mode === 'view' || mode === 'update' };
  }
  return { insert: false, update: false, view: false };
}

export function canAccessEmployeeForm(persona: HrPersona | null, mode: EmployeeFormMode): boolean {
  const p = getEmployeeFormPermissions(persona, mode);
  return p.insert || p.update || p.view;
}
