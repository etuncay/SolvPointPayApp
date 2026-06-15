export type { CustomerRecord } from './types/customer';
export { CUSTOMER_STATUSES, CUSTOMER_TYPES } from './types/customer';

export type {
  AuthUser,
  AuthAccountRecord,
  AuthErrorCode,
  AuthResult,
  RegisterPayload,
  BackOfficeRole,
} from './types/auth';
export { DEMO_PASSWORD, DEMO_ACCOUNTS, AUTH_SEED_ACCOUNTS } from './db/seed-auth';
export {
  authenticate,
  getAccountUser,
  registerAccount,
  activateAccount,
} from './services/auth.service';

export type { PaginatedListResponse, ApiResult } from './contracts/api-response';
export type { ListQueryInput } from './contracts/list-query';
export type { CustomersApi } from './contracts/customers-api';

export { getDb, EPayDataDB, deleteDatabase } from './db/dexie';
export { ensurePlaygroundCustomersSeeded, generateCustomerRows } from './db/seed';
export { ensureReferenceDataSeeded } from './db/seed-references';

export { applyListQuery, buildTabCounts } from './domain/list-query';
export { customerToFormValues, formValuesToRecord } from './domain/customer-mapper';

export { createDexieCustomersAdapter } from './adapters/dexie/customers-dexie.adapter';
export { createHttpCustomersAdapter } from './adapters/http/customers-http.adapter';
export { createDexieFormReferenceAdapter } from './adapters/dexie/form-reference-dexie.adapter';
export { createHttpFormReferenceAdapter } from './adapters/http/form-reference-http.adapter';
export type { FormReferenceApi } from './contracts/form-reference-api';
export type { RefOptionRow, SelectOptionDto } from './types/reference';

export {
  customersApi,
  setCustomersApiPort,
  getCustomersApiPort,
} from './services/customers.service';

export {
  formReferenceApi,
  setFormReferenceApiPort,
  getFormReferenceApiPort,
} from './services/form-reference.service';

export { fetchFormReferenceOptions } from './api/form-reference';

export type {
  AgentAccountType,
  AgentActivityDirection,
  AgentBalanceRow,
  AgentActivityRecord,
} from './types/account';
export { AGENT_ACCOUNT_TYPES } from './types/account';
export type { AccountsApi } from './contracts/accounts-api';
export {
  accountsApi,
  setAccountsApiPort,
  getAccountsApiPort,
} from './services/accounts.service';
export { fetchAgentBalances, fetchAgentActivitiesList } from './api/accounts';
export { ensureAgentAccountsSeeded, generateAgentActivities } from './db/seed-accounts';
export { applyAccountActivityQuery } from './domain/account-activity-query';
export { createDexieAccountsAdapter } from './adapters/dexie/accounts-dexie.adapter';
export { createHttpAccountsAdapter } from './adapters/http/accounts-http.adapter';

export type {
  AgentRegistrationRecord,
  AgentRegistrationSaveResult,
  AddressEntry,
  ContactEntry,
  IdType,
  MaritalStatus,
  Gender,
  RegistrationStatus,
} from './types/registration';
export type { AgentRegistrationApi } from './contracts/registration-api';
export {
  agentRegistrationApi,
  setAgentRegistrationApiPort,
  getAgentRegistrationApiPort,
} from './services/registration.service';
export {
  registrationToFormValues,
  getAgentRegistrationById,
  lookupAgentCustomerByIdentity,
  hasAgentPendingTransfer,
  saveAgentRegistration,
} from './api/registration';
export { ensureAgentRegistrationsSeeded, DEMO_PENDING_TRANSFER_IDNO } from './db/seed-registration';
export { formValuesToRegistration, screenSanction } from './domain/registration-mapper';
export { createDexieAgentRegistrationAdapter } from './adapters/dexie/registration-dexie.adapter';
export { createHttpAgentRegistrationAdapter } from './adapters/http/registration-http.adapter';

export type { ReceiptLang, ReceiptLabels } from './domain/receipt-labels';
export { receiptLabels, receiptLegalText, receiptTxType } from './domain/receipt-labels';

export {
  configureDataLayer,
  initMockDataLayer,
  getActiveDataDriver,
  type DataDriver,
  type ConfigureDataLayerOptions,
} from './runtime/configure';

/** Geriye dönük — customersApi ile aynı */
export {
  fetchCustomersList,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './api/customers';

/** Geliştirme — IndexedDB sıfırla ve yeniden seed */
export type {
  CustomerProfile,
  CustomerWallet,
  CustomerTransaction,
  SavedRecipient,
  OwnIban,
  TransferFee,
  FxQuote,
  CustomerSettings,
  CustomerContact,
  ContactKind,
  ContactInput,
  ContactResendResult,
  SupportCaseInput,
  SupportCaseRecord,
  TransferDraftInput,
  TransferConfirmation,
  TransferApproveResult,
  CustomerLoginInput,
  CustomerLoginResult,
  CustomerOtpVerifyInput,
  TransactionsListQuery,
  PaginatedTransactions,
  TopupInstructions,
  ReceiptRecord,
  TransferKind,
  TransactionStatus,
  TransactionDirection,
  CurrencyCode,
  WalletType,
} from './types/customer-portal';

export type { CustomerPortalApi } from './contracts/customer-portal-api';
export {
  customerPortalApi,
  setCustomerPortalApiPort,
  getCustomerPortalApiPort,
} from './services/customer-portal.service';
export {
  ensureCustomerPortalSeeded,
  DEMO_CUSTOMER_PASSWORD,
  getCustomerPortalSeed,
} from './db/seed-customer-portal';
export { createDexieCustomerPortalAdapter } from './adapters/dexie/customer-portal-dexie.adapter';
export { createHttpCustomerPortalAdapter } from './adapters/http/customer-portal-http.adapter';
export { createDexieTransactionsAdapter } from './adapters/dexie/transactions-dexie.adapter';
export { createHttpTransactionsAdapter } from './adapters/http/transactions-http.adapter';
export { createDexieWalletsAdapter } from './adapters/dexie/wallets-dexie.adapter';
export { createHttpWalletsAdapter } from './adapters/http/wallets-http.adapter';

export type { BackOfficeTransaction } from './types/transaction';
export type { TransactionsApi } from './contracts/transactions-api';
export {
  transactionsApi,
  setTransactionsApiPort,
  getTransactionsApiPort,
  hydrateBackOfficeTransactions,
  hydrateBackOfficeTransactionDetails,
} from './services/transactions.service';
export {
  buildBackOfficeTransactionDetails,
} from './db/build-back-office-transaction-details';
export type {
  BackOfficeTransactionNote,
  BackOfficeTransactionDocument,
  BackOfficeTransactionBlock,
  BackOfficeTransactionDetailSeed,
  BuildBackOfficeTransactionDetailsInput,
} from './types/transaction-detail';
export {
  BACK_OFFICE_TRANSACTION_SEED,
  ensureBackOfficeTransactionsSeeded,
} from './db/seed-transactions';
export {
  buildBackOfficeTransactions,
  type BuildBackOfficeTransactionsInput,
  type TransactionSeedWallet,
  type TransactionSeedCustomer,
  type TransactionSeedAgent,
} from './db/build-back-office-transactions';
export { maskIban, countTransactionsByStatus } from './domain/transaction-utils';

export type { BackOfficeWallet, BackOfficeWalletCategory, WalletKind } from './types/mock-wallet';
export { calcWalletAvailable } from './domain/wallet-utils';
export {
  buildBackOfficeWallets,
  type BuildBackOfficeWalletsInput,
  type WalletSeedAgent,
} from './db/build-back-office-wallets';
export type { WalletsApi } from './contracts/wallets-api';
export {
  walletsApi,
  setWalletsApiPort,
  getWalletsApiPort,
  hydrateBackOfficeWallets,
  hydrateBackOfficeWalletDetails,
} from './services/wallets.service';
export {
  buildBackOfficeWalletDetails,
} from './db/build-back-office-wallet-details';
export type {
  BackOfficeWalletNote,
  BackOfficeWalletLimit,
  BackOfficeWalletLimitHistory,
  BackOfficeWalletMovement,
  BackOfficeWalletDetailSeed,
  BuildBackOfficeWalletDetailsInput,
} from './types/wallet-detail';
export { BACK_OFFICE_WALLET_SEED, ensureBackOfficeWalletsSeeded } from './db/seed-wallets';
export {
  CUSTOMERS,
  type Customer as PlaygroundCustomer,
  MY_APPROVALS,
  PENDING_XFER,
  KYC_QUEUE,
  AML_HELD,
  REJECTED,
  DAILY_VOLUME,
  NEW_CUSTOMERS_30D,
  TOP_CUSTOMERS,
  TOP_AGENTS,
  SYS_HEALTH,
  FAILED_LOGINS,
  NOTIFS,
} from './db/seed-playground-mock-data';

/** Platform geneli domain — müşteri portalı `TransactionStatus` alt kümesidir */
export type {
  TransactionStatus as PlatformTransactionStatus,
  TransactionType,
  FeeTransactionType,
  LedgerDirection,
  CustomerPortalDirection,
  CustomerPortalTransactionStatus,
} from '@epay/domain';
export {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  FEE_TRANSACTION_TYPES,
  CUSTOMER_PORTAL_TRANSACTION_STATUSES,
  isTerminalTransactionStatus,
  isFeeTransactionType,
  portalToLedger,
  ledgerToPortal,
  PAYMENT_PURPOSES,
  paymentPurposeI18nKey,
  COMPLAINT_TYPES,
  complaintTypeI18nKey,
  EDUCATION_LEVELS,
  educationLevelI18nKey,
  EMPLOYMENT_CATEGORIES,
  employmentCategoryI18nKey,
  DOCUMENT_CUSTOMER_TYPES,
  PLAYGROUND_CUSTOMER_STATUSES,
  ENTITY_LIFECYCLE_STATUSES,
  ENTITY_LIFECYCLE_WITH_PROSPECT,
  ACTIVATION_STATUSES,
  WALLET_LIMIT_GROUPS,
  WALLET_LIMIT_TYPES,
  type PlaygroundCustomerStatus,
  type EntityLifecycleStatus,
  type EntityLifecycleStatusWithProspect,
  type ActivationStatus,
  type WalletLimitGroup,
  type WalletLimitType,
} from '@epay/domain';

export async function resetPlaygroundDatabase(): Promise<void> {
  const { deleteDatabase } = await import('./db/dexie');
  const { ensurePlaygroundCustomersSeeded } = await import('./db/seed');
  await deleteDatabase();
  const { ensureReferenceDataSeeded } = await import('./db/seed-references');
  await ensurePlaygroundCustomersSeeded();
  await ensureReferenceDataSeeded();
}
