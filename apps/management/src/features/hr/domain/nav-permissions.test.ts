import { describe, expect, it } from 'vitest';
import { canSeeHrMenu, filterHrMenuItem } from './nav-permissions';
import type { NavItem } from '@epay/ui';

const hrItem: NavItem = {
  id: 'hr',
  icon: 'hr',
  label: 'm_hr',
  soon: true,
  kids: [
    { id: 'hr_employees', no: '1', label: 's' },
    { id: 'hr_employee_new', no: '2', label: 'n' },
    { id: 'hr_leave', no: '3', label: 'l' },
  ],
};

describe('hr nav-permissions', () => {
  it('management sees hr menu with new employee kid', () => {
    expect(canSeeHrMenu('management')).toBe(true);
    const filtered = filterHrMenuItem(hrItem, 'management');
    expect(filtered?.soon).toBeUndefined();
    expect(filtered?.kids?.some((k) => k.id === 'hr_employee_new')).toBe(true);
  });

  it('ops sees hr menu without insert kid', () => {
    const filtered = filterHrMenuItem(hrItem, 'ops');
    expect(filtered?.kids?.some((k) => k.id === 'hr_employee_new')).toBe(false);
  });

  it('compliance sees leave-only hr menu', () => {
    expect(canSeeHrMenu('compliance')).toBe(true);
    const filtered = filterHrMenuItem(hrItem, 'compliance');
    expect(filtered?.kids?.map((k) => k.id)).toEqual(['hr_leave']);
    expect(filtered?.kids?.some((k) => k.id === 'hr_employees')).toBe(false);
    expect(filtered?.href).toBe('/hr/leave');
  });

  it('finance hides hr menu', () => {
    expect(canSeeHrMenu('finance')).toBe(false);
    expect(filterHrMenuItem(hrItem, 'finance')).toBeNull();
  });
});
