import type { AgentRegistrationApi } from '../../contracts/registration-api';
import type { AgentRegistrationRecord, AgentRegistrationSaveResult } from '../../types/registration';
import { getDb } from '../../db/dexie';
import { DEMO_PENDING_TRANSFER_IDNO, ensureAgentRegistrationsSeeded } from '../../db/seed-registration';
import { formValuesToRegistration, screenSanction } from '../../domain/registration-mapper';
import { simulateNetworkLatency } from './latency';

async function nextRegistrationId(): Promise<string> {
  const db = getDb();
  const meta = await db.meta.get('nextRegistrationId');
  const next = meta?.value ?? 200002;
  await db.meta.put({ key: 'nextRegistrationId', value: next + 1 });
  return String(next);
}

/** IndexedDB (Dexie) — temsilci bireysel müşteri kaydı mock backend. */
export function createDexieAgentRegistrationAdapter(): AgentRegistrationApi {
  return {
    async getById(id: string): Promise<AgentRegistrationRecord | undefined> {
      await ensureAgentRegistrationsSeeded();
      await simulateNetworkLatency();
      return getDb().agentRegistrations.get(id);
    },

    async lookupByIdentityNo(idNo: string): Promise<AgentRegistrationRecord | undefined> {
      await ensureAgentRegistrationsSeeded();
      await simulateNetworkLatency();
      const trimmed = idNo.trim();
      if (!trimmed) return undefined;
      return getDb().agentRegistrations.where('idNo').equals(trimmed).first();
    },

    async hasPendingTransfer(idNo: string): Promise<boolean> {
      await simulateNetworkLatency();
      // Mock: yalnızca demo Kimlik No'sunun devam eden transferi var.
      return idNo.trim() === DEMO_PENDING_TRANSFER_IDNO;
    },

    async save(
      values: Record<string, unknown>,
      opts: { draft: boolean },
    ): Promise<AgentRegistrationSaveResult> {
      await ensureAgentRegistrationsSeeded();

      const fullName = `${String(values.firstName ?? '')} ${String(values.lastName ?? '')}`.trim();
      if (!opts.draft && screenSanction(fullName)) {
        return { ok: false, error: 'ag_cust_sanction_hit' };
      }

      const existingId = typeof values.id === 'string' ? values.id : undefined;
      const existing = existingId ? await getDb().agentRegistrations.get(existingId) : undefined;

      const id = existing?.id ?? (await nextRegistrationId());
      const customerNo = existing?.customerNo ?? `MUS-${id.padStart(7, '0')}`;
      const row = formValuesToRegistration(id, customerNo, values, {
        status: opts.draft ? 'inactive' : 'active',
        existing,
      });
      await getDb().agentRegistrations.put(row);
      return { ok: true, id, customerNo };
    },
  };
}
