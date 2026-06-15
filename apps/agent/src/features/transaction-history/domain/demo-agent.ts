/**
 * Oturum açan temsilci kimliği — tek kaynak `agent-transactions-store` (Detay Modu ile aynı).
 * Liste ve detay aynı store'u okuduğu için izolasyon ve satır→detay tutarlı kalır.
 */
export { DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
