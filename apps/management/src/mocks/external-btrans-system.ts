/** Harici BTRANS/GİB sisteminde kayıtlı gönderim referansları — retry dedup test */
const registeredRefs = new Set<string>(['EXT-BTR-004']);

export function externalBtransRefExists(refId: string): boolean {
  return registeredRefs.has(refId);
}

export function registerExternalBtransRef(refId: string): void {
  registeredRefs.add(refId);
}

export function resetExternalBtransRefsForTest(): void {
  registeredRefs.clear();
  registeredRefs.add('EXT-BTR-004');
}
