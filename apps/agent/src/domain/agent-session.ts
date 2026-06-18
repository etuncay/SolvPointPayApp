import type { AuthUser } from '@epay/data';
import { DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
import { IS_AGENT_ADMIN } from '@/features/settings/api/agent-settings-store';

/** Oturumdaki temsilci yetkili kişi — production'da API'den gelir. */
export type AgentAuthorizedProfile = {
  userId: string;
  agentId: number | string;
  displayName: string;
  /** Admin Temsilci — Kullanıcı Yönetimi vb. */
  isAdmin: boolean;
  /** Para çekme, transfer ve işlem onayı */
  canTransact: boolean;
  /** Yeni müşteri kaydı */
  canRegisterCustomers: boolean;
};

export function resolveAgentSession(user: AuthUser | null): AgentAuthorizedProfile | null {
  if (!user) return null;

  // Mock: salt-okunur demo persona — `?agentDemo=readonly` veya finance rolü
  const readOnly =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('agentDemo') === 'readonly';
  const canTransact = !readOnly && user.role !== 'finance';

  return {
    userId: user.id,
    agentId: DEMO_AGENT_ID,
    displayName: user.fullName,
    isAdmin: IS_AGENT_ADMIN && canTransact,
    canTransact,
    canRegisterCustomers: canTransact,
  };
}
