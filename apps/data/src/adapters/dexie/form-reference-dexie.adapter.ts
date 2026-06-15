import type { FormReferenceApi } from '../../contracts/form-reference-api';
import type { SelectOptionDto } from '../../types/reference';
import { getDb } from '../../db/dexie';
import { ensureReferenceDataSeeded } from '../../db/seed-references';
import { simulateNetworkLatency } from './latency';

export function createDexieFormReferenceAdapter(): FormReferenceApi {
  return {
    async getOptions(endpoint: string, param?: unknown): Promise<SelectOptionDto[]> {
      await ensureReferenceDataSeeded();
      await simulateNetworkLatency();

      if (endpoint === 'getCities' && typeof param === 'string') {
        const rows = await getDb()
          .refOptions.where('[group+parentKey]')
          .equals(['cities', param])
          .toArray();
        return rows
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((r) => ({ label: r.label, value: r.value }));
      }

      return [];
    },
  };
}
