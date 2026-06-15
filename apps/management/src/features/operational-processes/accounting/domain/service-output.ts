/** Tablo servis çıktısı kısaltma — spec §5 max 80 */
export function shortenServiceOutput(text: string, max = 80): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
