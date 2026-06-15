import type { TableConfig, TranslateFn } from '@epay/ui';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { settingsService } from './api/settings-service';
import receiptsJson from './config/receipts.table.config.json';
import contactsJson from './config/contacts.table.config.json';
import addressesJson from './config/addresses.table.config.json';
import usersJson from './config/users.table.config.json';
import failedLoginsJson from './config/failed-logins.table.config.json';
import type { FailedLoginRow } from '@/features/dashboard/domain/types';
import {
  localizeAddressesTableConfig,
  localizeContactsTableConfig,
  localizeFailedLoginsTableConfig,
  localizeReceiptsTableConfig,
  localizeUsersTableConfig,
} from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildReceiptsTableConfig(t?: TranslateFn): TableConfig {
  const base = receiptsJson as TableConfigJson;
  const localized = t ? localizeReceiptsTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = agentTransactionsService.listAgentReceipts();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}

export function buildContactsTableConfig(t?: TranslateFn): TableConfig {
  const base = contactsJson as TableConfigJson;
  const localized = t ? localizeContactsTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = settingsService.listContacts();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}

export function buildAddressesTableConfig(t?: TranslateFn): TableConfig {
  const base = addressesJson as TableConfigJson;
  const localized = t ? localizeAddressesTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = settingsService.listAddresses();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}

export function buildUsersTableConfig(t?: TranslateFn): TableConfig {
  const base = usersJson as TableConfigJson;
  const localized = t ? localizeUsersTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = settingsService.listUsers();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}

export function buildFailedLoginsTableConfig(rows: FailedLoginRow[], t?: TranslateFn): TableConfig {
  const base = failedLoginsJson as TableConfigJson;
  const localized = t ? localizeFailedLoginsTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => ({
        data: rows as unknown as Record<string, unknown>[],
        total: rows.length,
        success: true,
      }),
    },
  };
}
