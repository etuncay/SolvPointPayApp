/** Gerekçe zorunlu — müdahale modalları */
export function validateInterventionReason(reason: string): string | null {
  if (!reason.trim()) return 'wd_block_reason_required';
  return null;
}
