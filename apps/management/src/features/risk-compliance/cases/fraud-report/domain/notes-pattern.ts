/** Notlar — yasak karakter ve uzunluk (MVP) */
const FORBIDDEN = /[<>{}]/;

export function isValidFraudNotes(notes: string): boolean {
  const t = notes.trim();
  if (t.length > 2000) return false;
  if (FORBIDDEN.test(t)) return false;
  return true;
}
