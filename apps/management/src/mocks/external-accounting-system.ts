/** Harici muhasebe sisteminde kayıtlı referanslar — retry dedup test */
const registeredRefs = new Set<string>(['EXT-ACC-004']);

export function externalAccountingRefExists(refId: string): boolean {
  return registeredRefs.has(refId);
}

export function registerExternalAccountingRef(refId: string): void {
  registeredRefs.add(refId);
}

export function resetExternalAccountingRefsForTest(): void {
  registeredRefs.clear();
  registeredRefs.add('EXT-ACC-004');
}
