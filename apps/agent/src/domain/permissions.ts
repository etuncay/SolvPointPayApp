import type { AgentAuthorizedProfile } from './agent-session';

export interface AgentPermissions {
  home: { view: boolean };
  accounts: { view: boolean };
  customers: { list: boolean; create: boolean; edit: boolean };
  withdrawal: { access: boolean };
  transfers: { access: boolean };
  transactions: { list: boolean; view: boolean; approve: boolean };
  feedback: { access: boolean };
  settings: { users: boolean };
  playground: { access: boolean };
}

/** Temsilci yetkili kişi profiline göre modül izinleri — UI + route guard tek kaynak. */
export function getAgentPermissions(profile: AgentAuthorizedProfile): AgentPermissions {
  const { canTransact, canRegisterCustomers, isAdmin } = profile;

  return {
    home: { view: true },
    accounts: { view: true },
    customers: {
      list: true,
      create: canRegisterCustomers,
      edit: canRegisterCustomers,
    },
    withdrawal: { access: canTransact },
    transfers: { access: canTransact },
    transactions: {
      list: true,
      view: true,
      approve: canTransact,
    },
    feedback: { access: true },
    settings: { users: isAdmin },
    playground: { access: import.meta.env.DEV },
  };
}

export function getWithdrawalPermissions(profile: AgentAuthorizedProfile) {
  return { access: getAgentPermissions(profile).withdrawal.access };
}

export function getTransferPermissions(profile: AgentAuthorizedProfile) {
  return { access: getAgentPermissions(profile).transfers.access };
}

export function getTransactionConfirmationPermissions(profile: AgentAuthorizedProfile) {
  const t = getAgentPermissions(profile).transactions;
  return { list: t.list, view: t.view, approve: t.approve };
}

export function getCustomerPermissions(profile: AgentAuthorizedProfile) {
  return getAgentPermissions(profile).customers;
}
