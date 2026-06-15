import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { WalletCategory } from './types';

const ROLE_CATEGORIES: Record<string, WalletCategory[]> = {
  ops: ['customer', 'agent'],
  finance: ['system'],
  compliance: ['customer', 'agent', 'system'],
  management: ['customer', 'agent', 'system'],
};

/** Spec §3 — rol bazlı görünür kategoriler */
export function getVisibleCategories(role: BackOfficeRole): WalletCategory[] {
  if (isAllAccessRole(role)) return ['customer', 'agent', 'system'];
  return ROLE_CATEGORIES[role] ?? ['customer', 'agent'];
}

export function canViewWalletCategory(role: BackOfficeRole, cat: WalletCategory): boolean {
  return getVisibleCategories(role).includes(cat);
}
