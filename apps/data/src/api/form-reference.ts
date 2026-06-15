import type { SelectOptionDto } from '../types/reference';
import { formReferenceApi } from '../services/form-reference.service';

/** DynamicForm optionsFromApi — Dexie veya HTTP adapter */
export function fetchFormReferenceOptions(
  endpoint: string,
  param?: unknown,
): Promise<SelectOptionDto[]> {
  return formReferenceApi.getOptions(endpoint, param);
}
