import Dexie, { type Table } from 'dexie';
import type { CustomerRecord } from '../types/customer';
import type { RefOptionRow } from '../types/reference';
import type { AgentActivityRecord, AgentBalanceRow } from '../types/account';
import type { AgentRegistrationRecord } from '../types/registration';
import type {
  CustomerProfile,
  CustomerWallet,
  CustomerTransaction,
  SavedRecipient,
  OwnIban,
  TransferFee,
  CustomerSettings,
  TopupInstructions,
  ReceiptRecord,
  SupportCaseRecord,
  CustomerContact,
} from '../types/customer-portal';
import type { BackOfficeTransaction } from '../types/transaction';
import type { BackOfficeWallet } from '../types/mock-wallet';

interface MetaRow {
  key: string;
  value: number;
}

export class EPayDataDB extends Dexie {
  customers!: Table<CustomerRecord, string>;
  meta!: Table<MetaRow, string>;
  refOptions!: Table<RefOptionRow, string>;
  agentBalances!: Table<AgentBalanceRow, number>;
  agentActivities!: Table<AgentActivityRecord, string>;
  agentRegistrations!: Table<AgentRegistrationRecord, string>;
  customerProfile!: Table<CustomerProfile, string>;
  customerWallets!: Table<CustomerWallet, string>;
  customerTransactions!: Table<CustomerTransaction, string>;
  customerRecipients!: Table<SavedRecipient, string>;
  customerIbans!: Table<OwnIban, string>;
  customerFees!: Table<TransferFee, string>;
  customerSettings!: Table<CustomerSettings, string>;
  customerTopup!: Table<TopupInstructions, string>;
  customerReceipts!: Table<ReceiptRecord, string>;
  customerSupportCases!: Table<SupportCaseRecord, string>;
  customerContacts!: Table<CustomerContact, string>;
  backOfficeTransactions!: Table<BackOfficeTransaction, number>;
  backOfficeWallets!: Table<BackOfficeWallet, number>;

  constructor() {
    super('EPayBackofficeData');
    this.version(1).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
    });
    this.version(2).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
    });
    this.version(3).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
      agentBalances: 'walletId, accountType, currency',
      agentActivities: 'id, walletId, direction, transactionType, status, createdAt',
    });
    this.version(4).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
      agentBalances: 'walletId, accountType, currency',
      agentActivities: 'id, walletId, direction, transactionType, status, createdAt',
      agentRegistrations: 'id, idNo, customerNo, status',
    });
    this.version(5).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
      agentBalances: 'walletId, accountType, currency',
      agentActivities: 'id, walletId, direction, transactionType, status, createdAt',
      agentRegistrations: 'id, idNo, customerNo, status',
      customerProfile: 'id, customerNo',
      customerWallets: 'id, type, currency',
      customerTransactions: 'id, direction, status, date, walletId',
      customerRecipients: 'id, recordStatus, country',
      customerIbans: 'id, walletId, currency',
      customerFees: 'id',
      customerSettings: 'customerId',
      customerTopup: 'customerReference',
      customerReceipts: 'transactionId',
      customerSupportCases: 'id, caseNo, status',
    });
    this.version(6).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
      agentBalances: 'walletId, accountType, currency',
      agentActivities: 'id, walletId, direction, transactionType, status, createdAt',
      agentRegistrations: 'id, idNo, customerNo, status',
      customerProfile: 'id, customerNo',
      customerWallets: 'id, type, currency',
      customerTransactions: 'id, direction, status, date, walletId',
      customerRecipients: 'id, recordStatus, country',
      customerIbans: 'id, walletId, currency',
      customerFees: 'id',
      customerSettings: 'customerId',
      customerTopup: 'customerReference',
      customerReceipts: 'transactionId',
      customerSupportCases: 'id, caseNo, status',
      backOfficeTransactions: 'id, status, type, currency, recordStatus, createdAt',
    });
    this.version(7).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
      agentBalances: 'walletId, accountType, currency',
      agentActivities: 'id, walletId, direction, transactionType, status, createdAt',
      agentRegistrations: 'id, idNo, customerNo, status',
      customerProfile: 'id, customerNo',
      customerWallets: 'id, type, currency',
      customerTransactions: 'id, direction, status, date, walletId',
      customerRecipients: 'id, recordStatus, country',
      customerIbans: 'id, walletId, currency',
      customerFees: 'id',
      customerSettings: 'customerId',
      customerTopup: 'customerReference',
      customerReceipts: 'transactionId',
      customerSupportCases: 'id, caseNo, status',
      backOfficeTransactions: 'id, status, type, currency, recordStatus, createdAt',
      backOfficeWallets: 'id, cat, type, ccy, recordStatus, customerId, agentId, walletNo',
    });
    this.version(8).stores({
      customers: 'id, status, type, city, createdAt, name, email',
      meta: 'key',
      refOptions: 'id, group, parentKey, [group+parentKey]',
      agentBalances: 'walletId, accountType, currency',
      agentActivities: 'id, walletId, direction, transactionType, status, createdAt',
      agentRegistrations: 'id, idNo, customerNo, status',
      customerProfile: 'id, customerNo',
      customerWallets: 'id, type, currency',
      customerTransactions: 'id, direction, status, date, walletId',
      customerRecipients: 'id, recordStatus, country',
      customerIbans: 'id, walletId, currency',
      customerFees: 'id',
      customerSettings: 'customerId',
      customerTopup: 'customerReference',
      customerReceipts: 'transactionId',
      customerSupportCases: 'id, caseNo, status',
      customerContacts: 'id, kind, isPrimary',
      backOfficeTransactions: 'id, status, type, currency, recordStatus, createdAt',
      backOfficeWallets: 'id, cat, type, ccy, recordStatus, customerId, agentId, walletNo',
    });
  }
}

let dbInstance: EPayDataDB | null = null;

export function getDb(): EPayDataDB {
  if (!dbInstance) {
    dbInstance = new EPayDataDB();
  }
  return dbInstance;
}

export async function deleteDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.delete();
    dbInstance = null;
  } else {
    await new EPayDataDB().delete();
  }
}
