import type { FormReferenceApi } from '../../contracts/form-reference-api';
import type { SelectOptionDto } from '../../types/reference';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Gerçek API — örn. GET /references/cities?country=TR */
export function createHttpFormReferenceAdapter(baseUrl: string): FormReferenceApi {
  const root = baseUrl.replace(/\/$/, '');

  return {
    async getOptions(endpoint: string, param?: unknown): Promise<SelectOptionDto[]> {
      if (endpoint === 'getCities' && typeof param === 'string') {
        const q = new URLSearchParams({ country: param });
        const res = await fetch(`${root}/references/cities?${q}`, { credentials: 'include' });
        const body = await parseJson<{ data?: SelectOptionDto[] } | SelectOptionDto[]>(res);
        return Array.isArray(body) ? body : (body.data ?? []);
      }
      return [];
    },
  };
}
