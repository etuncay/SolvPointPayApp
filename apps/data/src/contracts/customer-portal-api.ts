import type {
  CustomerProfile,
  CustomerWallet,
  CustomerTransaction,
  SavedRecipient,
  OwnIban,
  TransferFee,
  FxQuote,
  CustomerSettings,
  CustomerContact,
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
  CurrencyCode,
} from '../types/customer-portal';

export interface CustomerPortalApi {
  login(input: CustomerLoginInput): Promise<CustomerLoginResult>;
  verifyOtp(input: CustomerOtpVerifyInput): Promise<CustomerLoginResult>;
  requestPasswordReset(email: string): Promise<{ ok: true }>;

  getProfile(): Promise<CustomerProfile>;
  listWallets(): Promise<CustomerWallet[]>;
  listTransactions(query: TransactionsListQuery): Promise<PaginatedTransactions>;
  getTransactionById(id: string): Promise<CustomerTransaction | undefined>;
  recentTransactions(limit?: number): Promise<CustomerTransaction[]>;

  listRecipients(): Promise<SavedRecipient[]>;
  createRecipient(
    input: Omit<SavedRecipient, 'id' | 'recordStatus' | 'createdAt' | 'updatedAt'>,
  ): Promise<SavedRecipient>;
  updateRecipient(
    id: string,
    input: Partial<Omit<SavedRecipient, 'id' | 'recordStatus' | 'createdAt'>>,
  ): Promise<SavedRecipient | undefined>;
  deleteRecipient(id: string): Promise<boolean>;

  listIbans(): Promise<OwnIban[]>;
  listFees(): Promise<TransferFee[]>;
  getFxQuote(src: CurrencyCode, dst: CurrencyCode): Promise<FxQuote>;

  getSettings(): Promise<CustomerSettings>;
  updateSettings(patch: Partial<CustomerSettings>): Promise<CustomerSettings>;
  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: boolean; errorCode?: string }>;
  listReceipts(): Promise<ReceiptRecord[]>;

  listContacts(): Promise<CustomerContact[]>;
  addContact(input: ContactInput): Promise<CustomerContact>;
  updateContact(id: string, value: string): Promise<CustomerContact | undefined>;
  deleteContact(id: string): Promise<boolean>;
  setPrimaryContact(id: string): Promise<CustomerContact[]>;
  resendContactVerification(id: string): Promise<ContactResendResult>;
  verifyContact(id: string, code: string): Promise<{ ok: boolean }>;

  getTopupInstructions(): Promise<TopupInstructions>;
  createSupportCase(input: SupportCaseInput): Promise<SupportCaseRecord>;

  createTransferDraft(draft: TransferDraftInput): Promise<TransferConfirmation>;
  approveTransfer(
    transactionId: string,
    otp: string,
    idempotencyKey: string,
    declaration?: string,
  ): Promise<TransferApproveResult>;
  cancelTransfer(transactionId: string): Promise<boolean>;
  getReceipt(transactionId: string): Promise<ReceiptRecord | undefined>;
}
