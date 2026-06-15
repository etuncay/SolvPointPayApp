/** Kullanılabilir bakiye — cüzdan mock seed */
export function calcWalletAvailable(balance: number, blocked: number): number {
  if (blocked === -1) return 0;
  return Math.max(0, balance - blocked);
}
