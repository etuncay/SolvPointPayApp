import { AGENT_PATHS } from '@/config/agent-nav-paths';

/** Dekontu yeni sekmede açar; yazdırma sayfası mount olunca window.print tetikler. */
export function printReceipt(transactionId: number): void {
  window.open(AGENT_PATHS.receiptPrint(transactionId), '_blank', 'noopener,noreferrer');
}
