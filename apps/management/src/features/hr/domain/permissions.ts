import type { HrPersona } from './types';

export interface HrPermissions {
  list: boolean;
  view: boolean;
  insert: boolean;
  update: boolean;
}

export function getHrPermissions(persona: HrPersona | null): HrPermissions {
  if (persona === 'hr') {
    return { list: true, view: true, insert: true, update: true };
  }
  if (persona === 'ceo') {
    return { list: true, view: true, insert: false, update: false };
  }
  if (persona === 'unit_manager') {
    return { list: true, view: true, insert: false, update: false };
  }
  return { list: false, view: false, insert: false, update: false };
}
