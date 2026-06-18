import type { FormPermissions, TablePermissions } from '@epay/ui';
import type { AgentPermissions } from './permissions';
import { getAgentPermissions } from './permissions';
import type { AgentAuthorizedProfile } from './agent-session';

/** Salt-okunur tablo — toolbar aksiyonları kapalı. */
export const READ_ONLY_TABLE: TablePermissions = {
  view: true,
  new: false,
  edit: false,
  delete: false,
  export: false,
};

/** Arama formları — yalnızca arama butonu. */
export const SEARCH_FORM: FormPermissions = {
  view: true,
  create: false,
  update: false,
  delete: false,
};

export type AgentUiPermissions = {
  form: {
    search: FormPermissions;
    withdrawalSubmit: FormPermissions;
    transferSubmit: FormPermissions;
    customerRegister: (mode: 'new' | 'edit') => FormPermissions;
    transactionView: FormPermissions;
    transactionApprove: (isApprove: boolean) => FormPermissions;
    transactionApproveAction: FormPermissions;
    settingsPassword: FormPermissions;
    settingsPrefs: FormPermissions;
    documentUpload: FormPermissions;
    feedbackCreate: FormPermissions;
    playground: FormPermissions;
    settingsContactAdd: FormPermissions;
    settingsAddressAdd: FormPermissions;
  };
  table: {
    readOnly: TablePermissions;
    accountsBalances: TablePermissions;
    accountsActivities: TablePermissions;
    customers: TablePermissions;
    dashboardPendingTx: TablePermissions;
    dashboardPendingCustomers: TablePermissions;
    settingsUsers: TablePermissions;
    settingsContacts: TablePermissions;
    settingsAddresses: TablePermissions;
    settingsReceipts: TablePermissions;
    settingsFailedLogins: TablePermissions;
    transactions: TablePermissions;
    playground: TablePermissions;
    fees: TablePermissions;
  };
  flags: {
    canApproveTransaction: boolean;
    canRegisterCustomer: boolean;
    canEditCustomer: boolean;
    canWithdraw: boolean;
    canTransfer: boolean;
    canManageUsers: boolean;
  };
};

const RESTRICTED_PROFILE: AgentAuthorizedProfile = {
  userId: '',
  agentId: 0,
  displayName: '',
  isAdmin: false,
  canTransact: false,
  canRegisterCustomers: false,
};

export function defaultAgentPermissions(): AgentPermissions {
  return getAgentPermissions(RESTRICTED_PROFILE);
}

/** `getAgentPermissions` → DynamicForm / DynamicTable izin objeleri. */
export function mapAgentUiPermissions(p: AgentPermissions): AgentUiPermissions {
  return {
    form: {
      search: SEARCH_FORM,
      withdrawalSubmit: {
        view: true,
        create: p.withdrawal.access,
        update: false,
        delete: false,
      },
      transferSubmit: {
        view: true,
        create: p.transfers.access,
        update: false,
        delete: false,
      },
      customerRegister: (mode) =>
        mode === 'edit'
          ? { view: p.customers.edit, create: false, update: p.customers.edit, delete: false }
          : { view: true, create: p.customers.create, update: false, delete: false },
      transactionView: {
        view: p.transactions.view,
        create: false,
        update: false,
        delete: false,
      },
      transactionApprove: (isApprove) => ({
        view: p.transactions.view,
        create: false,
        update: isApprove && p.transactions.approve,
        delete: false,
      }),
      transactionApproveAction: {
        view: p.transactions.view,
        create: p.transactions.approve,
        update: false,
        delete: false,
      },
      settingsPassword: { view: true, create: true, update: false, delete: false },
      settingsPrefs: { view: true, create: false, update: true, delete: false },
      documentUpload: {
        view: p.customers.list,
        create: p.customers.list,
        update: false,
        delete: false,
      },
      feedbackCreate: {
        view: true,
        create: p.feedback.access,
        update: false,
        delete: false,
      },
      playground: {
        view: p.playground.access,
        create: p.playground.access,
        update: p.playground.access,
        delete: p.playground.access,
      },
      settingsContactAdd: { view: true, create: true, update: false, delete: false },
      settingsAddressAdd: { view: true, create: true, update: false, delete: false },
    },
    table: {
      readOnly: READ_ONLY_TABLE,
      accountsBalances: {
        view: p.accounts.view,
        new: false,
        edit: false,
        delete: false,
        export: false,
      },
      accountsActivities: {
        view: p.accounts.view,
        new: false,
        edit: false,
        delete: false,
        export: p.accounts.view,
      },
      customers: {
        view: p.customers.list,
        new: false,
        edit: p.customers.edit,
        delete: false,
        export: false,
      },
      dashboardPendingTx: {
        view: p.home.view && p.transactions.list,
        new: false,
        edit: false,
        delete: false,
        export: false,
      },
      dashboardPendingCustomers: {
        view: p.home.view && p.customers.list,
        new: false,
        edit: false,
        delete: false,
        export: false,
      },
      settingsUsers: {
        view: p.settings.users,
        new: false,
        edit: p.settings.users,
        update: p.settings.users,
        delete: false,
        export: false,
      },
      settingsContacts: READ_ONLY_TABLE,
      settingsAddresses: READ_ONLY_TABLE,
      settingsReceipts: READ_ONLY_TABLE,
      settingsFailedLogins: READ_ONLY_TABLE,
      transactions: {
        view: p.transactions.list,
        new: false,
        edit: false,
        delete: false,
        export: p.transactions.list,
      },
      playground: {
        view: p.playground.access,
        new: p.playground.access,
        edit: p.playground.access,
        delete: p.playground.access,
        export: p.playground.access,
      },
      fees: READ_ONLY_TABLE,
    },
    flags: {
      canApproveTransaction: p.transactions.approve,
      canRegisterCustomer: p.customers.create,
      canEditCustomer: p.customers.edit,
      canWithdraw: p.withdrawal.access,
      canTransfer: p.transfers.access,
      canManageUsers: p.settings.users,
    },
  };
}
