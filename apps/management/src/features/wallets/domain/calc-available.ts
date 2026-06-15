/** Spec §8 — Kullanılabilir bakiye */
export function calcAvailable(balance: number, blocked: number): number {
  if (blocked === -1) return 0;
  return Math.max(0, balance - blocked);
}
