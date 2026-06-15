import { isAllAccessRole, type BackOfficeRole, type NavItem } from '@epay/ui';
import { getHrCurrentUserExtras } from '@/domain/hr-persona';
import { getHrPermissions } from './permissions';

export const HR_CHILD_IDS = [
  'hr_employees',
  'hr_employee_new',
  'hr_leave',
  'hr_leave_new',
] as const;

export type HrChildId = (typeof HR_CHILD_IDS)[number];

export const HR_CHILD_HREFS: Record<HrChildId, string> = {
  hr_employees: '/hr/employees',
  hr_employee_new: '/hr/employees/new',
  hr_leave: '/hr/leave',
  hr_leave_new: '/hr/leave/new',
};

export function canSeeHrMenu(role: BackOfficeRole): boolean {
  if (isAllAccessRole(role)) return true;
  if (role === 'finance') return false;
  const extras = getHrCurrentUserExtras(role);
  return getHrPermissions(extras.hrPersona).list || extras.employeeId != null;
}

export function getHrMenuDefaultHref(role: BackOfficeRole): string | null {
  if (!canSeeHrMenu(role)) return null;
  const extras = getHrCurrentUserExtras(role);
  const perms = getHrPermissions(extras.hrPersona);
  const employeeOnly = extras.employeeId != null && perms.list === false;
  if (employeeOnly) return '/hr/leave';
  return '/hr/employees';
}

export function filterHrMenuItem(item: NavItem, role: BackOfficeRole): NavItem | null {
  if (item.id !== 'hr') return item;
  if (!canSeeHrMenu(role)) return null;
  const extras = getHrCurrentUserExtras(role);
  const perms = getHrPermissions(extras.hrPersona);
  const employeeOnly = extras.employeeId != null && perms.list === false;
  const kids = (item.kids ?? [])
    .filter((k) => {
      if (employeeOnly) return k.id === 'hr_leave' || k.id === 'hr_leave_new';
      if (k.id === 'hr_employee_new') return perms.insert;
      if (k.id === 'hr_employees') return perms.list;
      return true;
    })
    .map((k) => ({
      ...k,
      soon: undefined,
      href: HR_CHILD_HREFS[k.id as HrChildId] ?? k.href,
    }));
  if (kids.length === 0) return null;
  const defaultHref = employeeOnly ? (kids[0]?.href ?? '/hr/leave') : '/hr/employees';
  return {
    ...item,
    soon: undefined,
    href: defaultHref,
    kids,
  };
}

export function resolveHrActiveSub(pathname: string): HrChildId | null {
  if (pathname === '/hr/employees/new') return 'hr_employee_new';
  if (pathname.startsWith('/hr/employees')) return 'hr_employees';
  if (pathname === '/hr/leave/new') return 'hr_leave_new';
  if (pathname.startsWith('/hr/leave')) return 'hr_leave';
  return null;
}
