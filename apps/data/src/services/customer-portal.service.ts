import type { CustomerPortalApi } from '../contracts/customer-portal-api';
import { createDexieCustomerPortalAdapter } from '../adapters/dexie/customer-portal-dexie.adapter';

let port: CustomerPortalApi | null = null;

export function setCustomerPortalApiPort(next: CustomerPortalApi): void {
  port = next;
}

export function getCustomerPortalApiPort(): CustomerPortalApi | null {
  return port;
}

function resolvePort(): CustomerPortalApi {
  if (!port) {
    port = createDexieCustomerPortalAdapter();
  }
  return port;
}

export const customerPortalApi: CustomerPortalApi = {
  login: (input) => resolvePort().login(input),
  verifyOtp: (input) => resolvePort().verifyOtp(input),
  getSessionProfile: () => resolvePort().getSessionProfile(),
  logout: () => resolvePort().logout(),
  requestPasswordReset: (email) => resolvePort().requestPasswordReset(email),
  getProfile: () => resolvePort().getProfile(),
  listWallets: () => resolvePort().listWallets(),
  listTransactions: (query) => resolvePort().listTransactions(query),
  getTransactionById: (id) => resolvePort().getTransactionById(id),
  recentTransactions: (limit) => resolvePort().recentTransactions(limit),
  listRecipients: () => resolvePort().listRecipients(),
  createRecipient: (input) => resolvePort().createRecipient(input),
  updateRecipient: (id, input) => resolvePort().updateRecipient(id, input),
  deleteRecipient: (id) => resolvePort().deleteRecipient(id),
  listIbans: () => resolvePort().listIbans(),
  listFees: () => resolvePort().listFees(),
  getFxQuote: (src, dst) => resolvePort().getFxQuote(src, dst),
  getSettings: () => resolvePort().getSettings(),
  updateSettings: (patch) => resolvePort().updateSettings(patch),
  changePassword: (a, b) => resolvePort().changePassword(a, b),
  listReceipts: () => resolvePort().listReceipts(),
  listContacts: () => resolvePort().listContacts(),
  addContact: (input) => resolvePort().addContact(input),
  updateContact: (id, value) => resolvePort().updateContact(id, value),
  deleteContact: (id) => resolvePort().deleteContact(id),
  setPrimaryContact: (id) => resolvePort().setPrimaryContact(id),
  resendContactVerification: (id) => resolvePort().resendContactVerification(id),
  verifyContact: (id, code) => resolvePort().verifyContact(id, code),
  getTopupInstructions: () => resolvePort().getTopupInstructions(),
  createSupportCase: (input) => resolvePort().createSupportCase(input),
  listSupportCases: () => resolvePort().listSupportCases(),
  createTransferDraft: (draft) => resolvePort().createTransferDraft(draft),
  approveTransfer: (id, otp, key, decl) =>
    resolvePort().approveTransfer(id, otp, key, decl),
  cancelTransfer: (id) => resolvePort().cancelTransfer(id),
  getReceipt: (id) => resolvePort().getReceipt(id),
  getPendingTransfer: () => resolvePort().getPendingTransfer(),
  clearPendingTransfer: () => resolvePort().clearPendingTransfer(),
};
