import { DEFAULT_INTEGRATIONS } from '@/features/system/integrations/domain/default-integrations';
import type { IntegrationDefinition } from '@/features/system/integrations/domain/types';
import { allocateCredentialRef, resetCredentialVault } from '@/mocks/credential-vault';

function withVault(row: Omit<IntegrationDefinition, 'credentialRef'>): IntegrationDefinition {
  const credentialRef = allocateCredentialRef(row.id);
  return { ...row, credentialRef };
}

let store: IntegrationDefinition[] = DEFAULT_INTEGRATIONS.map(withVault);
let nextId = store.length + 1;

export function resetIntegrationDefinitionsStore(): void {
  resetCredentialVault();
  store = DEFAULT_INTEGRATIONS.map(withVault);
  nextId = store.length + 1;
}

export function getIntegrationDefinitionsStore(): IntegrationDefinition[] {
  return store.map((r) => ({ ...r }));
}

export function getIntegrationDefinitionById(id: string): IntegrationDefinition | undefined {
  const r = store.find((x) => x.id === id);
  return r ? { ...r } : undefined;
}

export function getIntegrationByType(type: IntegrationDefinition['integrationType']): IntegrationDefinition | undefined {
  const r = store.find((x) => x.integrationType === type && x.status === 'Active');
  return r ? { ...r } : undefined;
}

export function appendIntegrationDefinition(
  input: Omit<IntegrationDefinition, 'id' | 'code' | 'credentialRef' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
  userId: string,
): IntegrationDefinition {
  const now = new Date('2026-05-25T12:00:00Z').toISOString();
  const id = `int-${String(nextId++).padStart(3, '0')}`;
  const row: IntegrationDefinition = {
    ...input,
    id,
    code: input.name.toLowerCase().replace(/\s+/g, '_'),
    credentialRef: allocateCredentialRef(id),
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  };
  store = [...store, row];
  return row;
}

export function updateIntegrationDefinitionRecord(
  id: string,
  patch: Partial<IntegrationDefinition>,
  userId: string,
): IntegrationDefinition | undefined {
  const idx = store.findIndex((x) => x.id === id);
  if (idx < 0) return undefined;
  const now = new Date('2026-05-25T12:00:00Z').toISOString();
  const next = { ...store[idx]!, ...patch, updatedAt: now, updatedBy: userId };
  store = [...store.slice(0, idx), next, ...store.slice(idx + 1)];
  return { ...next };
}
