export {
  lookupSender,
  findCustomerByQuery,
  canInitiateTopUp,
  type SenderLookupResult,
  type AgentCustomerWallet,
  type AuthorizedPerson,
} from './domain/customer-lookup';
export { runIdentityOcrCompare, isIdentityTypeLocked } from './domain/identity-rules';
export { screenSanction } from './domain/sanction';
export { isDuplicateReference } from './domain/idempotency';
export { CustomerSearchBlock } from './components/customer-search-block';
export { TransactionWarningBanners } from './components/warning-banners';
export { IdentityScanSection } from './components/identity-scan-section';
export type { IdentityDocPayload } from './components/identity-scan-section';
export { DocumentUploadPanel } from './components/document-upload-panel';
export { SuspiciousTxCheckbox } from './components/suspicious-tx-checkbox';
export { FeeTierTable } from './components/fee-tier-table';
export { CorporateDocWarning } from './components/corporate-doc-warning';
