/** Mock vault — UI asla düz secret döndürmez */
const secrets = new Map<string, string>();

export function resetCredentialVault(): void {
  secrets.clear();
}

export function allocateCredentialRef(integrationId: string): string {
  const ref = `vault://${integrationId}`;
  secrets.set(ref, `mock-secret-${integrationId}-${Date.now()}`);
  return ref;
}

export function rotateCredential(ref: string): void {
  secrets.set(ref, `mock-rotated-${Date.now()}`);
}

export function getCredentialDisplay(): string {
  return '***';
}

export function hasCredential(ref: string): boolean {
  return secrets.has(ref);
}

/** Test dışı kullanım yasak — yalnızca vitest secret exposure kontrolü */
export function __unsafeGetSecretForTest(ref: string): string | undefined {
  return secrets.get(ref);
}
